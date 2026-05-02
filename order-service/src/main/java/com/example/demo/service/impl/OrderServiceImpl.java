package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.feign.CatalogClient;
import com.example.demo.feign.ProductResponse;
import com.example.demo.producer.OrderProducer;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.CartService;
import com.example.demo.service.OrderService;
import com.example.demo.service.RazorpayService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CatalogClient catalogClient;
    private final OrderProducer orderProducer;
    private final CartService cartService;
    private final RazorpayService razorpayService;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request, String email) {

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        for (OrderItemRequest itemRequest : request.getItems()) {

            ProductResponse product = catalogClient.getProduct(itemRequest.getProductId());

            if (product == null) {
                throw new RuntimeException("Product not found: " + itemRequest.getProductId());
            }

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getId());
            }

            double price = product.getPrice();
            double itemTotal = price * itemRequest.getQuantity();
            totalAmount += itemTotal;

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .price(price)
                    .build();

            orderItems.add(orderItem);
        }

        // ✅ FIXED HERE
        Order order = Order.builder()
                .userId(email) // 🔥 use email from gateway
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .totalAmount(totalAmount)
                .items(orderItems)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);

        // Reduce stock in catalog-service for each item
        for (OrderItem item : orderItems) {
            catalogClient.reduceStock(item.getProductId(), item.getQuantity());
        }

        List<OrderItemResponse> itemResponses = savedOrder.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus().name())
                .userId(savedOrder.getUserId())
                .createdAt(savedOrder.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    @Override
    public OrderResponse getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        return mapToResponse(order);
    }

    // ✅ FIXED HERE (String instead of Long)
    @Override
    public List<OrderResponse> getOrdersByUser(String userId) {

        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public long getTotalOrdersCount() {
        return orderRepository.count();
    }

    @Override
    public double getTotalRevenue() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    @Override
    public void cancelOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order already cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            catalogClient.increaseStock(item.getProductId(), item.getQuantity());
        }
    }

    @Override
    public void updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        try {
            order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
            orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status provided: " + status);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public OrderResponse placeOrderFromCart(String email) {
        System.out.println("📦 Placing order from cart for user: " + email);
        
        if (email == null || email.trim().isEmpty() || email.equals("anonymousUser")) {
            throw new RuntimeException("User must be authenticated to place an order");
        }

        CartDTO cart = cartService.getCartByUserEmail(email);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty for user: " + email);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        for (CartItemDTO itemReq : cart.getItems()) {
            // Use price and name already stored in cart — avoids an extra Feign call
            // Stock was validated when item was added to cart
            double itemTotal = itemReq.getPrice() * itemReq.getQuantity();
            totalAmount += itemTotal;

            OrderItem orderItem = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .productName(itemReq.getProductName())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        Order order = Order.builder()
                .userId(email)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .totalAmount(totalAmount)
                .items(orderItems)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        System.out.println("✅ Order saved successfully. ID: " + savedOrder.getId() + ", User: " + savedOrder.getUserId());

        // Reduce stock in catalog-service for each item (best-effort)
        for (OrderItem item : orderItems) {
            try {
                catalogClient.reduceStock(item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                System.err.println("Warning: failed to reduce stock for product " + item.getProductId() + ": " + e.getMessage());
            }
        }

        // 4. Clear the cart
        cartService.clearCart(email);

        // 5. Send order event to RabbitMQ for notification-service
        OrderEvent event = OrderEvent.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus().name())
                .build();

        System.out.println("📤 Sending order event to RabbitMQ: " + event);
        orderProducer.sendOrderEvent(event);

        return mapToResponse(savedOrder);
    }

    @Override
    public String processPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new RuntimeException("Order is already paid");
        }

        // Update status to PAID
        order.setStatus(OrderStatus.PAID);
        Order savedOrder = orderRepository.save(order);

        // 🔥 SEND EVENT TO RABBITMQ (Notification Service consumes this)
        OrderEvent event = new OrderEvent();
        event.setOrderId(savedOrder.getId());
        event.setUserId(savedOrder.getUserId()); 
        event.setTotalAmount(savedOrder.getTotalAmount());
        event.setStatus(savedOrder.getStatus().name());

        orderProducer.sendOrderEvent(event);

        return "Payment of " + savedOrder.getTotalAmount() + " processed successfully using " + request.getPaymentMethod();
    }

    @Override
    public RazorpayResponse createRazorpayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new RuntimeException("Order is already paid");
        }

        com.razorpay.Order razorpayOrder = razorpayService.createOrder(order.getTotalAmount(), String.valueOf(orderId));

        return RazorpayResponse.builder()
                .razorpayOrderId(razorpayOrder.get("id"))
                .amount(order.getTotalAmount())
                .currency("INR") // Match RazorpayService
                .key(razorpayService.getKeyId())
                .build();
    }

    @Override
    public String verifyRazorpayPayment(Long orderId, RazorpayVerificationRequest request) {
        boolean isValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            throw new RuntimeException("Payment verification failed. Invalid signature.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.PAID) {
            order.setStatus(OrderStatus.PAID);
            Order savedOrder = orderRepository.save(order);

            // 🔥 SEND EVENT TO RABBITMQ (Notification Service consumes this)
            OrderEvent event = new OrderEvent();
            event.setOrderId(savedOrder.getId());
            event.setUserId(savedOrder.getUserId()); 
            event.setTotalAmount(savedOrder.getTotalAmount());
            event.setStatus(savedOrder.getStatus().name());

            orderProducer.sendOrderEvent(event);
        }

        return "Razorpay payment verified successfully for order " + orderId;
    }

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .userId(order.getUserId())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}