"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Helper para leer una cookie por nombre
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return undefined;
}

// Helper para eliminar una cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
}

export default function Navbar() {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const userDataStr = getCookie("userdata");
    if (!userDataStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userDataStr));
      if (typeof userData.username === "string" && typeof userData.role === "string") {
        setUser(userData);
      } else {
        throw new Error("Invalid user data structure");
      }
    } catch (error) {
      console.error("Failed to load user from cookie:", error);
      deleteCookie("userdata");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    deleteCookie("userdata");
    router.push("/login");
  };

  if (!user) {
    return null; // o puedes mostrar un skeleton/loader
  }

  return (
    <nav className="w-full bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-lg">
      <h1 className="text-xl font-semibold">Scrap Calculator</h1>
      <p>by Tokyo</p>

      <div className="relative">
        <button
          onClick={() => setMenu(!menu)}
          className="px-4 py-2 bg-black rounded flex items-center gap-2 hover:bg-gray-900"
        >
          {user.username}
          {user.role === "admin" && (
            <span
              title="Admin"
              className="ml-2 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_#ff0]"
            ></span>
          )}
          {user.role === "user" && (
            <span
              title="Normal user"
              className="ml-2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_6px_#ff0]"
            ></span>
          )}
        </button>

        {menu && (
          <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded shadow w-40 py-2 z-10">
            {user.role === "admin" && (
              <button
                onClick={() => {
                  setMenu(false);
                  router.push("/admin");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                setMenu(false);
                handleLogout();
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