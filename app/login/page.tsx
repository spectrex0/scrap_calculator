"use client";
import { rpc } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AlertType = "success" | "error" | "loading" | null;

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [alertType, setAlertType] = useState<AlertType>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!username || !password) {
      setAlertType("error");
      setAlertMessage("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setAlertType("loading");
    setAlertMessage("Iniciando sesión...");

    try {
      const res = await rpc.api.auth.login.post({
        password: password,
        username: username,
      });

      if (res.error) {
        setAlertType("error");
        setAlertMessage(res.error.message || "Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      const data = res.data;

      if (data && data.success && data.user) {
        setAlertType("success");
        setAlertMessage("¡Bienvenido! Redirigiendo...");

        const userData = JSON.stringify({
          username: data.user.username,
          role: data.user.role,
        });
        document.cookie = `userdata=${encodeURIComponent(
          userData
        )}; path=/; max-age=604800`;

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setAlertType("error");
        setAlertMessage("Credenciales inválidas");
        setIsLoading(false);
      }

      rpc.api.log
        .post({
          username: username,
          event: "Login",
        })
        .catch(() => {});
    } catch (err) {
      setAlertType("error");
      setAlertMessage("Error de conexión. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      login();
    }
  };

  const recentChanges = [
    "Correccion de errores en el backend y unas cuantas mejoras en la interfaz",
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

        {alertType && (
          <div
            className={`mb-6 p-4 rounded-lg border text-sm transition-all ${
              alertType === "error"
                ? "bg-red-950/30 border-red-800 text-red-400"
                : alertType === "success"
                ? "bg-green-950/30 border-green-800 text-green-400"
                : "bg-blue-950/30 border-blue-800 text-blue-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {alertType === "loading" && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {alertType === "success" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {alertType === "error" && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span>{alertMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-4" onKeyPress={handleKeyPress}>
          <input
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition disabled:opacity-50"
            placeholder="Usuario"
            onChange={(e) => setU(e.target.value)}
            disabled={isLoading}
          />

          <input
            type="password"
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition disabled:opacity-50"
            placeholder="Contraseña"
            onChange={(e) => setP(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          onClick={login}
          disabled={isLoading}
          className={`mt-6 w-full py-3 text-center rounded-lg font-medium tracking-wide transition ${
            isLoading
              ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Procesando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>

        <button
          onClick={() =>
            alert(
              "No tienes permisos para crear cuentas. Contacta al administrador."
            )
          }
          disabled={isLoading}
          className="mt-4 w-full text-center text-neutral-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
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