package com.example.demo.service.impl;

import com.example.demo.dto.AddToCartRequest;
import com.example.demo.dto.CartDTO;
import com.example.demo.dto.CartItemDTO;
import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.feign.CatalogClient;
import com.example.demo.feign.ProductResponse;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CatalogClient catalogClient;

    @Override
    public CartDTO getCartByUserEmail(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        return mapToDTO(cart);
    }

    @Override
    public CartDTO addToCart(AddToCartRequest request, String userEmail) {
        Cart cart = getOrCreateCart(userEmail);

        // Check stock and details from catalog
        ProductResponse product = catalogClient.getProduct(request.getProductId());
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        // Check if already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        recalculateTotal(cart);
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }

    @Override
    public CartDTO updateCartItem(Long cartItemId, int quantity, String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Unauthorized: Item does not belong to your cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
        }

        recalculateTotal(cart);
        return mapToDTO(cartRepository.save(cart));
    }

    @Override
    public CartDTO removeCartItem(Long cartItemId, String userEmail) {
        Cart cart = getOrCreateCart(userEmail);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        
        recalculateTotal(cart);
        return mapToDTO(cartRepository.save(cart));
    }

    @Override
    public void clearCart(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElse(null);
        if (cart != null) {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cart.setTotalPrice(0.0);
            cartRepository.save(cart);
        }
    }

    private Cart getOrCreateCart(String userEmail) {
        return cartRepository.findByUserEmail(userEmail)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userEmail(userEmail)
                            .items(new ArrayList<>())
                            .totalPrice(0.0)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private void recalculateTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        cart.setTotalPrice(total);
    }

    private CartDTO mapToDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream().map(item ->
                CartItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build()
        ).collect(Collectors.toList());

        return CartDTO.builder()
                .id(cart.getId())
                .userEmail(cart.getUserEmail())
                .items(itemDTOs)
                .totalPrice(cart.getTotalPrice())
                .build();
    }
}
