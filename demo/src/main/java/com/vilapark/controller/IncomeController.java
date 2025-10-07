package com.vilapark.controller;

import com.vilapark.entity.*;
import com.vilapark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeRepository incomeRepository;
    private final BookingRepository bookingRepository;
    private final UsersRepository usersRepository;
    private final CatRepository catRepository;
    private final RoomRepository roomRepository;

    @lombok.Data
    public static class CreateFromBookingRequest {
        private String paymentMethod;   // cash / transfer / credit
        private BigDecimal amount;      // ถ้า FE ส่ง total มาให้ ก็ใช้ตัวนี้
    }

    @PostMapping("/from-booking/{bookingId}")
    public ResponseEntity<?> createFromBooking(
            @PathVariable Long bookingId,
            @RequestBody CreateFromBookingRequest req
    ) {
        Optional<Bookings> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));

        Bookings b = opt.get();

        Users u  = (b.getUserId() != null) ? usersRepository.findById(b.getUserId()).orElse(null) : null;
        Cat cat  = (b.getCatId()  != null) ? catRepository.findById(b.getCatId()).orElse(null)     : null;
        Room room= (b.getRoomId() != null) ? roomRepository.findById(b.getRoomId()).orElse(null)   : null;

        // คืนอย่างน้อย 1 คืน
        LocalDate in = b.getCheckinDate();
        LocalDate out= b.getCheckoutDate();
        long nights = (in != null && out != null) ? Math.max(1, out.toEpochDay() - in.toEpochDay()) : 1;

        BigDecimal amount = req.getAmount();
        if (amount == null) {
            BigDecimal roomPrice = (room != null && room.getPrice() != null)
                    ? BigDecimal.valueOf(room.getPrice()) : BigDecimal.ZERO;
            amount = roomPrice.multiply(BigDecimal.valueOf(nights));
        }

        BigDecimal prevAccum = incomeRepository.findTopByOrderByCreatedAtDesc()
                .map(i -> i.getTotalAccumulated() == null ? BigDecimal.ZERO : i.getTotalAccumulated())
                .orElse(BigDecimal.ZERO);

        String fullName = buildFullName(u);
        String phone = pickString(u, "getPhonenumber","getPhoneNumber","getPhone","getMobile","getTel");
        if (phone == null || phone.isBlank()) phone = "-";

        Income income = Income.builder()
                .bookingId(b.getId())
                .userId(b.getUserId())
                .userFullName(fullName)
                .phone(phone)
                .catName(cat != null ? cat.getName() : "-")
                .checkinDate(b.getCheckinDate())
                .checkoutDate(b.getCheckoutDate())
                .amount(amount)
                .totalAccumulated(prevAccum.add(amount))
                .paymentMethod(req.getPaymentMethod())
                .build();

        return ResponseEntity.ok(incomeRepository.save(income));
    }

    @GetMapping
    public List<Income> list() {
        return incomeRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @GetMapping("/total")
    public Map<String, BigDecimal> total() {
        BigDecimal s = incomeRepository.sumAmount();
        return Map.of("totalRevenue", s == null ? BigDecimal.ZERO : s);
    }

    // -------- helpers --------
    private static String buildFullName(Users u) {
        if (u == null) return "-";
        String f = pickString(u, "getName","getFirstname","getFirstName");
        String l = pickString(u, "getLastname","getLastName","getSurname","getLast");
        f = f == null ? "" : f.trim();
        l = l == null ? "" : l.trim();
        if (f.isEmpty() && l.isEmpty()) return "-";
        if (f.isEmpty()) return l;
        if (l.isEmpty()) return f;
        if (f.equals(l) || f.contains(l)) return f;
        if (l.contains(f)) return l;
        return f + " " + l;
    }

    private static String pickString(Object obj, String... getters) {
        if (obj == null) return null;
        for (String g : getters) {
            try {
                Method m = obj.getClass().getMethod(g);
                Object v = m.invoke(obj);
                if (v != null) return v.toString();
            } catch (Exception ignored) {}
        }
        return null;
    }
}
