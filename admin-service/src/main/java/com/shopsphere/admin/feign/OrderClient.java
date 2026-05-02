package com.shopsphere.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/orders") // Admin viewing all orders, assuming Order service exposes this or we add it. 
    Object getAllOrders();

    @PutMapping("/orders/{id}/status")
    String updateOrderStatus(@PathVariable("id") Long id, @RequestBody com.shopsphere.admin.dto.UpdateOrderStatusRequest request);

    @GetMapping("/orders/count")
    long getTotalOrdersCount();

    @GetMapping("/orders/revenue")
    double getTotalRevenue();
}
