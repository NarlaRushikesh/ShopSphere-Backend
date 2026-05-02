package com.shopsphere.notification.service.impl;

import com.shopsphere.notification.entity.ProcessedEvent;
import com.shopsphere.notification.repository.ProcessedEventRepository;
import com.shopsphere.notification.service.IdempotencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IdempotencyServiceImpl implements IdempotencyService {

    private final ProcessedEventRepository repository;

    @Override
    public boolean isProcessed(Long orderId) {
        return repository.existsByOrderId(orderId);
    }

    @Override
    public void markAsProcessed(Long orderId) {
        ProcessedEvent event = ProcessedEvent.builder()
                .orderId(orderId)
                .processedAt(LocalDateTime.now())
                .build();

        repository.save(event);
    }
}