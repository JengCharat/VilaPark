package com.vilapark.controller;

import com.vilapark.dto.BookingUIResponse;
import com.vilapark.entity.Booking;
import com.vilapark.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

  @Autowired
  private BookingRepository bookingRepository;

  // ---------- CRUD เดิม ----------
  @GetMapping
  public List<Booking> getAllBookings() {
    return bookingRepository.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
    Optional<Booking> booking = bookingRepository.findById(id);
    return booking.map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public Booking createBooking(@RequestBody Booking booking) {
    return bookingRepository.save(booking);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
    Optional<Booking> opt = bookingRepository.findById(id);
    if (opt.isEmpty())
      return ResponseEntity.notFound().build();

    Booking b = opt.get();
    b.setUserId(bookingDetails.getUserId());
    b.setRoomId(bookingDetails.getRoomId());
    b.setCatId(bookingDetails.getCatId());
    b.setCheckinDate(bookingDetails.getCheckinDate());
    b.setCheckoutDate(bookingDetails.getCheckoutDate());
    b.setStatus(bookingDetails.getStatus());
    b.setCreatedAt(bookingDetails.getCreatedAt());

    return ResponseEntity.ok(bookingRepository.save(b));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
    if (!bookingRepository.existsById(id))
      return ResponseEntity.notFound().build();
    bookingRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  // ---------- Endpoints สำหรับ UI ----------

  // ส่งรายการ booking ที่ map เป็น DTO มี catName พร้อม
  @GetMapping("/ui")

  public List<BookingUIResponse> getBookingsForUI() {
    return toUI(bookingRepository.findAll());
  }

  // ส่ง "งานวันนี้" (check-in วันนี้ + check-out วันนี้ + งานสถานะ UPDATE
  // วันนี้ถ้าคุณใช้งาน)
  @GetMapping("/today")
  public List<BookingUIResponse> getTasksToday(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    LocalDate d = (date != null) ? date : LocalDate.now(ZoneId.of("Asia/Bangkok"));
    // รวมงานที่เกี่ยวกับวันนี้: check-in วันนี้, check-out วันนี้, หรือ status
    // บางตัวที่คุณนับเป็นงาน
    var list = bookingRepository.findByCheckinDate(d);
    list.addAll(bookingRepository.findByCheckoutDate(d));
    // ถ้าต้องการดึง "UPDATE วันนี้" และคุณเก็บวันไว้ที่ created_at ให้กรองเพิ่มจาก
    // findAll() ก็ได้
    // list.addAll(bookingRepository.findByStatus("UPDATE"));

    // เอางานซ้ำออก (ถ้าเผอิญตรงเงื่อนไขมากกว่า 1) แล้ว map เป็น DTO
    return toUI(list.stream().distinct().collect(Collectors.toList()));
  }

  // ส่งสรุปตัวเลข (การ์ด 4 ใบ) ตามภาพแดชบอร์ด
  @GetMapping("/summary")
  public SummaryResponse getSummary(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    LocalDate d = (date != null) ? date : LocalDate.now(ZoneId.of("Asia/Bangkok"));
    var all = bookingRepository.findAll();

    long stayingToday = all.stream()
        .filter(b -> {
          // checkin <= d และ (checkout เป็น null หรือ > d)
          boolean in = (b.getCheckinDate() != null && !b.getCheckinDate().isAfter(d));
          boolean out = (b.getCheckoutDate() == null || b.getCheckoutDate().isAfter(d));
          return in && out;
        })
        .count();

    long checkinToday = all.stream().filter(b -> d.equals(b.getCheckinDate())).count();
    long checkoutToday = all.stream().filter(b -> d.equals(b.getCheckoutDate())).count();
    long needUpdate = all.stream().filter(b -> "PENDING".equalsIgnoreCase(b.getStatus())
        || "UPDATE".equalsIgnoreCase(b.getStatus())).count();

    return new SummaryResponse(stayingToday, checkinToday, checkoutToday, needUpdate);
  }

  // ---------- Helpers ----------
  private List<BookingUIResponse> toUI(List<Booking> list) {
    return list.stream().map(b -> new BookingUIResponse(
        b.getId(),
        b.getRoomId(),
        (b.getCat() != null && b.getCat().getName() != null)
            ? b.getCat().getName()
            : ("#" + (b.getCatId() == null ? "-" : b.getCatId())),
        b.getCheckinDate() == null ? null : b.getCheckinDate().toString(),
        b.getCheckoutDate() == null ? null : b.getCheckoutDate().toString(),
        b.getStatus(),
        b.getCreatedAt() == null ? null : b.getCreatedAt().toString())).toList();
  }

  // ใช้เป็น payload ของการ์ดสรุป
  public record SummaryResponse(
      long stayingToday,
      long checkinToday,
      long checkoutToday,
      long needUpdate) {
  }
}
