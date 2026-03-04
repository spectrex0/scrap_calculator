"use client";

import { rpc } from "@/lib/rpc";
import Navbar from "@/app/components/NavBar";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface Result {
  yardas: string
}

const sendLog = async (username: string, event: string) => {
  try {
    await rpc.api.log.post({ username, event });
  } catch {}
};

export default function App() {
  const initialUser = typeof window !== "undefined" ? localStorage.getItem("userdata") : null;
  const [username, setUsername] = useState<string | null>(initialUser);

  const [ciclos, setCiclos] = useState<string>("");
  const [piezasPorCuchilla, setPiezasPorCuchilla] = useState<string>("");
  const [produccionActual, setProduccionActual] = useState<string>("");

  const [results, setResults] = useState<Result[]>([]);

   


  const ciclosRef = useRef<HTMLInputElement>(null!);
  const piezasRef = useRef<HTMLInputElement>(null!);
  const produccionRef = useRef<HTMLInputElement>(null!);



  const logout = useCallback(() => {
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
      const res = await fetch("/api/calculate/pty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPieces: ciclos,
          woTotal: piezasPorCuchilla,
          totalYards: produccionActual,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const result: Result = data.result;
        setResults([result]);

        if (username) {
          sendLog(username, "piezas convertidas a yardas");
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



  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
        {/* INPUTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">Ingresar datos</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="ciclos" className="block font-light text-white/80 tracking-wide">
                cantidad de piezas
              </label>
              <input
                id="ciclos"
                ref={ciclosRef}
                type="number"
                value={ciclos}
                onChange={(e) => setCiclos(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, piezasRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 1000"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label htmlFor="piezas" className="block font-light text-white/80 tracking-wide">
                WO total
              </label>
              <input
                id="piezas"
                ref={piezasRef}
                type="number"
                value={piezasPorCuchilla}
                onChange={(e) => setPiezasPorCuchilla(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, produccionRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 30000"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label htmlFor="produccion" className="block font-light text-white/80 tracking-wide">
                Cantidad total de yardas en tu orden
              </label>
              <input
                id="produccion"
                ref={produccionRef}
                type="number"
                value={produccionActual}
                onChange={(e) => setProduccionActual(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, ciclosRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 650"
                min="0"
                step="any"
              />
            </div>


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
               
              </p>
            </div>
          )}

          <h2 className="text-xl font-light tracking-wide mb-6">Resultados</h2>

          {results.length === 0 ? (
            <p className="text-white/60 italic">No hay resultados.</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
                
                <button
                  type="button"
                  onClick={() => copyText(r.yardas)}
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