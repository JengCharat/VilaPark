"use client";
import { useEffect, useState } from "react";

interface Room {
    id: number;
    roomNumber: string;
    type: string;
    price: number;
}

export default function BookingPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [formData, setFormData] = useState({
        checkinDate: "",
        checkoutDate: "",
        roomId: 0, // ใช้ number แทน string
    });

    // ดึงข้อมูลห้องจาก API
    useEffect(() => {
        fetch("http://localhost:8081/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((err) => console.error("Error loading rooms:", err));
    }, []);

    // เปลี่ยนค่า input วันที่
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // เลือกห้อง
    const handleSelectRoom = (roomId: number) => {
        setFormData({ ...formData, roomId });
    };

    // ส่งข้อมูล Booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.roomId) {
            alert("กรุณาเลือกห้องก่อน");
            return;
        }

        try {
            const response = await fetch("http://localhost:8081/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId: formData.roomId,
                    checkinDate: formData.checkinDate,
                    checkoutDate: formData.checkoutDate,
                    status: "จองแล้ว",
                }),
            });

            if (response.ok) {
                alert("จองห้องสำเร็จ!");
                setFormData({ checkinDate: "", checkoutDate: "", roomId: 0 });
            } else {
                alert("จองห้องไม่สำเร็จ");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
            <h1 className="text-2xl font-bold mb-6 text-center">จองห้องพักสำหรับน้องแมว</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* วันที่เช็คอินและเช็คเอาท์ */}
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        name="checkinDate"
                        value={formData.checkinDate}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
                        required
                    />
                    <input
                        type="date"
                        name="checkoutDate"
                        value={formData.checkoutDate}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
                        required
                    />
                </div>

                {/* แสดงห้อง */}
                <div>
                    <p className="font-semibold mb-3">ประเภทห้อง</p>
                    <div className="grid grid-cols-3 gap-3">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => handleSelectRoom(room.id)}
                                className={`p-4 border rounded-lg cursor-pointer hover:border-purple-500 transition ${formData.roomId === room.id ? "border-purple-500 bg-purple-50" : "border-gray-300"
                                    }`}
                            >
                                <p className="font-bold">{room.type}</p>
                                <p className="text-sm text-gray-600">{room.roomNumber}</p>
                                <p className="text-purple-600 font-semibold">฿{room.price}/วัน</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ปุ่มส่งข้อมูล */}
                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                    ถัดไป
                </button>
            </form>
        </div>
    );
}
