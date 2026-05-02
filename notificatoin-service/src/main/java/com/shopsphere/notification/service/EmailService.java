package com.shopsphere.notification.service;


import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderConfirmation(String toEmail, Long orderId, double amount) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Order Confirmation - ShopSphere");
        message.setText(
                "Your order has been placed successfully!\n\n" +
                "Order ID: " + orderId + "\n" +
                "Total Amount: ₹" + amount + "\n\n" +
                "Thank you for shopping with us!"
        );

        mailSender.send(message);
    }
}