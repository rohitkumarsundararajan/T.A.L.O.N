package com.talon.profiling.infra;

import com.talon.profiling.domain.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByNameContainingIgnoreCaseOrderByNameAsc(String query);
}