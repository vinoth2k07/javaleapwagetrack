package com.example.track.controller;

import com.example.track.model.Worksite;
import com.example.track.service.WorksiteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worksites")
public class WorksiteController {

    private final WorksiteService worksiteService;

    public WorksiteController(WorksiteService worksiteService) {
        this.worksiteService = worksiteService;
    }

    // Create worksite
    @PostMapping
    public ResponseEntity<Worksite> createWorksite(
            @Valid @RequestBody Worksite worksite) {

        return ResponseEntity.ok(
                worksiteService.createWorksite(worksite)
        );
    }

    // Get all worksites
    @GetMapping
    public ResponseEntity<List<Worksite>> getAllWorksites() {

        return ResponseEntity.ok(
                worksiteService.getAllWorksites()
        );
    }

    // Get worksite by ID
    @GetMapping("/{id}")
    public ResponseEntity<Worksite> getWorksiteById(
            @PathVariable Long id) {

        return worksiteService.getWorksiteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update worksite
    @PutMapping("/{id}")
    public ResponseEntity<Worksite> updateWorksite(
            @PathVariable Long id,
            @Valid @RequestBody Worksite worksite) {

        return ResponseEntity.ok(
                worksiteService.updateWorksite(id, worksite)
        );
    }

    // Delete worksite
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorksite(
            @PathVariable Long id) {

        worksiteService.deleteWorksite(id);

        return ResponseEntity.noContent().build();
    }
}
