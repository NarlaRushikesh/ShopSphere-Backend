package com.shopsphere.auth.service.impl;

import com.shopsphere.auth.dto.*;
import com.shopsphere.auth.entity.PasswordResetToken;
import com.shopsphere.auth.entity.Role;
import com.shopsphere.auth.entity.User;
import com.shopsphere.auth.repository.PasswordResetRepository;
import com.shopsphere.auth.repository.UserRepository;
import com.shopsphere.auth.service.AuthService;
import com.shopsphere.auth.service.EmailService;
import com.shopsphere.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import com.shopsphere.auth.entity.RefreshToken;
import com.shopsphere.auth.service.RefreshTokenService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public void register(RegisterRequest request) {

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Enforce USER role for all registrations
                .build();

        userRepository.save(user);
    }

    @Override
    public AuthResponse login(AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResponse(token, refreshToken.getToken());
    }
    @Override
    public void sendOtp(String email) {
    	 //  CHECK USER EXISTS
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not registered"));
        
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        passwordResetRepository.save(token);

        emailService.sendOtp(email, otp);
    }
    @Override
    public void resetPassword(String email, String otp, String newPassword) {

        PasswordResetToken token = passwordResetRepository
                .findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public RefreshTokenService getRefreshTokenService() {
        return this.refreshTokenService;
    }

    @Override
    public JwtUtil getJwtUtil() {
        return this.jwtUtil;
    }

    @Override
    public long getTotalUsersCount() {
        return userRepository.count();
    }

    @Override
    public java.util.List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}