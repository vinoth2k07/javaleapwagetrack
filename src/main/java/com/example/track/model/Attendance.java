package com.example.track.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    @NotNull(message = "Worker is required")
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "worksite_id", nullable = false)
    @NotNull(message = "Worksite is required")
    private Worksite worksite;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @PositiveOrZero(message = "Overtime hours cannot be negative")
    private Double overtimeHours = 0.0;

    public Attendance() {
    }

    public Attendance(Long id, Worker worker, Worksite worksite,
                      LocalDate attendanceDate,
                      AttendanceStatus status,
                      Double overtimeHours) {
        this.id = id;
        this.worker = worker;
        this.worksite = worksite;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.overtimeHours = overtimeHours;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    public Worksite getWorksite() {
        return worksite;
    }

    public void setWorksite(Worksite worksite) {
        this.worksite = worksite;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public Double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(Double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }
}
