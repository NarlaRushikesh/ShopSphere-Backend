package com.shopsphere.auth.config;

import com.shopsphere.auth.entity.Role;
import com.shopsphere.auth.entity.User;
import com.shopsphere.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "narlarushikesh@gmail.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .name("Narla Rushikesh")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Rushi@12345"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                System.out.println("✅ Admin account created successfully: " + adminEmail);
            } else {
                System.out.println("✅ Admin account already exists.");
            }
        };
    }
}
