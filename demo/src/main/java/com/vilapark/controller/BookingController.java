package com.vilapark.controller;

import com.vilapark.entity.Bookings;
import com.vilapark.repository.BookingRepository;
import com.vilapark.dto.BookingUIResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @GetMapping("/{id}")
public ResponseEntity<Bookings> getBookingById(@PathVariable Long id) {
  return bookingRepository.findById(id)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.notFound().build());
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

    // ส่งรายการ booking สำหรับ UI (map เป็น DTO)
    @GetMapping("/ui")
    public List<BookingUIResponse> getBookingsForUI() {
        return toUI(bookingRepository.findAll());
    }

    // ส่ง "งานวันนี้" (check-in วันนี้ + check-out วันนี้)
    @GetMapping("/today")
    public List<BookingUIResponse> getTasksToday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate d = (date != null) ? date : LocalDate.now(ZoneId.of("Asia/Bangkok"));

        var checkinToday = bookingRepository.findByCheckinDate(d);
        var checkoutToday = bookingRepository.findByCheckoutDate(d);

        // รวมกันและเอาซ้ำออก
        var allToday = checkinToday.stream().collect(Collectors.toList());
        allToday.addAll(checkoutToday);

        return toUI(allToday.stream().distinct().collect(Collectors.toList()));
    }

    // ส่งสรุปตัวเลข (การ์ด 4 ใบ) สำหรับ Dashboard
    @GetMapping("/summary")
    public SummaryResponse getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate d = (date != null) ? date : LocalDate.now(ZoneId.of("Asia/Bangkok"));
        var all = bookingRepository.findAll();

        long stayingToday = all.stream()
                .filter(b -> b.getCheckinDate() != null && !b.getCheckinDate().isAfter(d))
                .filter(b -> b.getCheckoutDate() == null || b.getCheckoutDate().isAfter(d))
                .count();

        long checkinToday = all.stream().filter(b -> d.equals(b.getCheckinDate())).count();
        long checkoutToday = all.stream().filter(b -> d.equals(b.getCheckoutDate())).count();
        long needUpdate = all.stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()) || "UPDATE".equalsIgnoreCase(b.getStatus()))
                .count();

        return new SummaryResponse(stayingToday, checkinToday, checkoutToday, needUpdate);
    }

    // ---------- Helpers ----------
    private List<BookingUIResponse> toUI(List<Bookings> list) {
        return list.stream().map(b -> new BookingUIResponse(
                b.getId(),
                b.getRoomId(),
                b.getCatId() == null ? "-" : b.getCatId().toString(),
                b.getCheckinDate() == null ? null : b.getCheckinDate().toString(),
                b.getCheckoutDate() == null ? null : b.getCheckoutDate().toString(),
                b.getStatus(),
                b.getCreatedAt() == null ? null : b.getCreatedAt().toString()
        )).collect(Collectors.toList());
    }

    // Payload สำหรับสรุปตัวเลข Dashboard
    public record SummaryResponse(
            long stayingToday,
            long checkinToday,
            long checkoutToday,
            long needUpdate) {
    }
}
