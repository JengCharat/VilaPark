"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

/* ===== API base ===== */
const API = "http://localhost:8081"; // ถ้าตั้ง proxy ไว้ ใช้เป็น "/api" ได้

/* ===== fetch helper (คืนข้อมูลที่ parse แล้ว) ===== */
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} @ ${url} :: ${text.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  } catch (e) {
    console.error("Fetch failed:", url, e);
    throw e;
  }
}

/* ===== Types (ตาม controller ของคุณ) ===== */
interface BookingUIResponse {
  id: number;
  roomId: number;
  catId: string;
  checkinDate: string | null;
  checkoutDate: string | null;
  status: string | null;
  createdAt: string | null;
}
interface BookingRow {
  id: number;
  userId: number;
  roomId: number;
  catId: number;
  checkinDate: string;
  checkoutDate: string;
  status: string;
  createdAt?: string;
}
interface CatRow { id: number; name: string }
interface RoomRow { id: number; price: number; roomNumber: string; status?: string; type?: string }
interface UserDTO { id: number; name?: string; lastname?: string; phonenumber?: string }

type PaymentMethod = "cash" | "transfer" | "credit";
type Charge = { label: string; amount: number };

/* ===== utils ===== */
function todayLocalYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const fmtBaht = (n: number) => `฿${n.toLocaleString("th-TH")}`;
const nightsBetween = (d1: string, d2: string) => {
  const a = new Date(d1);
  const b = new Date(d2);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff || 1);
};

