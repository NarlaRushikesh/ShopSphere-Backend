package com.example.demo.controller;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.dto.UpdateOrderStatusRequest;
import com.example.demo.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    //  CREATE ORDER (WITH EMAIL FROM SECURITY CONTEXT)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.createOrder(request, email));
    }

    //  GET ORDER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    //  GET ORDERS FOR CURRENT USER (EMAIL BASED)
    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.getOrdersByUser(email));
    }

    //  CANCEL ORDER
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    //  GET ALL ORDERS (ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    //  GET TOTAL ORDERS COUNT (ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalOrdersCount() {
        return ResponseEntity.ok(orderService.getTotalOrdersCount());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(orderService.getTotalRevenue());
    }

    //  UPDATE ORDER STATUS (ADMIN / SERVICE COMMUNICATION)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok("Order status updated to " + request.getStatus());
    }

    //  CHECKOUT START
    @PostMapping("/checkout/start")
    public ResponseEntity<?> startCheckout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok("Checkout started for email: " + email + ". Please proceed to payment.");
    }

    //  CHECKOUT PAYMENT
    @PostMapping("/payment")
    public ResponseEntity<String> processPayment(@Valid @RequestBody com.example.demo.dto.PaymentRequest request) {
        return ResponseEntity.ok(orderService.processPayment(request));
    }

    //  PLACE ORDER FROM CART
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrderFromCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.placeOrderFromCart(email));
    }

    //  RAZORPAY - CREATE ORDER
    @PostMapping("/{id}/razorpay/create")
    public ResponseEntity<com.example.demo.dto.RazorpayResponse> createRazorpayOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.createRazorpayOrder(id));
    }

    //  RAZORPAY - VERIFY PAYMENT
    @PostMapping("/{id}/razorpay/verify")
    public ResponseEntity<String> verifyRazorpayPayment(
            @PathVariable Long id,
            @Valid @RequestBody com.example.demo.dto.RazorpayVerificationRequest request) {
        return ResponseEntity.ok(orderService.verifyRazorpayPayment(id, request));
    }
}