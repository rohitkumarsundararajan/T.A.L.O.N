package com.talon.profiling.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "years_experience", nullable = false)
    private short yearsExperience = 0;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "profile_version", nullable = false)
    private int profileVersion = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Employee() {}

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getTitle() { return title; }
    public Department getDepartment() { return department; }
    public short getYearsExperience() { return yearsExperience; }
    public String getSummary() { return summary; }
    public int getProfileVersion() { return profileVersion; }
}