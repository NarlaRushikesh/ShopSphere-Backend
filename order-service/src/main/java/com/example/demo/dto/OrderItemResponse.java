package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
}
