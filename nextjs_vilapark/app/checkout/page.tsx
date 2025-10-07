"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ===== เพิ่มสำหรับ PDF ===== */
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

/* ========= PDF helpers ========= */
// ฝังฟอนต์ไทยเพื่อให้แสดงภาษาไทยถูกต้อง
// ------- helper: โหลดฟอนต์ไทยให้ jsPDF แค่ครั้งเดียว -------
// วางไว้บนสุดของไฟล์ (นอก component) แล้วมีแค่ตัวเดียวเท่านั้น
// ---- Thai font loader (keep exactly ONE copy in this file) ----
// ===== Thai font loader (ONE copy only) =====
let _thaiFontLoaded = false;

async function fileUrlToBase64Body(url: string): Promise<string> {
  // ดึงไฟล์ แล้วแปลงเป็น dataURL ด้วย FileReader (ไม่กิน stack)
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Load font failed: ${url}`);

  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result: "data:font/ttf;base64,AAAA..."
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]); // เอาเฉพาะส่วน base64 หลัง comma
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// มีเพียงหนึ่งตัวในไฟล์เท่านั้น!
async function ensureThaiFont(doc: any) {
  if ((doc as any).__thaiFontLoaded) return;

  const res1 = await fetch("/fonts/THSarabunNew.ttf");
  const b64_Regular = await blobToBase64(res1);

  doc.addFileToVFS("THSarabunNew.ttf", b64_Regular);
  // 👇 ใส่ Identity-H ตรงนี้ สำคัญมาก
  (doc as any).addFont("THSarabunNew.ttf", "Sarabun", "normal", "Identity-H");

  // ถ้ามีไฟล์ Bold ก็ฝังด้วย (ไม่มีก็ข้ามได้)
  try {
    const res2 = await fetch("/fonts/THSarabunNew-Bold.ttf");
    const b64_Bold = await blobToBase64(res2);
    doc.addFileToVFS("THSarabunNew-Bold.ttf", b64_Bold);
    (doc as any).addFont("THSarabunNew-Bold.ttf", "Sarabun", "bold", "Identity-H");
  } catch {
    /* ignore */
  }

  doc.setFont("Sarabun", "normal");
  (doc as any).__thaiFontLoaded = true;
}

function blobToBase64(res: Response): Promise<string> {
  return res.blob().then(blob => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  }));
}





const bahtCurrency = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

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
interface UserDTO { id: number; name?: string; lastname?: string; phonenumber?: string; email?: string; address?: string }

type PaymentMethod = "cash" | "transfer" | "credit";
type Charge = { label: string; amount: number };

/* ===== API base ===== */
const API = "http://localhost:8081";

/* ===== fetch helper ===== */
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

/* ========= สร้าง PDF ใบเสร็จ ========= */
// === jsPDF helpers (client only) ===
async function fileToBase64(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Load font failed: ${url}`);
  const buf = await res.arrayBuffer();
  // to base64
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}



