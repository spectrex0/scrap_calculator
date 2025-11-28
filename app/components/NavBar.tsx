"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  return (
    <nav className="w-full bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-lg">
      <h1 className="text-xl font-semibold">Scrap Calculator</h1>

      <div className="relative">
        <button
          onClick={() => setMenu(!menu)}
          className="px-4 py-2 bg-gray-800 rounded flex items-center gap-2 hover:bg-gray-700"
        >
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_#00f]"></span>
          {user.username}
        </button>
{user?.role === "admin" && (
  <button onClick={() => router.push("/admin")} className="w-full text-left px-4 py-2 hover:bg-white/10">
    Admin Panel
  </button>
)}

        {menu && (
          <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded shadow w-40 py-2">
            {user.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Admin Panel
              </button>
            )}

            <button
              onClick={() => {
                document.cookie = "token=; Max-Age=0";
                router.push("/login");
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
