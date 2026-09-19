package com.talon.growth.application;

import com.talon.growth.domain.LearningResource;
import com.talon.growth.domain.Roadmap;
import com.talon.growth.domain.RoadmapStep;
import com.talon.growth.infra.LearningResourceRepository;
import com.talon.growth.infra.RoadmapRepository;
import com.talon.growth.infra.RoadmapStepRepository;
import com.talon.matching.domain.RoleSkillRequirement;
import com.talon.matching.infra.RoleSkillRequirementRepository;
import com.talon.profiling.domain.EmployeeSkill;
import com.talon.profiling.domain.Skill;
import com.talon.profiling.infra.EmployeeSkillRepository;
import com.talon.profiling.infra.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class RoadmapService {

    public record GapItem(Long skillId, String name, String importance, short requiredLevel, short currentLevel, double weeksToClose) {}
    public record RoadmapStepDto(Long id, short seq, String title, BigDecimal effortWeeks, String status) {}
    public record RoadmapDto(Long roadmapId, Long roleId, List<RoadmapStepDto> steps) {}

    private final RoleSkillRequirementRepository reqRepo;
    private final EmployeeSkillRepository empSkillRepo;
    private final SkillRepository skillRepo;
    private final LearningResourceRepository resourceRepo;
    private final RoadmapRepository roadmapRepo;
    private final RoadmapStepRepository stepRepo;

    public RoadmapService(RoleSkillRequirementRepository reqRepo,
                          EmployeeSkillRepository empSkillRepo,
                          SkillRepository skillRepo,
                          LearningResourceRepository resourceRepo,
                          RoadmapRepository roadmapRepo,
                          RoadmapStepRepository stepRepo) {
        this.reqRepo = reqRepo;
        this.empSkillRepo = empSkillRepo;
        this.skillRepo = skillRepo;
        this.resourceRepo = resourceRepo;
        this.roadmapRepo = roadmapRepo;
        this.stepRepo = stepRepo;
    }

    @Transactional(readOnly = true)
    public List<GapItem> computeGaps(Long employeeId, Long roleId) {
        List<RoleSkillRequirement> reqs = reqRepo.findByRoleId(roleId);
        List<EmployeeSkill> held = empSkillRepo.findByEmployeeIdWithSkill(employeeId);
        Map<Long, Short> heldMap = new HashMap<>();
        for (EmployeeSkill es : held) heldMap.put(es.getSkill().getId(), es.getLevel());

        List<GapItem> gaps = new ArrayList<>();
        for (RoleSkillRequirement r : reqs) {
            short cur = heldMap.getOrDefault(r.getSkillId(), (short) 0);
            if (cur < r.getRequiredLevel()) {
                Skill s = skillRepo.findById(r.getSkillId()).orElse(null);
                String name = (s != null) ? s.getName() : "Skill #" + r.getSkillId();
                double weeks = (r.getRequiredLevel() - cur) * 3.0; // 3 weeks per level baseline
                gaps.add(new GapItem(r.getSkillId(), name, r.getImportance(), r.getRequiredLevel(), cur, weeks));
            }
        }
        gaps.sort(Comparator.comparing((GapItem g) -> "MUST".equals(g.importance()) ? 0 : 1).thenComparingDouble(GapItem::weeksToClose));
        return gaps;
    }

    @Transactional
    public RoadmapDto buildRoadmap(Long employeeId, Long roleId) {
        Optional<Roadmap> existing = roadmapRepo.findFirstByEmployeeIdAndRoleIdOrderByIdDesc(employeeId, roleId);
        if (existing.isPresent()) {
            List<RoadmapStep> existingSteps = stepRepo.findByRoadmapIdOrderBySeqAsc(existing.get().getId());
            if (!existingSteps.isEmpty()) {
                List<RoadmapStepDto> stepDtos = existingSteps.stream()
                        .map(s -> new RoadmapStepDto(s.getId(), s.getSeq(), s.getTitle(), s.getEffortWeeks(), s.getStatus()))
                        .toList();
                return new RoadmapDto(existing.get().getId(), roleId, stepDtos);
            }
        }

        List<GapItem> gaps = computeGaps(employeeId, roleId);
        Roadmap roadmap = roadmapRepo.save(new Roadmap(employeeId, roleId));

        short seq = 1;
        List<RoadmapStepDto> steps = new ArrayList<>();
        for (GapItem gap : gaps) {
            List<LearningResource> resources = resourceRepo.findBySkillId(gap.skillId());
            LearningResource res = resources.isEmpty() ? null : resources.get(0);

            String title = (res != null) ? res.getTitle() : "Apply " + gap.name() + " in an internal hands-on stretch project";
            BigDecimal weeks = (res != null) ? BigDecimal.valueOf(res.getEffortHours()).divide(BigDecimal.valueOf(6), 1, RoundingMode.HALF_UP)
                                             : BigDecimal.valueOf(gap.weeksToClose());

            RoadmapStep step = stepRepo.save(new RoadmapStep(roadmap.getId(), seq, gap.skillId(), (res != null ? res.getId() : null), title, weeks));
            steps.add(new RoadmapStepDto(step.getId(), step.getSeq(), step.getTitle(), step.getEffortWeeks(), step.getStatus()));
            seq++;
            if (seq > 6) break; // Max 6 steps
        }
        return new RoadmapDto(roadmap.getId(), roleId, steps);
    }

    @Transactional
    public RoadmapStepDto updateStepStatus(Long stepId, String status) {
        RoadmapStep step = stepRepo.findById(stepId).orElseThrow();
        step.setStatus(status);
        stepRepo.save(step);
        return new RoadmapStepDto(step.getId(), step.getSeq(), step.getTitle(), step.getEffortWeeks(), step.getStatus());
    }
}