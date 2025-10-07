"use client";

import "../globals.css";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

type RoleDTO = { id: number; name: string };
type UserDTO = {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  phonenumber: string;
  address: string;
  roles: RoleDTO[];
};

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
type Cat = { id: number; name: string };
type Room = { id: number; roomNumber: string; type: string; price: number };

// แยก Component หลักออกมาเพื่อใช้ Suspense
function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromQuery = Number(searchParams.get("step")) || 1;

  const [user, setUser] = useState<UserDTO | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [step, setStep] = useState(stepFromQuery);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRoomAvailable, setIsRoomAvailable] = useState<boolean | null>(null);
  const [bookingData, setBookingData] = useState({
    checkinDate: "",
    checkoutDate: "",
    roomId: 0,
  });

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  // ✅ โหลด bookings
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

  // ✅ ตรวจสอบความพร้อมของห้อง
  const checkAvailability = async () => {
    const payload = {
      roomId: bookingData.roomId,
      checkinDate: bookingData.checkinDate,
      checkoutDate: bookingData.checkoutDate,
    };

    try {
      const res = await fetch("http://localhost:8081/bookings/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const available = await res.json();
      setIsRoomAvailable(available);

      if (!available) {
        alert("ห้องนี้ไม่ว่างในช่วงวันที่เลือก");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเช็คสถานะห้องได้");
    }
  };

  useEffect(() => {
    if (!bookingData.checkinDate || !bookingData.checkoutDate || bookingData.roomId === 0) {
      setIsRoomAvailable(null);
      return;
    }

    checkAvailability();
  }, [bookingData.checkinDate, bookingData.checkoutDate, bookingData.roomId]);

  // ✅ โหลด user จาก localStorage และ prefill
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/signin");
    else {
      const basicUser = JSON.parse(storedUser);
      fetch(`http://localhost:8081/users/${basicUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((u: UserDTO) => {
          setUser(u);
          setContactInfo({
            firstName: u.name || "",
            lastName: u.lastname || "",
            phone: u.phonenumber || "",
            email: u.email || "",
            address: u.address || "",
          });
        })
        .catch(() => router.push("/signin"));
    }
  }, [router]);

  // ✅ โหลดแมวของ user
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8081/cats/owner/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCats(data);
        setLoadingCats(false);
      })
      .catch(() => setLoadingCats(false));
  }, [user]);

  // ✅ โหลดห้อง
  useEffect(() => {
    fetch("http://localhost:8081/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => setRooms([]));
  }, []);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handleSelectCat = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCatId(Number(e.target.value));

  // ✅ Step Control
  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ✅ Update URL when step changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', step.toString());
    window.history.replaceState({}, '', url.toString());
  }, [step]);

  // ✅ Submit
  const handleSubmit = async () => {
    if (!user) return alert("ไม่พบข้อมูลผู้ใช้");
    if (!selectedCatId) return alert("กรุณาเลือกแมว");
    if (!bookingData.roomId) return alert("กรุณาเลือกห้อง");
    if (!bookingData.checkinDate || !bookingData.checkoutDate)
      return alert("กรุณากรอกวันที่ครบถ้วน");

    if (isRoomAvailable === false) {
      return alert("ห้องไม่ว่างในช่วงวันที่เลือก กรุณาเลือกใหม่");
    }

    const updatedUser = {
      ...user,
      name: contactInfo.firstName,
      lastname: contactInfo.lastName,
      phonenumber: contactInfo.phone,
      email: contactInfo.email,
      address: contactInfo.address,
    };

    const bookingPayload = {
      userId: user.id,
      catId: selectedCatId,
      roomId: bookingData.roomId,
      checkinDate: bookingData.checkinDate,
      checkoutDate: bookingData.checkoutDate,
      status: "1",
    };

    try {
      // PUT update user
      const putRes = await fetch(`http://localhost:8081/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!putRes.ok) throw new Error("อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ");

      // POST booking
      const postRes = await fetch("http://localhost:8081/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });
      if (!postRes.ok) throw new Error("การจองไม่สำเร็จ");

      alert("✅ จองสำเร็จและอัปเดตข้อมูลผู้ใช้แล้ว!");
      router.push("/dashboard");
    } catch (err) {
      alert("⚠️ เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-black py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">📅 จองห้องพักน้องแมว</h2>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium mb-2">
              {["เลือกวัน/ห้อง", "เลือกแมว", "ข้อมูลเจ้าของ", "ยืนยัน"].map((label, i) => (
                <div
                  key={i}
                  className={
                    step === i + 1
                      ? "text-purple-600 font-semibold"
                      : "text-gray-400"
                  }
                >
                  {i + 1}. {label}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${step * 25}%` }}
              ></div>
            </div>
          </div>

          {/* Availability Status */}
          {isRoomAvailable !== null && (
            <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              isRoomAvailable 
                ? "bg-green-100 text-green-800 border border-green-300" 
                : "bg-red-100 text-red-800 border border-red-300"
            }`}>
              {isRoomAvailable ? "✅ ห้องว่างในช่วงวันที่เลือก" : "❌ ห้องไม่ว่างในช่วงวันที่เลือก"}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                เลือกวันที่เข้าพักและห้อง
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    วันเช็คอิน
                  </label>
                  <input
                    type="date"
                    name="checkinDate"
                    value={bookingData.checkinDate}
                    onChange={handleBookingChange}
                    className="w-full p-3 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    วันเช็คเอาท์
                  </label>
                  <input
                    type="date"
                    name="checkoutDate"
                    value={bookingData.checkoutDate}
                    onChange={handleBookingChange}
                    className="w-full p-3 border rounded-lg"
                    min={bookingData.checkinDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <label className="block text-sm font-medium mb-2">
                เลือกห้องพัก
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() =>
                      setBookingData({ ...bookingData, roomId: room.id })
                    }
                    className={`p-4 border rounded-lg cursor-pointer hover:border-purple-500 transition ${
                      bookingData.roomId === room.id
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-300"
                    }`}
                  >
                    <h4 className="font-semibold">{room.type}</h4>
                    <p className="text-sm text-gray-600">
                      ห้อง {room.roomNumber}
                    </p>
                    <p className="text-purple-600 font-bold">
                      ฿{room.price}/วัน
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={!bookingData.checkinDate || !bookingData.checkoutDate || bookingData.roomId === 0}
                className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <span>เลือกแมวของคุณ</span>
                <button
                  onClick={() => router.push("/addpet?redirect=form&step=2")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>เพิ่มแมว</span>
                </button>
              </h3>

              {loadingCats ? (
                <p>⏳ กำลังโหลดข้อมูลแมว...</p>
              ) : cats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">❌ ยังไม่มีแมวในระบบ</p>
                  <button
                    onClick={() => router.push("/addpet?redirect=form&step=2")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    เพิ่มแมวแรกของคุณ
                  </button>
                </div>
              ) : (
                <select
                  value={selectedCatId ?? ""}
                  onChange={handleSelectCat}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- เลือกแมว --</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={prevStep}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedCatId}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">ข้อมูลเจ้าของ</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อ</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="ชื่อ"
                    value={contactInfo.firstName}
                    onChange={handleContactChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">นามสกุล</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="นามสกุล"
                    value={contactInfo.lastName}
                    onChange={handleContactChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="เบอร์โทรศัพท์"
                    value={contactInfo.phone}
                    onChange={handleContactChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">อีเมล</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="อีเมล"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">ที่อยู่</label>
                <textarea
                  name="address"
                  placeholder="ที่อยู่"
                  value={contactInfo.address}
                  onChange={handleContactChange}
                  rows={3}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={nextStep}
                  disabled={!contactInfo.firstName || !contactInfo.lastName || !contactInfo.phone || !contactInfo.email || !contactInfo.address}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">ยืนยันข้อมูลการจอง</h3>
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <h4 className="font-semibold text-lg mb-2">ข้อมูลการจอง</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <p><strong>เช็คอิน:</strong> {bookingData.checkinDate}</p>
                    <p><strong>เช็คเอาท์:</strong> {bookingData.checkoutDate}</p>
                    {rooms.find((r) => r.id === bookingData.roomId) && (
                      <>
                        <p><strong>ประเภทห้อง:</strong> {rooms.find((r) => r.id === bookingData.roomId)?.type}</p>
                        <p><strong>เลขห้อง:</strong> {rooms.find((r) => r.id === bookingData.roomId)?.roomNumber}</p>
                        <p><strong>ราคาต่อวัน:</strong> ฿{rooms.find((r) => r.id === bookingData.roomId)?.price}</p>
                        <p><strong>สถานะ:</strong> 
                          <span className={`ml-2 ${isRoomAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {isRoomAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">แมวที่เลือก</h4>
                  <p>{cats.find((c) => c.id === selectedCatId)?.name ?? "ไม่ได้เลือกแมว"}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">ข้อมูลเจ้าของ</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <p><strong>ชื่อ-นามสกุล:</strong> {contactInfo.firstName} {contactInfo.lastName}</p>
                    <p><strong>📞 โทรศัพท์:</strong> {contactInfo.phone}</p>
                    <p><strong>📧 อีเมล:</strong> {contactInfo.email}</p>
                    <p><strong>🏠 ที่อยู่:</strong> {contactInfo.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  onClick={prevStep} 
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  ย้อนกลับ
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isRoomAvailable === false}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isRoomAvailable === false ? 'ห้องไม่ว่าง' : 'ยืนยันการจอง'}
                </button>
              </div>
            </div>
          )}

          <Calendar bookings={bookings} loading={loading} />
        </div>
      </div>
    </>
  );
}

// Component หลักที่ใช้ Suspense
export default function DashboardBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}
