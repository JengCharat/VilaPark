"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

type Cat = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login"); // ถ้าไม่มี user -> กลับไป login
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch("http://localhost:8081/cats")
        .then((res) => res.json())
        .then((data: Cat[]) => {
          setCats(data);
          setLoadingCats(false);
        })
        .catch((err) => {
          console.error("Fetch cats error:", err);
          setLoadingCats(false);
        });
    }
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <ul className="list-disc pl-5">
          <li>ID: {user.id}</li>
          <li>Username: {user.username}</li>
          <li>Email: {user.email}</li>
          <li>Roles: {user.roles.join(", ")}</li>
        </ul>
      </div>

      {/* Cats List */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Pet Cats</h2>
        {loadingCats ? (
          <p>Loading cats...</p>
        ) : cats.length === 0 ? (
          <p>No cats found</p>
        ) : (
          <ul className="list-disc pl-5">
            {cats.map((cat) => (
              <li key={cat.id}>
                {cat.id} - {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
