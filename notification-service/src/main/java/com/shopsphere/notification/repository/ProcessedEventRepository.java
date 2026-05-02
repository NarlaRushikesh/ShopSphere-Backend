package com.shopsphere.notification.repository;

import com.shopsphere.notification.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {

    Optional<ProcessedEvent> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}