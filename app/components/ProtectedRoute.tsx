"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: any) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = document.cookie.includes("token=");
    if (!token) router.push("/login");
    else setAllowed(true);
  }, []);

  if (!allowed) return <div className="p-10">Cargando...</div>;

  return children;
}
