package com.talon.matching.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

class RoleSkillId implements Serializable {
    private Long roleId;
    private Long skillId;
    public RoleSkillId() {}
    public RoleSkillId(Long roleId, Long skillId) { this.roleId = roleId; this.skillId = skillId; }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoleSkillId that)) return false;
        return Objects.equals(roleId, that.roleId) && Objects.equals(skillId, that.skillId);
    }
    public int hashCode() { return Objects.hash(roleId, skillId); }
}

@Entity
@Table(name = "role_skill_requirement")
@IdClass(RoleSkillId.class)
public class RoleSkillRequirement {
    @Id
    @Column(name = "role_id")
    private Long roleId;

    @Id
    @Column(name = "skill_id")
    private Long skillId;

    @Column(name = "required_level", nullable = false)
    private short requiredLevel;

    @Column(nullable = false)
    private String importance; // MUST or NICE

    public Long getRoleId() { return roleId; }
    public Long getSkillId() { return skillId; }
    public short getRequiredLevel() { return requiredLevel; }
    public String getImportance() { return importance; }
}