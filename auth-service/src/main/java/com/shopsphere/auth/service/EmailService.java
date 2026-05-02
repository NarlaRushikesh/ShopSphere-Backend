package com.shopsphere.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP is: " + otp);

        try {
            System.out.println("📤 Attempting to send OTP to: " + to);
            mailSender.send(message);
            System.out.println("✅ OTP sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}