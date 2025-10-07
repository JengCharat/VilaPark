package com.vilapark.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "income")
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // อ้างอิง booking ที่ทำรายการ
    @Column(name = "booking_id")
    private Long bookingId;

    // ลูกค้าที่เป็นเจ้าของแมว (เอนทิตี Users)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_full_name", length = 255)
    private String userFullName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "cat_name", length = 255)
    private String catName;

    @Column(name = "checkin_date")
    private LocalDate checkinDate;

    @Column(name = "checkout_date")
    private LocalDate checkoutDate;

    // จำนวนเงินที่ลูกค้าจ่ายในรายการนี้
    @Column(name = "amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;

    // ยอดสะสมทั้งหมดจนถึงรายการนี้
    @Column(name = "total_accumulated", precision = 16, scale = 2)
    private BigDecimal totalAccumulated;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod; // cash / transfer / credit

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (amount == null) amount = BigDecimal.ZERO;
        if (totalAccumulated == null) totalAccumulated = BigDecimal.ZERO;
    }
}
