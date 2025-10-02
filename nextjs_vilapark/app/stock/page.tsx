"use client";

import { useEffect, useState } from "react";

// ... (ส่วน type Stock และ LOW_STOCK_THRESHOLD เหมือนเดิม) ...
type Stock = {
  id: number;
  category: string;
  name: string;
  quantity: number;
  unit: string;
};

const LOW_STOCK_THRESHOLD = 5;


export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 👈 1. เพิ่ม State สำหรับการโหลด

  const loadStocks = async () => {
    setIsLoading(true); // เริ่มโหลด
    try {
      const res = await fetch("http://localhost:8081/api/stocks");
      if (!res.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const data: Stock[] = await res.json();
      setStocks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // 👈 2. เมื่อโหลดเสร็จ (ไม่ว่าจะสำเร็จหรือล้มเหลว)
    }
  };

  // ... (ฟังก์ชัน updateStock เหมือนเดิม) ...
  const updateStock = async (id: number, action: "increment" | "decrement") => {
    try {
      await fetch(`http://localhost:8081/api/stocks/${id}/${action}`, {
        method: "PUT",
      });
      loadStocks();
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };


  useEffect(() => {
    loadStocks();
  }, []);

  // ... (ส่วนประมวลผลข้อมูล groupedStock, needToOrder, lowStock เหมือนเดิม) ...
  const categories = Array.from(new Set(stocks.map((s) => s.category)));
  const groupedStock = categories.map((cat) => ({
    category: cat,
    items: stocks.filter((s) => s.category === cat),
  }));
  const needToOrder = stocks.filter((s) => s.quantity === 0);
  const lowStock = stocks.filter(
    (s) => s.quantity > 0 && s.quantity <= LOW_STOCK_THRESHOLD
  );

  // 👈 3. เพิ่มเงื่อนไขเพื่อแสดงข้อความขณะโหลด
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">🔄 กำลังโหลดข้อมูลสินค้า...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">📦 เช็กสต็อกสินค้า</h1>
        
        {/* เพิ่มเงื่อนไข: ถ้าไม่มีสินค้าเลย ให้แสดงข้อความ */}
        {stocks.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow p-5 text-center">
                <p className="text-gray-500">ไม่พบข้อมูลสินค้าในสต็อก</p>
            </div>
        )}

        {/* ส่วนแสดงรายการสินค้าในสต็อก (จะแสดงเมื่อมีสินค้า) */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... โค้ด map เหมือนเดิม ... */}
            {groupedStock.map((group) => (
              <div key={group.category} className="bg-white rounded-xl shadow p-5">
                <h2 className="font-bold text-xl mb-4">{group.category}</h2>
                <ul className="space-y-4">
                  {group.items.map((item) => {
                    let statusColor = "text-green-600";
                    let statusText = "เพียงพอ";

                    if (item.quantity === 0) {
                      statusColor = "text-red-600 font-bold";
                      statusText = "ต้องสั่งเพิ่ม";
                    } else if (item.quantity <= LOW_STOCK_THRESHOLD) {
                      statusColor = "text-yellow-600 font-bold";
                      statusText = "ใกล้หมด";
                    }

                    return (
                      <li key={item.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className={`text-sm ${statusColor}`}>
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-semibold ${statusColor}`}>
                            {statusText}
                          </span>
                          <button onClick={() => updateStock(item.id, "decrement")} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">-</button>
                          <button onClick={() => updateStock(item.id, "increment")} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">+</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ส่วนแสดงรายการที่ต้องสั่งซื้อ */}
        {(needToOrder.length > 0 || lowStock.length > 0) && (
            <div className="bg-white rounded-xl shadow p-5 space-y-4">
                <h2 className="font-bold text-xl">🛒 รายการที่ต้องสั่งซื้อ</h2>
                {/* ... โค้ดแสดง needToOrder และ lowStock เหมือนเดิม ... */}
                {needToOrder.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <h3 className="font-bold text-red-800 mb-2">❗ ของที่ต้องสั่งด่วน:</h3>
                    <ul className="list-disc list-inside text-red-700">
                      {needToOrder.map((s) => (<li key={s.id}>{s.name} - เหลือ {s.quantity} {s.unit}</li>))}
                    </ul>
                  </div>
                )}
                {lowStock.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ ของที่ใกล้หมด:</h3>
                    <ul className="list-disc list-inside text-yellow-700">
                      {lowStock.map((s) => (<li key={s.id}>{s.name} - เหลือ {s.quantity} {s.unit}</li>))}
                    </ul>
                  </div>
                )}
            </div>
        )}
    </div>
  );
}
