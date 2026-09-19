package com.talon.matching.api;

import com.talon.identity.application.JwtAuthenticationFilter.TalonPrincipal;
import com.talon.matching.application.ScoringService;
import com.talon.matching.domain.RoleDefinition;
import com.talon.matching.infra.RoleDefinitionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class MatchingController {

    private final ScoringService scoringService;
    private final RoleDefinitionRepository roleRepo;

    public MatchingController(ScoringService scoringService, RoleDefinitionRepository roleRepo) {
        this.scoringService = scoringService;
        this.roleRepo = roleRepo;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<MatchingDtos.RoleSummary>> getOpenRoles() {
        var roles = roleRepo.findByStatus("OPEN").stream()
                .map(r -> new MatchingDtos.RoleSummary(r.getId(), r.getTitle(), "Engineering", r.getDescription(), r.getStatus()))
                .toList();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/me/matches")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MatchingDtos.RoleMatchItem>> getMyMatches(@AuthenticationPrincipal TalonPrincipal principal) {
        if (principal == null || principal.employeeId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(scoringService.computeMatchesForEmployee(principal.employeeId()));
    }
}