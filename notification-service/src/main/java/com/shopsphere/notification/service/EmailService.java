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

    public void sendOrderConfirmation(String toEmail, Long orderId, double amount, java.util.List<com.shopsphere.notification.dto.OrderItemEvent> items) {
        StringBuilder itemDetails = new StringBuilder();
        itemDetails.append("\nItems Purchased:\n");
        itemDetails.append("----------------------------\n");
        if (items != null) {
            for (com.shopsphere.notification.dto.OrderItemEvent item : items) {
                itemDetails.append(String.format("- %s (Qty: %d) - ₹%.2f\n", 
                        item.getProductName(), item.getQuantity(), item.getPrice() * item.getQuantity()));
            }
        }
        itemDetails.append("----------------------------\n");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Order Confirmation - ShopSphere");
        message.setText(
                "Hello,\n\n" +
                "Your order has been placed successfully!\n\n" +
                "Order ID: " + orderId + "\n" +
                itemDetails.toString() +
                "\nTotal Amount: ₹" + amount + "\n\n" +
                "Thank you for shopping with us!"
        );

        try {
            System.out.println("📤 Attempting to send email to: " + toEmail);
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}