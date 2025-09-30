"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type User = { id: number; username: string; email: string; roles: string[] };
type Cat = { id: number; name: string };
type Room = { id: number; roomNumber: string; type: string; price: number };

export default function DashboardBookingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [cats, setCats] = useState<Cat[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [step, setStep] = useState(1);

    const [bookingData, setBookingData] = useState({
        checkinDate: "",
        checkoutDate: "",
        roomId: 0,
    });

    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

    // โหลด user
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) router.push("/signin");
        else {
            const u = JSON.parse(storedUser);
            setUser(u);
            setUserId(u.id);
        }
    }, [router]);

    // โหลดแมว
    useEffect(() => {
        if (user) {
            fetch("http://localhost:8081/cats")
                .then(res => res.json())
                .then((data: Cat[]) => {
                    setCats(data);
                    setLoadingCats(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoadingCats(false);
                });
        }
    }, [user]);

    // โหลดห้อง
    useEffect(() => {
        fetch("http://localhost:8081/rooms")
            .then(res => res.json())
            .then(data => setRooms(data))
            .catch(err => console.error(err));
    }, []);

    function handleLogout() {
        localStorage.removeItem("user");
        router.push("/signin");
    }

    // handle form
    const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookingData({ ...bookingData, [name]: value });
    };

    const handleSelectRoom = (roomId: number) => {
        setBookingData({ ...bookingData, roomId });
    };

    const handleSelectCat = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCatId(Number(e.target.value));
    };

    // Next & Prev
    const handleNextStep = () => {
        if (!bookingData.checkinDate || !bookingData.checkoutDate || bookingData.roomId === 0) {
            alert("กรุณากรอกข้อมูลการจองให้ครบถ้วน");
            return;
        }
        setStep(2);
    };
    const handlePrevStep = () => setStep(1);

    // Submit Booking
const handleSubmit = async () => {
    if (!userId) {
        alert("ไม่พบ User ID");
        return;
    }
    if (!selectedCatId) {
        alert("กรุณาเลือกแมวก่อน");
        return;
    }

    const payload = {
        userId,
        catId: selectedCatId,
        roomId: bookingData.roomId,
        checkinDate: bookingData.checkinDate,
        checkoutDate: bookingData.checkoutDate,
        status: "1",
    };

    // alert JSON ก่อนส่ง
    alert("JSON ที่จะส่ง:\n" + JSON.stringify(payload, null, 2));

    try {
        const response = await fetch("http://localhost:8081/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("✅ จองห้องและเลือกแมวสำเร็จ!");
            setBookingData({ checkinDate: "", checkoutDate: "", roomId: 0 });
            setSelectedCatId(null);
            setStep(1);
        } else {
            alert("❌ เกิดข้อผิดพลาด");
        }
    } catch (error) {
        console.error(error);
        alert("⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
};

    if (!user) return <p>Loading...</p>;

    return (
        <>
            <Navbar />
            <div className="bg-white min-h-screen py-10 text-black">

                {/* STEP 1: ข้อมูลการจอง */}
                {step === 1 && (
                    <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-md bg-white mt-10">
                        <h1 className="text-2xl font-bold mb-6 text-center">📅 จองห้องพัก</h1>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">วันเช็คอิน</label>
                                    <input
                                        type="date"
                                        name="checkinDate"
                                        value={bookingData.checkinDate}
                                        onChange={handleBookingChange}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">วันเช็คเอาท์</label>
                                    <input
                                        type="date"
                                        name="checkoutDate"
                                        value={bookingData.checkoutDate}
                                        onChange={handleBookingChange}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">เลือกห้องพัก</label>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleSelectRoom(room.id)}
                                            className={`p-4 border rounded-lg cursor-pointer hover:border-purple-500 transition ${bookingData.roomId === room.id
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-300"
                                                }`}
                                        >
                                            <p className="font-semibold">{room.type}</p>
                                            <p className="text-sm text-gray-500">{room.roomNumber}</p>
                                            <p className="text-purple-600 font-bold">฿{room.price}/วัน</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: เลือกแมว */}
                {step === 2 && (
                    <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-md bg-white mt-10">
                        <h1 className="text-2xl font-bold mb-6 text-center">🐱 เลือกแมว</h1>

                        {loadingCats ? (
                            <p>Loading cats...</p>
                        ) : cats.length === 0 ? (
                            <p>ยังไม่มีแมวในระบบ</p>
                        ) : (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium mb-2">เลือกแมว</label>
                                <select
                                    value={selectedCatId ?? ""}
                                    onChange={handleSelectCat}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">-- เลือกแมว --</option>
                                    {cats.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ย้อนกลับ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        ยืนยันจอง
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
