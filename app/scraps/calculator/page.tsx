"use client";
import Navbar from "@/app/components/NavBar";
import { useEffect, useRef, useState } from "react";


interface Result {
  scrap: number;
  division: number;
  finalResult: number;
}

export default function App() {
  const [scraps, setScraps] = useState([""]);
  const [woTotal, setWoTotal] = useState("");
  const [totalYards, setTotalYards] = useState("");
  const [results, setResults] = useState<Result[]>([]);
 
  const [user, setUser] = useState("");

  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("userdata");
    if (u) setUser(u);

    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "Enter") calculate();
      if (e.ctrlKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addScrap();
      }
      if (e.ctrlKey && e.key === "Backspace") {
        e.preventDefault();
        setScraps([""]);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "l") logout();
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  const updateScrap = (index: number, value: string) => {
    const updated = [...scraps];
    updated[index] = value;
    setScraps(updated);
  };

  const addScrap = () => {
    setScraps((prev) => {
      const updated = [...prev, ""];
      return updated;
    });

    // focusing last input
    setTimeout(() => {
      const lastIndex = inputRefs.current.length - 1;
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }, 10);
  };

  const removeScrap = (index: number) =>
    setScraps(scraps.filter((_, i) => i !== index));

  const logout = () => {
    localStorage.removeItem("userdata");
    location.reload();
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const calculate = async () => {
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scraps, woTotal, totalYards }),
    });
    
    

    const data = await res.json();
    if (data.success) {
      setResults(data.results);

      // clean scraps after sending
      setScraps([""]);

      // focus first scrap field
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 10);
    }
  };

  return (
    
    <div className="min-h-screen bg-black text-white">

   <Navbar></Navbar>

      {/* CONTENT - RESPONSIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">

        {/* INPUTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Ingresar datos</h2>

          {/* SCRAP FIELDS */}
          <div className="space-y-4">
            <label className="font-medium opacity-90">Scraps</label>

            {scraps.map((value, index) => (
              <div key={index} className="flex gap-3">
                <input
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  type="number"
                  value={value}
                  onChange={(e) => updateScrap(index, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
                  placeholder={`Scrap #${index + 1}`}
                />

                {scraps.length > 1 && (
                  <button
                    onClick={() => removeScrap(index)}
                    className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addScrap}
              className="w-full px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              + Añadir scrap
            </button>
          </div>

          {/* WO */}
          <div className="mt-6">
            <label>WO Total</label>
            <input
              type="number"
              value={woTotal}
              onChange={(e) => setWoTotal(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg mt-1 focus:ring-2 focus:ring-white/30 outline-none"
              placeholder="8000"
            />
          </div>

          {/* YARDS */}
          <div className="mt-6">
            <label>Total de yardas</label>
            <input
              type="number"
              value={totalYards}
              onChange={(e) => setTotalYards(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg mt-1 focus:ring-2 focus:ring-white/30 outline-none"
              placeholder="800"
            />
          </div>

          <button
            onClick={calculate}
            className="mt-8 w-full bg-white text-black py-3 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Calcular
          </button>
        </section>

        {/* RESULTS */}
        <section className="bg-black border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Resultados</h2>

          {results.length === 0 ? (
            <p className="opacity-70">No hay resultados.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4"
              >
                <p><strong>Scrap:</strong> {r.scrap}</p>
               
                <p><strong>Yards: </strong> {r.finalResult}</p>

                <button
                  onClick={() =>
                    copyText(
                      `${r.finalResult}`
                    )
                  }
                  className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
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
