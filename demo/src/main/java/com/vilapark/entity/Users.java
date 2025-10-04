// src/main/java/.../entity/User.java
package com.vilapark.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    // ไม่ส่งให้ FE
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // คอลัมน์ใน DB ชื่อ enable
    @Column(name = "enable")
    private Boolean enabled;

    private String address;

    private String lastname;

    // ใน DB คอลัมน์ชื่อ name
    @Column(name = "name")
    private String firstName;

    @Column(name = "phonenumber")
    private String phoneNumber;

    /* ---------- ความสัมพันธ์ (ไม่บังคับ แต่แนะนำ) ---------- */

    // ถ้าใน Cat map owner_id -> user
    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @JsonIgnore // กัน recursion; ใช้ DTO เวลาอยากส่งกลับ
    private List<Cat> cats = new ArrayList<>();

    // ถ้าใน Bookings map user_id -> user
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Bookings> bookings = new ArrayList<>();
}
