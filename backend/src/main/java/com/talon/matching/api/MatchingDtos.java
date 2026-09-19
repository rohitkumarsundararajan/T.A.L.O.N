package com.talon.matching.api;

import java.math.BigDecimal;
import java.util.List;

public class MatchingDtos {

    public record ScoreBreakdown(
        double coverage,
        double proficiency,
        double semantic,
        double experience,
        double growth
    ) {}

    public record RoleMatchItem(
        Long roleId,
        String title,
        String department,
        double score,
        ScoreBreakdown breakdown,
        boolean hasExplanation
    ) {}

    public record RoleSummary(
        Long id,
        String title,
        String department,
        String description,
        String status
    ) {}

    public record SkillOption(
        Long id,
        String name,
        String category
    ) {}

    public record WhatIfSkillInput(
        Long skillId,
        short level
    ) {}

    public record WhatIfRequest(
        List<WhatIfSkillInput> addSkills
    ) {}

    public record WhatIfResultItem(
        Long roleId,
        String title,
        double currentScore,
        double newScore,
        double delta
    ) {}
}