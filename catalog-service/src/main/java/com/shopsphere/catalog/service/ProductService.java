package com.shopsphere.catalog.service;

import com.shopsphere.catalog.dto.PaginatedResponse;
import com.shopsphere.catalog.dto.ProductDTO;
import com.shopsphere.catalog.dto.ProductSearchRequest;

import java.util.List;

public interface ProductService {
    ProductDTO createProduct(ProductDTO dto);
    ProductDTO getProductById(Long id);
    PaginatedResponse<ProductDTO> getAllProducts(int page, int size, String sortBy);
    PaginatedResponse<ProductDTO> searchProducts(ProductSearchRequest request);
    ProductDTO updateProduct(Long id, ProductDTO dto);
    void deleteProduct(Long id);
    List<ProductDTO> getFeaturedProducts();
    
    void reduceStock(Long id, int quantity);
    void increaseStock(Long id, int quantity);
}