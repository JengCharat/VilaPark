'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // ใช้ Link จาก Next.js เพื่อการเปลี่ยนหน้าที่เร็วขึ้น

// --- Interfaces for type safety ---
interface SummaryData {
  stayingToday: number;
  checkinToday: number;
  checkoutToday: number;
  needUpdate: number;
}

interface BookingTask {
  id: number;
  roomId: number;
  catName: string;
  checkinDate: string;
  checkoutDate: string;
  status: string;
}

// --- API Base URL (แก้ที่นี่ที่เดียวถ้ามีการเปลี่ยนแปลง) ---
const API_BASE_URL = 'http://localhost:8081/api/bookings';

export default function DashboardAdmin() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [tasks, setTasks] = useState<BookingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/summary`),
          fetch(`${API_BASE_URL}/today`),
        ]);

        if (!summaryRes.ok || !tasksRes.ok) {
          throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }

        const summaryData: SummaryData = await summaryRes.json();
        const tasksData: BookingTask[] = await tasksRes.json();

        setSummary(summaryData);
        setTasks(tasksData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;
  }

  const getTaskDetails = (task: BookingTask) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (task.checkinDate === today) {
        return {
            title: `Check-in - ${task.catName} (ห้อง ${task.roomId})`,
            time: "เวลา 14:00",
            badgeText: "เช็คอิน",
            badgeColor: "bg-green-100 text-green-800",
        };
    }
    if (task.checkoutDate === today) {
        return {
            title: `Check-out - ${task.catName} (ห้อง ${task.roomId})`,
            time: "เวลา 10:00",
            badgeText: "เช็คเอาท์",
            badgeColor: "bg-blue-100 text-blue-800",
        };
    }
    return {
        title: `อัปเดตสุขภาพ - ${task.catName} (ห้อง ${task.roomId})`,
        time: "อัปเดตข้อมูลของวันนี้",
        badgeText: "อัปเดต",
        badgeColor: "bg-yellow-100 text-yellow-800",
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <h1>test</h1>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span>🧑‍💼</span>
          แดชบอร์ดพนักงาน
        </h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="แมวที่พักอยู่ตอนนี้"
          value={summary?.stayingToday ?? 0}
          icon="👥"
          color="text-white bg-blue-500"
        />
        <StatCard
          title="Check-in วันนี้"
          value={summary?.checkinToday ?? 0}
          icon="➡️"
          color="text-white bg-green-500"
        />
        <StatCard
          title="Check-out วันนี้"
          value={summary?.checkoutToday ?? 0}
          icon="⬅️"
          color="text-white bg-orange-500"
        />
        <StatCard
          title="ห้องที่ต้องอัปเดต"
          value={summary?.needUpdate ?? 0}
          icon="⚠️"
          color="text-white bg-purple-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">🗓️ งานวันนี้</h2>
          <div className="space-y-4">
            {tasks.length > 0 ? (
                tasks.map((task) => {
                    const { title, time, badgeText, badgeColor } = getTaskDetails(task);
                    return (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div>
                                <p className="font-semibold text-gray-800">{title}</p>
                                <p className="text-sm text-gray-500">{time}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColor}`}>
                                {badgeText}
                            </span>
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีงานสำหรับวันนี้</p>
            )}
          </div>
        </div>

        {/* Quick Menu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">⚡️ เมนูด่วน</h2>
            <div className="grid grid-cols-2 gap-4">
                <MenuButton icon="📅" title="จัดการการจอง" href="/bookings" color="hover:bg-blue-50 text-blue-600" />
                <MenuButton icon="🐈" title="ดูแมว" href="/cats" color="hover:bg-orange-50 text-orange-600" />
                {/* ปุ่มที่อัปเดตให้ลิงก์ไปหน้าสต็อก */}
                <MenuButton icon="📦" title="เช็กสต็อก" href="/stock" color="hover:bg-green-50 text-green-600" />
                <MenuButton icon="💰" title="คิดเงิน" href="/billing" color="hover:bg-yellow-50 text-yellow-600" />
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Components ---

interface StatCardProps {
  title: string;
  value: number;
  icon: string; // Changed to string for emoji
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg shadow-lg flex items-center justify-between ${color}`}>
      <div>
        <p className="text-lg font-medium opacity-90">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-80">
        {icon}
      </div>
    </div>
  );
}

interface MenuButtonProps {
    icon: string; // Changed to string for emoji
    title: string;
    href: string; // Added href for navigation
    color: string;
}

function MenuButton({icon, title, href, color}: MenuButtonProps) {
    return (
        <Link href={href} className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors text-center ${color}`}>
            <div className="text-3xl mb-2">{icon}</div>
            <span className="font-semibold text-sm">{title}</span>
        </Link>
    )
}