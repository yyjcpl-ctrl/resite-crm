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
  const [role, setRole] = useState<string>("user");

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

  // ✅ REALTIME
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

  const closeDemand = async (id: number) => {
    await supabase.from("demands").update({ status: "Closed" }).eq("id", id);
    loadAll();
  };

  const deleteDemand = async (id: number) => {
    await supabase.from("demands").delete().eq("id", id);
    loadAll();
  };

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

        {/* ✅ FORM */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border mb-6">
          <h2 className="font-bold text-lg mb-3 text-black">
            Add Client Demand
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input className={input} placeholder="Client Name"
              value={form.name}
              onChange={(e) => setVal("name", e.target.value)}
            />
            <input className={input} placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => setVal("mobile", e.target.value)}
            />
            <input className={input} placeholder="Property For"
              value={form.propertyFor}
              onChange={(e) => setVal("propertyFor", e.target.value)}
            />
            <input className={input} placeholder="Type"
              value={form.type}
              onChange={(e) => setVal("type", e.target.value)}
            />
            <input className={input} placeholder="Min Price"
              value={form.minPrice}
              onChange={(e) => setVal("minPrice", e.target.value)}
            />
            <input className={input} placeholder="Max Price"
              value={form.maxPrice}
              onChange={(e) => setVal("maxPrice", e.target.value)}
            />
            <input className={input} placeholder="Locality"
              value={form.locality}
              onChange={(e) => setVal("locality", e.target.value)}
            />
            <input type="date" className={input}
              value={form.followup}
              onChange={(e) => setVal("followup", e.target.value)}
            />
          </div>

          <button
            onClick={addDemand}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold"
          >
            ➕ Save Demand
          </button>
        </div>

        {/* ✅ LIST */}
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

                {/* ✅ DETAILS */}
                {openDetail === d.id && (
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 border text-sm space-y-1">
                    <p><b>Property For:</b> {d.propertyFor || "-"}</p>
                    <p><b>Type:</b> {d.type || "-"}</p>
                    <p><b>Bedroom:</b> {d.bedroom || "-"}</p>
                    <p><b>Budget:</b> ₹{d.minPrice || 0} - ₹{d.maxPrice || 0}</p>
                    <p><b>Locality:</b> {d.locality || "-"}</p>
                    <p><b>Status:</b> {d.status}</p>

                    <p>
                      <b>Follow-up:</b>{" "}
                      {getFollowStatus(d.followup) === "today" && "🟢 Today"}
                      {getFollowStatus(d.followup) === "overdue" && "🔴 Overdue"}
                      {getFollowStatus(d.followup) === "upcoming" && "🟡 Upcoming"}
                    </p>

                    <button
                      onClick={() =>
                        setOpenMatch(openMatch === d.id ? null : d.id)
                      }
                      className="mt-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      🔍 Find Matches ({matches.length})
                    </button>

                    {openMatch === d.id && (
                      <div className="mt-2 space-y-1">
                        {matches.length === 0 && (
                          <p className="text-gray-500">No matching property</p>
                        )}

                        {matches.map((m: any) => (
                          <div key={m.id} className="text-xs border rounded-lg p-2 bg-white">
                            {m.type} — ₹{m.price} — {m.address}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


