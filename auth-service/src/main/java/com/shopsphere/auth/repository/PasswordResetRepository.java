package com.shopsphere.auth.repository;

import com.shopsphere.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByEmailAndOtp(String email, String otp);
    Optional<PasswordResetToken> findByEmail(String email);
    void deleteByEmail(String email);
}