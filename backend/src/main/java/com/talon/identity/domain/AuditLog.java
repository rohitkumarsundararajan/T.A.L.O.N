package com.talon.identity.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(nullable = false, length = 60)
    private String action;

    @Column(length = 60)
    private String resource;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime at = OffsetDateTime.now();

    public AuditLog() {}

    public AuditLog(Long actorId, String action, String resource, Long resourceId) {
        this.actorId = actorId;
        this.action = action;
        this.resource = resource;
        this.resourceId = resourceId;
    }

    public Long getId() { return id; }
    public Long getActorId() { return actorId; }
    public String getAction() { return action; }
    public String getResource() { return resource; }
    public Long getResourceId() { return resourceId; }
    public OffsetDateTime getAt() { return at; }
}