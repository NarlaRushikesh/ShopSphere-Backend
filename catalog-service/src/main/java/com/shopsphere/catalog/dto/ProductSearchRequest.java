package com.shopsphere.catalog.dto;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String keyword;
    private Double minPrice;
    private Double maxPrice;
    private String brand;
    private Long categoryId;
    
    // Pagination defaults
    private int page = 0;
    private int size = 5;
}
