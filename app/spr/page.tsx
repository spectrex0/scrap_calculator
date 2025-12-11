"use client";

import { rpc } from "@/lib/rpc";
import Navbar from "@/app/components/NavBar";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface Result {
  expectedPieces: number;
  productionActual: number;
  difference: number; // expected - actual
  scrapTotal: number;
  adjustedCycles: number;
}

const sendLog = async (username: string, event: string) => {
  try {
    await rpc.api.log.post({ username, event });
  } catch {}
};

export default function App() {
  const initialUser = typeof window !== "undefined" ? localStorage.getItem("userdata") : null;
  const [username, setUsername] = useState<string | null>(initialUser);

  // Inputs
  const [ciclos, setCiclos] = useState<string>("");
  const [piezasPorCuchilla, setPiezasPorCuchilla] = useState<string>("");
  const [produccionActual, setProduccionActual] = useState<string>("");
  const [scrapActual, setScrapActual] = useState<string>("0");

  // Resultado
  const [results, setResults] = useState<Result[]>([]);

  // Historial de scrap
  const [scrapHistory, setScrapHistory] = useState<number[]>([]);

  // Refs (corregidos con !)
  const ciclosRef = useRef<HTMLInputElement>(null!);
  const piezasRef = useRef<HTMLInputElement>(null!);
  const produccionRef = useRef<HTMLInputElement>(null!);
  const scrapRef = useRef<HTMLInputElement>(null!);

  // Cargar historial
  useEffect(() => {
    const saved = localStorage.getItem("scrapHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setScrapHistory(parsed);
        }
      } catch {}
    }
  }, []);

  // Guardar historial
  useEffect(() => {
    localStorage.setItem("scrapHistory", JSON.stringify(scrapHistory));
  }, [scrapHistory]);

  const logout = useCallback(() => {
    localStorage.removeItem("userdata");
    setUsername(null);
    window.location.reload();
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          setScrapActual("0");
          setTimeout(() => scrapRef.current?.focus(), 10);
        }
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

  const calculate = () => {
    const c = parseFloat(ciclos);
    const p = parseFloat(piezasPorCuchilla);
    const prod = parseFloat(produccionActual);
    const scrap = parseFloat(scrapActual);

    if (isNaN(c) || isNaN(p) || isNaN(prod) || isNaN(scrap) || c < 0 || p <= 0 || prod < 0 || scrap < 0) {
      alert("Todos los campos deben ser números válidos y positivos.");
      return;
    }

    // ✅ Sumar scrap actual con el anterior
    const scrapAnterior = scrapHistory.length > 0 ? scrapHistory[0] : 0;
    const scrapTotal = scrap + scrapAnterior;

    // ✅ Piezas esperadas (sin ajustar)
    const expectedPieces = c * p;

    // ✅ Ciclos equivalentes al scrap total
    const ciclosDeScrap = scrapTotal / p;

    // ✅ Ciclos ajustados
    const ciclosAjustados = Math.max(0, c - ciclosDeScrap);

    // ✅ Piezas ajustadas (lo que debería haber producido después de descartar scrap)
    const adjustedPieces = ciclosAjustados * p;

    // ✅ Diferencia: piezas esperadas - producción real
    const difference = expectedPieces - prod;

    const result: Result = {
      expectedPieces,
      productionActual: prod,
      difference,
      scrapTotal,
      adjustedCycles: ciclosAjustados,
    };

    setResults([result]);

    // ✅ Guardar solo el scrap actual como "anterior" para la próxima vez
    setScrapHistory([scrap]);

    // Log
    if (username) {
      const event = `Ciclos: ${c}\nPiezas/cuchilla: ${p}\nProducción: ${prod}\nScrap actual: ${scrap}\nScrap anterior: ${scrapAnterior}\nDiferencia: ${difference.toFixed(2)}`;
      sendLog(username, event);
    }

    setTimeout(() => ciclosRef.current?.focus(), 10);
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
                onKeyDown={(e) => handleKeyDown(e, scrapRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 2971"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label htmlFor="scrap" className="block font-light text-white/80 tracking-wide">
                Scrap actual
              </label>
              <input
                id="scrap"
                ref={scrapRef}
                type="number"
                value={scrapActual}
                onChange={(e) => setScrapActual(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, ciclosRef)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                placeholder="Ej: 178"
                min="0"
                step="any"
              />
            </div>

            {scrapHistory.length > 0 && (
              <div className="text-sm text-white/70">
                Scrap anterior: <strong>{scrapHistory[0]}</strong>
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

        {/* RESULTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          {results.length > 0 && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-white/70"> total</p>
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
                <p><strong className="font-light">Piezas esperadas:</strong> {r.expectedPieces}</p>
                <p><strong className="font-light">Producción real:</strong> {r.productionActual}</p>
                <p>
                  <strong className="font-light">Diferencia:</strong>{" "}
                  <span style={{ color: r.difference >= 0 ? "green" : "red" }}>
                    {r.difference >= 0 ? "+" : ""}
                    {r.difference.toFixed(2)} piezas
                  </span>
                </p>
                <p><strong className="font-light">Scrap total (actual + anterior):</strong> {r.scrapTotal}</p>
                <p><strong className="font-light">Ciclos ajustados:</strong> {r.adjustedCycles.toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => copyText(r.difference.toFixed(2))}
                  className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition"
                >
                  Copiar diferencia
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}