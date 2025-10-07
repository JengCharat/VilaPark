"use client";

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
  details: string;
  room: string;
  owner: string;
  phone: string;
};

type DailyUpdate = {
  id?: number;
  cat: { id: number; name?: string };
  updateDate: string;
  mood: string;
  activity: string;
  specialNotes: string;
  checklist: string[];
  messageToOwner: string;
  imageUrls: string[];
};

export default function TodayUpdate() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [todayUpdates, setTodayUpdates] = useState<DailyUpdate[]>([]);

  useEffect(() => {
    // เช็ค user
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    fetch(`https://vilapark.app/api/cats/owner/${user.id}`)
      .then((res) => res.json())
      .then((myCats: Cat[]) => {
        setCats(myCats);

        if (myCats.length === 0) return;

        const today = new Date().toISOString().slice(0, 10);

        Promise.all(
          myCats.map((cat) =>
            fetch(`https://vilapark.app/api/api/daily-updates/cat/${cat.id}`)
              .then((res) => res.json())
              .then((updates: DailyUpdate[]) => {
                const todayUpdate = updates.find((u) => u.updateDate === today);
                if (todayUpdate) todayUpdate.cat.name = cat.name;
                return todayUpdate || null;
              })
          )
        ).then((results) =>
          setTodayUpdates(results.filter((u) => u !== null) as DailyUpdate[])
        ).catch(console.error);
      })
      .catch(console.error);
  }, [user]);


  if (!user) return <p>Loading...</p>;

  return (
    <>
    
      <Navbar />
<div className="bg-white min-h-screen p-8 font-sans flex flex-col items-center">
  <h2 className="text-3xl font-bold mb-8 self-start ">ข้อมูลอัปเดตวันนี้</h2>

  {cats.length === 0 ? (
    <p>คุณยังไม่มีแมวในระบบ</p>
  ) : todayUpdates.length === 0 ? (
    <p>ยังไม่มีข้อมูลอัปเดตสำหรับวันนี้</p>
  ) : (
    todayUpdates.map((update) => (
      <div
        key={update.id}
        className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg mb-8 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 items-start transition-all duration-300 hover:shadow-xl"
      >
        {/* ✅ คอลัมน์ซ้าย: ข้อมูล */}
        <div>
          <h3 className="text-xl font-semibold text-black mb-2">
            {update.cat.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 ml-4">
            วันที่ : {update.updateDate}
          </p>
          <p className="text-sm mb-2 ml-4">
            <strong>อารมณ์ :</strong> {update.mood} |{" "}
            <strong>กิจกรรม :</strong> {update.activity}
          </p>

          {update.checklist.length > 0 && (
            <div className="mb-2 ml-4">
              <strong>เช็กลิสต์ :</strong>
              <ul className="list-disc list-inside ml-4">
                {update.checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {update.specialNotes && (
            <p className="text-sm mb-2 ml-4">
              <strong>หมายเหตุ :</strong> {update.specialNotes}
            </p>
          )}

          {update.messageToOwner && (
            <p className="text-sm mb-2 ml-4">
              <strong>ข้อความถึงเจ้าของ :</strong> {update.messageToOwner}
            </p>
          )}
        </div>

        {/* ✅ คอลัมน์ขวา: รูปภาพ */}
        {update.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {update.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={`https://vilapark.app/api${url}`}
                alt={`update-${update.id}-${idx}`}
                className="w-full h-48 object-cover rounded-lg shadow-sm  transition-transform duration-300"
              />
            ))}
          </div>
        )}
      </div>
    ))
  )}
</div>

    </>
  );
}
