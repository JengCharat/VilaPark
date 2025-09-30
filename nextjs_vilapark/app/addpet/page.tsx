"use client";

import { useState } from "react";

type Cat = {
  id?: number;
  name: string;
  gender: string;
  age: number | "";
  habit: string;
  note: string;
  breed: string;
};

export default function Addpet() {
  const [form, setForm] = useState<Cat>({
    name: "",
    gender: "",
    age: "",
    habit: "",
    note: "",
    breed: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/cats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ เพิ่มแมวสำเร็จแล้ว");
        setForm({ name: "", gender: "", age: "", habit: "", note: "", breed: "" });
      } else {
        setMessage("❌ เกิดข้อผิดพลาดในการเพิ่มแมว");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">เพิ่มข้อมูลแมว 🐱</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="ชื่อแมว"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="gender"
          placeholder="เพศ (ผู้/เมีย)"
          value={form.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="age"
          placeholder="อายุ (ปี)"
          value={form.age}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="breed"
          placeholder="สายพันธุ์"
          value={form.breed}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="habit"
          placeholder="นิสัย"
          value={form.habit}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="note"
          placeholder="บันทึกเพิ่มเติม"
          value={form.note}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          บันทึก
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
