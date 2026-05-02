package com.shopsphere.notification.controller;

import com.shopsphere.notification.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestNotificationController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test-email")
    public String testEmail(@RequestParam String email) {
        try {
            emailService.sendOrderConfirmation(email, 12345L, 1.0);
            return "Test email request triggered for " + email + ". Check logs for result.";
        } catch (Exception e) {
            return "Error triggering email: " + e.getMessage();
        }
    }
}
