"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userdataCookie = getCookie("userdata");

    if (userdataCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userdataCookie));
        if (parsed && typeof parsed === "object") {
          router.push("/dashboard");
          return;
        }
      } catch {}
    }

    router.push("/login");
  }, [router]);

  return <div></div>;
}
