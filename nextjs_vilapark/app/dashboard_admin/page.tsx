"use client";

import { useEffect, useMemo, useState } from "react";

type BookingUI = {
  id: number;
  roomId: number;
  catName: string;
  checkinDate: string | null;
  checkoutDate: string | null;
  status: string;
  createdAt: string | null;
};

type Summary = {
  stayingToday: number;
  checkinToday: number;
  checkoutToday: number;
  needUpdate: number;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<BookingUI[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // ดึงสรุปการ์ด 4 ใบ
        const sumRes = await fetch("http://127.0.0.1:8081/api/bookings/summary");
        const sumData: Summary = await sumRes.json();

        // ดึง "งานวันนี้"
        const taskRes = await fetch("http://127.0.0.1:8081/api/bookings/today");
        const taskData: BookingUI[] = await taskRes.json();

        setSummary(sumData);
        setTasks(taskData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = useMemo(() => ([
    { title: "แมวที่พักอยู่วันนี้", value: summary?.stayingToday ?? 0, bg: "bg-blue-500" },
    { title: "Check-in วันนี้", value: summary?.checkinToday ?? 0, bg: "bg-green-500" },
    { title: "Check-out วันนี้", value: summary?.checkoutToday ?? 0, bg: "bg-orange-500" },
    { title: "ต้องอัปเดต", value: summary?.needUpdate ?? 0, bg: "bg-purple-500" },
  ]), [summary]);

  if (loading) return <div className="p-6">กำลังโหลดแดชบอร์ด...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">👨‍💼 แดชบอร์ดพนักงาน</h1>

      {/* การ์ดสรุป 4 ใบ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.bg} text-white rounded-xl p-5`}>
            <div className="text-lg opacity-90">{c.title}</div>
            <div className="text-4xl font-extrabold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* งานวันนี้ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-xl mb-4">📋 งานวันนี้</h2>

          <div className="space-y-3">
            {tasks.length === 0 && (
              <div className="text-gray-500">วันนี้ยังไม่พบงาน</div>
            )}

            {tasks.map((t) => {
              // สร้างข้อความหัวข้อการ์ดตาม status
              let title = "";
              let chip = { text: "", cls: "" };

              if (t.status?.toUpperCase() === "UPDATE") {
                title = `อัปเดตรูปภาพ – ${t.catName} (ห้อง ${t.roomId})`;
                chip = { text: "อัปเดต", cls: "bg-yellow-200 text-yellow-900" };
              } else if (t.status?.toUpperCase() === "CHECKIN") {
                title = `Check-in – ${t.catName} (ห้อง ${t.roomId})`;
                chip = { text: "เสร็จแล้ว", cls: "bg-green-200 text-green-900" };
              } else if (t.status?.toUpperCase() === "CHECKOUT") {
                title = `Check-out – ${t.catName} (ห้อง ${t.roomId})`;
                chip = { text: "คิดเงิน", cls: "bg-blue-200 text-blue-900" };
              } else {
                title = `${t.status ?? "งาน"} – ${t.catName} (ห้อง ${t.roomId})`;
                chip = { text: t.status ?? "งาน", cls: "bg-gray-200 text-gray-800" };
              }

              return (
                <div key={t.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm text-gray-500">
                      {t.checkinDate ? `Check-in: ${t.checkinDate}` : ""}
                      {t.checkoutDate ? `  ·  Check-out: ${t.checkoutDate}` : ""}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-md ${chip.cls}`}>{chip.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* เมนูด่วน (ตัวอย่าง) */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-xl mb-4">⚡ เมนูด่วน</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="rounded-xl p-6 bg-purple-100 hover:bg-purple-200">📅 จัดการการจอง</button>
            <button className="rounded-xl p-6 bg-blue-100 hover:bg-blue-200">🐱 ดูแลแมว</button>
            <button className="rounded-xl p-6 bg-green-100 hover:bg-green-200">📦 เช็กสต็อก</button>
            <button className="rounded-xl p-6 bg-amber-100 hover:bg-amber-200">💰 คิดเงิน</button>
          </div>
        </div>
      </div>
    </div>
  );
}
