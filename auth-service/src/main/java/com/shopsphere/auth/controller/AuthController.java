package com.shopsphere.auth.controller;

import com.shopsphere.auth.dto.*;
import com.shopsphere.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = {"/register", "/signup"})
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully. Please check your email for the verification OTP.");
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<String> verifyRegistration(@Valid @RequestBody VerifyRegistrationRequest request) {
        authService.verifyRegistration(request.getEmail(), request.getOtp());
        return ResponseEntity.ok("Email verified successfully. You can now login.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {

        String email = request.getEmail();
        authService.sendOtp(email);

        return ResponseEntity.ok("OTP sent to email");
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );

        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return java.util.Optional.of(authService.getRefreshTokenService().findByToken(requestRefreshToken))
                .map(authService.getRefreshTokenService()::verifyExpiration)
                .map(com.shopsphere.auth.entity.RefreshToken::getUser)
                .map(user -> {
                    String token = authService.getJwtUtil().generateToken(user.getEmail(), user.getRole().name());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @GetMapping("/users/count")
    public ResponseEntity<Long> getTotalUsersCount() {
        return ResponseEntity.ok(authService.getTotalUsersCount());
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}