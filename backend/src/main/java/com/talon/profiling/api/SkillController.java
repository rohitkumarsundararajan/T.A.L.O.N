package com.talon.profiling.api;

import com.talon.matching.api.MatchingDtos.SkillOption;
import com.talon.profiling.infra.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {

    private final SkillRepository skillRepo;

    public SkillController(SkillRepository skillRepo) {
        this.skillRepo = skillRepo;
    }

    @GetMapping
    public ResponseEntity<List<SkillOption>> searchSkills(@RequestParam(defaultValue = "") String query) {
        var skills = skillRepo.findByNameContainingIgnoreCaseOrderByNameAsc(query).stream()
                .map(s -> new SkillOption(s.getId(), s.getName(), s.getCategory()))
                .toList();
        return ResponseEntity.ok(skills);
    }
}