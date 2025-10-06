"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Booking = {
  id: number;
  roomId: number;
  catName: string;
  roomNumber: string; 
    checkinDate: string;
  checkoutDate: string;
  status: string;
  createdAt: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [unavailableRooms, setUnavailableRooms] = useState<string[]>([]);
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

  const events: CalendarEvent[] = bookings.map((b) => ({
    id: b.id.toString(),
    title: `ห้อง ${b.roomNumber}`, 
    start: b.checkinDate,
    end: addOneDay(b.checkoutDate),
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c",
  }));

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    const rooms = bookings
      .filter((b) => isDateBetween(info.dateStr, b.checkinDate, b.checkoutDate))
      .map((b) => b.roomNumber); 
    setUnavailableRooms(rooms);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📅 ปฏิทินการจองห้อง</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale="th"
            height="auto"
            dateClick={handleDateClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
          />

          {selectedDate && (
            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                🗓️ ห้องที่ไม่ว่างวันที่ {selectedDate}
              </h2>
              {unavailableRooms.length > 0 ? (
                <ul className="list-disc list-inside">
                  {unavailableRooms.map((roomNumber) => (
                    <li key={roomNumber}>ห้อง {roomNumber}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 font-medium"> ไม่มีการจองในวันนี้</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function isDateBetween(dateStr: string, startStr: string, endStr: string): boolean {
  const date = new Date(dateStr);
  const start = new Date(startStr);
  const end = new Date(endStr);
  return date >= start && date <= end;
}

function addOneDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}
