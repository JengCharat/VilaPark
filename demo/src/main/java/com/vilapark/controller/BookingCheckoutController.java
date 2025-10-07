package com.vilapark.controller;

import com.vilapark.dto.CheckoutRequest;
import com.vilapark.entity.Bookings;
import com.vilapark.entity.Room;
import com.vilapark.repository.BookingRepository;
import com.vilapark.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingCheckoutController {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    @PostMapping("/{id}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long id, @RequestBody CheckoutRequest req) {
        // 1) หา booking
        Bookings b = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));

        // 2) อัปเดตสถานะ + วันที่ checkout
        b.setStatus("CHECKED_OUT");
        if (b.getCheckoutDate() == null) {
            b.setCheckoutDate(LocalDate.now());
        }
        bookingRepository.save(b);

        // 3) (ถ้ามี) ปลดล็อคห้องให้ว่าง
        if (b.getRoomId() != null) {
            roomRepository.findById(b.getRoomId()).ifPresent(r -> {
                r.setStatus("available");
                roomRepository.save(r);
            });
        }

        // 4) คำนวณยอด (ส่งกลับให้หน้าเว็บแสดงได้ แต่ "ไม่" บันทึก income ที่นี่)
        Room room = (b.getRoomId() != null) ? roomRepository.findById(b.getRoomId()).orElse(null) : null;
        double roomPrice = (room != null && room.getPrice() != null) ? room.getPrice() : 0.0;
        long nights = Math.max(1, ChronoUnit.DAYS.between(b.getCheckinDate(), b.getCheckoutDate()));
        BigDecimal total = BigDecimal.valueOf(roomPrice * nights + 150 + 300);

        Map<String, Object> resp = new HashMap<>();
        resp.put("ok", true);
        resp.put("bookingId", b.getId());
        resp.put("status", b.getStatus());
        resp.put("nights", nights);
        resp.put("roomPrice", roomPrice);
        resp.put("total", total);
        resp.put("paymentMethod", (req != null) ? req.getPaymentMethod() : null);

        return ResponseEntity.ok(resp);
    }
}
