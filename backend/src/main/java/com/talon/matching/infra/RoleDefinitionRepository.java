package com.talon.matching.infra;

import com.talon.matching.domain.RoleDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleDefinitionRepository extends JpaRepository<RoleDefinition, Long> {
    List<RoleDefinition> findByStatus(String status);
}