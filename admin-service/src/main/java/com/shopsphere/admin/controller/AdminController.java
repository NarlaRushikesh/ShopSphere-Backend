package com.shopsphere.admin.controller;

import com.shopsphere.admin.dto.DashboardMetricsResponse;
import com.shopsphere.admin.dto.UpdateOrderStatusRequest;
import com.shopsphere.admin.feign.AuthClient;
import com.shopsphere.admin.feign.CatalogClient;
import com.shopsphere.admin.feign.OrderClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final CatalogClient catalogClient;
    private final OrderClient orderClient;
    private final AuthClient authClient;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsResponse> getDashboardMetrics() {
        java.util.Map<String, Object> productPage = catalogClient.getAllProducts(0, 1);
        long totalProducts = productPage != null && productPage.get("totalElements") != null ? 
                             Long.parseLong(productPage.get("totalElements").toString()) : 0;

        DashboardMetricsResponse metrics = DashboardMetricsResponse.builder()
                .totalProducts((int) totalProducts)
                .totalOrders((int) orderClient.getTotalOrdersCount())
                .totalUsers(authClient.getTotalUsersCount())
                .totalRevenue(orderClient.getTotalRevenue())
                .build();
        return ResponseEntity.ok(metrics);
    }

    // PRODUCT MANAGEMENT removed - handled directly by catalog-service



    // ORDER MANAGEMENT
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderClient.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderClient.updateOrderStatus(id, request));
    }

    // REPORTS
    @GetMapping("/reports")
    public ResponseEntity<String> generateReports() {
        return ResponseEntity.ok("Detailed sales and inventory report generated (mock)");
    }

    // USER MANAGEMENT
    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.shopsphere.admin.dto.UserDto>> getAllUsers() {
        return ResponseEntity.ok(authClient.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        authClient.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
