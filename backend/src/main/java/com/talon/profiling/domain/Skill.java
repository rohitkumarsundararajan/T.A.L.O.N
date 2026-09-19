package com.talon.profiling.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "skill")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;

    public Skill() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
}