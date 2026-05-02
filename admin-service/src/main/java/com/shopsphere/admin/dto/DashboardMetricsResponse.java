package com.shopsphere.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetricsResponse {
    private long totalProducts;
    private long totalOrders;
    private long totalUsers;
    private double totalRevenue;
}
