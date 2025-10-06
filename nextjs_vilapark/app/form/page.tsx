"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [user, setUser] = useState<UserDTO | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [step, setStep] = useState(1);




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

  // โหลด user และ prefill contact info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/signin");
    else {
      const u: UserDTO = JSON.parse(storedUser);
      setUser(u);

      setContactInfo({
        firstName: u.name,
        lastName: u.lastname,
        phone: u.phonenumber,
        email: u.email,
        address: u.address,
      });
    }
  }, [router]);

useEffect(() => {
  if (!user) return;
  alert("User ID: " + user.id);

  // โหลดแมวของ user คนนี้
  fetch(`http://localhost:8081/cats/owner/${user.id}`)
    .then((res) => res.json())
    .then((myCats: Cat[]) => {
      console.log("Cats from backend:", myCats); // ✅ ดูใน console
      alert("My Cats: " + JSON.stringify(myCats, null, 2)); // ✅ แสดงเป็น alert
      setCats(myCats); // เก็บแมวเฉพาะของ user
      setLoadingCats(false);
    })
    .catch((err) => {
      console.error(err);
      alert("Error fetching cats: " + err);
    });
}, [user]);



  // โหลดห้อง
  useEffect(() => {
    fetch("http://localhost:8081/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err));
  }, []);

// โหลด user จาก backend
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    router.push("/signin");
  } else {
    const basicUser = JSON.parse(storedUser); // จะมีแค่ id, username, email จาก login
    fetch(`http://localhost:8081/users/${basicUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user details");
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
      .catch((err) => {
        console.error(err);
        router.push("/signin");
      });
  }
}, [router]);

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/signin");
  }

  // ---------- STEP 1 ----------
  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };
  const handleSelectRoom = (roomId: number) => {
    setBookingData({ ...bookingData, roomId });
  };
  const handleNextStep1 = () => {
    if (!bookingData.checkinDate || !bookingData.checkoutDate || bookingData.roomId === 0) {
      alert("กรุณากรอกข้อมูลการจองให้ครบถ้วน");
      return;
    }
    setStep(2);
  };

  // ---------- STEP 2 ----------
  const handleSelectCat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCatId(Number(e.target.value));
  };
  const handlePrevStep2 = () => setStep(1);
  const handleNextStep2 = () => {
    if (!selectedCatId) {
      alert("กรุณาเลือกแมวก่อน");
      return;
    }
    setStep(3);
  };

  // ---------- STEP 3 ----------
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };
  const handlePrevStep3 = () => setStep(2);
  const handleNextStep3 = () => {
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.phone || !contactInfo.email || !contactInfo.address) {
      alert("กรุณากรอกข้อมูลเจ้าของให้ครบถ้วน");
      return;
    }
    setStep(4);
  };

  // ---------- STEP 4 ----------
  const handlePrevStep4 = () => setStep(3);

  // ---------- SUBMIT ----------
const handleSubmit = async () => {
  if (!user) {
    alert("ไม่พบ User ID");
    return;
  }

  // 1. เตรียมข้อมูล User ที่จะอัปเดต
  const updatedUser = {
    ...user,
    name: contactInfo.firstName,
    lastname: contactInfo.lastName,
    phonenumber: contactInfo.phone,
    email: contactInfo.email,
    address: contactInfo.address,
  };

  // 2. Payload booking
  const bookingPayload = {
    userId: user.id,
    catId: selectedCatId,
    roomId: bookingData.roomId,
    checkinDate: bookingData.checkinDate,
    checkoutDate: bookingData.checkoutDate,
    status: "1",
  };

  // 🟣 แสดง JSON ที่จะส่งออกไป
  alert("📌 UpdatedUser\n" + JSON.stringify(updatedUser, null, 2));
  alert("📌 BookingPayload\n" + JSON.stringify(bookingPayload, null, 2));

  try {
    // 🔹 PUT update user
    const putRes = await fetch(`http://localhost:8081/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!putRes.ok) {
      alert("❌ อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ");
      return;
    }

    // 🔹 POST booking
    const postRes = await fetch("http://localhost:8081/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload),
    });

    if (postRes.ok) {
      alert("✅ จองสำเร็จและอัปเดตข้อมูลผู้ใช้แล้ว!");
      setBookingData({ checkinDate: "", checkoutDate: "", roomId: 0 });
      setSelectedCatId(null);
      setContactInfo({ firstName: "", lastName: "", phone: "", email: "", address: "" });
      setStep(1);
    } else {
      alert("❌ การจองไม่สำเร็จ");
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

        {/* STEP 1 */}
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
                  onClick={handleNextStep1}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
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
                    onClick={handlePrevStep2}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-md bg-white mt-10">
            <h3 className="text-xl font-semibold mb-4">ข้อมูลเจ้าของ</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อ</label>
                <input
                  type="text"
                  name="firstName"
                  value={contactInfo.firstName}
                  onChange={handleContactChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="ชื่อจริง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={contactInfo.lastName}
                  onChange={handleContactChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="นามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleContactChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleContactChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="example@email.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">ที่อยู่</label>
              <textarea
                name="address"
                value={contactInfo.address}
                onChange={handleContactChange}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="ที่อยู่สำหรับติดต่อ"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={handlePrevStep3}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleNextStep3}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-md bg-white mt-10">
            <h3 className="text-xl font-semibold mb-4">ยืนยันการจอง</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">ข้อมูลการจอง</h4>
                <p>เช็คอิน: {bookingData.checkinDate}</p>
                <p>เช็คเอาท์: {bookingData.checkoutDate}</p>
                {rooms.find(r => r.id === bookingData.roomId) && (
                  <p>ห้อง: {rooms.find(r => r.id === bookingData.roomId)?.type} - {rooms.find(r => r.id === bookingData.roomId)?.roomNumber}</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold">แมวที่เลือก</h4>
                {cats.find(c => c.id === selectedCatId) ? (
                  <p>{cats.find(c => c.id === selectedCatId)?.name}</p>
                ) : (
                  <p>ไม่ได้เลือกแมว</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold">ข้อมูลเจ้าของ</h4>
                <p>ชื่อ: {contactInfo.firstName} {contactInfo.lastName}</p>
                <p>เบอร์โทร: {contactInfo.phone}</p>
                <p>อีเมล: {contactInfo.email}</p>
                <p>ที่อยู่: {contactInfo.address}</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={handlePrevStep4}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                ยืนยันการจอง
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
