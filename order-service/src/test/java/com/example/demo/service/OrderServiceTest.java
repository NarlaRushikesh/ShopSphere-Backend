package com.example.demo.service;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.OrderItemRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.feign.CatalogClient;
import com.example.demo.feign.ProductResponse;
import com.example.demo.producer.OrderProducer;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CatalogClient catalogClient;

    @Mock
    private OrderProducer orderProducer;

    @InjectMocks
    private OrderServiceImpl orderService;

    private ProductResponse mockProduct;
    private Order mockOrder;

    @BeforeEach
    void setUp() {
        mockProduct = new ProductResponse();
        mockProduct.setId(10L);
        mockProduct.setName("Laptop");
        mockProduct.setPrice(1200.0);
        mockProduct.setStock(5);

        mockOrder = new Order();
        mockOrder.setId(100L);
        mockOrder.setUserId("test@test.com");
        mockOrder.setStatus(OrderStatus.CREATED);
        mockOrder.setTotalAmount(1200.0);
        
        com.example.demo.entity.OrderItem mockItem = new com.example.demo.entity.OrderItem();
        mockItem.setProductId(10L);
        mockItem.setQuantity(1);
        mockOrder.setItems(java.util.List.of(mockItem));
    }

    @Test
    void testCreateOrder_Success() {
        CreateOrderRequest request = new CreateOrderRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(10L);
        item.setQuantity(1);
        request.setItems(List.of(item));

        when(catalogClient.getProduct(10L)).thenReturn(mockProduct);
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        doNothing().when(catalogClient).reduceStock(anyLong(), anyInt());

        OrderResponse response = orderService.createOrder(request, "test@test.com");

        assertNotNull(response);
        assertEquals(100L, response.getOrderId());
        assertEquals("CREATED", response.getStatus());

        verify(orderRepository, times(1)).save(any(Order.class));
        verify(catalogClient, times(1)).reduceStock(10L, 1);
    }

    @Test
    void testCreateOrder_InsufficientStock_ThrowsException() {
        CreateOrderRequest request = new CreateOrderRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(10L);
        item.setQuantity(10); // requested 10, stock is 5
        request.setItems(List.of(item));

        when(catalogClient.getProduct(10L)).thenReturn(mockProduct);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> orderService.createOrder(request, "test@test.com"));
        assertTrue(exception.getMessage().contains("Insufficient stock"));
    }

    @Test
    void testCancelOrder_Success() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(mockOrder));
        doNothing().when(catalogClient).increaseStock(anyLong(), anyInt());

        assertDoesNotThrow(() -> orderService.cancelOrder(100L));
        assertEquals(OrderStatus.CANCELLED, mockOrder.getStatus());
        verify(orderRepository, times(1)).save(mockOrder);
        verify(catalogClient, times(1)).increaseStock(10L, 1);
    }
}
