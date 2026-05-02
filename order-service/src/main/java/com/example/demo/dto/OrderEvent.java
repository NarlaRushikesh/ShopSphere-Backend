package com.example.demo.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderEvent {
    private Long orderId;
    private String userId;
    private double totalAmount;
    private String status;
}