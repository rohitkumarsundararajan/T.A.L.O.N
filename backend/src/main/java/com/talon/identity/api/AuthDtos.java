package com.talon.identity.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record LoginResponse(
        String accessToken,
        long expiresInSeconds,
        String role,
        Long employeeId,
        String email
    ) {}
}