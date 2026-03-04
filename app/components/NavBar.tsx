"use client";
import { rpc } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
}

export default function Navbar() {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const shortcutsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userDataStr = getCookie("userdata");
    if (!userDataStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userDataStr));
      if (
        typeof userData.username === "string" &&
        typeof userData.role === "string"
      ) {
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
  function home() {
    router.push("/dashboard");
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shortcutsRef.current &&
        !shortcutsRef.current.contains(e.target as Node)
      ) {
        setShowShortcuts(false);
      }
    };
    if (showShortcuts) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShortcuts]);

  const handleLogout = async () => {
    if (!user) return;

    try {
      await rpc.api.log.post({
        username: user.username,
        event: "Logout",
      });
    } catch {}

    deleteCookie("userdata");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <nav className="w-full bg-black select-none border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <h1
        onClick={() => {
          home();
        }}
        className="text-xl font-light tracking-wide text-white"
      >
        TOOLS
      </h1>
      <p className="text-white/60 tracking-wider">by Tokyo</p>

      <div className="flex items-center gap-3">
        {/* Ícono de teclado */}
        <div className="relative" ref={shortcutsRef}>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-white/50 hover:text-white text-lg transition"
            aria-label="Atajos de teclado"
          >
            ⌨️
          </button>

          {showShortcuts && (
            <div className="absolute right-0 top-full mt-2 w-70 bg-black border border-white/10 rounded-lg p-4 z-20">
              <h3 className="text-sm font-light text-white mb-2 tracking-wide">
                Atajos
              </h3>
              <ul className="text-xs text-white/70 space-y-2">
                <li>
                  <span className="inline-block w-12 bg-white/5 border select-none border-white/10 text-center rounded mr-2 py-0.5">
                    +
                  </span>
                  Agrega campo (si hay valor)
                </li>
                <li>
                  <span className="inline-block w-12 bg-white/5 border select-none border-white/10 text-center rounded mr-2 py-0.5">
                    Enter
                  </span>
                  Calcula resultados
                </li>
              </ul>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-3 text-xs text-white/50 hover:text-white underline"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenu(!menu)}
            className="px-4 py-2 bg-black flex items-center gap-2 hover:bg-white/5 transition"
          >
            <span className="text-white">{user.username}</span>
            {user.role === "admin" && (
              <span
                title="Admin"
                className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              ></span>
            )}
            {user.role === "user" && (
              <span
                title="User"
                className="w-2 h-2 rounded-full bg-blue-700 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              ></span>
            )}
          </button>

          {menu && (
            <div className="absolute right-0 mt-2 bg-black border border-white/10 rounded py-2 z-10 w-40">
              {user.role === "admin" && (
                <button
                  onClick={() => {
                    setMenu(false);
                    router.push("/admin");
                  }}
                  className="w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/5"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  setMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
