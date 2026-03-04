"use client";

import { rpc } from "@/lib/rpc";
import Navbar from "@/app/components/NavBar";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface Result {
  cycles: number;
  piecesPerBlade: number;
  expectedPieces: number;
  currentProduction: number;
  difference: number;
}

interface UserData {
  username: string;
  role: string;
}

const getUserDataFromStorage = (): UserData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("userdata");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const sendLog = async (username: string, event: string) => {
  try {
    await rpc.api.log.post({ username, event });
  } catch (error) {
    console.error("❌ Error enviando log:", error);
  }
};

export default function App() {
  const [username, setUsername] = useState<string | null>(() => {
    const userData = getUserDataFromStorage();
    return userData?.username ?? null;
  });

  const [ciclos, setCiclos] = useState<string>("");
  const [piezasPorCuchilla, setPiezasPorCuchilla] = useState<string>("");
  const [produccionActual, setProduccionActual] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);

  const [scrapAnterior, setScrapAnterior] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("ultimoScrap");
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val)) return val;
    }
    return null;
  });

  const ciclosRef = useRef<HTMLInputElement>(null!);
  const piezasRef = useRef<HTMLInputElement>(null!);
  const produccionRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof window !== "undefined" && scrapAnterior !== null) {
      localStorage.setItem("ultimoScrap", scrapAnterior.toString());
    }
  }, [scrapAnterior]);

  const logout = useCallback(async () => {
    const userData = getUserDataFromStorage();
    if (userData?.username) {
      await sendLog(userData.username, "Logout");
    }
    localStorage.removeItem("userdata");
    setUsername(null);
    window.location.reload();
  }, []);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === "Backspace") {
          e.preventDefault();
          setResults([]);
        }
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          logout();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [logout]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const calculate = async () => {
    if (!ciclos.trim() || !piezasPorCuchilla.trim() || !produccionActual.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const c = parseFloat(ciclos);
    const p = parseFloat(piezasPorCuchilla);
    const prod = parseFloat(produccionActual);

    if (isNaN(c) || isNaN(p) || isNaN(prod) || c < 0 || p <= 0 || prod < 0) {
      alert("Todos los valores deben ser números positivos.");
      return;
    }

    try {
      const res = await fetch("/api/calculate/spr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycles: ciclos,
          piecesPerBlade: piezasPorCuchilla,
          currentProduction: produccionActual,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const result: Result = data.result;
        setResults([result]);
        setScrapAnterior(result.difference);

        const userData = getUserDataFromStorage();
        if (userData?.username) {
          const event = `Ciclos: ${result.cycles} | Piezas/cuchilla: ${result.piecesPerBlade} | Producción: ${result.currentProduction} | Scrap: ${result.difference.toFixed(2)}`;
          await sendLog(userData.username, "Calculation");
        }

        setCiclos("");
        setPiezasPorCuchilla("");
        setProduccionActual("");
        setTimeout(() => ciclosRef.current?.focus(), 10);
      } else {
        alert("Error: " + (data.message || "intente de nuevo"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
      
      const userData = getUserDataFromStorage();
      if (userData?.username) {
        await sendLog(userData.username, "Error: Connection failed");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<HTMLInputElement> | null = null) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (nextRef) nextRef.current?.focus();
      else ciclosRef.current?.focus();
    }
  };

  const totalDifference = useMemo(() => {
    return results.reduce((sum, r) => sum + r.difference, 0);
  }, [results]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">Ingresar datos</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="ciclos" className="block font-light text-white/80 tracking-wide">
                Ciclos
              </label>
              <input
                id="ciclos"
                ref={ciclosRef}
                type="number"
                value={ciclos}
                onChange={(e) => setCiclos(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, piezasRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 67"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label htmlFor="piezas" className="block font-light text-white/80 tracking-wide">
                Piezas por cuchilla
              </label>
              <input
                id="piezas"
                ref={piezasRef}
                type="number"
                value={piezasPorCuchilla}
                onChange={(e) => setPiezasPorCuchilla(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, produccionRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 47"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label htmlFor="produccion" className="block font-light text-white/80 tracking-wide">
                Producción actual (piezas/hora)
              </label>
              <input
                id="produccion"
                ref={produccionRef}
                type="number"
                value={produccionActual}
                onChange={(e) => setProduccionActual(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, ciclosRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 2971"
                min="0"
                step="any"
              />
            </div>

            {scrapAnterior !== null && (
              <div className="text-sm text-white/70">
                Scrap anterior: <strong>{scrapAnterior}</strong>
              </div>
            )}

            <button
              type="button"
              onClick={calculate}
              className="w-full bg-white text-black py-3 font-medium rounded-lg hover:bg-white/90 transition"
            >
              Calcular
            </button>
          </div>
        </section>

        <section className="bg-black border border-white/10 p-6 rounded-xl">
          {results.length > 0 && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-white/70">Scrap calculado</p>
              <p className="text-xl font-light mt-1">
                <span style={{ color: totalDifference >= 0 ? "green" : "red" }}>
                  {totalDifference >= 0 ? "+" : ""}
                  {totalDifference.toFixed(2)} piezas
                </span>
              </p>
            </div>
          )}

          <h2 className="text-xl font-light tracking-wide mb-6">Resultados</h2>

          {results.length === 0 ? (
            <p className="text-white/60 italic">No hay resultados.</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
                <p><strong className="font-light">Ciclos:</strong> {r.cycles}</p>
                <p><strong className="font-light">Piezas por cuchilla:</strong> {r.piecesPerBlade}</p>
                <p><strong className="font-light">Piezas esperadas:</strong> {r.expectedPieces}</p>
                <p><strong className="font-light">Producción real:</strong> {r.currentProduction}</p>
                <p>
                  <strong className="font-light">Scrap:</strong>{" "}
                  <span style={{ color: r.difference >= 0 ? "green" : "red" }}>
                    {r.difference >= 0 ? "+" : ""}
                    {r.difference.toFixed(2)} piezas
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => copyText(r.difference.toFixed(2))}
                  className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition"
                >
                  Copiar scrap
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}