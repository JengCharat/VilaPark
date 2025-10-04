package com.vilapark.repository;

import com.vilapark.entity.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface BookingRepository extends JpaRepository<Bookings, Long> {

    List<Bookings> findByCheckinDate(LocalDate date);

    List<Bookings> findByCheckoutDate(LocalDate date);

    List<Bookings> findByStatus(String status);
}
