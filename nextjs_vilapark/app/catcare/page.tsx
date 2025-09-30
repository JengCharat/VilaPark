"use client";
import { useEffect, useRef, useState } from "react";

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
  cat: { id: number }; // ต้องมี id ของแมว
  updateDate: string; // "yyyy-MM-dd"
  mood: string;
  activity: string;
  specialNotes: string;
  checklist: string[];
  messageToOwner: string;
  imageUrls: string[];
};

export default function Catcare() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [catInfo, setCatInfo] = useState<Cat | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    breakfast: false,
    dinner: false,
    water: false,
    play: false,
    rest: false,
    toilet: false,
  });

  const [mood, setMood] = useState("😊 ปกติดี");
  const [activity, setActivity] = useState("🏃 กระฉับกระเฉง");
  const [note, setNote] = useState("");
  const [messageToOwner, setMessageToOwner] = useState("");
  const [images, setImages] = useState<{ file?: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // บันทึก daily update
  const handleSave = async () => {
    if (!catInfo) return;

    const payload = {
      cat: { id: selectedCatId },
      updateDate: new Date().toISOString().slice(0, 10),
      mood,
      activity,
      specialNotes: note,
      checklist: Object.entries(checklist)
        .filter(([_, v]) => v)
        .map(([k]) => k),
      messageToOwner,
      imageUrls: images.map((img) => img.url),
    };

    try {
      const res = await fetch("http://localhost:8081/api/daily-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("บันทึกเรียบร้อย!");
      } else {
        console.log(payload);
        alert("เกิดข้อผิดพลาด!");
      }
    } catch (err) {
      console.error(err);
      console.log(payload);
      alert("เกิดข้อผิดพลาด!");
    }
  };

  // ดึงข้อมูลแมวจาก backend
  useEffect(() => {
    fetch("http://localhost:8081/cats")
      .then((res) => res.json())
      .then((data: Cat[]) => setCats(data))
      .catch((err) => console.error(err));
  }, []);

  // ดึง daily update ของแมวที่เลือก
  useEffect(() => {
    if (selectedCatId === null) {
      setShowForm(false);
      setCatInfo(null);
      return;
    }

    const cat = cats.find((c) => c.id === selectedCatId) || null;
    setCatInfo(cat);
    setShowForm(true);

    fetch(`http://localhost:8081/api/daily-updates/cat/${selectedCatId}`)
      .then((res) => res.json())
      .then((data: DailyUpdate[]) => {
        const today = new Date().toISOString().slice(0, 10);
        const todayUpdate = data.find((u) => u.updateDate === today);

        if (todayUpdate) {
          setChecklist(
            Object.fromEntries(
              ["breakfast", "dinner", "water", "play", "rest", "toilet"].map(
                (key) => [key, todayUpdate.checklist.includes(key)]
              )
            )
          );
          setMood(todayUpdate.mood);
          setActivity(todayUpdate.activity);
          setNote(todayUpdate.specialNotes);
          setMessageToOwner(todayUpdate.messageToOwner);
          setImages(todayUpdate.imageUrls.map((url) => ({ url })));
        } else {
          // reset
          setChecklist({
            breakfast: false,
            dinner: false,
            water: false,
            play: false,
            rest: false,
            toilet: false,
          });
          setMood("😊 ปกติดี");
          setActivity("🏃 กระฉับกระเฉง");
          setNote("");
          setMessageToOwner("");
          setImages([]);
        }
        setShowForm(true);
      })
      .catch((err) => console.error(err));
  }, [selectedCatId, cats]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">🐱 ดูแลและอัปเดตข้อมูลแมว</h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
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
                    <h4 className="font-semibold">{catInfo.name}</h4>
                    <p className="text-sm text-gray-600">{catInfo.details}</p>
                    <p className="text-sm text-gray-600">{catInfo.room}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p>
                    <strong>เจ้าของ:</strong> {catInfo.owner}
                  </p>
                  <p>
                    <strong>เบอร์โทร:</strong> {catInfo.phone}
                  </p>
                </div>
              </div>

              {/* เช็กลิสต์ */}
              <h4 className="font-semibold mb-3">✅ เช็กลิสต์ประจำวัน</h4>
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
                <label className="block text-sm font-medium mb-2">
                  อัปโหลดรูปภาพ
                </label>
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
                            onClick={() =>
                              setImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  สุขภาพและพฤติกรรม
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      อารมณ์
                    </label>
                    <select
                      className="w-full p-2 border rounded"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    >
                      <option>😊 ปกติดี</option>
                      <option>😴 ง่วงนอน</option>
                      <option>😸 ร่าเริง</option>
                      <option>😿 เศร้า</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      กิจกรรม
                    </label>
                    <select
                      className="w-full p-2 border rounded"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    >
                      <option>🏃 กระฉับกระเฉง</option>
                      <option>😴 นอนเยอะ</option>
                      <option>🎾 ชอบเล่น</option>
                      <option>🍽️ กินเก่ง</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* หมายเหตุพิเศษ */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  หมายเหตุพิเศษ
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ข้อสังเกตพิเศษ หรือสิ่งที่ต้องแจ้งเจ้าของ..."
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold"
              >
                💾 บันทึกอัปเดต
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
