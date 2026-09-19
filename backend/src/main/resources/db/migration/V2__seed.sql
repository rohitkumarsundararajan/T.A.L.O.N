-- =========================================================================
-- T.A.L.O.N. AI Seed Data (V2__seed.sql)
-- Departments, Skills, Skill Relations, Roles, Employees & Evidence
-- =========================================================================

-- 1. DEPARTMENTS
INSERT INTO department (id, name) OVERRIDING SYSTEM VALUE VALUES
(1, 'Engineering'),
(2, 'Support'),
(3, 'Data & Analytics'),
(4, 'Product'),
(5, 'IT Operations');

-- 2. EMPLOYEES (Hero personas)
-- ID 1: Priya Raman (Support Engineer wanting DevOps)
-- ID 2: Arjun Mehta (QA Analyst wanting Data Analytics)
-- ID 3: Kavya Nair (Business Analyst wanting Product Management)
INSERT INTO employee (id, full_name, title, department_id, years_experience, summary, profile_version) OVERRIDING SYSTEM VALUE VALUES
(1, 'Priya Raman', 'Support Engineer', 2, 4, 'Support Engineer with deep troubleshooting experience, CI/CD pipeline fixes, and containerised deployments.', 1),
(2, 'Arjun Mehta', 'QA Analyst', 1, 3, 'QA Automation Engineer focused on API testing, SQL validation, and test automation frameworks in Python.', 1),
(3, 'Kavya Nair', 'Business Analyst', 4, 5, 'Business Analyst specializing in user requirements, SQL data extraction, and cross-functional agile roadmaps.', 1),
(4, 'Marcus Chen', 'Senior DevOps Engineer', 5, 8, 'DevOps lead managing Kubernetes clusters, AWS infrastructure, and Terraform deployments.', 1);

-- 3. SKILL TAXONOMY (~70 core skills across 10 categories)
INSERT INTO skill (id, name, category) OVERRIDING SYSTEM VALUE VALUES
-- Programming
(1, 'Java', 'Programming'),
(2, 'Python', 'Programming'),
(3, 'JavaScript', 'Programming'),
(4, 'TypeScript', 'Programming'),
(5, 'SQL', 'Programming'),
(6, 'Go', 'Programming'),
(7, 'Bash Scripting', 'Programming'),

-- Backend
(8, 'Spring Boot', 'Backend'),
(9, 'REST API Design', 'Backend'),
(10, 'Microservices', 'Backend'),
(11, 'Event-Driven Architecture', 'Backend'),
(12, 'GraphQL', 'Backend'),

-- Frontend
(13, 'React', 'Frontend'),
(14, 'Next.js', 'Frontend'),
(15, 'HTML/CSS', 'Frontend'),
(16, 'Web Accessibility', 'Frontend'),

-- Cloud & DevOps
(17, 'Docker', 'Cloud & DevOps'),
(18, 'Kubernetes', 'Cloud & DevOps'),
(19, 'CI/CD', 'Cloud & DevOps'),
(20, 'Terraform', 'Cloud & DevOps'),
(21, 'AWS', 'Cloud & DevOps'),
(22, 'Azure', 'Cloud & DevOps'),
(23, 'Linux Administration', 'Cloud & DevOps'),
(24, 'Monitoring & Observability', 'Cloud & DevOps'),
(25, 'Infrastructure Automation', 'Cloud & DevOps'),

-- Data & AI
(26, 'Data Analysis', 'Data & AI'),
(27, 'Data Visualization', 'Data & AI'),
(28, 'Statistics', 'Data & AI'),
(29, 'ETL', 'Data & AI'),
(30, 'Pandas', 'Data & AI'),
(31, 'Machine Learning', 'Data & AI'),
(32, 'Deep Learning', 'Data & AI'),
(33, 'NLP', 'Data & AI'),
(34, 'Feature Engineering', 'Data & AI'),

-- Databases
(35, 'PostgreSQL', 'Databases'),
(36, 'MongoDB', 'Databases'),
(37, 'Redis', 'Databases'),
(38, 'Data Modeling', 'Databases'),

