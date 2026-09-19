package com.talon.profiling.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ProfileDtos {

    public record EmployeeSummary(
        Long id,
        String fullName,
        String title,
        String department,
        short yearsExperience,
        String summary
    ) {}

    public record EvidenceItem(
        Long id,
        String sourceType,
        String snippet,
        BigDecimal weight,
        LocalDate observedAt
    ) {}

    public record SkillProfileItem(
        Long skillId,
        String name,
        String category,
        short level,
        BigDecimal confidence,
        String origin,
        List<EvidenceItem> evidence
    ) {}

    public record ProfileResponse(
        EmployeeSummary employee,
        int profileVersion,
        List<SkillProfileItem> skills
    ) {}
}