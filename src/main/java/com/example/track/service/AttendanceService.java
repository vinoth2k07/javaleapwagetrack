package com.example.track.service;

import com.example.track.model.Attendance;
import com.example.track.model.AttendanceStatus;
import com.example.track.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // Create attendance
    public Attendance createAttendance(Attendance attendance) {

        // Absent workers cannot have overtime
        if (attendance.getStatus() == AttendanceStatus.ABSENT) {
            attendance.setOvertimeHours(0.0);
        }

        // If overtime is not provided, use zero
        if (attendance.getOvertimeHours() == null) {
            attendance.setOvertimeHours(0.0);
        }

        // Overtime cannot be negative
        if (attendance.getOvertimeHours() < 0) {
            throw new RuntimeException(
                    "Overtime hours cannot be negative"
            );
        }

        return attendanceRepository.save(attendance);
    }

    // Get all attendance records
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // Get attendance by ID
    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }

    // Update attendance
    public Attendance updateAttendance(
            Long id,
            Attendance attendanceDetails) {

        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Attendance not found with ID: " + id
                        ));

        attendance.setWorker(attendanceDetails.getWorker());
        attendance.setWorksite(attendanceDetails.getWorksite());
        attendance.setAttendanceDate(
                attendanceDetails.getAttendanceDate()
        );
        attendance.setStatus(attendanceDetails.getStatus());

        Double overtime = attendanceDetails.getOvertimeHours();

        if (attendanceDetails.getStatus() == AttendanceStatus.ABSENT) {
            overtime = 0.0;
        }

        if (overtime == null) {
            overtime = 0.0;
        }

        if (overtime < 0) {
            throw new RuntimeException(
                    "Overtime hours cannot be negative"
            );
        }

        attendance.setOvertimeHours(overtime);

        return attendanceRepository.save(attendance);
    }

    // Delete attendance
    public void deleteAttendance(Long id) {

        if (!attendanceRepository.existsById(id)) {
            throw new RuntimeException(
                    "Attendance not found with ID: " + id
            );
        }

        attendanceRepository.deleteById(id);
    }
}
