package com.talon.identity.api;

import com.talon.identity.application.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String COOKIE_NAME = "talon_rt";
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.LoginResponse> login(
            @Valid @RequestBody AuthDtos.LoginRequest request,
            HttpServletResponse response) {
        var result = authService.login(request.email(), request.password());
        attachRefreshCookie(response, result.rawRefreshToken());
        return ResponseEntity.ok(new AuthDtos.LoginResponse(
                result.accessToken(), result.expiresIn(), result.role(), result.employeeId(), result.email()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDtos.LoginResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String rawToken = extractCookie(request);
        var result = authService.refresh(rawToken);
        attachRefreshCookie(response, result.rawRefreshToken());
        return ResponseEntity.ok(new AuthDtos.LoginResponse(
                result.accessToken(), result.expiresIn(), result.role(), result.employeeId(), result.email()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = extractCookie(request);
        authService.logout(rawToken);

        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private void attachRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Set to true in production
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}