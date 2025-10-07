"use client";

import '../globals.css';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type User = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

type Cat = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin"); // ถ้าไม่มี user -> กลับไป login
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch("http://localhost:8081/cats")
        .then((res) => res.json())
        .then((data: Cat[]) => {
          setCats(data);
          setLoadingCats(false);
        })
        .catch((err) => {
          console.error("Fetch cats error:", err);
          setLoadingCats(false);
        });
    }
  }, [user]);


  // ปุ่มจองห้อง → ไปหน้า BookingPage
  function goToBookingPage() {
    router.push("form"); // สมมติไฟล์อยู่ pages/booking.tsx
  }

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Navbar />

      <div id="home" className="page">
        <div className=" text-white mt-22 ">
          <div className="max-w-7xl mx-auto px-4 text-center ">
            <h1 className="text-5xl text-[#4691D3] font-bold mb-6">ยินดีต้อนรับ {user.username}</h1>
            <p className="text-xl text-[#225ec4] mb-8">โรงแรมแมวหรูที่ดูแลน้องแมวของคุณด้วยความรักและใส่ใจ</p>
            <button
              onClick={goToBookingPage}
              className="card-hover bg-[#4691D3] hover:bg-[#225ec4] text-white px-8 py-4 rounded-full text-lg font-semibold  transition duration-300"
            >
              จองห้องพักเลย !
            </button>
          </div>
        </div>

            <div className="relative mt-10">
          {/* Background ครึ่งล่าง */}
<div className="absolute top-1/15 left-0 w-full h-14/15 bg-[#4691D3] -z-10"></div>

          {/* Section Feature */}
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-hover bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold mb-2">ห้องพักหรู</h3>
                <p className="text-gray-600">
                  ห้องพักสะอาด ปลอดภัย พร้อมของเล่นและที่นอนนุ่มสบาย
                </p>
              </div>
              <div className="card-hover bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">อัปเดตประจำวัน</h3>
                <p className="text-gray-600">
                  รับรูปภาพและข้อความอัปเดตน้องแมวของคุณทุกวัน
                </p>
              </div>
              <div className="card-hover bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">💝</div>
                <h3 className="text-xl font-semibold mb-2">ดูแลด้วยใจ</h3>
                <p className="text-gray-600">
                  พนักงานมืออาชีพที่รักแมวและดูแลด้วยความใส่ใจ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ... ส่วนอื่นของ Dashboard ... */}
      </div>

      {/*
      <div className="p-6 space-y-6 gradient-bg">
        Header 
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
        </div>

        User Info 
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <ul className="list-disc pl-5">
            <li>ID: {user.id}</li>
            <li>Username: {user.username}</li>
            <li>Email: {user.email}</li>
            <li>Roles: {user.roles.join(", ")}</li>
          </ul>
        </div>

        Cats List 
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Pet Cats</h2>
          {loadingCats ? (
            <p>Loading cats...</p>
          ) : cats.length === 0 ? (
            <p>No cats found</p>
          ) : (
            <ul className="list-disc pl-5">
              {cats.map((cat) => (
                <li key={cat.id}>
                  {cat.id} - {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div> 
      </div> */}
    </>
  );
}