-- Security
(39, 'Application Security', 'Security'),
(40, 'Threat Modeling', 'Security'),
(41, 'Identity & Access Management', 'Security'),
(42, 'Cryptography Basics', 'Security'),

-- Quality
(43, 'Test Automation', 'Quality'),
(44, 'Selenium', 'Quality'),
(45, 'API Testing', 'Quality'),
(46, 'Performance Testing', 'Quality'),

-- Product & Management
(47, 'Product Analytics', 'Product & Management'),
(48, 'Stakeholder Management', 'Product & Management'),
(49, 'Agile/Scrum', 'Product & Management'),
(50, 'Roadmapping', 'Product & Management'),
(51, 'People Management', 'Product & Management'),
(52, 'Technical Writing', 'Product & Management'),
(53, 'Customer Support', 'Product & Management'),
(54, 'Incident Management', 'Product & Management'),

-- Professional
(55, 'Communication', 'Professional'),
(56, 'Mentoring', 'Professional'),
(57, 'Problem Solving', 'Professional');

-- 4. SKILL GRAPH RELATIONS (Adjacency & Prerequisites)
INSERT INTO skill_relation (source_id, target_id, type, strength) VALUES
(17, 18, 'ADJACENT', 0.80),      -- Docker <-> Kubernetes
(17, 25, 'ADJACENT', 0.70),      -- Docker -> Infrastructure Automation
(19, 25, 'ADJACENT', 0.75),      -- CI/CD <-> Infrastructure Automation
(7, 25, 'ADJACENT', 0.65),       -- Bash -> Infrastructure Automation
(23, 7, 'ADJACENT', 0.70),       -- Linux <-> Bash Scripting
(2, 30, 'ADJACENT', 0.80),       -- Python <-> Pandas
(30, 26, 'ADJACENT', 0.75),      -- Pandas <-> Data Analysis
(5, 26, 'ADJACENT', 0.70),       -- SQL <-> Data Analysis
(26, 28, 'ADJACENT', 0.70),      -- Data Analysis <-> Statistics
(28, 31, 'ADJACENT', 0.65),      -- Statistics -> Machine Learning
(31, 34, 'ADJACENT', 0.75),      -- Machine Learning <-> Feature Engineering
(8, 10, 'ADJACENT', 0.75),       -- Spring Boot <-> Microservices
(10, 11, 'ADJACENT', 0.70),      -- Microservices <-> Event-Driven Architecture
(13, 14, 'ADJACENT', 0.85),      -- React <-> Next.js
(43, 44, 'ADJACENT', 0.80),      -- Test Automation <-> Selenium
(43, 45, 'ADJACENT', 0.75),      -- Test Automation <-> API Testing
(54, 24, 'ADJACENT', 0.65),      -- Incident Management <-> Observability
(53, 48, 'ADJACENT', 0.50),      -- Customer Support -> Stakeholder Management
(39, 40, 'ADJACENT', 0.75),      -- AppSec <-> Threat Modeling
(17, 18, 'PREREQUISITE', 0.85),  -- Docker is prerequisite for Kubernetes
(28, 31, 'PREREQUISITE', 0.75),  -- Statistics is prerequisite for ML
(2, 30, 'PREREQUISITE', 0.80),   -- Python is prerequisite for Pandas
(5, 38, 'PREREQUISITE', 0.70);   -- SQL is prerequisite for Data Modeling

