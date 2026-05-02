package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g., CARD, UPI, COD
    
    // Auto-calculates amount from order
    private Long orderId;
    
    private String cardNumber; // optional/mocked
}
