package com.example.track.controller;

import com.example.track.model.Worker;
import com.example.track.service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    // Create worker
    @PostMapping
    public ResponseEntity<Worker> createWorker(
            @Valid @RequestBody Worker worker) {

        return ResponseEntity.ok(workerService.createWorker(worker));
    }

    // Get all workers
    @GetMapping
    public ResponseEntity<List<Worker>> getAllWorkers() {

        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    // Get worker by ID
    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(
            @PathVariable Long id) {

        return workerService.getWorkerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update worker
    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(
            @PathVariable Long id,
            @Valid @RequestBody Worker worker) {

        return ResponseEntity.ok(
                workerService.updateWorker(id, worker)
        );
    }

    // Delete worker
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(
            @PathVariable Long id) {

        workerService.deleteWorker(id);

        return ResponseEntity.noContent().build();
    }
}

