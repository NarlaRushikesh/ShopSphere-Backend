package com.shopsphere.notification.dto;

import lombok.Data;

@Data
public class OrderEvent {
    private Long orderId;
    private String userId;
    private double totalAmount;
    private String status;
}