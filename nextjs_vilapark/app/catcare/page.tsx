"use client";

import router from "next/router";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

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
  cat: { id: number };
  staff: { id: number };
  updateDate: string;
  mood: string;
  activity: string;
  specialNotes: string;
  checklist: string[];
  messageToOwner: string;
  imageUrls: string[];
};

type RoleDTO = {
  id: number;
  name: string;
};

export default function Catcare() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [catInfo, setCatInfo] = useState<Cat | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [staffId] = useState<number>(1); // แก้เป็น user id จริง
const router = useRouter();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    breakfast: false,
    dinner: false,
    water: false,
    play: false,
    rest: false,
    toilet: false,
  });

  const [mood, setMood] = useState("ปกติดี");
  const [activity, setActivity] = useState("กระฉับกระเฉง");
  const [note, setNote] = useState("");
  const [messageToOwner, setMessageToOwner] = useState("");
  const [images, setImages] = useState<{ file: File | null; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  

  // โหลด userId จาก localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUserId(userObj.id);
    }
  }, []);

  // โหลด roles ของ user
  useEffect(() => {
    if (!userId) return;

    fetch(`http://64.71.156.99:9090/users/${userId}/roles`)
      .then((res) => res.json())
      .then((data: RoleDTO[]) => {
        setRoles(data);
        const admin = data.some((role) => role.name === "ROLE_ADMIN" || role.name === "ROLE_MANAGER");
        setIsAdmin(admin);

        // ✅ redirect ถ้าไม่ใช่ admin
        if (!admin) {
          router.push("/dashboard");
        }
      })
      .catch(console.error);
  }, [userId, router]);

  // โหลดแมวทั้งหมด
  useEffect(() => {
    fetch("http://64.71.156.99:9090/cats")
      .then((res) => res.json())
      .then((cats: Cat[]) => setCats(cats))
      .catch(console.error);
  }, []);

  // โหลดข้อมูลอัปเดตของแมว
  useEffect(() => {
    if (selectedCatId === null) {
      setShowForm(false);
      setCatInfo(null);
      return;
    }

    const cat = cats.find((c) => c.id === selectedCatId) || null;
    setCatInfo(cat);
    setShowForm(true);

    fetch(`http://64.71.156.99:9090/api/daily-updates/cat/${selectedCatId}`)
      .then((res) => res.json())
      .then((data: DailyUpdate[]) => {
        const today = new Date().toISOString().slice(0, 10);
        const todayUpdate = data.find((u) => u.updateDate === today);

        if (todayUpdate) {
          const checklistObj: Record<string, boolean> = {};
          todayUpdate.checklist.forEach((item) => (checklistObj[item] = true));
          setChecklist(checklistObj);
          setMood(todayUpdate.mood);
          setActivity(todayUpdate.activity);
          setNote(todayUpdate.specialNotes);
          setMessageToOwner(todayUpdate.messageToOwner);
          setImages(todayUpdate.imageUrls.map((url) => ({ file: null, url })));
        } else {
          setChecklist({
            breakfast: false,
            dinner: false,
            water: false,
            play: false,
            rest: false,
            toilet: false,
          });
          setMood("ปกติดี");
          setActivity("กระฉับกระเฉง");
          setNote("");
          setMessageToOwner("");
          setImages([]);
        }
      })
      .catch(console.error);
  }, [selectedCatId, cats]);

  
  const uploadImages = async (): Promise<string[]> => {
  const formData = new FormData();
  images.forEach(img => {
    if (img.file) formData.append("files", img.file);
  });
  if (formData.has("files")) {
    const res = await fetch("http://64.71.156.99:9090/api/daily-updates/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json(); // จะได้ array ของ URLs จริง
  }
  return images.map(img => img.url); // ถ้าไม่มีไฟล์ใหม่ ใช้ URL เดิม
};

  // ฟังก์ชันบันทึก
  // ฟังก์ชันบันทึก
  const handleSave = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!catInfo || !selectedCatId) return;

  try {
    const uploadedUrls = await uploadImages();

    const payload: DailyUpdate = {
      cat: { id: selectedCatId },
      staff: { id: staffId },
      updateDate: new Date().toISOString().slice(0, 10),
      mood,
      activity,
      specialNotes: note,
      checklist: Object.entries(checklist)
        .filter(([_, v]) => v)
        .map(([k]) => k),
      messageToOwner,
      imageUrls: uploadedUrls,
    };

    const res = await fetch("http://64.71.156.99:9090/api/daily-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Error Response:", res.status, errorBody);
      alert(`❌ Error ${res.status}: ${errorBody}`);
      return;
    }

    const data = await res.json();
    console.log("✅ Saved:", data);
    alert("บันทึกเรียบร้อย!");
  } catch (err: any) {
    console.error("Exception:", err);
    alert("เกิดข้อผิดพลาด: " + (err.message || JSON.stringify(err)));
  }
};

  

  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">ดูแลและอัปเดตข้อมูลแมว</h2>
      <form onSubmit={handleSave}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* เลือกแมว */}
          <div className="mb-6">
            <label className="block text-l font-medium mb-2">
              เลือกแมวที่ต้องการอัปเดต
            </label>
            <select
              className="w-full p-3 border rounded-lg"
              value={selectedCatId ?? ""}
              onChange={(e) => setSelectedCatId(Number(e.target.value))}
            >
              <option value="">เลือกแมว...</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.room}
                </option>
              ))}
            </select>
          </div>

          {/* ฟอร์มอัปเดต */}
          {showForm && catInfo && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* ข้อมูลแมว */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ข้อมูลแมว</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4">
                      🐱
                    </div>
                    <div>
                      <h4 className="font-semibold text-xl">{catInfo.name}</h4>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <h4 className="font-semibold mb-3">เช็กลิสต์ประจำวัน</h4>
                <div className="space-y-2 mb-4">
                  {Object.entries(checklist).map(([key, val]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={val}
                        onChange={() =>
                          setChecklist((prev) => ({ ...prev, [key]: !val }))
                        }
                      />
                      {key === "breakfast"
                        ? "กินอาหารเช้า"
                        : key === "dinner"
                        ? "กินอาหารเย็น"
                        : key === "water"
                        ? "ดื่มน้ำ"
                        : key === "play"
                        ? "เล่นของเล่น"
                        : key === "rest"
                        ? "นอนหลับพักผ่อน"
                        : "ใช้ห้องน้ำ"}
                    </label>
                  ))}
                </div>
              </div>

              {/* อัปเดตประจำวัน */}
              <div>
                <h3 className="text-lg font-semibold mb-4">อัปเดตประจำวัน</h3>

                {/* อัปโหลดรูปภาพ */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">อัปโหลดรูปภาพ</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">
                      คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวาง
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const previews = files.map((f) => ({
                          file: f,
                          url: URL.createObjectURL(f),
                        }));
                        setImages((prev) => [...prev, ...previews]);
                      }}
                    />
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        เลือกรูป
                      </button>
                    </div>
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {images.map((im, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={im.url}
                              alt={`preview-${idx}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setImages((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ข้อความสำหรับเจ้าของ */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ข้อความสำหรับเจ้าของ
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows={4}
                    value={messageToOwner}
                    onChange={(e) => setMessageToOwner(e.target.value)}
                    placeholder="เช่น มิวมิวสนุกกับของเล่นใหม่มาก..."
                  />
                </div>

                {/* สุขภาพและพฤติกรรม */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">อารมณ์</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    >
                      <option>ปกติดี</option>
                      <option>ง่วงนอน</option>
                      <option> ร่าเริง</option>
                      <option>เศร้า</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">กิจกรรม</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    >
                      <option>กระฉับกระเฉง</option>
                      <option>นอนเยอะ</option>
                      <option>ชอบเล่น</option>
                      <option>กินเก่ง</option>
                    </select>
                  </div>
                </div>

                {/* หมายเหตุพิเศษ */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">หมายเหตุพิเศษ</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ข้อสังเกตพิเศษ หรือสิ่งที่ต้องแจ้งเจ้าของ..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#225EC4] hover:bg-[#063d8c] text-white py-3 rounded-lg font-semibold"
                >
                  บันทึกอัปเดต
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
    </>
  );
}
