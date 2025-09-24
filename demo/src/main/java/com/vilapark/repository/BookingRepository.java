package com.vilapark.repository;

import com.vilapark.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCheckinDate(LocalDate date);

    List<Booking> findByCheckoutDate(LocalDate date);

    List<Booking> findByStatus(String status);
}
