"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login"); // ถ้าไม่มี user -> กลับไป login
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("user"); // เคลียร์ user ที่เก็บไว้
    router.push("/login"); // กลับไปหน้า login
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <p className="mt-2">Welcome, {user.username}!</p>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(", ")}</p>
    </div>
  );
}
