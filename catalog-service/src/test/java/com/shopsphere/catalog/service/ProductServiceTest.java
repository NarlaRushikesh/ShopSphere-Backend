package com.shopsphere.catalog.service;

import com.shopsphere.catalog.dto.PaginatedResponse;
import com.shopsphere.catalog.dto.ProductDTO;
import com.shopsphere.catalog.entity.Category;
import com.shopsphere.catalog.entity.Product;
import com.shopsphere.catalog.repository.CategoryRepository;
import com.shopsphere.catalog.repository.ProductRepository;
import com.shopsphere.catalog.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product mockProduct;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        mockCategory = new Category();
        mockCategory.setId(1L);
        mockCategory.setName("Electronics");

        mockProduct = new Product();
        mockProduct.setId(10L);
        mockProduct.setName("Laptop");
        mockProduct.setPrice(1200.0);
        mockProduct.setCategory(mockCategory);
        mockProduct.setStock(10);
    }

    @Test
    void testCreateProduct_Success() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Laptop");
        dto.setPrice(1200.0);
        dto.setCategoryId(1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(productRepository.save(any(Product.class))).thenReturn(mockProduct);

        ProductDTO result = productService.createProduct(dto);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        assertEquals("Electronics", result.getCategoryName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testGetProductById_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(mockProduct));

        ProductDTO result = productService.getProductById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Laptop", result.getName());
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> productService.getProductById(99L));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    void testGetAllProducts_Success() {
        Page<Product> page = new PageImpl<>(Collections.singletonList(mockProduct));
        when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

        PaginatedResponse<ProductDTO> result = productService.getAllProducts(0, 10, "id");
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Laptop", result.getContent().get(0).getName());
    }

    @Test
    void testGetFeaturedProducts_Success() {
        mockProduct.setFeatured(true);
        when(productRepository.findByIsFeaturedTrue()).thenReturn(List.of(mockProduct));

        List<ProductDTO> result = productService.getFeaturedProducts();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Laptop", result.get(0).getName());
    }
}
