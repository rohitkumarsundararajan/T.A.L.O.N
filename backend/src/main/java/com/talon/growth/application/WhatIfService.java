package com.talon.growth.application;

import com.talon.matching.api.MatchingDtos.*;
import com.talon.matching.application.ScoringService;
import com.talon.matching.domain.RoleDefinition;
import com.talon.matching.infra.RoleDefinitionRepository;
import com.talon.profiling.domain.Employee;
import com.talon.profiling.domain.EmployeeSkill;
import com.talon.profiling.domain.Skill;
import com.talon.profiling.infra.EmployeeRepository;
import com.talon.profiling.infra.EmployeeSkillRepository;
import com.talon.profiling.infra.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class WhatIfService {

    private final ScoringService scoringService;
    private final RoleDefinitionRepository roleRepo;
    private final EmployeeRepository employeeRepo;
    private final EmployeeSkillRepository empSkillRepo;
    private final SkillRepository skillRepo;

    public WhatIfService(ScoringService scoringService,
                         RoleDefinitionRepository roleRepo,
                         EmployeeRepository employeeRepo,
                         EmployeeSkillRepository empSkillRepo,
                         SkillRepository skillRepo) {
        this.scoringService = scoringService;
        this.roleRepo = roleRepo;
        this.employeeRepo = employeeRepo;
        this.empSkillRepo = empSkillRepo;
        this.skillRepo = skillRepo;
    }

    @Transactional(readOnly = true)
    public List<WhatIfResultItem> simulate(Long employeeId, WhatIfRequest request) {
        Employee employee = employeeRepo.findById(employeeId).orElseThrow();
        List<EmployeeSkill> baselineSkills = empSkillRepo.findByEmployeeIdWithSkill(employeeId);
        List<RoleDefinition> openRoles = roleRepo.findByStatus("OPEN");

        // Clone profile into in-memory list
        List<EmployeeSkill> simulatedSkills = new ArrayList<>(baselineSkills);

        if (request.addSkills() != null) {
            for (WhatIfSkillInput add : request.addSkills()) {
                Skill skill = skillRepo.findById(add.skillId()).orElse(null);
                if (skill != null) {
                    // Remove if already present so level gets updated
                    simulatedSkills.removeIf(es -> es.getSkill().getId().equals(add.skillId()));
                    simulatedSkills.add(createTransientSkill(employeeId, skill, add.level()));
                }
            }
        }

        List<WhatIfResultItem> deltas = new ArrayList<>();
        for (RoleDefinition role : openRoles) {
            RoleMatchItem currentMatch = scoringService.evaluateRole(employee, baselineSkills, role);
            RoleMatchItem newMatch = scoringService.evaluateRole(employee, simulatedSkills, role);
            double delta = Math.round((newMatch.score() - currentMatch.score()) * 10000.0) / 10000.0;

            deltas.add(new WhatIfResultItem(role.getId(), role.getTitle(), currentMatch.score(), newMatch.score(), delta));
        }

        deltas.sort(Comparator.comparingDouble(WhatIfResultItem::delta).reversed());
        return deltas;
    }

    private EmployeeSkill createTransientSkill(Long empId, Skill skill, short level) {
        EmployeeSkill es = new EmployeeSkill();
        try {
            var fEmp = EmployeeSkill.class.getDeclaredField("employeeId");
            fEmp.setAccessible(true);
            fEmp.set(es, empId);

            var fSkill = EmployeeSkill.class.getDeclaredField("skill");
            fSkill.setAccessible(true);
            fSkill.set(es, skill);

            var fLevel = EmployeeSkill.class.getDeclaredField("level");
            fLevel.setAccessible(true);
            fLevel.set(es, level);

            var fConf = EmployeeSkill.class.getDeclaredField("confidence");
            fConf.setAccessible(true);
            fConf.set(es, new BigDecimal("0.85"));

            var fOrig = EmployeeSkill.class.getDeclaredField("origin");
            fOrig.setAccessible(true);
            fOrig.set(es, "EXPLICIT");
        } catch (Exception ignored) {}
        return es;
    }
}