-- 5. ROLES (10 organizational roles)
INSERT INTO role_definition (id, title, department_id, description, status) OVERRIDING SYSTEM VALUE VALUES
(1, 'DevOps Engineer', 5, 'Own container pipelines, deployment automation, and Kubernetes orchestration.', 'OPEN'),
(2, 'Backend Engineer (Java)', 1, 'Build scalable microservices with Spring Boot and event messaging.', 'OPEN'),
(3, 'Data Analyst', 3, 'Transform business metrics into actionable insights using SQL and Pandas.', 'OPEN'),
(4, 'ML Engineer', 3, 'Train and deploy machine learning models to production.', 'OPEN'),
(5, 'Frontend Engineer', 1, 'Deliver accessible, reactive web applications with React and Next.js.', 'OPEN'),
(6, 'Cloud Architect', 5, 'Design resilient cloud infrastructure across multi-region environments.', 'OPEN'),
(7, 'QA Automation Engineer', 1, 'Design and execute automated integration and API test suites.', 'OPEN'),
(8, 'Product Analyst', 4, 'Drive feature discovery and user telemetry roadmap analytics.', 'OPEN'),
(9, 'Engineering Manager', 1, 'Lead technical teams, mentor engineers, and guide delivery roadmaps.', 'OPEN'),
(10, 'Security Engineer', 5, 'Conduct threat modeling, application security audits, and access control.', 'OPEN');

-- 6. ROLE REQUIREMENTS (DevOps Engineer requirements)
INSERT INTO role_skill_requirement (role_id, skill_id, required_level, importance) VALUES
(1, 17, 3, 'MUST'), -- Docker (Level 3)
(1, 19, 3, 'MUST'), -- CI/CD (Level 3)
(1, 18, 3, 'MUST'), -- Kubernetes (Level 3)
(1, 7, 2, 'NICE'),  -- Bash Scripting (Level 2)
(1, 23, 3, 'NICE'); -- Linux Admin (Level 3)

-- Data Analyst requirements
INSERT INTO role_skill_requirement (role_id, skill_id, required_level, importance) VALUES
(3, 5, 3, 'MUST'),  -- SQL (Level 3)
(3, 26, 3, 'MUST'), -- Data Analysis (Level 3)
(3, 27, 2, 'NICE'), -- Data Visualization (Level 2)
(3, 28, 2, 'NICE'); -- Statistics (Level 2)

-- 7. INITIAL EMPLOYEE SKILLS & EVIDENCE (Priya Raman - ID 1)
INSERT INTO employee_skill (id, employee_id, skill_id, level, confidence, origin) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 17, 4, 0.88, 'EXPLICIT'), -- Docker
(2, 1, 19, 3, 0.82, 'EXPLICIT'), -- CI/CD
(3, 1, 7, 3, 0.79, 'EXPLICIT'),  -- Bash Scripting
(4, 1, 53, 4, 0.90, 'EXPLICIT'), -- Customer Support
(5, 1, 54, 3, 0.75, 'EXPLICIT'), -- Incident Management
-- Inferred Skill (Inferred via Docker + CI/CD + Bash)
(6, 1, 25, 3, 0.71, 'INFERRED'); -- Infrastructure Automation

-- Evidence Ledger for Priya
INSERT INTO skill_evidence (id, employee_skill_id, source_type, source_ref, snippet, weight, observed_at) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'PROJECT', 'Ticket-Triage-Service', 'Containerised the ticket triage microservice using Docker multi-stage builds.', 0.85, '2026-01-15'),
(2, 2, 'PROJECT', 'Internal-CI-Fixes', 'Diagnosed and repaired broken GitLab CI/CD runner pipelines for deployment triage.', 0.80, '2026-02-10'),
(3, 3, 'PROJECT', 'Log-Rotator-Script', 'Authored production Bash scripts for automated log rotation and disk monitoring.', 0.75, '2025-11-20'),
(4, 6, 'PROJECT', 'GraphInferenceEngine', 'Inferred from Docker, CI/CD, and Bash Scripting project contributions.', 0.71, '2026-02-15');

-- 8. LEARNING RESOURCES (For roadmap builder)
INSERT INTO learning_resource (id, title, provider, url, skill_id, target_level, effort_hours) OVERRIDING SYSTEM VALUE VALUES
(1, 'Kubernetes for Production Microservices', 'Internal LMS', 'https://kubernetes.io/docs/tutorials/', 18, 3, 18),
(2, 'Practical Statistics for Analysts', 'Coursera', 'https://coursera.org', 28, 3, 12),
(3, 'Advanced Threat Modeling Techniques', 'Internal LMS', 'https://owasp.org', 40, 3, 15);