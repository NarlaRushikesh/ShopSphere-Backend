package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RazorpayResponse {
    private String razorpayOrderId;
    private double amount;
    private String currency;
    private String key;
}
