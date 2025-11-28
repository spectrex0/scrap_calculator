"use client";
import { rpc } from "@/lib/rpc";
import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await rpc.api.admin.users.get()
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

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans select-none">
      
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-tight">Admin Panel</h1>
        <div className="w-16 h-0.5 bg-white mt-2 opacity-30"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto select-none">
        {/* USERS */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-lg font-medium tracking-wide text-gray-200 uppercase select-none">Usuarios</h2>
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
    </div>
  );
}