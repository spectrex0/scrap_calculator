"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoute({ children }: any) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("userdata");
    if (!data) return router.push("/login");

    const user = JSON.parse(data);
    if (user.role !== "admin") return router.push("/");

    setShow(true);
  }, []);

  if (!show) return <div className="p-10">Cargando...</div>;

  return children;
}
