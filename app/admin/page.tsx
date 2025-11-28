"use client";

import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users));
  }, []);

  const loadLogs = async (u: string) => {
    setSelectedUser(u);
    const res = await fetch(`/api/admin/logs?user=${u}`);
    const data = await res.json();
    setLogs(data.logs);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* USERS */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-3">Usuarios</h2>

          <div className="space-y-2">
            {users.map(u => (
              <button
                key={u}
                onClick={() => loadLogs(u)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedUser === u ? "bg-blue-700" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* LOGS */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-3">
            Logs {selectedUser && `de ${selectedUser}`}
          </h2>

          {logs.length === 0 && <p className="text-gray-400">No hay logs</p>}

          <div className="space-y-3 max-h-[65vh] overflow-auto pr-2">
            {logs.map((log: any, i) => (
              <div
                key={i}
                className="p-3 bg-gray-800 border border-gray-700 rounded"
              >
                <p><b>Acción:</b> {log.action}</p>
                <p className="text-sm text-gray-400">{log.date}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
