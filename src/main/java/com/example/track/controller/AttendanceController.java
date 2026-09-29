package com.example.track.controller;

import com.example.track.model.Attendance;
import com.example.track.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Create attendance
    @PostMapping
    public ResponseEntity<Attendance> createAttendance(
            @Valid @RequestBody Attendance attendance) {

        return ResponseEntity.ok(
                attendanceService.createAttendance(attendance)
        );
    }

    // Get all attendance
    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {

        return ResponseEntity.ok(
                attendanceService.getAllAttendance()
        );
    }

    // Get attendance by ID
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(
            @PathVariable Long id) {

        return attendanceService.getAttendanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update attendance
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody Attendance attendance) {

        return ResponseEntity.ok(
                attendanceService.updateAttendance(
                        id,
                        attendance
                )
        );
    }

    // Delete attendance
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(
            @PathVariable Long id) {

        attendanceService.deleteAttendance(id);

        return ResponseEntity.noContent().build();
    }
}
