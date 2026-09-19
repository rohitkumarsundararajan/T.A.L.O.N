package com.talon.profiling.infra;

import com.talon.profiling.domain.SkillEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillEvidenceRepository extends JpaRepository<SkillEvidence, Long> {
    List<SkillEvidence> findByEmployeeSkillIdIn(List<Long> employeeSkillIds);
}