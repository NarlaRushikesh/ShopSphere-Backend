package com.example.demo.producer;

import com.example.demo.dto.OrderEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendOrderEvent(OrderEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    "order.exchange",
                    "order.routing.key",
                    event
            );
            log.info("Order event sent to RabbitMQ successfully for orderId: {}", event.getOrderId());
        } catch (AmqpException e) {
            log.error("Failed to send order event to RabbitMQ. Exception: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error occurred while sending order event: {}", e.getMessage());
        }
    }
}