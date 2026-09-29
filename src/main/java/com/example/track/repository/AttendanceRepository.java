package com.example.track.repository;

import com.example.track.model.Attendance;
import com.example.track.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByWorker(Worker worker);

    List<Attendance> findByWorkerAndAttendanceDateBetween(
            Worker worker,
            LocalDate startDate,
            LocalDate endDate
    );
}
