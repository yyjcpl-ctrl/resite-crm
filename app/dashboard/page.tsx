"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [role, setRole] = useState<string>("user"); // ⭐ role state

  // 🔐 protect dashboard + get role
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      // ✅ get user role
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();

        setRole(profile?.role || "user");
      }

      setChecked(true);
    };

    checkAuth();
  }, [router]);

  // 🔓 logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // ⛔ loading screen
  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white text-xl">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🌌 MOVING GRADIENT BG */}
      <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#020617,#1e3a8a,#6d28d9,#0ea5e9)] bg-[length:400%_400%]" />

      {/* glow blobs */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl -bottom-32 -right-32" />

      {/* 🧊 MAIN CONTENT */}
      <div className="relative p-6 max-w-7xl mx-auto">
        {/* 🔝 HEADER */}
        <div className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl p-6 shadow-2xl flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Resite CRM Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back 👋 — Wishing you good day 🥳
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition-all text-white px-5 py-2 rounded-xl font-semibold shadow-lg"
          >
            🔓 Logout
          </button>
        </div>

        {/* 💎 ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* ➕ ADD PROPERTY */}
          <Link
            href="/add-property"
            className="group backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
              Add Property
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add new property into your CRM
            </p>
          </Link>

          {/* 🔍 SEARCH */}
          <Link
            href="/properties"
            className="group backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition">
              Search Property
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Find properties instantly
            </p>
          </Link>

          {/* ✍️ DEMAND */}
          <Link
            href="/demand"
            className="group backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-3">✍️</div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition">
              Client Demand
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Save/Match client requirements
            </p>
          </Link>

          {/* 👑 ADMIN PANEL (VISIBLE ONLY TO ADMIN) */}
          {role === "admin" && (
            <Link
              href="/admin"
              className="group backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-3">👑</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition">
                Admin Panel
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage users & roles
              </p>
            </Link>
          )}

        </div>
      </div>

      {/* 🎬 gradient animation */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradientMove 14s ease infinite;
        }
      `}</style>
    </div>
  );
}



