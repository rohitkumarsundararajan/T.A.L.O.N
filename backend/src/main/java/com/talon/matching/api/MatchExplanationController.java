package com.talon.matching.api;

import com.talon.identity.application.JwtAuthenticationFilter.TalonPrincipal;
import com.talon.matching.application.ExplanationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/me/matches")
public class MatchExplanationController {

    private final ExplanationService explanationService;

    public MatchExplanationController(ExplanationService explanationService) {
        this.explanationService = explanationService;
    }

    @GetMapping("/{roleId}/explanation")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getExplanation(
            @AuthenticationPrincipal TalonPrincipal principal,
            @PathVariable Long roleId) {
        return ResponseEntity.ok(explanationService.generateWhyMe(principal.employeeId(), roleId));
    }
}