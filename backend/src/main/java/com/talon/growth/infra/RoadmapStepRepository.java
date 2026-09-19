package com.talon.growth.infra;

import com.talon.growth.domain.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {
    List<RoadmapStep> findByRoadmapIdOrderBySeqAsc(Long roadmapId);
}