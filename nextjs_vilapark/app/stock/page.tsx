"use client";

import { useEffect, useState } from "react";

type Stock = {
  id: number;
  category: string;
  name: string;
  quantity: number;
  unit: string;
};

const LOW_STOCK_THRESHOLD = 5;

export default function Stock() {   
  const [stocks, setStocks] = useState<Stock[]>([]);

  const loadStocks = async () => {
    const res = await fetch("http://localhost:8081/api/stocks"); 
    const data: Stock[] = await res.json();
    setStocks(data);
  };

  const updateStock = async (id: number, action: "increment" | "decrement") => {
    await fetch(`http://localhost:8081/api/stocks/${id}/${action}`, {
      method: "PUT",
    });
    loadStocks();
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const categories = Array.from(new Set(stocks.map((s) => s.category)));
  const grouped = categories.map((cat) => ({
    category: cat,
    items: stocks.filter((s) => s.category === cat),
  }));

  const needOrder = stocks.filter((s) => s.quantity === 0);
  const almostEmpty = stocks.filter(
    (s) => s.quantity > 0 && s.quantity <= LOW_STOCK_THRESHOLD
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">📦 เช็กสต็อกสินค้า</h1>

      {/* แสดงสินค้า */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grouped.map((group, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-xl mb-4">{group.category}</h2>
            <ul className="space-y-3">
              {group.items.map((item) => {
                let statusColor = "text-green-600";
                let statusText = "เพียงพอ";

                if (item.quantity === 0) {
                  statusColor = "text-red-600";
                  statusText = "ต้องสั่งเพิ่ม";
                } else if (item.quantity <= LOW_STOCK_THRESHOLD) {
                  statusColor = "text-yellow-600";
                  statusText = "ใกล้หมด";
                }

                return (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-semibold ${statusColor}`}>
                        {statusText}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateStock(item.id, "decrement")}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStock(item.id, "increment")}
                          className="px-2 py-1 bg-green-500 text-white rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* แสดงแจ้งเตือน */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-bold text-xl mb-2">🛒 รายการที่ต้องสั่งซื้อ</h2>

        {needOrder.length === 0 && almostEmpty.length === 0 && (
          <div className="text-gray-500">ยังไม่มีรายการที่ต้องสั่งซื้อ</div>
        )}

        {needOrder.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <h3 className="font-bold text-red-700 mb-1">❗ ของที่ต้องสั่งด่วน:</h3>
            <ul className="list-disc list-inside text-red-700">
              {needOrder.map((s) => (
                <li key={s.id}>
                  {s.name} – เหลือ {s.quantity} {s.unit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {almostEmpty.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
            <h3 className="font-bold text-yellow-700 mb-1">⚠ ของที่ใกล้หมด:</h3>
            <ul className="list-disc list-inside text-yellow-700">
              {almostEmpty.map((s) => (
                <li key={s.id}>
                  {s.name} – เหลือ {s.quantity} {s.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ✅ เพิ่มสรุปจำนวนรวม (ใหม่) */}
      {(needOrder.length > 0 || almostEmpty.length > 0) && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <h3 className="font-semibold text-lg mb-2">📊 สรุปการสั่งซื้อ</h3>
          <p className="text-sm text-gray-700">
            ต้องสั่งด่วน: <span className="font-bold text-red-600">{needOrder.length}</span> รายการ ·
            ใกล้หมด: <span className="font-bold text-yellow-600">{almostEmpty.length}</span> รายการ
          </p>
        </div>
      )}
    </div>
  );
}
