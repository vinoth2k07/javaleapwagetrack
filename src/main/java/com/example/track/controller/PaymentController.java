package com.example.track.controller;

import com.example.track.model.PaymentRecord;
import com.example.track.model.WeeklyPaymentSummary;
import com.example.track.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // Calculate and create payment
    @PostMapping("/calculate")
    public ResponseEntity<PaymentRecord> calculatePayment(
            @RequestParam Long workerId,
            @RequestParam Long attendanceId) {

        return ResponseEntity.ok(
                paymentService.calculatePayment(
                        workerId,
                        attendanceId
                )
        );
    }

    // Get all payment records
    @GetMapping
    public ResponseEntity<List<PaymentRecord>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentRecord> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    // Get all payments of a worker
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<PaymentRecord>> getWorkerPayments(
            @PathVariable Long workerId) {

        return ResponseEntity.ok(
                paymentService.getWorkerPayments(workerId)
        );
    }

    // Calculate weekly payment
    @GetMapping("/weekly/{workerId}")
    public ResponseEntity<WeeklyPaymentSummary> calculateWeeklyPayment(
            @PathVariable Long workerId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start =
                LocalDate.parse(startDate);

        LocalDate end =
                LocalDate.parse(endDate);

        return ResponseEntity.ok(
                paymentService.calculateWeeklyPayment(
                        workerId,
                        start,
                        end
                )
        );
    }
}
