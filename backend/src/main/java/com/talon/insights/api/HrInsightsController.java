package com.talon.insights.api;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr")
@PreAuthorize("hasRole('HR_ADMIN')")
public class HrInsightsController {

    private final JdbcTemplate jdbcTemplate;

    public HrInsightsController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Object>> getHeatmap() {
        var rows = jdbcTemplate.queryForList("""
            SELECT d.name AS department, s.category, ROUND(AVG(es.level), 1) AS avg_level, COUNT(es.id) AS count
            FROM employee_skill es
            JOIN employee e ON e.id = es.employee_id
            JOIN department d ON d.id = e.department_id
            JOIN skill s ON s.id = es.skill_id
            GROUP BY d.name, s.category
        """);

        List<String> departments = List.of("Engineering", "Support", "Data & Analytics", "Product", "IT Operations");
        List<String> categories = List.of("Cloud & DevOps", "Programming", "Backend", "Frontend", "Data & AI", "Product & Management");

        return ResponseEntity.ok(Map.of(
            "departments", departments,
            "categories", categories,
            "cells", rows
        ));
    }

    @GetMapping("/bus-factor")
    public ResponseEntity<List<Map<String, Object>>> getBusFactor() {
        var alerts = jdbcTemplate.queryForList("""
            SELECT s.id AS skill_id, s.name, s.category,
                   COUNT(es.id) FILTER (WHERE es.level >= 3) AS proficient_holders,
                   COUNT(DISTINCT rsr.role_id) AS open_role_demand
            FROM skill s
            LEFT JOIN employee_skill es ON es.skill_id = s.id
            JOIN role_skill_requirement rsr ON rsr.skill_id = s.id
            GROUP BY s.id, s.name, s.category
            HAVING COUNT(es.id) FILTER (WHERE es.level >= 3) <= 2
            ORDER BY open_role_demand DESC
        """);
        return ResponseEntity.ok(alerts);
    }
}