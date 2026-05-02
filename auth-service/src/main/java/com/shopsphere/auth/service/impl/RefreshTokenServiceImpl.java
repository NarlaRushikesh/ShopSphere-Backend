package com.shopsphere.auth.service.impl;

import com.shopsphere.auth.entity.RefreshToken;
import com.shopsphere.auth.repository.RefreshTokenRepository;
import com.shopsphere.auth.repository.UserRepository;
import com.shopsphere.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")))
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(1000 * 60 * 60 * 24 * 7)) // 7 days
                .build();
        
        // Optionally delete existing refresh tokens for the user before creating a new one
        refreshTokenRepository.deleteByUser(refreshToken.getUser());
        refreshTokenRepository.flush();
        
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Override
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }
}
