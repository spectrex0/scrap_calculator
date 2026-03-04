"use client";
import Navbar from "@/app/components/NavBar";
import { useCallback, useEffect, useRef, useState } from "react";


interface Result {
  WyC: number; // Piezas faltantes
  RyY: number; // Yardas faltantes
  input?: number; // Valor de entrada original (opcional)
  error?: string; // Si hubo un error en el cálculo
}

export default function App() {
  const [yards, setYards] = useState<string[]>([""]);
  const [woTotal, setWoTotal] = useState<string>("");
  const [totalYards, setTotalYards] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const woInputRef = useRef<HTMLInputElement>(null);
  const yardsInputRef = useRef<HTMLInputElement>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("userdata");
    window.location.reload();
  }, []);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === "Backspace") {
          e.preventDefault();
          setYards([""]);
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

  const updateScrap = (index: number, value: string) => {
    setYards((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeScrap = (index: number) => {
    setYards((prev) => {
      const newScraps = prev.filter((_, i) => i !== index);
      return newScraps.length ? newScraps : [""];
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const calculate = async () => {
    const filteredScraps = yards.filter((s) => s.trim() !== "");
    if (!woTotal.trim() || !totalYards.trim() || filteredScraps.length === 0) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("/api/calculate/missingyards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProduction: filteredScraps, // Enviar el array como 'currentProduction'
          woTotal: woTotal.trim(),
          totalYards: totalYards.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.results); // Guardar los resultados directamente
        setYards([""]); // Limpiar los inputs de yardas
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 1);
      } else {
        // Mostrar el primer error o un mensaje genérico
        const errorMsg = data.error || "Error desconocido en el servidor.";
        alert("Error al calcular: " + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  const handleWOKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      yardsInputRef.current?.focus();
    }
  };

  const handleYardsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      inputRefs.current[0]?.focus();
    }
  };

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, yards.length);
  }, [yards.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
        {/* INPUTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">
            Ingresar datos
          </h2>

          <div className="space-y-4">
            <label className="font-light text-white/80 tracking-wide">
              Current Production
            </label>

            {yards.map((value, index) => (
              <div key={index} className="flex gap-3">
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="number"
                  value={value}
                  onChange={(e) => updateScrap(index, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                  placeholder={`2000`}
                  min="0"
                  step="any"
                />
                {yards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScrap(index)}
                    className="px-3 py-2 bg-white text-black rounded hover:bg-white/90 transition"
                    aria-label={`Eliminar scrap ${index + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* WO */}
          <div className="mt-6">
            <label
              htmlFor="wo-total"
              className="block font-light text-white/80 tracking-wide"
            >
              WO Total
            </label>
            <input
              id="wo-total"
              ref={woInputRef}
              type="number"
              value={woTotal}
              onChange={(e) => setWoTotal(e.target.value)}
              onKeyDown={handleWOKeyDown}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg mt-1 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="8000"
              min="0"
              step="any"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="total-yards"
              className="block font-light text-white/80 tracking-wide"
            >
              Total de yardas
            </label>
            <input
              id="total-yards"
              ref={yardsInputRef}
              type="number"
              value={totalYards}
              onChange={(e) => setTotalYards(e.target.value)}
              onKeyDown={handleYardsKeyDown}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg mt-1 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="800"
              min="0"
              step="any"
            />
          </div>

          <button
            type="button"
            onClick={calculate}
            className="mt-8 w-full bg-white text-black py-3 font-medium rounded-lg hover:bg-white/90 transition"
          >
            Calcular
          </button>
        </section>

        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">Resultados</h2>

          {results.length === 0 ? (
            <p className="text-white/60 italic">No hay resultados.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4"
              >
                {r.error ? (
                  <p className="text-red-400">
                    <strong>Error:</strong> {r.error}
                  </p>
                ) : (
                  <>
                    <p>
                      <strong className="font-light">Piezas Faltantes:</strong>{" "}
                      {r.WyC.toFixed(2)}
                    </p>
                    <p>
                      <strong className="font-light">Yardas Faltantes:</strong>{" "}
                      {r.RyY.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(r.RyY.toFixed(2))}
                      className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition"
                    >
                      Copy
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
