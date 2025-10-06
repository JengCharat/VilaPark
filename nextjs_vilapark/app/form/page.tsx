"use client";

import "../globals.css";
import { useEffect, useState } from "react";
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
type Cat = { id: number; name: string };
type Room = { id: number; roomNumber: string; type: string; price: number };

export default function DashboardBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ ใช้ query string
  const stepFromQuery = Number(searchParams.get("step")) || 1;

  const [user, setUser] = useState<UserDTO | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [step, setStep] = useState(stepFromQuery); // ✅ เริ่มที่ step จาก query




const [isRoomAvailable, setIsRoomAvailable] = useState<boolean | null>(null);
const checkAvailability = async () => {
  const payload = {
    roomId: bookingData.roomId,
    checkinDate: bookingData.checkinDate,
    checkoutDate: bookingData.checkoutDate,
  };

            alert(payload.roomId)
            alert(payload.checkinDate)
            alert(payload.checkoutDate)
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

  const [bookingData, setBookingData] = useState({
    checkinDate: "",
    checkoutDate: "",
    roomId: 0,
  });
useEffect(() => {
  if (!bookingData.checkinDate || !bookingData.checkoutDate || bookingData.roomId === 0) {
    setIsRoomAvailable(null); 
    return;
  }

  checkAvailability();
}, [bookingData.checkinDate, bookingData.checkoutDate, bookingData.roomId]);












  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

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

  // ✅ Submit
  const handleSubmit = async () => {
    if (!user) return alert("ไม่พบข้อมูลผู้ใช้");
    if (!selectedCatId) return alert("กรุณาเลือกแมว");
    if (!bookingData.roomId) return alert("กรุณาเลือกห้อง");
    if (!bookingData.checkinDate || !bookingData.checkoutDate)
      return alert("กรุณากรอกวันที่ครบถ้วน");

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
                    className={`p-4 border rounded-lg cursor-pointer hover:border-purple-500 transition ${bookingData.roomId === room.id
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
                className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
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
                <p>❌ ยังไม่มีแมวในระบบ</p>
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
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={nextStep}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg"
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
                <input
                  type="text"
                  name="firstName"
                  placeholder="ชื่อ"
                  value={contactInfo.firstName}
                  onChange={handleContactChange}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="นามสกุล"
                  value={contactInfo.lastName}
                  onChange={handleContactChange}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="เบอร์โทรศัพท์"
                  value={contactInfo.phone}
                  onChange={handleContactChange}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="อีเมล"
                  value={contactInfo.email}
                  onChange={handleContactChange}
                  className="p-3 border rounded-lg"
                />
              </div>
              <textarea
                name="address"
                placeholder="ที่อยู่"
                value={contactInfo.address}
                onChange={handleContactChange}
                rows={3}
                className="w-full p-3 border rounded-lg mt-4"
              />

              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg"
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
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">ข้อมูลการจอง</h4>
                  <p>เช็คอิน: {bookingData.checkinDate}</p>
                  <p>เช็คเอาท์: {bookingData.checkoutDate}</p>
                  {rooms.find((r) => r.id === bookingData.roomId) && (
                    <p>
                      ห้อง: {rooms.find((r) => r.id === bookingData.roomId)?.type} -{" "}
                      {rooms.find((r) => r.id === bookingData.roomId)?.roomNumber}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold">แมวที่เลือก</h4>
                  <p>{cats.find((c) => c.id === selectedCatId)?.name ?? "ไม่ได้เลือกแมว"}</p>
                </div>

                <div>
                  <h4 className="font-semibold">ข้อมูลเจ้าของ</h4>
                  <p>
                    {contactInfo.firstName} {contactInfo.lastName}
                  </p>
                  <p>📞 {contactInfo.phone}</p>
                  <p>📧 {contactInfo.email}</p>
                  <p>🏠 {contactInfo.address}</p>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={prevStep} className="px-6 py-3 bg-gray-500 text-white rounded-lg">
                  ย้อนกลับ
                </button>
                <button onClick={handleSubmit} className="px-6 py-3 bg-purple-600 text-white rounded-lg">
                  ยืนยันการจอง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
