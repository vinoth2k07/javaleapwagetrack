package com.example.track.repository;

import com.example.track.model.PaymentRecord;
import com.example.track.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PaymentRecordRepository
        extends JpaRepository<PaymentRecord, Long> {

    List<PaymentRecord> findByWorker(Worker worker);

    List<PaymentRecord> findByWorkerAndPaymentDateBetween(
            Worker worker,
            LocalDate startDate,
            LocalDate endDate
    );
}
