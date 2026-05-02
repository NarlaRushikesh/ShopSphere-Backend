package com.shopsphere.auth.service;

import com.shopsphere.auth.entity.RefreshToken;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
    RefreshToken findByToken(String token);
}
