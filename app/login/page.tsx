"use client"
import { rpc } from "@/lib/rpc";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");


// En tu página de login (cliente)
const login = async () => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();

  if (data.success) {
    // Guardar datos del usuario en una cookie accesible desde el cliente
    const userData = JSON.stringify({
      username: data.user.username,
      role: data.user.role,
    });
    document.cookie = `userdata=${encodeURIComponent(userData)}; path=/; max-age=604800`; // 7 días
    router.push("/scraps/calculator");
  }
};
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-xl p-10 shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all">

        {/* Título */}
        <h1 className="text-center text-white text-3xl mb-8 tracking-widest font-light">
          Iniciar sesión
        </h1>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition"
            placeholder="Usuario"
            onChange={(e) => setU(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition"
            placeholder="Contraseña"
            onChange={(e) => setP(e.target.value)}
          />
        </div>

        {/* Botón Login */}
        <button
          onClick={login}
          className="mt-6 w-full py-3 bg-white text-black text-center rounded-lg font-medium tracking-wide hover:bg-neutral-200 transition"
        >
          Entrar
        </button>

        {/* Crear cuenta */}
        <button
          onClick={() =>
            alert("No tienes permisos para crear cuentas. Contacta al administrador.")
          }
          className="mt-4 w-full text-center text-neutral-400 hover:text-white transition"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
