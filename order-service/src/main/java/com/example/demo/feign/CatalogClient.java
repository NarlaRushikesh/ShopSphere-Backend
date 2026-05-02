package com.example.demo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalog-service")
public interface CatalogClient {

    @GetMapping("/catalog/products/{id}")
    ProductResponse getProduct(@PathVariable Long id);

    @org.springframework.web.bind.annotation.PutMapping("/catalog/products/{id}/reduce-stock")
    void reduceStock(@PathVariable("id") Long id, @org.springframework.web.bind.annotation.RequestParam("quantity") int quantity);

    @org.springframework.web.bind.annotation.PutMapping("/catalog/products/{id}/increase-stock")
    void increaseStock(@PathVariable("id") Long id, @org.springframework.web.bind.annotation.RequestParam("quantity") int quantity);
}