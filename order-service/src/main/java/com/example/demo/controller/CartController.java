package com.example.demo.controller;

import com.example.demo.dto.AddToCartRequest;
import com.example.demo.dto.CartDTO;
import com.example.demo.dto.UpdateCartItemRequest;
import com.example.demo.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.getCartByUserEmail(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addToCart(@Valid @RequestBody AddToCartRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.addToCart(request, email));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.updateCartItem(id, request.getQuantity(), email));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<CartDTO> removeCartItem(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.removeCartItem(id, email));
    }
}
