"use client";

import { useState, useEffect } from "react";

type User = {
    id: number;
    username: string;
    email: string;
    name?: string;
    lastname?: string;
    phonenumber?: string;
    address?: string;
};

type Cat = {
    id: number;
    name: string;
    breed: string;
    gender: string;
    age: number;
    habit?: string;
    note?: string;
};

type RoomOption = {
    id: number;
    roomNumber: string;
    type: string;
    price: number;
};

export default function AdminBooking() {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [cats, setCats] = useState<Cat[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

    const [checkinDate, setCheckinDate] = useState("");
    const [checkoutDate, setCheckoutDate] = useState("");

    // ✅ ดึงห้องจาก DB
    const [rooms, setRooms] = useState<RoomOption[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);

    // ✅ โหลดข้อมูลห้องทั้งหมด
    useEffect(() => {
        fetch("http://localhost:8081/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch(() => setRooms([]));
    }, []);

    // ✅ โหลดข้อมูล user + cats เมื่อกรอก userId
    useEffect(() => {
        if (!userId) return;
        fetch(`http://localhost:8081/users/${userId}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(() => setUser(null));

        fetch(`http://localhost:8081/cats/by-owner/${userId}`)
            .then((res) => res.json())
            .then((data) => setCats(data))
            .catch(() => setCats([]));
    }, [userId]);

    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const calcDays = () => {
        if (!checkinDate || !checkoutDate) return 0;
        const diff =
            new Date(checkoutDate).getTime() - new Date(checkinDate).getTime();
        return diff > 0 ? diff / (1000 * 60 * 60 * 24) : 0;
    };

    const totalPrice = selectedRoom ? calcDays() * selectedRoom.price : 0;

    const confirmBooking = async () => {
        if (!user || !selectedCatId || !selectedRoom || !checkinDate || !checkoutDate)
            return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

        const bookingData = {
            userId: user.id,
            catId: selectedCatId,
            roomId: selectedRoom.id,
            checkinDate,
            checkoutDate,
            status: "Pending",
        };

        const res = await fetch("http://localhost:8081/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
        });

        if (res.ok) {
            alert("✅ จองสำเร็จ!");
            setStep(1);
            setUser(null);
            setCats([]);
            setUserId("");
            setSelectedRoom(null);
            setSelectedCatId(null);
            setCheckinDate("");
            setCheckoutDate("");
        } else {
            alert("❌ เกิดข้อผิดพลาดในการจอง");
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                    📅 จองห้องพักสำหรับน้องแมว (Admin)
                </h2>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Step Indicator */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`step-indicator ${step === i
                                                ? "text-purple-600 font-semibold"
                                                : "text-gray-400"
                                            }`}
                                    >
                                        {i}.{" "}
                                        {i === 1
                                            ? "เลือกวันและห้อง"
                                            : i === 2
                                                ? "ข้อมูลแมว"
                                                : i === 3
                                                    ? "ข้อมูลติดต่อ"
                                                    : "ยืนยันการจอง"}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${step * 25}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">
                                เลือกวันที่และประเภทห้อง
                            </h3>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">
                                    User ID
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-3 border rounded-lg text-black"
                                    placeholder="กรอก ID ผู้ใช้"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                />
                                {user && (
                                    <p className="mt-2 text-sm text-green-600">
                                        พบผู้ใช้: {user.username} ({user.email})
                                    </p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        วันที่เข้าพัก
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border rounded-lg text-black"
                                        value={checkinDate}
                                        onChange={(e) => setCheckinDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        วันที่ออก
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border rounded-lg text-black"
                                        value={checkoutDate}
                                        onChange={(e) => setCheckoutDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium mb-2">
                                    ประเภทห้อง
                                </label>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {rooms.length === 0 ? (
                                        <p className="text-gray-500">⏳ กำลังโหลดข้อมูลห้อง...</p>
                                    ) : (
                                        rooms.map((room) => (
                                            <div
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={`border rounded-lg p-4 cursor-pointer hover:border-purple-500 ${selectedRoom?.id === room.id
                                                        ? "border-purple-600 bg-purple-50"
                                                        : ""
                                                    }`}
                                            >
                                                <h4 className="font-semibold">{room.type}</h4>
                                                <p className="text-sm text-gray-600">
                                                    ห้อง {room.roomNumber} | ฿{room.price}/วัน
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                            >
                                ถัดไป
                            </button>
                        </div>
                    )}

                    {/* ส่วน Step 2 - Step 4 เหมือนเดิม ไม่เปลี่ยน */}
                    {/* ... */}
                </div>
            </div>
        </div>
    );
}
