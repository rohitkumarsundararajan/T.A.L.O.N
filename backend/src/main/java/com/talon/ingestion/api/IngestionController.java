package com.talon.ingestion.api;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1")
public class IngestionController {

    @PostMapping("/me/resume")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        String jobId = UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.accepted().body(Map.of("jobId", jobId));
    }

    @GetMapping(value = "/jobs/{jobId}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamJobEvents(@PathVariable String jobId) {
        SseEmitter emitter = new SseEmitter(60000L);
        Executors.newVirtualThreadPerTaskExecutor().submit(() -> {
            try {
                emitter.send(SseEmitter.event().name("progress").data("{\"stage\":\"PARSING\",\"percent\":20}"));
                Thread.sleep(600);
                emitter.send(SseEmitter.event().name("progress").data("{\"stage\":\"REDACTING\",\"percent\":45}"));
                Thread.sleep(600);
                emitter.send(SseEmitter.event().name("progress").data("{\"stage\":\"EXTRACTING\",\"percent\":70}"));
                Thread.sleep(600);
                emitter.send(SseEmitter.event().name("progress").data("{\"stage\":\"INFERRING\",\"percent\":90}"));
                Thread.sleep(500);
                emitter.send(SseEmitter.event().name("done").data("{\"skillsAdded\":3,\"inferredAdded\":1,\"unmapped\":0}"));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }
}