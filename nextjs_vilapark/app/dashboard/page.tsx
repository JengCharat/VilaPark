"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function First_page() {
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8081/cats")
      .then((res) => res.json())
      .then((data) => {
        setCats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <h1 className="text-red-600 text-2xl mb-4">Student List</h1>
      <ul className="list-disc pl-5">
        {cats.map((cat) => (
          <li key={cat.id}>
            {cat.id} - {cat.name}
          </li>
        ))}
      </ul>
    </>
  );
}
