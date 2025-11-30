"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const register = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.msg);

    alert("Usuario creado!");
   
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Crear Cuenta</h2>

        <input
          className="w-full mb-3 p-3 bg-black border border-gray-700 rounded"
          placeholder="Usuario"
          onChange={e => setU(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-5 p-3 bg-black border border-gray-700 rounded"
          placeholder="Contraseña"
          onChange={e => setP(e.target.value)}
        />

        <button
          onClick={register}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
