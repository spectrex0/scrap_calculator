"use client";
import { rpc } from "@/lib/rpc";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
}

interface SessionLog {
  username?: string;
  userId?: string;
  event?: string;
  createdAt: string;
}

interface UserLog {
  action: string;
  date: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await rpc.api.admin.users.get();
        if (res.error) throw new Error(res.error.message || "Failed to load users");
        setUsers(res.data?.users || []);
      } catch (err) {
        console.error("Error loading users:", err);
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const loadUserLogs = async (userId: string, userName: string) => {
    setSelectedUser(userName);
    try {
      const res = await rpc.api.admin.logs.get({ $query: { userId } });

      let logs: SessionLog[] = [];

      if (Array.isArray(res)) {
        logs = res;
      } else if (Array.isArray(res?.data?.logs)) {
        logs = res.data.logs;
      } else if (Array.isArray(res?.logs)) {
        logs = res.logs;
      } else {
        console.warn("Unexpected user logs response structure:", res);
        logs = [];
      }

      const formattedLogs: UserLog[] = logs
        .filter(log => log.event && log.createdAt)
        .map(log => ({
          action: log.event || "Unknown event",
          date: new Date(log.createdAt).toLocaleString(),
        }));

      setUserLogs(formattedLogs);
    } catch (err) {
      console.error("Error loading user logs:", err);
      setUserLogs([]);
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
      const res = await rpc.api.auth.register.post({ username, password });
      if (res.error) {
        throw new Error(res.error.message || "Error al crear el usuario");
      }

      const updated = await rpc.api.admin.users.get();
      if (updated.error) throw new Error("No se pudieron recargar los usuarios");
      setUsers(updated.data?.users || []);

      setIsModalOpen(false);
      setNewUsername("");
      setNewPassword("");
    } catch (err: any) {
      setModalError(err.message || "Ocurrió un error inesperado");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 font-sans select-none">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Admin Panel</h1>
        <div className="w-16 h-0.5 bg-white mt-2 opacity-30 mx-auto"></div>
      </header>

      {/* Contenedor centrado con dos columnas en escritorio, una en móvil */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Panel de Usuarios */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1a1a1a] flex justify-between items-center">
              <h2 className="text-lg font-medium tracking-wide text-gray-200 uppercase">
                Usuarios
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs bg-[#1a1a1a] hover:bg-[#222] text-gray-300 px-3 py-1.5 rounded-md transition-colors"
              >
                + Nuevo
              </button>
            </div>
            <div className="p-2 max-h-[70vh] overflow-y-auto">
              {users.length === 0 ? (
                <p className="px-4 py-3 text-gray-500 italic">No se encontraron usuarios</p>
              ) : (
                <div className="space-y-1.5">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => loadUserLogs(u._id, u.username)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedUser === u.username
                          ? "bg-white text-black font-medium"
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

          {/* Panel de Registros de Usuario */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <h2 className="text-lg font-medium tracking-wide text-gray-200 uppercase">
                {selectedUser ? `Logs de ${selectedUser}` : "Registros de Usuario"}
              </h2>
            </div>
            <div className="p-2 max-h-[70vh] overflow-y-auto">
              {userLogs.length === 0 ? (
                <p className="px-4 py-3 text-gray-500 italic">
                  {selectedUser ? "No hay registros" : "Selecciona un usuario"}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {userLogs.map((log, i) => (
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
      </div>

      {/* Modal de creación de usuario */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
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
                  placeholder="ej. admin"
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
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-4 py-2 rounded ${
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