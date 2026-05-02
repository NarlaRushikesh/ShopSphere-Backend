package com.shopsphere.catalog.controller;

import com.shopsphere.catalog.dto.PaginatedResponse;
import com.shopsphere.catalog.dto.ProductDTO;
import com.shopsphere.catalog.dto.ProductSearchRequest;
import com.shopsphere.catalog.service.ProductService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/catalog/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    // ADMIN ONLY TEST
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<?> getAllProductsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
            
        return ResponseEntity.ok(productService.getAllProducts(page, size, sortBy));
    }

    // CREATE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ProductDTO createProduct(@Valid @RequestBody ProductDTO dto) {
        return productService.createProduct(dto);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ProductDTO getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // GET ALL + PAGINATION + SORT
    @GetMapping
    public PaginatedResponse<ProductDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        return productService.getAllProducts(page, size, sortBy);
    }

    // SEARCH (POST)
    @PostMapping("/search")
    public PaginatedResponse<ProductDTO> searchProducts(@RequestBody ProductSearchRequest request) {
        return productService.searchProducts(request);
    }

    // UPDATE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ProductDTO updateProduct(@PathVariable Long id,
                                   @Valid @RequestBody ProductDTO dto) {
        return productService.updateProduct(id, dto);
    }

    // DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }

    // REDUCE STOCK
    @PutMapping("/{id}/reduce-stock")
    public ResponseEntity<String> reduceStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok("Stock reduced successfully");
    }

    // INCREASE STOCK
    @PutMapping("/{id}/increase-stock")
    public ResponseEntity<String> increaseStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.increaseStock(id, quantity);
        return ResponseEntity.ok("Stock increased successfully");
    }
}