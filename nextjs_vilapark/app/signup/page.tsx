
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import '../globals.css'
import Navbar from "../components/Navbar";
export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://64.71.156.99:9090/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Signup failed");
      }

      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  }

  return (
        <>
        
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
  <div className="bg-white rounded-xl shadow-md flex max-w-2xl overflow-hidden">
    {/* ซ้าย: รูป */}
    <div className="bg-blue-100 flex items-center justify-center">
      <img
        src="/Logovilaparksquare.png"
        alt="Sign Up Illustration"
        className="object-contain h-full w-full"
      />
    </div>

    {/* ขวา: ฟอร์ม */}
    <div className="flex items-center justify-center bg-[#4691D3] w-130">
      <form
        onSubmit={handleSignup}
        className="p-8 space-y-4 w-full max-w-md"
      >
        <h1 className="text-white text-2xl font-bold text-center">Sign Up</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-white w-full p-2 border rounded border-white bg-transparent placeholder-white"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-white w-full p-2 border rounded border-white bg-transparent placeholder-white"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-white w-full p-2 border rounded border-white bg-transparent placeholder-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-white text-[#4691D3] py-2 rounded hover:bg-white/90"
        >
          Sign Up
        </button>
      </form>
    </div>
  </div>
</div>

    </>
  );
}
