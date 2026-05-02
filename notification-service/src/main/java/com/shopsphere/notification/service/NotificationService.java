package com.shopsphere.notification.service;

import com.shopsphere.notification.dto.OrderEvent;

public interface NotificationService {
    void sendOrderNotification(OrderEvent event);
}