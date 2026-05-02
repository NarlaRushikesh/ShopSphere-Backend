package com.shopsphere.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "auth-service", url = "http://localhost:8087")
public interface AuthClient {

    @GetMapping("/auth/users/count")
    Long getTotalUsersCount();

    @GetMapping("/auth/users")
    java.util.List<com.shopsphere.admin.dto.UserDto> getAllUsers();

    @org.springframework.web.bind.annotation.DeleteMapping("/auth/users/{id}")
    void deleteUser(@org.springframework.web.bind.annotation.PathVariable("id") Long id);
}
