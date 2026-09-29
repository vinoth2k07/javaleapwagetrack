package com.example.track.service;

import com.example.track.model.Attendance;
import com.example.track.model.AttendanceStatus;
import com.example.track.model.PaymentRecord;
import com.example.track.model.WeeklyPaymentSummary;
import com.example.track.model.Worker;
import com.example.track.repository.AttendanceRepository;
import com.example.track.repository.PaymentRecordRepository;
import com.example.track.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final WorkerRepository workerRepository;
    private final AttendanceRepository attendanceRepository;

    // Overtime payment per hour
    private static final double OVERTIME_RATE = 100.0;

    public PaymentService(
            PaymentRecordRepository paymentRecordRepository,
            WorkerRepository workerRepository,
            AttendanceRepository attendanceRepository) {

        this.paymentRecordRepository = paymentRecordRepository;
        this.workerRepository = workerRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // Calculate and create payment
    public PaymentRecord calculatePayment(
            Long workerId,
            Long attendanceId) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker not found with ID: " + workerId));

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Attendance not found with ID: " + attendanceId));

        double dailyWage = worker.getDailyWage();

        double basePay;

        if (attendance.getStatus() == AttendanceStatus.PRESENT) {

            // Full day = 100%
            basePay = dailyWage;

        } else if (attendance.getStatus() == AttendanceStatus.HALF_DAY) {

            // Half day = 50%
            basePay = dailyWage * 0.5;

        } else {

            // Absent = 0
            basePay = 0.0;
        }

        double overtimeHours = attendance.getOvertimeHours();

        // Absent workers cannot receive overtime
        if (attendance.getStatus() == AttendanceStatus.ABSENT) {
            overtimeHours = 0.0;
        }

        double overtimePay =
                overtimeHours * OVERTIME_RATE;

        double totalPay =
                basePay + overtimePay;

        PaymentRecord paymentRecord =
                new PaymentRecord();

        paymentRecord.setWorker(worker);
        paymentRecord.setAttendance(attendance);
        paymentRecord.setBasePay(basePay);
        paymentRecord.setOvertimeHours(overtimeHours);
        paymentRecord.setOvertimeRate(OVERTIME_RATE);
        paymentRecord.setOvertimePay(overtimePay);
        paymentRecord.setTotalPay(totalPay);
        paymentRecord.setPaymentDate(LocalDate.now());

        return paymentRecordRepository.save(paymentRecord);
    }

    // Get all payment records
    public List<PaymentRecord> getAllPayments() {

        return paymentRecordRepository.findAll();
    }

    // Get payment record by ID
    public PaymentRecord getPaymentById(Long id) {

        return paymentRecordRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment record not found with ID: " + id));
    }

    // Get all payments for a worker
    public List<PaymentRecord> getWorkerPayments(
            Long workerId) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker not found with ID: " + workerId));

        return paymentRecordRepository.findByWorker(worker);
    }

    // Calculate weekly payment
    public WeeklyPaymentSummary calculateWeeklyPayment(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker not found with ID: " + workerId));

        List<Attendance> attendanceList =
                attendanceRepository
                        .findByWorkerAndAttendanceDateBetween(
                                worker,
                                startDate,
                                endDate
                        );

        double totalPayment = 0.0;

        for (Attendance attendance : attendanceList) {

            double basePay;

            if (attendance.getStatus() == AttendanceStatus.PRESENT) {

                basePay = worker.getDailyWage();

            } else if (attendance.getStatus() == AttendanceStatus.HALF_DAY) {

                basePay = worker.getDailyWage() * 0.5;

            } else {

                basePay = 0.0;
            }

            double overtimeHours =
                    attendance.getOvertimeHours();

            if (attendance.getStatus() == AttendanceStatus.ABSENT) {
                overtimeHours = 0.0;
            }

            double overtimePay =
                    overtimeHours * OVERTIME_RATE;

            totalPayment +=
                    basePay + overtimePay;
        }

        return new WeeklyPaymentSummary(
                worker.getId(),
                worker.getName(),
                startDate.toString(),
                endDate.toString(),
                totalPayment
        );
    }
}
