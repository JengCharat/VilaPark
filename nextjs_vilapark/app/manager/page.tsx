"use client"
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

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
  roles:Role[];
}
export default function Manager() {
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployee] = useState<Employee[]>([]);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

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
      <h1>this is manager page</h1>

      <h1>create room</h1>
      <form onSubmit={handleSubmitCreateRoom} className="border-b-black mb-4">
        <input 
          type="text" 
          placeholder="roomNumber"
          value={roomNumber}
          onChange={(e)=>setRoomNumber(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <input type="text"
          placeholder="type"
          value={type}
          onChange={(e)=>setType(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <input type="text"
          placeholder="price"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <input type="text"
          placeholder="status"
          value={status}
          onChange={(e)=>setStatus(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">create room</button>
      </form>

      <h1>Room List</h1>
      <ul className="space-y-4">
        {rooms.map((room) => (
          <li key={room.id} className="p-4 border rounded-md shadow-sm">
            <div className="mb-2 font-semibold">
              Room {room.roomNumber} - Type: {room.type} - Price: {room.price} - Status: {room.status}
            </div>

            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mb-2"
              onClick={() => handleEditClick(room)}
            >
                EDIT
            </button>

            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mb-2"
              onClick={() => handleDeleteRoom(room.id, room.status)}
            >
              Delete
            </button>

            {editingRoomId === room.id && (
              <form
                className="flex flex-col space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitEditRoom(room.id);
                }}
              >
                <input
                  type="text"
                  placeholder="Room Number"
                  value={roomNumber}
                  className="border px-2 py-1 rounded"
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={type}
                  className="border px-2 py-1 rounded"
                  onChange={(e) => setType(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  className="border px-2 py-1 rounded"
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Status"
                  value={status}
                  className="border px-2 py-1 rounded"
                  onChange={(e) => setStatus(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>





            <h1>Create Employee User</h1>
            <form 
              onSubmit={handleSubmitCreateEmpUser} 
              className="flex flex-col space-y-3 border p-4 rounded-md shadow-sm mb-6 w-80"
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border px-2 py-1 rounded"
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Add User
              </button>
            </form>
            <h1>EMP LIST</h1>
            <ul>

            {employees.map((emp)=>(

              <li key={emp.id} className="p-4 border rounded-md shadow-sm">
                        <h1>username:{emp.username}</h1>
                        <h1>lastname:{emp.email}</h1>
                        <h1>name:{emp.name}</h1>
                        <h1>lastname:{emp.lastname}</h1>
                        <h1>phone:{emp.phonenumber}</h1>
                        <h1>adress:{emp.address}</h1>
                    </li>
            ))}



            </ul>
    </>
  );
}
