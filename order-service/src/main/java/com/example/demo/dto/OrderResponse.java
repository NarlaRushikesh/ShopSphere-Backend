package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private double totalAmount;
    private String status;
    private String userId;
    private java.time.LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}