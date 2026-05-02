package com.shopsphere.notification.consumer;

import com.shopsphere.notification.config.RabbitMQConfig;
import com.shopsphere.notification.dto.OrderEvent;
import com.shopsphere.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void consume(OrderEvent event) {

        System.out.println("📩 Received Order Event: " + event);

        // 🔥 SEND EMAIL
        emailService.sendOrderConfirmation(
                event.getUserId(),   // email
                event.getOrderId(),
                event.getTotalAmount()
        );
    }
}