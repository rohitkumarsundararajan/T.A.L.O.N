package com.talon.profiling.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Department() {}

    public Long getId() { return id; }
    public String getName() { return name; }
}