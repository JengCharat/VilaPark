"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  userId: number;
  roomId: number;
  catId: number;
  checkinDate: string;
  checkoutDate: string;
  status: string;
  createdAt: string;
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://64.71.156.99:9090/api/bookings")
      .then((res) => res.json())
      .then((data: Booking[]) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-4">Loading bookings...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📌 Bookings List</h1>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">User</th>
            <th className="border border-gray-300 px-4 py-2">Room</th>
            <th className="border border-gray-300 px-4 py-2">Cat</th>
            <th className="border border-gray-300 px-4 py-2">Check-in</th>
            <th className="border border-gray-300 px-4 py-2">Check-out</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{b.id}</td>
              <td className="border border-gray-300 px-4 py-2">{b.userId}</td>
              <td className="border border-gray-300 px-4 py-2">{b.roomId}</td>
              <td className="border border-gray-300 px-4 py-2">{b.catId}</td>
              <td className="border border-gray-300 px-4 py-2">{b.checkinDate}</td>
              <td className="border border-gray-300 px-4 py-2">{b.checkoutDate}</td>
              <td className="border border-gray-300 px-4 py-2">{b.status}</td>
              <td className="border border-gray-300 px-4 py-2">{b.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
