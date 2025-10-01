"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    fetch(`http://localhost:8081/cats/owner/${user.id}`)
      .then((res) => res.json())
      .then((myCats: Cat[]) => {
        setCats(myCats);

        if (myCats.length === 0) return;

        const today = new Date().toISOString().slice(0, 10);

        Promise.all(
          myCats.map((cat) =>
            fetch(`http://localhost:8081/api/daily-updates/cat/${cat.id}`)
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">🐱 ข้อมูลอัปเดตวันนี้</h2>

      {cats.length === 0 ? (
        <p>คุณยังไม่มีแมวในระบบ</p>
      ) : todayUpdates.length === 0 ? (
        <p>ยังไม่มีข้อมูลอัปเดตสำหรับวันนี้</p>
      ) : (
        todayUpdates.map((update) => (
          <div key={update.id} className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-2">{update.cat.name}</h3>
            <p className="text-sm text-gray-600 mb-2">วันที่: {update.updateDate}</p>
            <p className="text-sm mb-2">
              <strong>อารมณ์:</strong> {update.mood} | <strong>กิจกรรม:</strong>{" "}
              {update.activity}
            </p>

            {/* Checklist */}
            {update.checklist.length > 0 && (
              <div className="mb-2">
                <strong>✅ เช็กลิสต์:</strong>
                <ul className="list-disc list-inside">
                  {update.checklist.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* หมายเหตุ */}
            {update.specialNotes && (
              <p className="text-sm mb-2">
                <strong>หมายเหตุ:</strong> {update.specialNotes}
              </p>
            )}

            {/* ข้อความถึงเจ้าของ */}
            {update.messageToOwner && (
              <p className="text-sm mb-2">
                <strong>ข้อความถึงเจ้าของ:</strong> {update.messageToOwner}
              </p>
            )}

            {/* รูปภาพ */}
            {update.imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {update.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`update-${update.id}-${idx}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
