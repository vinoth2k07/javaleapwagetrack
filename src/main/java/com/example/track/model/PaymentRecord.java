package com.example.track.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    @NotNull(message = "Worker is required")
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "attendance_id", nullable = false)
    @NotNull(message = "Attendance is required")
    private Attendance attendance;

    @NotNull
    @PositiveOrZero
    private Double basePay;

    @NotNull
    @PositiveOrZero
    private Double overtimeHours;

    @NotNull
    @PositiveOrZero
    private Double overtimeRate;

    @NotNull
    @PositiveOrZero
    private Double overtimePay;

    @NotNull
    @PositiveOrZero
    private Double totalPay;

    @NotNull
    private LocalDate paymentDate;

    public PaymentRecord() {
    }

    public PaymentRecord(Long id,
                         Worker worker,
                         Attendance attendance,
                         Double basePay,
                         Double overtimeHours,
                         Double overtimeRate,
                         Double overtimePay,
                         Double totalPay,
                         LocalDate paymentDate) {

        this.id = id;
        this.worker = worker;
        this.attendance = attendance;
        this.basePay = basePay;
        this.overtimeHours = overtimeHours;
        this.overtimeRate = overtimeRate;
        this.overtimePay = overtimePay;
        this.totalPay = totalPay;
        this.paymentDate = paymentDate;
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

    public Attendance getAttendance() {
        return attendance;
    }

    public void setAttendance(Attendance attendance) {
        this.attendance = attendance;
    }

    public Double getBasePay() {
        return basePay;
    }

    public void setBasePay(Double basePay) {
        this.basePay = basePay;
    }

    public Double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(Double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public Double getOvertimeRate() {
        return overtimeRate;
    }

    public void setOvertimeRate(Double overtimeRate) {
        this.overtimeRate = overtimeRate;
    }

    public Double getOvertimePay() {
        return overtimePay;
    }

    public void setOvertimePay(Double overtimePay) {
        this.overtimePay = overtimePay;
    }

    public Double getTotalPay() {
        return totalPay;
    }

    public void setTotalPay(Double totalPay) {
        this.totalPay = totalPay;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
}
