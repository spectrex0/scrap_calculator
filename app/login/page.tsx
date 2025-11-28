"use client";
import { rpc } from "@/lib/rpc";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  // const login = async () => {
  //   const res = await rpc.api.auth.login.post({
  //     username: username,
  //     password: password,
  //   });

  //   if (res.error) return alert(res.error.message ?? "Login failed");

  //   const data = res.data;
  //   if (!data?.success) return alert(data?.message ?? "Login failed");

  //   const token = (data as any).token;
  //   if (token) document.cookie = `token=${token}; path=/;`;

  //   const user = data.user;

  //   if (user?.username) {
  //     localStorage.setItem(
  //       "userdata",
  //       JSON.stringify({ username: user.username, role: user.role })
  //     );
  //   }

  //   router.push("/scraps/calculator");
  // };

  function login(){
    let user = "sc";
    let pas = "panel"

    try {
      if (!username){
        alert("please add a username")
      }
      if(!password){
        alert("dude, wheres the password?")
      }

      if(user === username && pas === password){
        router.push("/scraps/calculator")
      }
    } catch (error) {
      return{
        message: "something went wrong"
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-xl p-10 shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all">

        {/* Título */}
        <h1 className="text-center text-white text-3xl mb-8 tracking-widest font-light">
          Iniciar sesión
        </h1>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition"
            placeholder="Usuario"
            onChange={(e) => setU(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-400 text-center focus:border-white outline-none transition"
            placeholder="Contraseña"
            onChange={(e) => setP(e.target.value)}
          />
        </div>

        {/* Botón Login */}
        <button
          onClick={login}
          className="mt-6 w-full py-3 bg-white text-black text-center rounded-lg font-medium tracking-wide hover:bg-neutral-200 transition"
        >
          Entrar
        </button>

        {/* Crear cuenta */}
        <button
          onClick={() =>
            alert("No tienes permisos para crear cuentas. Contacta al administrador.")
          }
          className="mt-4 w-full text-center text-neutral-400 hover:text-white transition"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
