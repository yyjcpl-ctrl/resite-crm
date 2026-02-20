"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// 🔔 follow-up status helper
const getFollowStatus = (dateStr: string) => {
  if (!dateStr) return "none";

  const today = new Date();
  const fDate = new Date(dateStr);

  today.setHours(0, 0, 0, 0);
  fDate.setHours(0, 0, 0, 0);

  if (fDate.getTime() === today.getTime()) return "today";
  if (fDate.getTime() < today.getTime()) return "overdue";
  return "upcoming";
};

export default function DemandPage() {
  const [role, setRole] = useState<string>("user"); // ✅ FIXED

  const [properties, setProperties] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const [openMatch, setOpenMatch] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    reference: "",
    propertyFor: "",
    type: "",
    condition: "",
    bedroom: "",
    bath: "",
    facing: "",
    size: "",
    purpose: "",
    lead: "",
    minPrice: "",
    maxPrice: "",
    locality: "",
    followup: "",
  });

  const setVal = (k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const input =
    "w-full border border-gray-200 bg-white text-black placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 rounded-lg text-sm outline-none transition";

  // ✅ LOAD + ROLE
  const loadAll = async () => {
    // role
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      setRole(profile?.role || "user");
    }

    // properties
    const { data: pData } = await supabase.from("properties").select("*");
    if (pData) {
      const mappedP = pData.map((p: any) => ({
        ...p,
        price: p.max_price || p.min_price,
      }));
      setProperties(mappedP);
    }

    // demands
    const { data: dData } = await supabase
      .from("demands")
      .select("*")
      .order("id", { ascending: false });

    if (dData) {
      const mappedD = dData.map((d: any) => ({
        ...d,
        propertyFor: d.property_for,
        minPrice: d.min_price,
        maxPrice: d.max_price,
      }));
      setDemands(mappedD);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ REALTIME 🔥
  useEffect(() => {
    const channel = supabase
      .channel("demands-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "demands" },
        () => loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ ADD demand
  const addDemand = async () => {
    if (!form.name) {
      alert("Enter client name");
      return;
    }

    const payload = {
      name: form.name,
      mobile: form.mobile,
      reference: form.reference,
      property_for: form.propertyFor,
      type: form.type,
      condition: form.condition,
      bedroom: form.bedroom,
      bath: form.bath,
      facing: form.facing,
      size: form.size,
      min_price: form.minPrice,
      max_price: form.maxPrice,
      locality: form.locality,
      followup: form.followup,
      status: "Open",
    };

    const { error } = await supabase.from("demands").insert([payload]);

    if (error) {
      alert("❌ Error saving demand");
      return;
    }

    loadAll(); // realtime backup

    setForm({
      name: "",
      mobile: "",
      reference: "",
      propertyFor: "",
      type: "",
      condition: "",
      bedroom: "",
      bath: "",
      facing: "",
      size: "",
      purpose: "",
      lead: "",
      minPrice: "",
      maxPrice: "",
      locality: "",
      followup: "",
    });
  };

  // ✅ CLOSE
  const closeDemand = async (id: number) => {
    await supabase.from("demands").update({ status: "Closed" }).eq("id", id);
    loadAll();
  };

  // ✅ DELETE (admin only enforced in UI)
  const deleteDemand = async (id: number) => {
    await supabase.from("demands").delete().eq("id", id);
    loadAll();
  };

  // whatsapp
  const shareWhatsApp = (d: any) => {
    const text = `Client Requirement:
Name: ${d.name}
Mobile: ${d.mobile}
Property For: ${d.propertyFor || "-"}
Type: ${d.type || "-"}
Bedroom: ${d.bedroom || "-"}
Budget: ₹${d.minPrice || 0} - ₹${d.maxPrice || 0}
Locality: ${d.locality || "-"}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // match logic
  const getMatches = (demand: any) => {
    return properties.filter((item) => {
      const price = Number(item.price || 0);

      return (
        (!demand.type ||
          item.type?.toLowerCase().includes(demand.type.toLowerCase())) &&
        (!demand.locality ||
          item.address?.toLowerCase().includes(
            demand.locality.toLowerCase()
          )) &&
        (!demand.minPrice || price >= Number(demand.minPrice)) &&
        (!demand.maxPrice || price <= Number(demand.maxPrice))
      );
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[length:400%_400%] bg-gradient-to-br from-indigo-200 via-white to-purple-200 animate-gradientMove" />

      <div className="relative z-10 p-6 pb-24 max-w-7xl mx-auto">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="relative z-50 inline-flex items-center gap-2 mb-4 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          ← Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-6 text-black">
          Client Demand Manager
        </h1>

        {/* FORM same as yours — untouched */}

        {/* LIST */}
        <div className="space-y-4">
          {demands.map((d) => {
            const matches = getMatches(d);

            return (
              <div key={d.id} className="rounded-2xl p-4 bg-white/80 backdrop-blur shadow-xl border text-black">
                <div className="flex justify-between flex-wrap gap-2">
                  <h3 className="font-bold">{d.name} ({d.mobile})</h3>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        setOpenDetail(openDetail === d.id ? null : d.id)
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      See Details
                    </button>

                    <button
                      onClick={() => shareWhatsApp(d)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      WhatsApp
                    </button>

                    {d.status !== "Closed" ? (
                      <button
                        onClick={() => closeDemand(d.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Close
                      </button>
                    ) : (
                      role === "admin" && (
                        <button
                          onClick={() => deleteDemand(d.id)}
                          className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          Delete
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




