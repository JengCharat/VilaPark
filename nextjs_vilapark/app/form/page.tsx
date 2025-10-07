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
  const searchParams = useSearchParams(); // ✅ ใช้ query string
  const stepFromQuery = Number(searchParams.get("step")) || 1;

  const [user, setUser] = useState<UserDTO | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [step, setStep] = useState(stepFromQuery); // ✅ เริ่มที่ step จาก query

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  const [isRoomAvailable, setIsRoomAvailable] = useState<boolean | null>(null);
  const checkAvailability = async () => {
    const payload = {
      roomId: bookingData.roomId,
      checkinDate: bookingData.checkinDate,
      checkoutDate: bookingData.checkoutDate,
    };

    try {
      const res = await fetch("https://www.vilapark.app/api/bookings/check-availability", {
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
  //////////////////////////////////////////////////////////////////////////////////////////////////

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
      fetch(`https://www.vilapark.app/api/users/${basicUser.id}`)
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
    fetch(`https://www.vilapark.app/api/cats/owner/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCats(data);
        setLoadingCats(false);
      })
      .catch(() => setLoadingCats(false));
  }, [user]);

  // ✅ โหลดห้อง
  useEffect(() => {
    fetch("https://www.vilapark.app/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => setRooms([]));
  }, []);

  // ✅ โหลด bookings
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://www.vilapark.app/api/bookings/future");
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
      const putRes = await fetch(`https://www.vilapark.app/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!putRes.ok) throw new Error("อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ");

      // POST booking
      const postRes = await fetch("https://www.vilapark.app/api/bookings", {
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
      <div className="min-h-screen bg-white text-black ">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            จองห้องพักน้องแมว</h2>

          {/* Step Indicator */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-10">
              {/* Step Titles */}
              <div className="flex justify-between text-sm font-medium mb-3">
                {["เลือกวัน/ห้อง", "เลือกแมว", "ข้อมูลเจ้าของ", "ยืนยัน"].map((label, i) => (
                  <div
                    key={i}
                    className={`transition-colors duration-300 ${
                      step === i + 1 ? "text-[#225EC4] font-semibold" : "text-gray-400"
                    }`}
                  >
                    {i + 1}. {label}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="absolute top-0 left-0 bg-[#225EC4] h-2 rounded-full transition-all duration-500 ease-in-out"
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
                      วันที่เช็คอิน
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
                      วันที่เช็คเอาท์
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
                      className={`p-4 border rounded-lg cursor-pointer hover:border-[#225EC4] transition ${bookingData.roomId === room.id
                        ? "border-[#225EC4] "
                        : "border-gray-300"
                        }`}
                    >
                      <h4 className="font-semibold">{room.type}</h4>
                      <p className="text-sm text-gray-600">
                        ห้อง {room.roomNumber}
                      </p>
                      <p className="text-[#225EC4] font-bold">
                        ฿{room.price}/วัน
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={nextStep}
                    className="mt-6 bg-[#225EC4] text-white px-6 py-3 rounded-lg hover:bg-[#063d8c]"
                  >
                    ถัดไป
                  </button></div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                  <span>เลือกแมวของคุณ</span>
                  <button
                    onClick={() => router.push("/addpet?redirect=form&step=2")}
                    className="bg-[#225EC4] text-white px-4 py-2 rounded-lg hover:bg-[#063d8c] flex items-center space-x-2"
                  >
                    <span className="text-sm">➕</span>
                    <span className="text-sm">เพิ่มแมว</span>
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
                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevStep}
                    className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-3 rounded-lg"
                  >
                    ย้อนกลับ
                  </button>

                  <button
                    onClick={nextStep}
                    className="bg-[#225EC4] hover:bg-[#063d8c] text-white px-6 py-3 rounded-lg"
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
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-400 text-white rounded-lg"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-[#225EC4] hover:bg-[#063d8c] text-white rounded-lg"
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
                  <div className="bg-gray-50 p-6 rounded-lg text-black">
                    {/* ข้อมูลการจอง */}
                    <h4 className="font-semibold mb-4">ข้อมูลการจอง</h4>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>วันที่เช็คอิน :</span>
                        <span>{bookingData.checkinDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>วันที่เช็คเอาท์ :</span>
                        <span>{bookingData.checkoutDate}</span>
                      </div>
                      {rooms.find((r) => r.id === bookingData.roomId) && (
                        <div className="flex justify-between">
                          <span>ห้อง :</span>
                          <span>
                            {rooms.find((r) => r.id === bookingData.roomId)?.type} -{" "}
                            {rooms.find((r) => r.id === bookingData.roomId)?.roomNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* แมวที่เลือก */}
                    <h4 className="font-semibold mb-4">แมวที่เลือก</h4>
                    <div className="flex justify-between text-sm mb-4">
                      <span>{cats.find((c) => c.id === selectedCatId)?.name ?? "ไม่ได้เลือกแมว"}</span>
                    </div>

                    {/* ข้อมูลเจ้าของ */}
                    <h4 className="font-semibold mb-4">ข้อมูลเจ้าของ</h4>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>ชื่อ-สกุล :</span>
                        <span>{contactInfo.firstName} {contactInfo.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>เบอร์ติดต่อ :</span>
                        <span>{contactInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>อีเมล :</span>
                        <span>{contactInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ที่อยู่ :</span>
                        <span>{contactInfo.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-400 text-white rounded-lg"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-[#225EC4] hover:bg-[#063d8c] text-white rounded-lg"
                    >
                      ยืนยันการจอง
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
          <Calendar bookings={bookings} loading={loading} />
        </div>
      </div>
    </>
  );
}

// Component หลักที่ใช้ Suspense
export default function DashboardBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225EC4] mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
