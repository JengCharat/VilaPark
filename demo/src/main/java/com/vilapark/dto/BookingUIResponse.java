package com.vilapark.dto;

public record BookingUIResponse(
        Long id,
        Long roomId,
        String catName,
        String checkinDate,
        String checkoutDate,
        String status,
        String createdAt) {
}
