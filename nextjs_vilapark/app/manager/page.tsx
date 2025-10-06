"use client"
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  price: number | null;
  status: string;
}
interface Role {
  id: number;
  name: string;
}
interface Employee {
  id: number;
  username: string;
  email: string;
  name: string
  lastname: string;
  phonenumber: string;
  address: string;
  roles: Role[];
}
type RoleDTO = {
  id: number;
  name: string;
};
export default function Manager() {
    const router = useRouter();
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployee] = useState<Employee[]>([]);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingEmpId, setEditingEmpId] = useState<number | null>(null);
  const [empId, setEmpId] = useState("")
  const [EmpFirstName, setEmpFirstName] = useState("")
  const [EmpLastName, setEmpLasttName] = useState("")
  const [EmpPhone, setEmpPhone] = useState("")
  const [EmpAdress, setEmpAdress] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [thismonthBooking, setThisMonthBooking] = useState("")
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);



///////////////////////////////////////////////////////////////////////////////////////////////////
    //
          const [userId, setUserId] = useState<number | null>(null);
          const [roles, setRoles] = useState<RoleDTO[]>([]);
          const [isManager, setIsManager] = useState(false);

              useEffect(() => {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                  const userObj = JSON.parse(storedUser);
                  setUserId(userObj.id);
                }
              }, []);

              useEffect(() => {
                if (!userId) return;

                fetch(`http://localhost:8081/users/${userId}/roles`)
                  .then((res) => res.json())
                  .then((data: RoleDTO[]) => {
                    setRoles(data);
                    const manager = data.some((role) => role.name === "ROLE_MANAGER");
                    setIsManager(manager);

                    if (!manager) {
                      router.push("/dashboard");
                    }
                  })
                  .catch(console.error);
              }, [userId, router]);
