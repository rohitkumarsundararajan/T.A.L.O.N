package com.talon.growth.api;

import com.talon.growth.application.RoadmapService;
import com.talon.growth.application.RoadmapService.*;
import com.talon.identity.application.JwtAuthenticationFilter.TalonPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/me")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping("/gaps")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GapItem>> getGaps(@AuthenticationPrincipal TalonPrincipal principal, @RequestParam Long roleId) {
        return ResponseEntity.ok(roadmapService.computeGaps(principal.employeeId(), roleId));
    }

    @PostMapping("/roadmap")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoadmapDto> createRoadmap(@AuthenticationPrincipal TalonPrincipal principal, @RequestBody Map<String, Long> payload) {
        Long roleId = payload.get("roleId");
        return ResponseEntity.ok(roadmapService.buildRoadmap(principal.employeeId(), roleId));
    }

    @PatchMapping("/roadmap/steps/{stepId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoadmapStepDto> updateStep(@PathVariable Long stepId, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(roadmapService.updateStepStatus(stepId, status));
    }
}