package com.talon.growth.api;

import com.talon.growth.application.WhatIfService;
import com.talon.identity.application.JwtAuthenticationFilter.TalonPrincipal;
import com.talon.matching.api.MatchingDtos.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
public class WhatIfController {

    private final WhatIfService whatIfService;

    public WhatIfController(WhatIfService whatIfService) {
        this.whatIfService = whatIfService;
    }

    @PostMapping("/whatif")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WhatIfResultItem>> simulateWhatIf(
            @AuthenticationPrincipal TalonPrincipal principal,
            @RequestBody WhatIfRequest request) {
        if (principal == null || principal.employeeId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(whatIfService.simulate(principal.employeeId(), request));
    }
}