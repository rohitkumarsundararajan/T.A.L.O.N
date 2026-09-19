package com.talon.growth.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_resource")
public class LearningResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String provider;
    private String url;
    @Column(name = "skill_id")
    private Long skillId;
    @Column(name = "target_level")
    private short targetLevel;
    @Column(name = "effort_hours")
    private int effortHours;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getProvider() { return provider; }
    public String getUrl() { return url; }
    public Long getSkillId() { return skillId; }
    public short getTargetLevel() { return targetLevel; }
    public int getEffortHours() { return effortHours; }
}