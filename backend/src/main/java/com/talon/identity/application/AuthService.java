package com.talon.identity.application;

import com.talon.identity.domain.AuditLog;
import com.talon.identity.domain.RefreshToken;
import com.talon.identity.domain.UserAccount;
import com.talon.identity.infra.AuditLogRepository;
import com.talon.identity.infra.RefreshTokenRepository;
import com.talon.identity.infra.UserAccountRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository userRepo;
    private final RefreshTokenRepository tokenRepo;
    private final AuditLogRepository auditRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userRepo,
                       RefreshTokenRepository tokenRepo,
                       AuditLogRepository auditRepo,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.auditRepo = auditRepo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResult login(String email, String rawPassword) {
        UserAccount user = userRepo.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.isLocked()) {
            throw new BadCredentialsException("Account temporarily locked due to multiple failed attempts. Try again later.");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            short fails = (short) (user.getFailedLogins() + 1);
            user.setFailedLogins(fails);
            if (fails >= 5) {
                user.setLockedUntil(OffsetDateTime.now().plusMinutes(15));
                auditRepo.save(new AuditLog(user.getId(), "ACCOUNT_LOCKED", "user_account", user.getId()));
            }
            userRepo.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reset failed logins on success
        user.setFailedLogins((short) 0);
        user.setLockedUntil(null);
        userRepo.save(user);

        // Generate Access Token & Refresh Token Family
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole(), user.getEmployeeId());
        String rawRefreshToken = generateRandomToken();
        String hashedToken = sha256(rawRefreshToken);

        RefreshToken refreshToken = new RefreshToken(
                user.getId(),
                hashedToken,
                UUID.randomUUID(),
                OffsetDateTime.now().plusDays(7)
        );
        tokenRepo.save(refreshToken);
        auditRepo.save(new AuditLog(user.getId(), "LOGIN_SUCCESS", "user_account", user.getId()));

        return new LoginResult(accessToken, 900, user.getRole(), user.getEmployeeId(), user.getEmail(), rawRefreshToken);
    }

    @Transactional
    public LoginResult refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BadCredentialsException("Missing refresh token");
        }

        String hashed = sha256(rawRefreshToken);
        RefreshToken token = tokenRepo.findByTokenHash(hashed)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        // Theft Detection: If already revoked, revoke the ENTIRE family
        if (token.isRevoked()) {
            tokenRepo.revokeFamily(token.getFamilyId());
            auditRepo.save(new AuditLog(token.getUserId(), "TOKEN_THEFT_DETECTED", "refresh_token", token.getId()));
            throw new BadCredentialsException("Compromised session. Please log in again.");
        }

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadCredentialsException("Refresh token expired");
        }

        // Mark old token revoked
        token.setRevoked(true);
        tokenRepo.save(token);

        UserAccount user = userRepo.findById(token.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        // Issue new token in SAME family
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole(), user.getEmployeeId());
        String newRawRefresh = generateRandomToken();
        String newHashed = sha256(newRawRefresh);

        RefreshToken nextToken = new RefreshToken(user.getId(), newHashed, token.getFamilyId(), OffsetDateTime.now().plusDays(7));
        tokenRepo.save(nextToken);

        return new LoginResult(newAccessToken, 900, user.getRole(), user.getEmployeeId(), user.getEmail(), newRawRefresh);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            tokenRepo.findByTokenHash(sha256(rawRefreshToken))
                    .ifPresent(t -> tokenRepo.revokeFamily(t.getFamilyId()));
        }
    }

    private String generateRandomToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public record LoginResult(String accessToken, long expiresIn, String role, Long employeeId, String email, String rawRefreshToken) {}
}