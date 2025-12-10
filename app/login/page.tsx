"use client";
import { rpc } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const login = async () => {
    const res = await rpc.api.auth.login.post({
      password: password,
      username: username,
    });
    const data = res.data;

    if (data && data.success && data.user) {
      const userData = JSON.stringify({
        username: data.user.username,
        role: data.user.role,
      });
      document.cookie = `userdata=${encodeURIComponent(
        userData
      )}; path=/; max-age=604800`; // 7 días
      router.push("/dashboard");
    }
    rpc.api.log
      .post({
        username: username,
        event: "Login",
      })
      .catch(() => {});
  };

  const recentChanges = [
    "Introduces a dashboard page for navigation, a new yards calculator page with backend API support for missing yards calculation, and a reusable success alert component. Updates the NavBar for dashboard navigation, adjusts login and register flows to use the dashboard, and refactors the scraps calculator route and API endpoint. Also includes minor UI and layout improvements.",
    "Funciones en el teclado para hacer el trabajo mas rapido (Click en el icono de teclado para saber mas)",
    "Panel de administración con gestión de usuarios",
    "Registro de acciones en tiempo real",
    "Interfaz de inicio de sesión mejorada",
    "Soporte para roles y permisos",
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-xl p-10 shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all">
        <h1 className="text-center text-white text-3xl mb-8 tracking-widest font-light">
          Iniciar sesión
        </h1>

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

        <button
          onClick={login}
          className="mt-6 w-full py-3 bg-white text-black text-center rounded-lg font-medium tracking-wide hover:bg-neutral-200 transition"
        >
          Entrar
        </button>

        <button
          onClick={() =>
            alert(
              "No tienes permisos para crear cuentas. Contacta al administrador."
            )
          }
          className="mt-4 w-full text-center text-neutral-400 hover:text-white transition"
        >
          Crear cuenta
        </button>

        <div className="mt-8 pt-6 border-t border-neutral-800">
          <h2 className="text-xs text-neutral-500 uppercase tracking-wider font-light mb-2">
            Last changes
          </h2>
          <ul className="text-xs text-neutral-400 space-y-1.5">
            {recentChanges.map((change, i) => (
              <li key={i} className="flex items-start">
                <span className="text-neutral-600 mr-2">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
