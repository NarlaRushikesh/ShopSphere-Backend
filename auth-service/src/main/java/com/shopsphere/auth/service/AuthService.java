package com.shopsphere.auth.service;

import com.shopsphere.auth.dto.*;

public interface AuthService {

    void register(RegisterRequest request);

    AuthResponse login(AuthRequest request);
    void sendOtp(String email);

    void resetPassword(String email, String otp, String newPassword);
    
    RefreshTokenService getRefreshTokenService();
    com.shopsphere.auth.util.JwtUtil getJwtUtil();
    long getTotalUsersCount();
    
    java.util.List<UserDto> getAllUsers();
    void deleteUser(Long id);
}