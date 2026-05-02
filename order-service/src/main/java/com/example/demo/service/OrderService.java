package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.dto.PaymentRequest;

public interface OrderService {

    
    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByUser(String email);
    List<OrderResponse> getAllOrders();
    long getTotalOrdersCount();
    double getTotalRevenue();
    
    OrderResponse createOrder(CreateOrderRequest request, String email);
    void cancelOrder(Long id);
    void updateOrderStatus(Long id, String status);
    
    OrderResponse placeOrderFromCart(String email);
    String processPayment(PaymentRequest request);
    
    com.example.demo.dto.RazorpayResponse createRazorpayOrder(Long orderId);
    String verifyRazorpayPayment(Long orderId, com.example.demo.dto.RazorpayVerificationRequest request);

}