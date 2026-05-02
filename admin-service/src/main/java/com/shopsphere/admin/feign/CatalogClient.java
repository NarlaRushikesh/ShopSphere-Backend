package com.shopsphere.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "catalog-service")
public interface CatalogClient {


    @GetMapping("/catalog/products")
    java.util.Map<String, Object> getAllProducts(@RequestParam("page") int page, @RequestParam("size") int size);
}
