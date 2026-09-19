package com.talon.growth.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "roadmap")
public class Roadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "employee_id")
    private Long employeeId;
    @Column(name = "role_id")
    private Long roleId;
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Roadmap() {}
    public Roadmap(Long employeeId, Long roleId) { this.employeeId = employeeId; this.roleId = roleId; }
    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public Long getRoleId() { return roleId; }
}