"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("userdata");
    if (!data) return router.push("/login");

    const user = JSON.parse(data);
    if (user.role !== "admin") return router.push("/");
  }, [router]);

  return children;
}
