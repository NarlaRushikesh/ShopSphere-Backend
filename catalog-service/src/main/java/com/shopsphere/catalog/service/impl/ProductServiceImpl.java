package com.shopsphere.catalog.service.impl;

import com.shopsphere.catalog.dto.PaginatedResponse;
import com.shopsphere.catalog.dto.ProductDTO;
import com.shopsphere.catalog.dto.ProductSearchRequest;
import com.shopsphere.catalog.entity.Category;
import com.shopsphere.catalog.entity.Product;
import com.shopsphere.catalog.repository.CategoryRepository;
import com.shopsphere.catalog.repository.ProductRepository;
import com.shopsphere.catalog.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private ProductDTO mapToDTO(Product product) {
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getBrand(),
                product.getImageUrl(),
                product.isFeatured(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null
        );
    }

    private Product mapToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setBrand(dto.getBrand());
        product.setImageUrl(dto.getImageUrl());
        product.setFeatured(dto.isFeatured()); // boolean defaults to false if not set

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        } else {
            throw new RuntimeException("Product must belong to a category");
        }

        return product;
    }
    
    private PaginatedResponse<ProductDTO> mapToPaginatedResponse(Page<ProductDTO> page) {
        return new PaginatedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }

    @Override
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = mapToEntity(dto);
        return mapToDTO(productRepository.save(product));
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(product);
    }

    @Override
    public PaginatedResponse<ProductDTO> getAllProducts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productPage = productRepository.findAll(pageable).map(this::mapToDTO);
        return mapToPaginatedResponse(productPage);
    }

    @Override
    public PaginatedResponse<ProductDTO> searchProducts(ProductSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        Page<Product> pageResult = productRepository.searchProductsWithFilters(
                request.getKeyword(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getBrand(),
                request.getCategoryId(),
                pageable
        );
        
        return mapToPaginatedResponse(pageResult.map(this::mapToDTO));
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setStock(dto.getStock());
        existing.setBrand(dto.getBrand());
        existing.setImageUrl(dto.getImageUrl());
        existing.setFeatured(dto.isFeatured());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(category);
        } else {
            throw new RuntimeException("Product must belong to a category");
        }

        return mapToDTO(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void reduceStock(Long id, int quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for product id: " + id);
        }
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    @Override
    public void increaseStock(Long id, int quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }
}