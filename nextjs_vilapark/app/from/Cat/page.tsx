"use client";
import { useState } from "react";

export default function CatForm() {
    const [formData, setFormData] = useState({
        name: "",
        breed: "",
        gender: "",
        age: "",
        habit: "",
        note: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8081/cats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("เพิ่มแมวเรียบร้อยแล้ว!");
                setFormData({ name: "", breed: "", gender: "", age: "", habit: "", note: "" });
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg text-black">
            <h1 className="text-3xl font-bold text-center mb-6">📅 ข้อมูลน้องแมว</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">ชื่อน้องแมว</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="เช่น มิวมิว"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">สายพันธุ์</label>
                        <select
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">เลือกสายพันธุ์</option>
                            <option value="แมวไทย">แมวไทย</option>
                            <option value="เปอร์เซีย">เปอร์เซีย</option>
                            <option value="สก็อตติช โฟลด์">สก็อตติช โฟลด์</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">เพศ</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">เลือกเพศ</option>
                            <option value="ผู้">ผู้</option>
                            <option value="เมีย">เมีย</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">อายุ (เดือน)</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="เช่น 6"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">ลักษณะนิสัย</label>
                    <textarea
                        name="habit"
                        value={formData.habit}
                        onChange={handleChange}
                        placeholder="เช่น ชอบเล่น กลัวเสียงดัง"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">ข้อควรระวัง / โรคประจำตัว</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="เช่น แพ้อาหารทะเล ต้องกินยา"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        rows={3}
                    />
                </div>

                <div className="flex justify-between mt-6">
                    <button type="button" className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        ย้อนกลับ
                    </button>
                    <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        ถัดไป
                    </button>
                </div>
            </form>
        </div>
    );
}
