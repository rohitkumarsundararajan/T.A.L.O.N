-- T.A.L.O.N. AI Master Schema (PostgreSQL 16 + pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------- Organization structure ----------
CREATE TABLE department (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE employee (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name        VARCHAR(150) NOT NULL,
    title            VARCHAR(150) NOT NULL,
    department_id    BIGINT REFERENCES department(id),
    years_experience SMALLINT NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
    summary          TEXT,
    embedding        vector(384),
    profile_version  INTEGER NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_account (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('EMPLOYEE', 'HR_ADMIN')),
    employee_id   BIGINT REFERENCES employee(id) ON DELETE SET NULL,
    failed_logins SMALLINT NOT NULL DEFAULT 0,
    locked_until  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_token (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    family_id   UUID NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Skill taxonomy and graph ----------
CREATE TABLE skill (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name      VARCHAR(120) NOT NULL UNIQUE,
    category  VARCHAR(80),
    embedding vector(384)
);

CREATE TABLE skill_relation (
    source_id BIGINT NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
    type      VARCHAR(20) NOT NULL CHECK (type IN ('ADJACENT', 'PREREQUISITE', 'PARENT')),
    strength  NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (strength BETWEEN 0 AND 1),
    PRIMARY KEY (source_id, target_id, type),
    CHECK (source_id <> target_id)
);

-- ---------- Employee profile (current state + evidence ledger) ----------
CREATE TABLE employee_skill (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    skill_id    BIGINT NOT NULL REFERENCES skill(id),
    level       SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    confidence  NUMERIC(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    origin      VARCHAR(10) NOT NULL CHECK (origin IN ('EXPLICIT', 'INFERRED')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (employee_id, skill_id)
);

CREATE TABLE skill_evidence (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_skill_id BIGINT NOT NULL REFERENCES employee_skill(id) ON DELETE CASCADE,
    source_type       VARCHAR(20) NOT NULL CHECK (source_type IN ('RESUME', 'PROJECT', 'COURSE', 'REVIEW')),
    source_ref        VARCHAR(255),
    snippet           TEXT,
    weight            NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (weight BETWEEN 0 AND 1),
    observed_at       DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE project (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    started_on  DATE,
    ended_on    DATE
);

CREATE TABLE learning_activity (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id  BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    provider     VARCHAR(100),
    completed_on DATE
);

-- ---------- Roles and matching ----------
CREATE TABLE role_definition (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(150) NOT NULL,
    department_id BIGINT REFERENCES department(id),
    description   TEXT,
    status        VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FILLED')),
    embedding     vector(384),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_skill_requirement (
    role_id        BIGINT NOT NULL REFERENCES role_definition(id) ON DELETE CASCADE,
    skill_id       BIGINT NOT NULL REFERENCES skill(id),
    required_level SMALLINT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    importance     VARCHAR(4) NOT NULL CHECK (importance IN ('MUST', 'NICE')),
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE match_result (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    role_id         BIGINT NOT NULL REFERENCES role_definition(id) ON DELETE CASCADE,
    score           NUMERIC(5,4) NOT NULL CHECK (score BETWEEN 0 AND 1),
    breakdown       JSONB NOT NULL,
    explanation     TEXT,
    profile_version INTEGER NOT NULL,
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (employee_id, role_id)
);

-- ---------- Growth ----------
CREATE TABLE learning_resource (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    provider     VARCHAR(100),
    url          VARCHAR(500),
    skill_id     BIGINT NOT NULL REFERENCES skill(id),
    target_level SMALLINT NOT NULL CHECK (target_level BETWEEN 1 AND 5),
    effort_hours INTEGER NOT NULL CHECK (effort_hours > 0)
);

CREATE TABLE roadmap (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    role_id     BIGINT NOT NULL REFERENCES role_definition(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_step (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    roadmap_id           BIGINT NOT NULL REFERENCES roadmap(id) ON DELETE CASCADE,
    seq                  SMALLINT NOT NULL,
    skill_id             BIGINT REFERENCES skill(id),
    learning_resource_id BIGINT REFERENCES learning_resource(id),
    title                VARCHAR(200) NOT NULL,
    effort_weeks         NUMERIC(4,1),
    status               VARCHAR(12) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    UNIQUE (roadmap_id, seq)
);

-- ---------- Feedback and audit ----------
CREATE TABLE feedback (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('MATCH', 'ROADMAP', 'SKILL', 'ASSISTANT')),
    target_id   BIGINT,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN -1 AND 1),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id    BIGINT REFERENCES user_account(id) ON DELETE SET NULL,
    action      VARCHAR(60) NOT NULL,
    resource    VARCHAR(60),
    resource_id BIGINT,
    at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Indexes ----------
CREATE INDEX idx_employee_embedding ON employee        USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_role_embedding     ON role_definition USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_skill_embedding    ON skill           USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_employee_skill_emp    ON employee_skill (employee_id);
CREATE INDEX idx_employee_skill_skill  ON employee_skill (skill_id);
CREATE INDEX idx_evidence_emp_skill    ON skill_evidence (employee_skill_id);
CREATE INDEX idx_role_req_skill        ON role_skill_requirement (skill_id);
CREATE INDEX idx_match_role_score      ON match_result (role_id, score DESC);
CREATE INDEX idx_match_emp_score       ON match_result (employee_id, score DESC);
CREATE INDEX idx_skill_relation_target ON skill_relation (target_id);
CREATE INDEX idx_refresh_family        ON refresh_token (family_id);
CREATE INDEX idx_audit_actor_at        ON audit_log (actor_id, at DESC);

-- ---------- HR Analytics Materialized View ----------
CREATE MATERIALIZED VIEW skill_coverage AS
SELECT s.id                                          AS skill_id,
       s.name                                        AS skill_name,
       s.category                                    AS category,
       COUNT(es.id)                                  AS holders,
       COUNT(es.id) FILTER (WHERE es.level >= 3)     AS proficient_holders
FROM skill s
LEFT JOIN employee_skill es ON es.skill_id = s.id
GROUP BY s.id, s.name, s.category;

CREATE UNIQUE INDEX idx_skill_coverage_skill ON skill_coverage (skill_id);