/* ===== page ===== */
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const queryBookingId = searchParams.get("bookingId");

  const [candidates, setCandidates] = useState<BookingUIResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");

  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [cat, setCat] = useState<CatRow | null>(null);
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [catNameMap, setCatNameMap] = useState<Record<string, string>>({});
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  /* 1) โหลดรายการที่จะ check-out วันนี้ (+ fallback) */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ชั้น 1: today จาก BE (คิดวัน Asia/Bangkok แล้ว)
        let list = await fetchJSON<BookingUIResponse[]>(`${API}/bookings/today`);

        // ชั้น 2: fallback -> /bookings/ui แล้วกรอง <= วันนี้ (local)
        if (!list || list.length === 0) {
          const ui = await fetchJSON<BookingUIResponse[]>(`${API}/bookings/ui`);
          const today = todayLocalYMD();
          list = ui.filter((x) => x.checkoutDate && x.checkoutDate <= today);
        }

        setCandidates(list);

        // โหลดชื่อแมวทั้งหมดครั้งเดียว ทำ map id->name
        try {
        const cats = await fetchJSON<CatRow[]>(`${API}/cats`);
        const map: Record<string, string> = {};
        cats.forEach((c) => (map[String(c.id)] = c.name));
        setCatNameMap(map);
        } catch {
        setCatNameMap({});
        }
        if (queryBookingId) setSelectedId(Number(queryBookingId));
        else setSelectedId(list.length ? list[0].id : "");
      } catch (e: any) {
        setError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    })();
  }, [queryBookingId]);

  /* 2) เมื่อเลือก id → โหลดรายละเอียดจากหลายตาราง */
  useEffect(() => {
    if (!selectedId) {
      setBooking(null); setCat(null); setRoom(null); setUser(null);
      return;
    }
    (async () => {
      try {
        setLoadingDetail(true);
        setError(null);

        const bData = await fetchJSON<BookingRow>(`${API}/bookings/${selectedId}`);
        setBooking(bData);

        // user
        try {
          const uData = await fetchJSON<UserDTO>(`${API}/users/${bData.userId}`);
          setUser(uData);
        } catch { setUser(null); }

        // cat (ลอง /cats/{id} → ถ้าไม่มี fallback /cats)
        let c: CatRow | null = null;
        try {
          c = await fetchJSON<CatRow>(`${API}/cats/${bData.catId}`);
        } catch {
          const cats = await fetchJSON<CatRow[]>(`${API}/cats`);
          c = cats.find((x) => Number(x.id) === Number(bData.catId)) || null;
        }
        setCat(c);

        // room (ลอง /rooms/{id} → ถ้าไม่มี fallback /rooms)
        let r: RoomRow | null = null;
        try {
          r = await fetchJSON<RoomRow>(`${API}/rooms/${bData.roomId}`);
        } catch {
          const rooms = await fetchJSON<RoomRow[]>(`${API}/rooms`);
          r = rooms.find((x) => Number(x.id) === Number(bData.roomId)) || null;
        }
        setRoom(r);
      } catch (e: any) {
        setError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [selectedId]);

  useEffect(() => {
  if (booking && cat?.name) {
    // map id -> name
    setCatNameMap(prev => ({
      ...prev,
      [String(booking.catId)]: cat.name,
    }));
  }
}, [booking, cat]);

// 4. ถ้า candidates ของรายการที่เลือก catId เป็น "-" ให้แทนที่ด้วย catId จริงจาก booking
useEffect(() => {
  if (!booking) return;
  setCandidates(prev =>
    prev.map(c =>
      c.id === booking.id && (c.catId === "-" || !c.catId)
        ? { ...c, catId: String(booking.catId) }
        : c
    )
  );
}, [booking]);

  /* 3) charges */
  const charges: Charge[] = useMemo(() => {
    if (!booking || !room) return [];
    const nights = nightsBetween(booking.checkinDate, booking.checkoutDate);
    const roomCharge = (room.price || 0) * nights;
    return [
      { label: `${room.type || "Room"} ห้อง ${room.roomNumber} (${nights} คืน)`, amount: roomCharge },
      { label: "ค่าภาษีห้องพัก", amount: 150 },
      { label: "ค่าบริการดูแลพิเศษ", amount: 300 },
    ];
  }, [booking, room]);

  const total = useMemo(() => charges.reduce((s, c) => s + c.amount, 0), [charges]);

  /* 4) confirm checkout */
  const onConfirmCheckout = async () => {
    if (!selectedId) return;
    if (!paymentMethod) { setActionMsg("กรุณาเลือกวิธีการชำระเงินก่อน"); return; }
    try {
      setActionMsg(null);
      const res = await fetch(`${API}/bookings/${selectedId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      if (!res.ok) throw new Error(await res.text());
      setActionMsg("✅ ดำเนินการ Check-out สำเร็จ");
    } catch (e: any) {
      setActionMsg(`❌ ${e.message || "ยืนยันการชำระเงินไม่สำเร็จ"}`);
    }
  };

  /* ===== UI ===== */
  if (loading) {
    return (<><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-center">กำลังโหลดข้อมูล...</div></>);
  }
  if (error) {
    return (<><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div></>);
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span>💰</span> คิดเงิน / Check-out
          </h1>
        </div>

        <main className="max-w-4xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            {/* เลือก booking */}
            <div className="p-5 border-b">
              <label className="block text-sm text-gray-600 mb-2">เลือกลูกค้าที่ต้องการ Check-out</label>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  {candidates.length === 0 ? (
                    <option value="">— ไม่มีรายการที่ต้อง Check-out วันนี้ —</option>
                ) : (
                    candidates.map((c) => {
                    const name =
                        c.catId && c.catId !== "-"
                        ? (catNameMap[c.catId] ?? `แมว #${c.catId}`)
                        : "ไม่ระบุแมว";
                    return (
                        <option key={c.id} value={c.id}>
                        {name} – ห้อง {c.roomId}
                        </option>
                    );
                    })
                )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ข้อมูลลูกค้า */}
              <section className="border rounded-md">
                <div className="px-4 py-3 border-b font-semibold text-gray-800">ข้อมูลลูกค้า</div>
                <div className="p-4">
                  {loadingDetail ? (
                    <div className="text-sm text-gray-500">กำลังโหลดรายละเอียด…</div>
                  ) : booking && room ? (
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center text-2xl">🐱</div>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">{cat?.name || `แมว #${booking.catId}`}</div>
                        <div className="text-gray-500">{room.type || "Room"} — ห้อง {room.roomNumber}</div>

                        <dl className="mt-3 space-y-1 text-gray-600">
                          <div className="flex gap-2">
                            <dt className="w-20 text-gray-500">เช็คอิน:</dt>
                            <dd className="flex-1">{booking.checkinDate}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 text-gray-500">เช็คเอาต์:</dt>
                            <dd className="flex-1">{booking.checkoutDate}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 text-gray-500">ผู้ปกครอง:</dt>
                            <dd className="flex-1">{(user?.name || "") + (user?.lastname ? ` ${user.lastname}` : "") || "-"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 text-gray-500">เบอร์โทร:</dt>
                            <dd className="flex-1">{user?.phonenumber || "-"}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">ไม่มีรายการ</div>
                  )}
                </div>
              </section>

              {/* รายการคิดเงิน */}
              <section className="border rounded-md">
                <div className="px-4 py-3 border-b font-semibold text-gray-800">รายการคิดเงิน</div>
                <div className="p-4">
                  {loadingDetail ? (
                    <div className="text-sm text-gray-500">กำลังโหลดรายการคิดเงิน…</div>
                  ) : (
                    <>
                      <ul className="divide-y text-sm">
                        {charges.map((c, idx) => (
                          <li key={idx} className="py-2 flex items-center justify-between">
                            <span className="text-gray-700">{c.label}</span>
                            <span className="font-semibold text-gray-800">{fmtBaht(c.amount)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 border-t pt-3 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">รวมทั้งสิ้น</span>
                        <span className="font-extrabold text-emerald-600">{fmtBaht(total)}</span>
                      </div>

                      <div className="mt-5">
                        <div className="font-semibold text-gray-800 mb-2">วิธีการชำระเงิน</div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="payment" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                            เงินสด
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="payment" checked={paymentMethod === "transfer"} onChange={() => setPaymentMethod("transfer")} />
                            โอนเงิน
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="payment" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} />
                            บัตรเครดิต
                          </label>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <button type="button" onClick={() => window.print()} className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2">
                          🖨 พิมพ์ใบเสร็จ
                        </button>
                        <button type="button" onClick={onConfirmCheckout} disabled={!selectedId || !paymentMethod} className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium px-4 py-2">
                          ✅ ยืนยันการชำระเงินและ Check-out
                        </button>
                        {actionMsg && <p className="text-sm text-center text-gray-700">{actionMsg}</p>}
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
