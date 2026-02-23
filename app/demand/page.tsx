"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

  // ✅ MATCHING PROPERTIES FROM SUPABASE
  const fetchMatching = async (demand: Demand) => {
    const { data, error } = await supabase
      .from("properties") // 👈 table name
      .select("*")
      .eq("propertyFor", demand.propertyFor)
      .eq("type", demand.type)
      .eq("locality", demand.locality)
      .gte("price", demand.minPrice || 0)
      .lte("price", demand.maxPrice || 999999999);

    if (!error && data) {
      setMatchedProps(data);
    }
  };

  const handleSeeDetails = async (d: Demand) => {
    setSelected(d);
    await fetchMatching(d);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Demand Form</h1>

      {/* ✅ FORM */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow">
        {Object.keys(form).map((key) => {
          if (key === "id") return null;
          return (
            <input
              key={key}
              name={key}
              placeholder={key}
              value={(form as any)[key]}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          );
        })}

        <button
          onClick={handleSubmit}
          className="col-span-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Save Demand
        </button>
      </div>

      {/* ✅ DEMAND LIST */}
      <div className="mt-6 space-y-3">
        {demands.map((d) => (
          <div
            key={d.id}
            className="flex justify-between items-center bg-white p-4 rounded-xl shadow"
          >
            <div>
              <p className="font-semibold">{d.clientName}</p>
              <p className="text-sm">{d.mobile}</p>
              <p className="text-sm">{d.locality}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSeeDetails(d)}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                See Details
              </button>

              <button
                onClick={() => openWhatsApp(d.mobile)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                WhatsApp
              </button>

              <button
                onClick={() => handleDelete(d.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-xl w-[95%] max-w-4xl">
            <h2 className="text-xl font-bold mb-4">Demand Details</h2>

            {/* DEMAND INFO */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-6">
              {Object.entries(selected).map(([k, v]) => (
                <p key={k}>
                  <b>{k}:</b> {v}
                </p>
              ))}
            </div>

            {/* ✅ MATCHING PROPERTIES */}
            <h3 className="text-lg font-bold mb-2">
              Matching Properties ({matchedProps.length})
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-auto">
              {matchedProps.length === 0 && (
                <p className="text-gray-500">No matching property found</p>
              )}

              {matchedProps.map((p) => (
                <div
                  key={p.id}
                  className="border rounded p-3 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm">
                      {p.type} | {p.locality}
                    </p>
                    <p className="text-sm">
                      {p.bedroom} BHK | ₹{p.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


