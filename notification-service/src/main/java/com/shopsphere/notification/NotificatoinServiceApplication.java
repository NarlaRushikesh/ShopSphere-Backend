package com.shopsphere.notification;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableRabbit
public class NotificatoinServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificatoinServiceApplication.class, args);
	}

}
