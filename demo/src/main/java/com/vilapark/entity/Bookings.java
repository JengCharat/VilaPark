package com.vilapark.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vilapark.entity.Users;
import com.vilapark.entity.Room;
import com.vilapark.entity.Cat;    
@Entity
@Table(name = "bookings")
public class Bookings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "cat_id", nullable = false)
    private Long catId;
    
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "checkout_date", nullable = false)
    private LocalDate checkoutDate;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
// @ManyToOne(fetch = FetchType.LAZY)
// @JoinColumn(name = "room_id", insertable = false, updatable = false)
// private Room room;

public Room getRoom() {
    return room;
}


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "password", "bookings", "cats" })
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cat_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "owner", "bookings" })
    private Cat cat;

    // ถ้ามีเอนทิตีห้อง ให้ใช้ชื่อนั้น (Room/Rooms) ให้ตรงโปรเจ็กต์
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "bookings" })
    private Room room;



    public Bookings() {
        // ตั้งค่า createdAt เป็นเวลาปัจจุบัน
        this.createdAt = LocalDateTime.now();
    }

    // ------------------ Getters & Setters ------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCatId() {
        return catId;
    }

    public void setCatId(Long catId) {
        this.catId = catId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckinDate() {
        return checkinDate;
    }

    public void setCheckinDate(LocalDate checkinDate) {
        this.checkinDate = checkinDate;
    }

    public LocalDate getCheckoutDate() {
        return checkoutDate;
    }

    public void setCheckoutDate(LocalDate checkoutDate) {
        this.checkoutDate = checkoutDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
