package com.talon.matching.infra;

import com.talon.matching.domain.RoleSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleSkillRequirementRepository extends JpaRepository<RoleSkillRequirement, Object> {
    List<RoleSkillRequirement> findByRoleId(Long roleId);
}