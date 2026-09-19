package com.talon.profiling.infra;

import com.talon.profiling.domain.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
    @Query("SELECT es FROM EmployeeSkill es JOIN FETCH es.skill WHERE es.employeeId = :employeeId ORDER BY es.level DESC, es.confidence DESC")
    List<EmployeeSkill> findByEmployeeIdWithSkill(Long employeeId);
}