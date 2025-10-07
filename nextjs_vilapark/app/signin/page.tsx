"use client";

import '../globals.css'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
export default function Signin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://64.71.156.99:9090/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      // เก็บ JWT และ user info ลง localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // redirect ไปหน้า dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  }

  return (
        <>
        
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
  <div className="bg-white rounded-xl shadow-md flex max-w-2xl overflow-hidden">
    {/* ซ้าย: รูป */}
    <div className=" bg-blue-100 flex items-center justify-center">
      <img
        src="/Logovilaparksquare.png"
        alt="Login Illustration"
        className="object-cover h-full w-full"
      />
    </div>

    {/* ขวา: ฟอร์ม */}
    <div className="flex items-center justify-center bg-[#4691D3]">
    <form
      onSubmit={handleLogin}
      className=" p-6 space-y-4"
    >
      <h1 className="text-white text-2xl font-bold text-center">Login</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="text-white w-full p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-white w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-white text-[#4691D3] py-2 rounded hover:bg-white-600"
      >
        Login
      </button>
    </form>
    </div>
  </div>
</div>


    </>
  );
}
