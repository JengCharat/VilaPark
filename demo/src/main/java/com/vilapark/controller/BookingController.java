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
import java.time.YearMonth;
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
    @PostMapping public Bookings createBooking(@RequestBody Bookings booking) {
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
            @GetMapping("/month")
            public long getBookingsThisMonth(
                    @RequestParam(required = false) Integer year,
                    @RequestParam(required = false) Integer month) {

                LocalDate now = LocalDate.now(ZoneId.of("Asia/Bangkok"));
                int y = (year != null) ? year : now.getYear();
                int m = (month != null) ? month : now.getMonthValue();

                YearMonth targetMonth = YearMonth.of(y, m);

                return bookingRepository.findAll().stream()
                        .filter(b -> {
                            LocalDate checkin = b.getCheckinDate();
                            LocalDate checkout = b.getCheckoutDate();
                            // เช็คว่า checkin หรือ checkout อยู่ในเดือน target
                            boolean checkinInMonth = checkin != null && YearMonth.from(checkin).equals(targetMonth);
                            boolean checkoutInMonth = checkout != null && YearMonth.from(checkout).equals(targetMonth);
                            return checkinInMonth || checkoutInMonth;
                        })
                        .count();
            }

            // ดึงรายการ Booking ตั้งแต่วันนี้เป็นต้นไป
            @GetMapping("/future")
            public List<BookingUIResponse> getFutureBookings(
                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {

                LocalDate start = (fromDate != null) ? fromDate : LocalDate.now(ZoneId.of("Asia/Bangkok"));

                var futureBookings = bookingRepository.findAll().stream()
                        .filter(b -> {
                            LocalDate checkin = b.getCheckinDate();
                            LocalDate checkout = b.getCheckoutDate();
                            boolean futureCheckin = checkin != null && !checkin.isBefore(start);
                            boolean futureCheckout = checkout != null && !checkout.isBefore(start);
                            return futureCheckin || futureCheckout;
                        })
                        .collect(Collectors.toList());

                return toUI(futureBookings);
            }

// POST: เช็คว่าห้องว่างหรือไม่
@PostMapping("/check-availability")
public boolean checkRoomAvailability(@RequestBody Bookings bookingRequest) {
    LocalDate checkin = bookingRequest.getCheckinDate();
    LocalDate checkout = bookingRequest.getCheckoutDate();
    Long roomId = bookingRequest.getRoomId();

    if (checkin == null || checkout == null || roomId == null) {
        throw new RuntimeException("กรุณาระบุข้อมูลให้ครบ (roomId, checkinDate, checkoutDate)");
    }

    boolean isOverlap = bookingRepository.findAll().stream()
            .filter(b -> b.getRoomId().equals(roomId))
            .anyMatch(b -> isDateRangeOverlap(checkin, checkout, b.getCheckinDate(), b.getCheckoutDate()));

    return !isOverlap; // true = ว่าง, false = ไม่ว่าง
}

// Helper function
private boolean isDateRangeOverlap(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
    return (start1.isBefore(end2) || start1.equals(end2)) &&
           (end1.isAfter(start2) || end1.equals(start2));
}
}
