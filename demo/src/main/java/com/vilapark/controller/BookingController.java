package com.vilapark.controller;

import com.vilapark.entity.Bookings;
import com.vilapark.repository.BookingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "*") // อนุญาตให้ React เข้าถึง API ได้
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ดึงข้อมูล Booking ทั้งหมด
    @GetMapping
    public List<Bookings> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ดึงข้อมูล Booking ตาม ID
    @GetMapping("/{id}")
    public Optional<Bookings> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id);
    }

    // เพิ่ม Booking ใหม่
    @PostMapping
    public Bookings createBooking(@RequestBody Bookings booking) {
        return bookingRepository.save(booking);
    }

    // แก้ไข Booking ตาม ID
    @PutMapping("/{id}")
    public Bookings updateBooking(@PathVariable Long id, @RequestBody Bookings bookingDetails) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setUserId(bookingDetails.getUserId());
            booking.setRoomId(bookingDetails.getRoomId());
            booking.setCatId(bookingDetails.getCatId());
            booking.setCheckinDate(bookingDetails.getCheckinDate());
            booking.setCheckoutDate(bookingDetails.getCheckoutDate());
            booking.setStatus(bookingDetails.getStatus());
            return bookingRepository.save(booking);
        }).orElseThrow(() -> new RuntimeException("ไม่พบ Booking ID: " + id));
    }

    // ลบ Booking ตาม ID
    @DeleteMapping("/{id}")
    public String deleteBooking(@PathVariable Long id) {
        bookingRepository.deleteById(id);
        return "Booking ID " + id + " ถูกลบแล้ว";
    }
}
