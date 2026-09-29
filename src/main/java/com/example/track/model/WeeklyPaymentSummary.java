package com.example.track.model;

public class WeeklyPaymentSummary {

    private Long workerId;
    private String workerName;
    private String startDate;
    private String endDate;
    private Double totalPayment;

    public WeeklyPaymentSummary() {
    }

    public WeeklyPaymentSummary(
            Long workerId,
            String workerName,
            String startDate,
            String endDate,
            Double totalPayment) {

        this.workerId = workerId;
        this.workerName = workerName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalPayment = totalPayment;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Double getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(Double totalPayment) {
        this.totalPayment = totalPayment;
    }
}
