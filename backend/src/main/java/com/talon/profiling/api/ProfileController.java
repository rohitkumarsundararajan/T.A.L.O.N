package com.talon.profiling.api;

import com.talon.identity.application.JwtAuthenticationFilter.TalonPrincipal;
import com.talon.profiling.application.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDtos.ProfileResponse> getMyProfile(@AuthenticationPrincipal TalonPrincipal principal) {
        if (principal == null || principal.employeeId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(profileService.getProfileByEmployeeId(principal.employeeId()));
    }
}