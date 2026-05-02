package com.shopsphere.admin.controller;

import com.shopsphere.admin.dto.DashboardMetricsResponse;
import com.shopsphere.admin.feign.CatalogClient;
import com.shopsphere.admin.feign.OrderClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private CatalogClient catalogClient;

    @Mock
    private OrderClient orderClient;

    @InjectMocks
    private AdminController adminController;

    @Test
    void testGetDashboardMetrics_Success() {
        // Mock proxy dependencies to safely test Dashboard computation
        java.util.Map<String, Object> mockMap = new java.util.HashMap<>();
        mockMap.put("totalElements", 100);
        when(catalogClient.getAllProducts(0, 1)).thenReturn(mockMap); 
        when(orderClient.getTotalOrdersCount()).thenReturn(50L);

        ResponseEntity<DashboardMetricsResponse> response = adminController.getDashboardMetrics();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        
        DashboardMetricsResponse metrics = response.getBody();
        assertNotNull(metrics);
        assertEquals(100, metrics.getTotalProducts());
        assertEquals(50, metrics.getTotalOrders()); 

        verify(catalogClient, times(1)).getAllProducts(0, 1);
        verify(orderClient, times(1)).getTotalOrdersCount();
    }
    
    @Test
    void testGenerateReports_Success() {
        ResponseEntity<String> response = adminController.generateReports();
        
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().contains("Detailed sales and inventory report"));
    }
}
