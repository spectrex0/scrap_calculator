"use client";
import { useRouter } from "next/navigation";
import Navbar from "../components/NavBar";

export default function Dashboard() {
  const router = useRouter();

  function sendtoSec1() {
    router.push("/scraps");
  }
    function sendtoSec2 () {
    router.push("/yards");
  }
  function sendtoSec3 () {
    router.push("/comment")
  }
  return (
    <div className="min-h-screen  bg-black text-white">
      <Navbar />

      <div className="container mx-auto  px-4 py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 font-['Dancing_Script'] tracking-wider">
          WELCOME!
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          <div className="w-full max-w-sm bg-black border border-white rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full mb-5">
              <span className="text-2xl font-bold text-black">✂️</span>
            </div>
            <h2 className="text-xl font-bold mb-3">Calculate Scraps</h2>
            <p className="text-white text-sm mb-6 opacity-90">
              Calculate the scraps reported in a order
            </p>
            <button
              onClick={sendtoSec1}
              className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Start Calc
            </button>
          </div>
          
          <div className="w-full max-w-sm bg-black border border-white rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full mb-5">
              <span className="text-2xl font-bold text-black">📏</span>
            </div>
            <h2 className="text-xl font-bold mb-3">Missing Yards</h2>
            <p className="text-white text-sm mb-6 opacity-90">
              Calculate how many yards u need to completa a order
            </p>
            <button onClick={sendtoSec2} className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Start Calc
            </button>
          </div>
          
          <div className="w-full max-w-sm bg-black border border-white rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full mb-5">
              <span className="text-2xl font-bold text-black">?</span>
            </div>
            <h2 className="text-xl font-bold mb-3">Comments and recommendations</h2>
            <p className="text-white text-sm mb-6 opacity-90">
              Do u have ideas to improve this website? send it !
            </p>
            <button onClick={sendtoSec3} className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Send Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
