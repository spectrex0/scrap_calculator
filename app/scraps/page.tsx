"use client";

import { rpc } from "@/lib/rpc";
import Navbar from "@/app/components/NavBar";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";

interface Result {
  scrap: number;
  division: number;
  finalResult: number;
}

interface UserData {
  username: string;
  role: string;
}

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift();
    if (raw) return decodeURIComponent(raw);
  }
  return null;
};

const parseUserData = (): UserData | null => {
  const cookie = getCookie("userdata");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
};

const sendLog = async (username: string, event: string) => {
  try {
    await rpc.api.log.post({ username, event });
  } catch (error) {
    console.error("Error sending log:", error);
  }
};

export default function App() {
  const [username, setUsername] = useState<string | null>(() => {
    const userData = parseUserData();
    return userData?.username ?? null;
  });

  const [scraps, setScraps] = useState<string[]>([""]);
  const [woTotal, setWoTotal] = useState<string>("");
  const [totalYards, setTotalYards] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const woInputRef = useRef<HTMLInputElement>(null);
  const yardsInputRef = useRef<HTMLInputElement>(null);

  const logout = useCallback(() => {
    document.cookie = "userdata=; path=/; max-age=0";
    setUsername(null);
    window.location.reload();
  }, []);

  const addScrap = useCallback(() => {
    setScraps((prev) => [...prev, ""]);
  }, []);

  useEffect(() => {
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
  }, [addScrap, logout]);

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
      const res = await fetch("/api/calculate/scraps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scraps: filteredScraps,
          woTotal: woTotal.trim(),
          totalYards: totalYards.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setScraps([""]);

        const userData = parseUserData();
        if (userData?.username) {
          const scrapsList = filteredScraps.join(", ");
          const totalYardsResult = data.results.reduce(
            (sum: number, r: Result) => sum + r.finalResult,
            0
          );
          const event = `[${scrapsList}] WO: ${woTotal.trim()} Yards in WO: ${totalYards.trim()} Total: ${totalYardsResult.toFixed(2)} yards`;
          sendLog(userData.username, event);
        }

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
    } else if (e.key === "+" && !e.shiftKey) {
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

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, scraps.length);
  }, [scraps.length]);

  const totalScrapsYards = useMemo(() => {
    return results.reduce((sum, r) => sum + r.finalResult, 0);
  }, [results]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
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

        <section className="bg-black border border-white/10 p-6 rounded-xl">
          {results.length > 0 && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-white/70">Total en yards</p>
              <p className="text-xl font-light mt-1">{totalScrapsYards.toFixed(2)} yardas</p>
            </div>
          )}

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