package com.talon.growth.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "roadmap_step")
public class RoadmapStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "roadmap_id")
    private Long roadmapId;
    private short seq;
    @Column(name = "skill_id")
    private Long skillId;
    @Column(name = "learning_resource_id")
    private Long learningResourceId;
    private String title;
    @Column(name = "effort_weeks", precision = 4, scale = 1)
    private BigDecimal effortWeeks;
    private String status = "TODO"; // TODO, IN_PROGRESS, DONE

    public RoadmapStep() {}
    public RoadmapStep(Long roadmapId, short seq, Long skillId, Long learningResourceId, String title, BigDecimal effortWeeks) {
        this.roadmapId = roadmapId;
        this.seq = seq;
        this.skillId = skillId;
        this.learningResourceId = learningResourceId;
        this.title = title;
        this.effortWeeks = effortWeeks;
    }
    public Long getId() { return id; }
    public Long getRoadmapId() { return roadmapId; }
    public short getSeq() { return seq; }
    public Long getSkillId() { return skillId; }
    public String getTitle() { return title; }
    public BigDecimal getEffortWeeks() { return effortWeeks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}