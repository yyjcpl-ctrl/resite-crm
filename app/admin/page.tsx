"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "admin") {
        alert("⛔ Admin access only");
        router.replace("/dashboard");
        return;
      }

      setRole("admin");

      // load users
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(allUsers || []);
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  // 🔄 change role
  const changeRole = async (id: string, newRole: string) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: newRole } : u
      )
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">

        {/* header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            👑 Admin Control Panel
          </h1>

          <Link
            href="/dashboard"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            ← Dashboard
          </Link>
        </div>

        {/* users table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-auto">
          <table className="w-full text-sm text-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{u.id}</td>
                  <td className="p-3 font-semibold">
                    {u.role}
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">

                    <button
                      onClick={() => changeRole(u.id, "admin")}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Make Admin
                    </button>

                    <button
                      onClick={() => changeRole(u.id, "user")}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Make User
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
