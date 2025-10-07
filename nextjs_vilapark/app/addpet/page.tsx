"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import "../globals.css";

type Cat = {
  name: string;
  gender: string;
  age: number | "";
  habit: string;
  note: string;
  breed: string;
  ownerId?: number;
};

type User = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

export default function AddPetPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Cat>({
    name: "",
    gender: "",
    age: "",
    habit: "",
    note: "",
    breed: "",
  });
  const [customBreed, setCustomBreed] = useState(false);
  const [message, setMessage] = useState("");

  const genders = ["ผู้", "เมีย"];
  const breeds = [
    "เปอร์เซีย",
    "สยาม",
    "อเมริกันช็อตแฮร์",
    "เมนคูน",
    "เบงกอล",
    "รัสเซียนบลู",
    "สก็อตติชโฟลด์",
    "โซมาลี",
    "บอมเบย์",
    "อเมริกันเคิร์ล",
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setForm((prev) => ({ ...prev, ownerId: parsedUser.id }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? "" : Number(value)) : value,
    }));

    if (name === "breed" && value === "อื่นๆ") {
      setCustomBreed(true);
      setForm((prev) => ({ ...prev, breed: "" }));
    } else if (name === "breed") {
      setCustomBreed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8081/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ เพิ่มแมวสำเร็จแล้ว");

        // ✅ เปลี่ยนให้ไปหน้า /form
        setTimeout(() => {
          router.push("/form");
        }, 500);
      } else {
        setMessage("❌ เกิดข้อผิดพลาดในการเพิ่มแมว");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen py-10 text-black">
        <h2 className="text-3xl font-bold  text-center">เพิ่มข้อมูลแมว </h2>
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ชื่อแมว */}
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อแมว</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="กรอกชื่อแมว"
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {/* เพศ */}
            <div>
              <label className="block text-sm font-medium mb-1">เพศ</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">-- เลือกเพศ --</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* อายุ */}
            <div>
              <label className="block text-sm font-medium mb-1">อายุ (ปี)</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="กรอกอายุเป็นตัวเลข"
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* สายพันธุ์ */}
            <div>
              <label className="block text-sm font-medium mb-1">สายพันธุ์</label>
              {customBreed ? (
                <input
                  type="text"
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  placeholder="กรอกสายพันธุ์"
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              ) : (
                <select
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">-- เลือกสายพันธุ์ --</option>
                  {breeds.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              )}
            </div>

            {/* นิสัย */}
            <div>
              <label className="block text-sm font-medium mb-1">นิสัย</label>
              <input
                type="text"
                name="habit"
                value={form.habit}
                onChange={handleChange}
                placeholder="เช่น ขี้เล่น, ขี้อ้อน"
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* บันทึกเพิ่มเติม */}
            <div>
              <label className="block text-sm font-medium mb-1">บันทึกเพิ่มเติม</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="เช่น สุขภาพ, อาหารที่ชอบ"
                className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4691D3] hover:bg-blue-500 text-white p-3 rounded-md "
            >
              บันทึก
            </button>
          </form>

          {message && <p className="mt-4 text-center">{message}</p>}
        </div>
      </div>
    </>
  );
}
