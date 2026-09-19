package com.talon.identity.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_account")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // 'EMPLOYEE' or 'HR_ADMIN'

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "failed_logins", nullable = false)
    private short failedLogins = 0;

    @Column(name = "locked_until")
    private OffsetDateTime lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public UserAccount() {}

    public UserAccount(String email, String passwordHash, String role, Long employeeId) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.employeeId = employeeId;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public Long getEmployeeId() { return employeeId; }
    public short getFailedLogins() { return failedLogins; }
    public OffsetDateTime getLockedUntil() { return lockedUntil; }

    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(String role) { this.role = role; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public void setFailedLogins(short failedLogins) { this.failedLogins = failedLogins; }
    public void setLockedUntil(OffsetDateTime lockedUntil) { this.lockedUntil = lockedUntil; }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(OffsetDateTime.now());
    }
}