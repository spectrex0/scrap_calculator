"use client";
import { useRouter } from "next/navigation";
import Navbar from "../components/NavBar";

export default function Dashboard() {
  const router = useRouter();

  const sendtoSec1 = () => router.push("/scraps");
  const sendtoSec2 = () => router.push("/yards");
  const sendtoSec3 = () => router.push("/comment");
  const sendtoSec4 = () => router.push("/spr");
  const sendtoSec5 = () => router.push("/pty")

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-16 tracking-wide text-white/90">
          Welcome!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Scraps */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:shadow">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-xl mb-6">
              <span className="text-2xl text-black">✂️</span>
            </div>
            <h2 className="text-xl font-medium mb-3 text-white">Calculate Scraps</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
              Calcula los scraps reportados en una orden.
            </p>
            <button
              onClick={sendtoSec1}
              className="px-6 py-3 bg-white/95 text-black font-medium rounded-xl hover:bg-white transition-colors duration-200 shadow-sm"
            >
              Start Calc
            </button>
          </div>
                    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:shadow">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-xl mb-6">
              <span className="text-2xl text-black">📏</span>
            </div>
            <h2 className="text-xl font-medium mb-3 text-white">Scraps x hora</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
             Calcula los scraps x hora de manera rapida
            </p>
            <button
              onClick={sendtoSec4}
              className="px-6 py-3 bg-white/95 text-black font-medium rounded-xl hover:bg-white transition-colors duration-200 shadow-sm"
            >
              Start Calc
            </button>
          </div>
          {/* Card 2: Yards */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:shadow">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-xl mb-6">
              <span className="text-2xl text-black">📏</span>
            </div>
            <h2 className="text-xl font-medium mb-3 text-white">Missing Yards</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
              Calcula cuántas yardas necesitas para completar una orden
            </p>
            <button
              onClick={sendtoSec2}
              className="px-6 py-3 bg-white/95 text-black font-medium rounded-xl hover:bg-white transition-colors duration-200 shadow-sm"
            >
              Start Calc
            </button>
          </div>

        {/* Card 3: Yards */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:shadow">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-xl mb-6">
              <span className="text-2xl text-black">🔨</span>
            </div>
            <h2 className="text-xl font-medium mb-3 text-white">Pieces to Yards</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
              Transforma piezas a yardas
            </p>
            <button
              onClick={sendtoSec5}
              className="px-6 py-3 bg-white/95 text-black font-medium rounded-xl hover:bg-white transition-colors duration-200 shadow-sm"
            >
              Enter
            </button>
          </div>

          {/* Card 4: Comments */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 hover:shadow">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-xl mb-6">
              <span className="text-2xl text-black">💬</span>
            </div>
            <h2 className="text-xl font-medium mb-3 text-white">Feedback</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
              ¿Tienes ideas para mejorar esta herramienta? ¡Compártelas!
            </p>
            <button
              onClick={sendtoSec3}
              className="px-6 py-3 bg-white/95 text-black font-medium rounded-xl hover:bg-white transition-colors duration-200 shadow-sm"
            >
              Send Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}