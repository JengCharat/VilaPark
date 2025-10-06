package com.vilapark.dto;

public record BookingUIResponse(
        Long id,
        Long roomId,
         String roomNumber,
        String checkinDate,
        String checkoutDate,
        String status,
        String createdAt) {
}