///////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8081/rooms");
        if (!res.ok) throw new Error(`${res.status}`);
        const room_data: Room[] = await res.json();
        setRooms(room_data);
      } catch (error) {
        alert(error);
      }
    };
    fetchRoomData();
  }, [rooms]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8081/users/employee");
        if (!res.ok) throw new Error(`${res.status}`);
        const employee: Employee[] = await res.json();
        setEmployee(employee);
      } catch (error) {
        alert(error);
      }
    };
    fetchRoomData();
  }, [rooms]);

  useEffect(() => {
    const fetcThisMonthBooking = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8081/bookings/month");
        if (!res.ok) throw new Error(`${res.status}`);
        const text = await res.text();
        setThisMonthBooking(text)
      } catch (error) {
      }
    };
    fetcThisMonthBooking()
  }, []);

  useEffect(() => {
  if (editingRoom) {
    setRoomNumber(editingRoom.roomNumber);
    setType(editingRoom.type);
    setPrice(editingRoom.price?.toString() || "");
    setStatus(editingRoom.status);
  }
}, [editingRoom]);


  const handleSubmitCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8081/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber,
          type,
          price: Number(price),
          status,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setRoomNumber("");
      setType("");
      setPrice("");
      setStatus("");
      alert("success");
      setRooms([...rooms, data]); // อัพเดตรายการห้องใหม่
    } catch (err) {
      alert(err);
    }
  };

  const handleEditClick = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setType(room.type);
    setPrice(room.price?.toString() || "");
    setStatus(room.status);
  };

  const handleEditEmpClick = (emp: Employee) => {
    setEditingEmpId(emp.id); // แสดง form เฉพาะตัวนี้
    setEmpId(emp.id.toString());
    setUsername(emp.username);
    setEmail(emp.email);
    setEmpFirstName(emp.name);
    setEmpLasttName(emp.lastname);
    setEmpPhone(emp.phonenumber);
    setEmpAdress(emp.address);
  };

  const handleSubmitEditEmp = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8081/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          name: EmpFirstName,
          lastname: EmpLastName,
          phonenumber: EmpPhone,
          address: EmpAdress
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);

      setEmpId("")
      setUsername("")
      setEmail("")
      setEmpFirstName("")
      setEmpLasttName("")
      setEmpPhone("")
      setEmpAdress("")
    } catch (err) {
      alert(err);
    }
  };
  
  const handleSubmitEditRoom = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8081/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber,
          type,
          price: Number(price),
          status,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updatedRoom = await res.json();

      setRoomNumber("");
      setType("");
      setPrice("");
      setStatus("");
      alert("success");
      setRooms(rooms.map(r => r.id === id ? updatedRoom : r));
      setEditingRoomId(null);
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteEmp = async (id: number) => {
    if (status === "2") {
      alert("ลบไม่ได้ ห้องนี้ถูกจองอยู่");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8081/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      alert("ลบสำเร็จ");

      setEmployee(employees.filter(r => r.id !== id));
      setEditingRoomId(null);
    } catch (err) {
      alert(err);
    }
  };
  const handleDeleteRoom = async (id: number, status: string) => {
    if (status === "2") {
      alert("ลบไม่ได้ ห้องนี้ถูกจองอยู่");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8081/rooms/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      alert("ลบสำเร็จ");

      setRooms(rooms.filter(r => r.id !== id));
      setEditingRoomId(null);
    } catch (err) {
      alert(err);
    }
  };

  const handleSubmitCreateEmpUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8081/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: ["admin"]

        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setUsername("")
      setEmail("")
      setPassword("")
      alert("success");
      setRooms([...rooms, data]); // อัพเดตรายการห้องใหม่
    } catch (err) {
      alert(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">⚙️ Manager Dashboard</h2>
        <div className="mt-10 mb-10flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6 w-full max-w-md transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">📅 การจองเดือนนี้</h3>
                <p className="text-blue-100 text-sm">จำนวนการจองทั้งหมดประจำเดือน</p>
              </div>
              <div className="mt-6 text-8xl font-extrabold text-center">
                {thismonthBooking}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 🏨 Room Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              🏨 จัดการห้องพัก
            </h3>

            {/* Create Room */}
            <form
              onSubmit={handleSubmitCreateRoom}
              className="space-y-3 border border-gray-200 rounded-lg p-4 mb-6"
            >
              <h4 className="font-semibold text-gray-700">➕ เพิ่มห้องใหม่</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="หมายเลขห้อง"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="ประเภท"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="ราคา"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="สถานะ"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                ➕ สร้างห้อง
              </button>
            </form>

            {/* Room List */}
            <h4 className="font-semibold text-gray-700 mb-2">📋 รายการห้องพัก</h4>
            <ul className="space-y-4">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-gray-700">
                      ห้อง {room.roomNumber} | {room.type} | ฿{room.price} | {room.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                      onClick={() => setEditingRoom(room)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      onClick={() => handleDeleteRoom(room.id, room.status)}
                    >
                      ลบ
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 👥 Employee Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
              👥 จัดการพนักงาน
            </h3>

            {/* Create Employee */}
            <form
              onSubmit={handleSubmitCreateEmpUser}
              className="flex flex-col space-y-3 border border-gray-200 p-4 rounded-lg shadow-sm mb-6"
            >
              <h4 className="font-semibold text-gray-700">➕ เพิ่มพนักงานใหม่</h4>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border px-3 py-2 rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-3 py-2 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border px-3 py-2 rounded-lg"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                ➕ เพิ่มผู้ใช้
              </button>
            </form>

            {/* Employee List */}
        <h4 className="font-semibold text-gray-700 mb-2">📋 รายชื่อพนักงาน</h4>
        <ul className="space-y-4">
          {employees.map((emp) => (
            <li key={emp.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <div className="font-semibold text-gray-700">
                {emp.username} ({emp.email})
              </div>
              <p className="text-sm text-gray-600">
                {emp.name} {emp.lastname} • {emp.phonenumber}
              </p>
              <p className="text-sm text-gray-600 mb-2">{emp.address}</p>

              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  onClick={() => handleEditEmpClick(emp)}
                >
                  แก้ไข
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  onClick={() => handleDeleteEmp(emp.id)}
                >
                  ลบ
                </button>
              </div>

              {editingEmpId === emp.id && (
                <form
                  className="flex flex-col space-y-2 mt-3 border-t pt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitEditEmp(emp.id);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border px-2 py-1 rounded"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border px-2 py-1 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={EmpFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={EmpLastName}
                    onChange={(e) => setEmpLasttName(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={EmpPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={EmpAdress}
                    onChange={(e) => setEmpAdress(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                  >
                    💾 บันทึก
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
          </div>
        </div>
      </div>



      {editingRoom && (
        <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              ✏️ แก้ไขห้อง {editingRoom.roomNumber}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitEditRoom(editingRoom.id);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="หมายเลขห้อง"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="ประเภท"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="ราคา"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="สถานะ"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  💾 บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>


  );
}
