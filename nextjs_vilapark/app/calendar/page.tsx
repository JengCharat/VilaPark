"use client";

import { useEffect, useState } from "react";
import Calendar from "../components/Calendar";

type Booking = {
  id: number;
  roomId: number;
  roomNumber: string;
  checkinDate: string;
  checkoutDate: string;
  status: string;
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8081/bookings/future");
        const data = await res.json();
        setBookings(data);
      } catch (e) {
        console.error("Failed to fetch bookings:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ปฏิทินการจองห้อง</h1>
      <Calendar bookings={bookings} loading={loading} />
    </div>
  );
}
