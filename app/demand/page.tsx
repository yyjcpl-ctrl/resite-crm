"use client";

import { useEffect, useState } from "react";
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
  const [role, setRole] = useState<string>("user");
  const [properties, setProperties] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [openDetail, setOpenDetail] = useState<number | null>(null);

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

  // ✅ LOAD DATA
  const loadAll = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      setRole(profile?.role || "user");
    }

    const { data: pData } = await supabase.from("properties").select("*");
    if (pData) {
      const mappedP = pData.map((p: any) => ({
        ...p,
        price: p.max_price || p.min_price,
      }));
      setProperties(mappedP);
    }

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

  // ✅ ADD DEMAND
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

    loadAll();

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-200 via-white to-purple-200" />

      <div className="relative z-10 p-6 pb-24 max-w-7xl mx-auto">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="mb-4 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold"
        >
          ← Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-6 text-black">
          Client Demand Manager
        </h1>

        {/* 🧾 FULL FORM (RESTORED) */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-6 shadow border">
          <h2 className="font-bold mb-3 text-black">Add Client Demand</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input className={input} placeholder="Name" value={form.name} onChange={(e)=>setVal("name",e.target.value)} />
            <input className={input} placeholder="Mobile" value={form.mobile} onChange={(e)=>setVal("mobile",e.target.value)} />
            <input className={input} placeholder="Reference" value={form.reference} onChange={(e)=>setVal("reference",e.target.value)} />
            <input className={input} placeholder="Property For" value={form.propertyFor} onChange={(e)=>setVal("propertyFor",e.target.value)} />
            <input className={input} placeholder="Type" value={form.type} onChange={(e)=>setVal("type",e.target.value)} />
            <input className={input} placeholder="Condition" value={form.condition} onChange={(e)=>setVal("condition",e.target.value)} />
            <input className={input} placeholder="Bedroom" value={form.bedroom} onChange={(e)=>setVal("bedroom",e.target.value)} />
            <input className={input} placeholder="Bath" value={form.bath} onChange={(e)=>setVal("bath",e.target.value)} />
            <input className={input} placeholder="Facing" value={form.facing} onChange={(e)=>setVal("facing",e.target.value)} />
            <input className={input} placeholder="Size" value={form.size} onChange={(e)=>setVal("size",e.target.value)} />
            <input className={input} placeholder="Purpose" value={form.purpose} onChange={(e)=>setVal("purpose",e.target.value)} />
            <input className={input} placeholder="Lead" value={form.lead} onChange={(e)=>setVal("lead",e.target.value)} />
            <input className={input} placeholder="Min Price" value={form.minPrice} onChange={(e)=>setVal("minPrice",e.target.value)} />
            <input className={input} placeholder="Max Price" value={form.maxPrice} onChange={(e)=>setVal("maxPrice",e.target.value)} />
            <input className={input} placeholder="Locality" value={form.locality} onChange={(e)=>setVal("locality",e.target.value)} />
            <input className={input} placeholder="Followup Date" type="date" value={form.followup} onChange={(e)=>setVal("followup",e.target.value)} />
          </div>

          <button
            onClick={addDemand}
            className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            ➕ Save Demand
          </button>
        </div>

        {/* 📋 LIST */}
        <div className="space-y-4">
          {demands.length === 0 && (
            <div className="text-center text-gray-600 bg-white/70 p-6 rounded-xl">
              No demands yet. Add your first demand 🚀
            </div>
          )}

          {demands.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl p-4 bg-white/80 backdrop-blur shadow-xl border text-black"
            >
              <h3 className="font-bold">
                {d.name} ({d.mobile})
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



