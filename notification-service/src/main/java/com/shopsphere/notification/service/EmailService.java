package com.shopsphere.notification.service;


import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(String toEmail, Long orderId, double amount) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Order Confirmation - ShopSphere");
        message.setText(
                "Hello,\n\n" +
                "Your order has been placed successfully!\n\n" +
                "Order ID: " + orderId + "\n" +
                "Total Amount: ₹" + amount + "\n\n" +
                "Thank you for shopping with us!"
        );

        mailSender.send(message);
    }
}