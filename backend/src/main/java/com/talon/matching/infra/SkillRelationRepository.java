package com.talon.matching.infra;

import com.talon.matching.domain.SkillRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRelationRepository extends JpaRepository<SkillRelation, Object> {
    List<SkillRelation> findBySourceIdOrTargetId(Long sourceId, Long targetId);
}