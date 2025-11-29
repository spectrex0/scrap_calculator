"use client";
import { rpc } from "@/lib/rpc";
import { useEffect, useState } from "react";
// Navbar is imported but not used — consider removing if unused
// import Navbar from "../components/NavBar";

interface User {
  _id: string;
  username: string;
}

interface LogEntry {
  action: string;
  date: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await rpc.api.admin.users.get();
        if (res.error) throw new Error("Failed to fetch users");
        setUsers(res.data.users || []);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    fetchUsers();
  }, []);

  const loadLogs = async (userId: string, userName: string) => {
    setSelectedUser(userName);
    try {
      const res = await fetch(`/api/admin/logs?user=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      setLogs([]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsCreating(true);

    const username = newUsername.trim();
    const password = newPassword.trim();

    if (!username || !password) {
      setModalError("Todos los campos son obligatorios");
      setIsCreating(false);
      return;
    }

    try {
      // ✅ Use rpc correctly — with the right variable names and response handling
      const res = await rpc.api.auth.register.post({
        username,
        password,
      });

      if (res.error) {
        // ✅ rpc returns error in res.error, not via HTTP status
        throw new Error(res.error.message || "Error al crear el usuario");
      }

      // ✅ Success: refetch users
      const updatedRes = await rpc.api.admin.users.get();
      if (updatedRes.error) throw new Error("Failed to refresh users");

      setUsers(updatedRes.data.users || []);
      setIsModalOpen(false);
      setNewUsername("");
      setNewPassword("");
    } catch (error: any) {
      setModalError(error.message || "Ocurrió un error inesperado");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans select-none">
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-tight">Admin Panel</h1>
        <div className="w-16 h-0.5 bg-white mt-2 opacity-30"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* USERS */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a] flex justify-between items-center">
            <h2 className="text-lg font-medium tracking-wide text-gray-200 uppercase">
              Usuarios
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-[#1a1a1a] hover:bg-[#222] text-gray-300 px-3 py-1.5 rounded-md transition-colors duration-200"
            >
              + Nuevo
            </button>
          </div>
          <div className="p-2">
            {users.length === 0 ? (
              <p className="px-4 py-3 text-gray-500 italic">No se encontraron usuarios</p>
            ) : (
              <div className="space-y-1.5">
                {users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => loadLogs(u._id, u.username)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedUser === u.username
                        ? "bg-white text-black font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                        : "bg-[#111] text-gray-200 hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    {u.username}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOGS */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-lg font-medium tracking-wide text-gray-200 uppercase">
              {selectedUser ? `Logs de ${selectedUser}` : "Registros"}
            </h2>
          </div>
          <div className="p-2 max-h-[65vh] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="px-4 py-3 text-gray-500 italic">No hay registros</p>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 bg-[#111] rounded-lg border border-[#1a1a1a] text-sm"
                  >
                    <p className="font-mono text-white">{log.action}</p>
                    <p className="text-gray-500 mt-1 text-xs tracking-wide">{log.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)} // Close on backdrop click
        >
          <div
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <h3 className="text-lg font-medium tracking-wide text-white">Nuevo Usuario</h3>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="••••••••"
                />
              </div>
              {modalError && <p className="text-red-400 text-sm">{modalError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-4 py-2 rounded transition-colors ${
                    isCreating
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-white text-black font-medium hover:bg-gray-200"
                  }`}
                >
                  {isCreating ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}