// === ปุ่มสร้าง PDF ใบเสร็จ ===
// ---------- PDF generator (เวอร์ชันแก้) ----------
export async function generateReceiptPDF(opts: {
  bookingId: number;
  catName: string;
  roomLabel: string;
  checkin: string;
  checkout: string;
  guardian: string;
  phone?: string;
  rows: { label: string; qty: number; unit: number; amount: number }[];
  total: number;
}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // สำคัญมาก: ต้องโหลดฟอนต์ก่อนเขียนตัวอักษรใด ๆ
  await ensureThaiFont(doc);
  doc.setFont("Sarabun", "normal");

  // Header bar
  doc.setFillColor(28, 63, 148);
  doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("ใบเสร็จรับเงิน", 14, 17);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  // Left block (From)
  let y = 36;
  doc.setFont("Sarabun", "bold");
  doc.text("จาก (From):", 14, y);
  doc.setFont("Sarabun", "normal");
  doc.text(["VilaPark Cat Hotel", "Phone: 02-000-0000", "Email: hello@vilapark.test"], 14, y + 6);

  // Right block (Receipt info)
  doc.setFont("Sarabun", "bold");
  doc.text("ข้อมูลใบเสร็จ (Receipt):", 120, y);
  doc.setFont("Sarabun", "normal");
  const rightLines = [
    `เลขที่ใบเสร็จ: R-${opts.bookingId}`,
    `วันที่ออกเอกสาร: ${new Date().toLocaleDateString("th-TH")}`,
    `รหัสลูกค้า: B-${opts.bookingId}`,
  ];
  rightLines.forEach((t, i) => doc.text(t, 120, y + 6 + i * 5));

  // Customer block
  y += 30;
  doc.setFont("Sarabun", "bold");
  doc.text("ข้อมูลผู้เข้าพัก:", 14, y);
  doc.setFont("Sarabun", "normal");
  y += 6;
  doc.text(
    [
      `แมว: ${opts.catName || "-"}`,
      `ห้อง: ${opts.roomLabel}`,
      `เช็คอิน: ${opts.checkin}`,
      `เช็คเอาต์: ${opts.checkout}`,
      `ผู้ปกครอง: ${opts.guardian || "-"}`,
      `เบอร์โทร: ${opts.phone || "-"}`,
    ],
    14,
    y
  );

  // Table
  const startY = y + 26;
  const head = [["รายการ (Description)", "จำนวน (Qty)", "ราคา/หน่วย (Unit)", "จำนวนเงิน (Amount)"]];
  const body = opts.rows.map((r) => [
    r.label,
    String(r.qty),
    r.unit.toLocaleString("th-TH"),
    r.amount.toLocaleString("th-TH"),
  ]);

  autoTable(doc, {
    startY,
    head,
    body,
     styles: { font: "Sarabun", fontStyle: "normal", fontSize: 11 },
     headStyles: { font: "Sarabun", fontStyle: "bold", fillColor: [28,63,148], textColor: 255 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY ?? startY;
  const endY = finalY + 6;

  doc.setFont("Sarabun", "bold");
  doc.text("รวมทั้งสิ้น (Total):", 130, endY);
  doc.setFont("Sarabun", "normal");
  doc.text(opts.total.toLocaleString("th-TH") + " บาท", 196, endY, { align: "right" });

  // Footer notes
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("หมายเหตุ: ขอบคุณที่ใช้บริการ VilaPark  :)", 14, 285);

  doc.save(`receipt_${opts.bookingId}.pdf`);
}


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

        // ชั้น 1: today จาก BE
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

        try {
          const uData = await fetchJSON<UserDTO>(`${API}/users/${bData.userId}`);
          setUser(uData);
        } catch { setUser(null); }

        let c: CatRow | null = null;
        try {
          c = await fetchJSON<CatRow>(`${API}/cats/${bData.catId}`);
        } catch {
          const cats = await fetchJSON<CatRow[]>(`${API}/cats`);
          c = cats.find((x) => Number(x.id) === Number(bData.catId)) || null;
        }
        setCat(c);

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

  // พัก map ชื่อแมว
  useEffect(() => {
    if (booking && cat?.name) {
      setCatNameMap(prev => ({ ...prev, [String(booking.catId)]: cat.name }));
    }
  }, [booking, cat]);

  // อัปเดต candidates ให้ catId ถูกต้อง (ถ้าเคยเป็น "-")
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
  // ถ้ายังไม่ได้ import ให้ใส่ด้านบนของไฟล์
// import Swal from "sweetalert2";

const onConfirmCheckout = async () => {
  if (!selectedId) return;
  if (!paymentMethod) {
    setActionMsg("กรุณาเลือกวิธีการชำระเงินก่อน");
    return;
  }

  try {
    setActionMsg(null);

    // 1) ยืนยัน Check-out
    const res1 = await fetch(`${API}/bookings/${selectedId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod }),
    });
    const t1 = await res1.text();
    if (!res1.ok) throw new Error(t1 || "Checkout failed");

    // 2) บันทึกรายได้ (ใช้ endpoint ที่รองรับจริง)
    const res2 = await fetch(`${API}/income/from-booking/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(total),       // ยอดที่ลูกค้าจ่าย
        paymentMethod,               // "cash" | "transfer" | "credit"
      }),
    });
    const t2 = await res2.text();
    if (!res2.ok) throw new Error(t2 || "บันทึกรายได้ไม่สำเร็จ");

    // 3) ป็อปอัปสำเร็จ
    await Swal.fire({
      icon: "success",
      title: "Check-out สำเร็จ",
      text: "บันทึกรายได้เรียบร้อย",
      confirmButtonText: "OK",
      confirmButtonColor: "#22c55e",
    });

    setActionMsg("✅ ดำเนินการ Check-out และบันทึกรายได้สำเร็จ");
  } catch (e: any) {
    let msg = e?.message || "เกิดข้อผิดพลาด";
    try {
      const j = JSON.parse(msg);
      msg = j.message || j.error || msg;
    } catch {}
    setActionMsg(`❌ ${msg}`);

    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: msg,
      confirmButtonText: "OK",
    });
  }
};



  // ชื่อผู้ปกครอง (กันซ้ำ)
  const displayGuardian = (() => {
    const first = (user?.name ?? '').trim();
    const last  = (user?.lastname ?? '').trim();
    if (!first && !last) return '-';
    if (!last) return first;
    if (!first) return last;
    const f = first.replace(/\s+/g, ' ').trim();
    const l = last.replace(/\s+/g, ' ').trim();
    if (f === l || f.includes(l)) return f;
    if (l.includes(f)) return l;
    return `${f} ${l}`;
  })();

  /* ===== UI ===== */
  if (loading) return (<><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-center">กำลังโหลดข้อมูล...</div></>);
  if (error)   return (<><Navbar /><div className="max-w-4xl mx-auto px-6 py-10 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div></>);

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
             คิดเงิน / Check-out
          </h1>
        </div>

        <main className="max-w-4xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            {/* เลือก booking */}
            <div className="p-5">
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
                      const name = c.catId && c.catId !== "-" ? (catNameMap[c.catId] ?? `แมว #${c.catId}`) : "ไม่ระบุแมว";
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
                            <dd className="flex-1">{displayGuardian}</dd>
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
                    <button
                        type="button"
                        onClick={async () => {
                            if (!booking || !room) return;

                            // เตรียม rows จาก charges ที่คุณคำนวณไว้
                            const rows = charges.map(c => ({
                            label: c.label,
                            qty: 1,                            // ถ้ามีจำนวนคืน เช่น nights ให้ใส่ qty = nights แล้วปรับ unit ให้เป็นราคาต่อคืน
                            unit: c.amount,                    // หรือ unit = room.price; amount = room.price * nights
                            amount: c.amount,
                            }));

                            await generateReceiptPDF({
                            bookingId: booking!.id,
                            catName : cat?.name ?? "-",
                            roomLabel: `${room?.type ?? "Room"} ห้อง ${room?.roomNumber ?? "-"}`,
                            checkin: booking!.checkinDate,
                            checkout: booking!.checkoutDate,
                            guardian: displayGuardian,         // จากหน้าคุณ
                            phone: user?.phonenumber ?? "-",
                            rows,
                            total,
                            });
                        }}
                        className="w-full rounded-md bg-[#4691D3] hover:bg-blue-500 text-white font-medium px-4 py-2"
                        >
                         พิมพ์ใบเสร็จ
                        </button>

                        <button
                          type="button"
                          onClick={onConfirmCheckout}
                          disabled={!selectedId || !paymentMethod}
                          className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium px-4 py-2"
                        >
                           ยืนยันการชำระเงินและ Check-out
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
