"use client";
import { useState } from "react";

export default function FromPage() {
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        age: "",
        habit: "",
        note: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8081/cats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("เพิ่มแมวเรียบร้อยแล้ว!");
                setFormData({ name: "", gender: "", age: "", habit: "", note: "" });
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
            <h1 className="text-2xl font-bold mb-6 text-center">เพิ่มข้อมูลแมว</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ชื่อแมว"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                    required
                />
                <input
                    type="text"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder="เพศ"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
                <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="อายุ"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
                <input
                    type="text"
                    name="habit"
                    value={formData.habit}
                    onChange={handleChange}
                    placeholder="พฤติกรรม"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
                <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="หมายเหตุ"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-black"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    บันทึกข้อมูล
                </button>
            </form>
        </div>
    );
}
