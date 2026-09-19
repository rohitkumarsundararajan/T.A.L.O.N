package com.talon.matching.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

class SkillRelationId implements Serializable {
    private Long sourceId;
    private Long targetId;
    private String type;
    public SkillRelationId() {}
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SkillRelationId that)) return false;
        return Objects.equals(sourceId, that.sourceId) && Objects.equals(targetId, that.targetId) && Objects.equals(type, that.type);
    }
    public int hashCode() { return Objects.hash(sourceId, targetId, type); }
}

@Entity
@Table(name = "skill_relation")
@IdClass(SkillRelationId.class)
public class SkillRelation {
    @Id
    @Column(name = "source_id")
    private Long sourceId;

    @Id
    @Column(name = "target_id")
    private Long targetId;

    @Id
    private String type;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal strength;

    public Long getSourceId() { return sourceId; }
    public Long getTargetId() { return targetId; }
    public String getType() { return type; }
    public BigDecimal getStrength() { return strength; }
}