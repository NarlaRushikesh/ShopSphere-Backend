package com.shopsphere.notification.service.impl;

import com.shopsphere.notification.dto.OrderEvent;
import com.shopsphere.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    @Override
    public void sendOrderNotification(OrderEvent event) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(event.getUserId()); // customer's email (stored as userId)
        message.setSubject("Order Confirmation - " + event.getOrderId());

        message.setText(
                "Hello,\n\n" +
                "Your order has been placed successfully!\n\n" +
                "Order ID: " + event.getOrderId() + "\n" +
                "Total Amount: " + event.getTotalAmount() + "\n" +
                "Status: " + event.getStatus() + "\n\n" +
                "Thank you for shopping with us!"
        );

        mailSender.send(message);
    }
    
}