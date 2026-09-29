package com.example.track.service;

import com.example.track.model.Worker;
import com.example.track.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    // Create worker
    public Worker createWorker(Worker worker) {
        return workerRepository.save(worker);
    }

    // Get all workers
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    // Get worker by ID
    public Optional<Worker> getWorkerById(Long id) {
        return workerRepository.findById(id);
    }

    // Update worker
    public Worker updateWorker(Long id, Worker workerDetails) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + id));

        worker.setName(workerDetails.getName());
        worker.setPhone(workerDetails.getPhone());
        worker.setDailyWage(workerDetails.getDailyWage());

        return workerRepository.save(worker);
    }

    // Delete worker
    public void deleteWorker(Long id) {

        if (!workerRepository.existsById(id)) {
            throw new RuntimeException("Worker not found with ID: " + id);
        }

        workerRepository.deleteById(id);
    }
}
