"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // 🔐 already logged in check (Supabase session)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      alert("❌ Invalid login");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  const handleSignup = async () => {
    if (!username || !password) {
      alert("Enter email and password");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: username,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("✅ Account created! Now login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 🌌 MOVING GRADIENT BACKGROUND */}
      <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#0f172a,#1e3a8a,#6d28d9,#0ea5e9)] bg-[length:400%_400%]" />

      {/* blur glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl -bottom-32 -right-32" />

      {/* 🔷 CARD */}
      <div className="relative w-[360px] backdrop-blur-xl bg-white/95 border border-white/40 p-8 rounded-3xl shadow-2xl">
        {/* 🏠 PERFECT ROUND LOGO */}
        <div className="flex justify-center mb-5">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-xl flex items-center justify-center bg-white overflow-hidden">
            <Image
              src="/logo.png"
              alt="Resite Logo"
              width={90}
              height={90}
              className="object-contain rounded-full"
              priority
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Resite CRM Login
        </h1>

        {/* 👤 EMAIL */}
        <input
          className="w-full border border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 rounded-xl mb-3 transition-all"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* 🔐 PASSWORD */}
        <div className="relative mb-5">
          <input
            type={showPass ? "text" : "password"}
            className="w-full border border-gray-300 text-black placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none p-3 rounded-xl pr-12 transition-all"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>

        {/* 🔐 LOGIN */}
        <button
          type="button"
          disabled={loading}
          onClick={handleLogin}
          className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:scale-[1.02] text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <span className="relative z-10">
            🔐 {loading ? "Logging in..." : "Login"}
          </span>
          <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* 🆕 SIGNUP */}
        <button
          type="button"
          onClick={handleSignup}
          className="w-full mt-3 border border-gray-300 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
        >
          🆕 Create Account
        </button>

        <p className="text-center text-xs text-gray-500 mt-5">
          Secure CRM Access • Resite
        </p>
      </div>

      {/* 🎬 gradient animation */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradientMove 12s ease infinite;
        }
      `}</style>
    </div>
  );
}
