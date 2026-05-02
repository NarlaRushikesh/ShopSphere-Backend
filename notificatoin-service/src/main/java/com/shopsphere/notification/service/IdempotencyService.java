package com.shopsphere.notification.service;

public interface IdempotencyService {

    boolean isProcessed(Long orderId);

    void markAsProcessed(Long orderId);
}