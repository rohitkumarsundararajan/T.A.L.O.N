package com.talon.profiling.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "skill_evidence")
public class SkillEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_skill_id", nullable = false)
    private Long employeeSkillId;

    @Column(name = "source_type", nullable = false)
    private String sourceType; // 'RESUME', 'PROJECT', 'COURSE', 'REVIEW'

    @Column(name = "source_ref")
    private String sourceRef;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal weight;

    @Column(name = "observed_at", nullable = false)
    private LocalDate observedAt = LocalDate.now();

    public SkillEvidence() {}

    public Long getId() { return id; }
    public Long getEmployeeSkillId() { return employeeSkillId; }
    public String getSourceType() { return sourceType; }
    public String getSourceRef() { return sourceRef; }
    public String getSnippet() { return snippet; }
    public BigDecimal getWeight() { return weight; }
    public LocalDate getObservedAt() { return observedAt; }
}