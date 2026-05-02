package com.shopsphere.notification.entity;

import lombok.*;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "processed_events", uniqueConstraints = {
        @UniqueConstraint(columnNames = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private LocalDateTime processedAt;
}