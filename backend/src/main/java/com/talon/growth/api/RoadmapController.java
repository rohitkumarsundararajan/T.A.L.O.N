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

    public record CreateRoadmapReq(Long roleId) {}
    public record UpdateStepReq(String status) {}

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping("/gaps")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GapItem>> getGaps(@AuthenticationPrincipal TalonPrincipal principal, @RequestParam Long roleId) {
        Long empId = (principal != null && principal.employeeId() != null) ? principal.employeeId() : 1L;
        return ResponseEntity.ok(roadmapService.computeGaps(empId, roleId));
    }

    @PostMapping("/roadmap")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoadmapDto> createRoadmap(@AuthenticationPrincipal TalonPrincipal principal, @RequestBody(required = false) CreateRoadmapReq payload) {
        Long empId = (principal != null && principal.employeeId() != null) ? principal.employeeId() : 1L;
        Long roleId = (payload != null && payload.roleId() != null) ? payload.roleId() : 1L;
        return ResponseEntity.ok(roadmapService.buildRoadmap(empId, roleId));
    }

    @PatchMapping("/roadmap/steps/{stepId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoadmapStepDto> updateStep(@PathVariable Long stepId, @RequestBody(required = false) UpdateStepReq payload) {
        String status = (payload != null && payload.status() != null) ? payload.status() : "DONE";
        return ResponseEntity.ok(roadmapService.updateStepStatus(stepId, status));
    }
}