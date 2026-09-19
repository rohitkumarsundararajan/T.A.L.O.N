package com.talon.profiling.application;

import com.talon.profiling.api.ProfileDtos.*;
import com.talon.profiling.domain.Employee;
import com.talon.profiling.domain.EmployeeSkill;
import com.talon.profiling.domain.SkillEvidence;
import com.talon.profiling.infra.EmployeeRepository;
import com.talon.profiling.infra.EmployeeSkillRepository;
import com.talon.profiling.infra.SkillEvidenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final EmployeeRepository employeeRepo;
    private final EmployeeSkillRepository employeeSkillRepo;
    private final SkillEvidenceRepository evidenceRepo;

    public ProfileService(EmployeeRepository employeeRepo,
                          EmployeeSkillRepository employeeSkillRepo,
                          SkillEvidenceRepository evidenceRepo) {
        this.employeeRepo = employeeRepo;
        this.employeeSkillRepo = employeeSkillRepo;
        this.evidenceRepo = evidenceRepo;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByEmployeeId(Long employeeId) {
        Employee emp = employeeRepo.findByIdWithDepartment(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));

        String deptName = (emp.getDepartment() != null) ? emp.getDepartment().getName() : "Unassigned";
        EmployeeSummary summary = new EmployeeSummary(
                emp.getId(), emp.getFullName(), emp.getTitle(), deptName, emp.getYearsExperience(), emp.getSummary()
        );

        List<EmployeeSkill> empSkills = employeeSkillRepo.findByEmployeeIdWithSkill(employeeId);
        List<Long> skillIds = empSkills.stream().map(EmployeeSkill::getId).toList();

        // Fetch evidence for all skills in one bulk query
        Map<Long, List<SkillEvidence>> evidenceBySkillId = evidenceRepo.findByEmployeeSkillIdIn(skillIds).stream()
                .collect(Collectors.groupingBy(SkillEvidence::getEmployeeSkillId));

        List<SkillProfileItem> skillItems = empSkills.stream().map(es -> {
            List<EvidenceItem> evidenceList = evidenceBySkillId.getOrDefault(es.getId(), List.of()).stream()
                    .map(ev -> new EvidenceItem(ev.getId(), ev.getSourceType(), ev.getSnippet(), ev.getWeight(), ev.getObservedAt()))
                    .toList();

            return new SkillProfileItem(
                    es.getSkill().getId(),
                    es.getSkill().getName(),
                    es.getSkill().getCategory(),
                    es.getLevel(),
                    es.getConfidence(),
                    es.getOrigin(),
                    evidenceList
            );
        }).toList();

        return new ProfileResponse(summary, emp.getProfileVersion(), skillItems);
    }
}