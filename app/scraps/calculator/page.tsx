"use client";
import Navbar from "@/app/components/NavBar";
import { useEffect, useRef, useState, useCallback } from "react";

interface Result {
  scrap: number;
  division: number;
  finalResult: number;
}

export default function App() {
  const [scraps, setScraps] = useState<string[]>([""]);
  const [woTotal, setWoTotal] = useState<string>("");
  const [totalYards, setTotalYards] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [user, setUser] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const woInputRef = useRef<HTMLInputElement>(null);
  const yardsInputRef = useRef<HTMLInputElement>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("userdata");
    window.location.reload();
  }, []);

  const addScrap = useCallback(() => {
    setScraps((prev) => [...prev, ""]);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("userdata");
    if (u) setUser(u);

    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          addScrap();
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          setScraps([""]);
        }
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          logout();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [addScrap, logout]); // ✅ Add dependencies

  const updateScrap = (index: number, value: string) => {
    setScraps((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeScrap = (index: number) => {
    setScraps((prev) => {
      const newScraps = prev.filter((_, i) => i !== index);
      return newScraps.length ? newScraps : [""];
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const calculate = async () => {
    const filteredScraps = scraps.filter((s) => s.trim() !== "");
    if (!woTotal.trim() || !totalYards.trim() || filteredScraps.length === 0) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  scraps: filteredScraps,         // ← strings
  woTotal: woTotal.trim(),        // ← string
  totalYards: totalYards.trim(),  // ← string
}),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setScraps([""]);
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 10);
      } else {
        alert("Error al calcular: " + (data.message || "intente de nuevo"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (index === scraps.length - 1 && scraps[index].trim() !== "") {
        addScrap();
        setTimeout(() => {
          const newIndex = inputRefs.current.length - 1;
          if (inputRefs.current[newIndex]) {
            inputRefs.current[newIndex].focus();
          }
        }, 0);
      } else {
        const nextIndex = index + 1;
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex]?.focus();
        } else {
          woInputRef.current?.focus();
        }
      }
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

  // Sync refs when scraps change
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, scraps.length);
  }, [scraps.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
        {/* INPUTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">Ingresar datos</h2>

          <div className="space-y-4">
            <label className="font-light text-white/80 tracking-wide">Scraps</label>

            {scraps.map((value, index) => (
              <div key={index} className="flex gap-3">
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="number"
                  value={value}
                  onChange={(e) => updateScrap(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-1 focus:ring-white/20 outline-none"
                  placeholder={`Scrap #${index + 1}`}
                  min="0"
                  step="any"
                />
                {scraps.length > 1 && (
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

            <button
              type="button"
              onClick={addScrap}
              className="w-full px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition"
            >
              + Añadir scrap
            </button>
          </div>

          {/* WO */}
          <div className="mt-6">
            <label htmlFor="wo-total" className="block font-light text-white/80 tracking-wide">
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

          {/* YARDS */}
          <div className="mt-6">
            <label htmlFor="total-yards" className="block font-light text-white/80 tracking-wide">
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

        {/* RESULTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-light tracking-wide mb-6">Resultados</h2>

          {results.length === 0 ? (
            <p className="text-white/60 italic">No hay resultados.</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
                <p>
                  <strong className="font-light">Scrap:</strong> {r.scrap}
                </p>
                <p>
                  <strong className="font-light">Yards:</strong> {r.finalResult.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(r.finalResult.toFixed(2))}
                  className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition"
                >
                  Copiar
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}