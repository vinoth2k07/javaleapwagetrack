package com.example.track.service;

import com.example.track.model.Worksite;
import com.example.track.repository.WorksiteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorksiteService {

    private final WorksiteRepository worksiteRepository;

    public WorksiteService(WorksiteRepository worksiteRepository) {
        this.worksiteRepository = worksiteRepository;
    }

    // Create worksite
    public Worksite createWorksite(Worksite worksite) {
        return worksiteRepository.save(worksite);
    }

    // Get all worksites
    public List<Worksite> getAllWorksites() {
        return worksiteRepository.findAll();
    }

    // Get worksite by ID
    public Optional<Worksite> getWorksiteById(Long id) {
        return worksiteRepository.findById(id);
    }

    // Update worksite
    public Worksite updateWorksite(Long id, Worksite worksiteDetails) {

        Worksite worksite = worksiteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Worksite not found with ID: " + id));

        worksite.setName(worksiteDetails.getName());
        worksite.setLocation(worksiteDetails.getLocation());

        return worksiteRepository.save(worksite);
    }

    // Delete worksite
    public void deleteWorksite(Long id) {

        if (!worksiteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Worksite not found with ID: " + id);
        }

        worksiteRepository.deleteById(id);
    }
}
