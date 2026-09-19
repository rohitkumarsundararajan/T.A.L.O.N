package com.talon.matching.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "role_definition")
public class RoleDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(name = "department_id")
    private Long departmentId;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String status;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Long getDepartmentId() { return departmentId; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
}