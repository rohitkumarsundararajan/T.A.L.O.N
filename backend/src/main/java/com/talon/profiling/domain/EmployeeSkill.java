package com.talon.profiling.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "employee_skill", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "skill_id"})
})
public class EmployeeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private short level; // 1 to 5

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal confidence; // 0.00 to 1.00

    @Column(nullable = false, length = 10)
    private String origin; // 'EXPLICIT' or 'INFERRED'

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public EmployeeSkill() {}

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public Skill getSkill() { return skill; }
    public short getLevel() { return level; }
    public BigDecimal getConfidence() { return confidence; }
    public String getOrigin() { return origin; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}