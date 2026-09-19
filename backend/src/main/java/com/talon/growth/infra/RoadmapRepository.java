package com.talon.growth.infra;

import com.talon.growth.domain.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    Optional<Roadmap> findFirstByEmployeeIdAndRoleIdOrderByIdDesc(Long employeeId, Long roleId);
}