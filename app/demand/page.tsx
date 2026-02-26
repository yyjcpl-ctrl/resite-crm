"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Demand = {
  id: string;
  clientName: string;
  mobile: string;
  reference: string;
  propertyFor: string;
  type: string;
  condition: string;
  bedroom: string;
  bath: string;
  facing: string;
  size: string;
  purpose: string;
  lead: string;
  minPrice: string;
  maxPrice: string;
  locality: string;
  followUp: string;
};

type Property = {
  id: string;
  title: string;
  propertyFor: string;
  type: string;
  bedroom: string;
  bath: string;
  size: string;
  price: number;
  locality: string;
};

export default function DemandPage() {
  const initialForm: Demand = {
    id: "",
    clientName: "",
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
    followUp: "",
  };

  const [form, setForm] = useState<Demand>(initialForm);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [selected, setSelected] = useState<Demand | null>(null);
  const [matchedProps, setMatchedProps] = useState<Property[]>([]);

  // 🔥 STATS (ULTRA)
  const stats = useMemo(() => {
    return {
      total: demands.length,
      today: demands.filter(
        (d) =>
          Number(d.id) >
          Date.now() - 24 * 60 * 60 * 1000
      ).length,
      withFollowUp: demands.filter((d) => d.followUp).length,
    };
  }, [demands]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.clientName) return alert("Client Name required");

    const newDemand = {
      ...form,
      id: Date.now().toString(),
    };

    setDemands([newDemand, ...demands]);
    setForm(initialForm);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this demand?")) return;
    setDemands(demands.filter((d) => d.id !== id));
  };

  const openWhatsApp = (mobile: string) => {
    window.open(`https://wa.me/91${mobile}`, "_blank");
  };

  // ✅ MATCHING
  const fetchMatching = async (demand: Demand) => {
    const min = Number(demand.minPrice) || 0;
    const max = Number(demand.maxPrice) || 999999999;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("property For", demand.propertyFor)
      .eq("type", demand.type)
      .eq("locality", demand.locality)
      .gte("price", min)
      .lte("price", max);

    if (!error && data) setMatchedProps(data);
    else setMatchedProps([]);
  };

  const handleSeeDetails = async (d: Demand) => {
    setSelected(d);
    setMatchedProps([]);
    await fetchMatching(d);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="bg-black text-white px-4 py-2 rounded-xl text-sm shadow hover:opacity-90"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Demand Dashboard
        </h1>
      </div>

      {/* 🔥 STATS BAR */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Demands", value: stats.total },
          { label: "Today Added", value: stats.today },
          { label: "Follow Ups", value: stats.withFollowUp },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-5 rounded-3xl shadow-lg border border-gray-100">
        {Object.keys(form).map((key) => {
          if (key === "id") return null;
          return (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={(form as any)[key]}
              onChange={handleChange}
              className="border border-gray-200 p-2.5 rounded-xl text-black bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          );
        })}

        <button
          onClick={handleSubmit}
          className="col-span-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90"
        >
          Save Demand
        </button>
      </div>

      {/* DEMAND LIST */}
      <div className="mt-6 space-y-3">
        {demands.map((d) => (
          <div
            key={d.id}
            className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <div>
              <p className="font-semibold text-black">{d.clientName}</p>
              <p className="text-sm text-gray-600">{d.mobile}</p>
              <p className="text-sm text-gray-600">{d.locality}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSeeDetails(d)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
              >
                See Details
              </button>

              <button
                onClick={() => openWhatsApp(d.mobile)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
              >
                WhatsApp
              </button>

              <button
                onClick={() => handleDelete(d.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-3xl w-[95%] max-w-4xl text-black shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Demand Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-6">
              {Object.entries(selected).map(([k, v]) => (
                <p key={k}>
                  <b>{k}:</b> {v}
                </p>
              ))}
            </div>

            <h3 className="text-lg font-bold mb-2">
              Matching Properties ({matchedProps.length})
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-auto">
              {matchedProps.length === 0 && (
                <p className="text-gray-500">
                  No matching property found
                </p>
              )}

              {matchedProps.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-200 rounded-xl p-3 flex justify-between hover:shadow-lg transition-all bg-gradient-to-r from-gray-50 to-white"
                >
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm">
                      {p.type} | {p.locality}
                    </p>
                    <p className="text-sm font-semibold">
                      {p.bedroom} BHK | ₹{p.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
