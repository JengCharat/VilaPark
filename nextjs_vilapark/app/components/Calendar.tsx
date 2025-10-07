"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";

type Booking = {
  id: number;
  roomId: number;
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

interface CalendarProps {
  bookings: Booking[];
  loading: boolean;
}

export default function Calendar({ bookings, loading }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [unavailableRooms, setUnavailableRooms] = useState<string[]>([]);

  const events: CalendarEvent[] = bookings.map((b) => ({
    id: b.id.toString(),
    title: `ห้อง ${b.roomNumber}`,
    start: b.checkinDate,
    end: addOneDay(b.checkoutDate),
    backgroundColor: "#4195cc",
    borderColor: "#4195cc",
  }));

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    const rooms = bookings
      .filter((b) => isDateBetween(info.dateStr, b.checkinDate, b.checkoutDate))
      .map((b) => b.roomNumber);
    setUnavailableRooms(rooms);
  };

  if (loading) {
    return <p>กำลังโหลด...</p>;
  }

  return (
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
            ห้องที่ไม่ว่างวันที่ {selectedDate}
          </h2>
          {unavailableRooms.length > 0 ? (
            <ul className="list-disc list-inside ml-16 ">
              {unavailableRooms.map((roomNumber) => (
                <li key={roomNumber}>ห้อง {roomNumber}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600 font-medium ml-16 "> ไม่มีการจองในวันนี้</p>
          )}
        </div>
      )}
    </>
  );
}

function isDateBetween(dateStr: string, startStr: string, endStr: string): boolean {
  const date = new Date(dateStr);
  const start = new Date(startStr);
  const end = new Date(endStr);
  return date >= start && date <= end;
}

// FullCalendar ใช้ end-exclusive → เพิ่ม 1 วัน
function addOneDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}
