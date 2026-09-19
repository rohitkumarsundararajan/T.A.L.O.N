package com.talon.matching.application;

import com.talon.matching.api.MatchingDtos.*;
import com.talon.matching.domain.RoleDefinition;
import com.talon.matching.domain.RoleSkillRequirement;
import com.talon.matching.domain.SkillRelation;
import com.talon.matching.infra.RoleDefinitionRepository;
import com.talon.matching.infra.RoleSkillRequirementRepository;
import com.talon.matching.infra.SkillRelationRepository;
import com.talon.profiling.domain.Employee;
import com.talon.profiling.domain.EmployeeSkill;
import com.talon.profiling.infra.EmployeeRepository;
import com.talon.profiling.infra.EmployeeSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ScoringService {

    private final RoleDefinitionRepository roleRepo;
    private final RoleSkillRequirementRepository reqRepo;
    private final SkillRelationRepository relationRepo;
    private final EmployeeRepository employeeRepo;
    private final EmployeeSkillRepository empSkillRepo;

    public ScoringService(RoleDefinitionRepository roleRepo,
                          RoleSkillRequirementRepository reqRepo,
                          SkillRelationRepository relationRepo,
                          EmployeeRepository employeeRepo,
                          EmployeeSkillRepository empSkillRepo) {
        this.roleRepo = roleRepo;
        this.reqRepo = reqRepo;
        this.relationRepo = relationRepo;
        this.employeeRepo = employeeRepo;
        this.empSkillRepo = empSkillRepo;
    }

    @Transactional(readOnly = true)
    public List<RoleMatchItem> computeMatchesForEmployee(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId).orElseThrow();
        List<EmployeeSkill> heldSkills = empSkillRepo.findByEmployeeIdWithSkill(employeeId);
        List<RoleDefinition> openRoles = roleRepo.findByStatus("OPEN");

        List<RoleMatchItem> results = new ArrayList<>();
        for (RoleDefinition role : openRoles) {
            var scored = evaluateRole(employee, heldSkills, role);
            results.add(scored);
        }

        results.sort(Comparator.comparingDouble(RoleMatchItem::score).reversed());
        return results;
    }

    public RoleMatchItem evaluateRole(Employee employee, List<EmployeeSkill> heldSkills, RoleDefinition role) {
        List<RoleSkillRequirement> requirements = reqRepo.findByRoleId(role.getId());
        if (requirements.isEmpty()) {
            return new RoleMatchItem(role.getId(), role.getTitle(), "Engineering", 0.0,
                    new ScoreBreakdown(0,0,0,0,0), false);
        }

        Map<Long, Short> heldMap = new HashMap<>();
        for (EmployeeSkill es : heldSkills) {
            heldMap.put(es.getSkill().getId(), es.getLevel());
        }

        double totalWeight = 0.0;
        double weightedCoverage = 0.0;
        double weightedProficiency = 0.0;
        List<Double> missingGrowthPotentials = new ArrayList<>();

        for (RoleSkillRequirement req : requirements) {
            double w = "MUST".equalsIgnoreCase(req.getImportance()) ? 1.0 : 0.4;
            totalWeight += w;

            Long reqSkillId = req.getSkillId();
            if (heldMap.containsKey(reqSkillId)) {
                short actualLevel = heldMap.get(reqSkillId);
                weightedCoverage += w * 1.0;
                weightedProficiency += w * Math.min(1.0, (double) actualLevel / req.getRequiredLevel());
            } else {
                double adjStrength = getMaxAdjacentStrength(heldMap.keySet(), reqSkillId);
                weightedCoverage += w * (0.5 * adjStrength);
                missingGrowthPotentials.add(adjStrength);
            }
        }

        double coverage = totalWeight > 0 ? (weightedCoverage / totalWeight) : 0.0;
        double proficiency = totalWeight > 0 ? (weightedProficiency / totalWeight) : 0.0;
        double semantic = 0.70; // Local baseline (MiniLM vector similarity)
        double experience = Math.min(1.0, employee.getYearsExperience() / 8.0);
        double growth = missingGrowthPotentials.isEmpty() ? 1.0 :
                missingGrowthPotentials.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        // Final Master Formula (Section 9.5)
        double score = (0.35 * coverage) + (0.20 * proficiency) + (0.20 * semantic) + (0.15 * experience) + (0.10 * growth);
        score = Math.round(score * 10000.0) / 10000.0;

        ScoreBreakdown breakdown = new ScoreBreakdown(
                Math.round(coverage * 100.0) / 100.0,
                Math.round(proficiency * 100.0) / 100.0,
                Math.round(semantic * 100.0) / 100.0,
                Math.round(experience * 100.0) / 100.0,
                Math.round(growth * 100.0) / 100.0
        );

        return new RoleMatchItem(role.getId(), role.getTitle(), "IT Operations", score, breakdown, true);
    }

    public double getMaxAdjacentStrength(Set<Long> heldSkillIds, Long targetSkillId) {
        double maxStr = 0.0;
        for (Long heldId : heldSkillIds) {
            List<SkillRelation> relations = relationRepo.findBySourceIdOrTargetId(heldId, targetSkillId);
            for (SkillRelation rel : relations) {
                if (("ADJACENT".equalsIgnoreCase(rel.getType()) || "PREREQUISITE".equalsIgnoreCase(rel.getType()))
                        && ((rel.getSourceId().equals(heldId) && rel.getTargetId().equals(targetSkillId)) ||
                            (rel.getSourceId().equals(targetSkillId) && rel.getTargetId().equals(heldId)))) {
                    maxStr = Math.max(maxStr, rel.getStrength().doubleValue());
                }
            }
        }
        return maxStr;
    }
}