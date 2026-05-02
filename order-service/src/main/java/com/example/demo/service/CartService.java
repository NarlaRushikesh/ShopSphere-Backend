package com.example.demo.service;

import com.example.demo.dto.AddToCartRequest;
import com.example.demo.dto.CartDTO;

public interface CartService {
    
    CartDTO getCartByUserEmail(String userEmail);
    
    CartDTO addToCart(AddToCartRequest request, String userEmail);
    
    CartDTO updateCartItem(Long cartItemId, int quantity, String userEmail);
    
    CartDTO removeCartItem(Long cartItemId, String userEmail);
    
    void clearCart(String userEmail);
}
