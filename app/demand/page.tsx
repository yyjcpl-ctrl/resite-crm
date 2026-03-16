"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Demand = {
  id?: string;
  date: string;
  client_name: string;
  mobile: string;
  reference: string;
  property_for: string;
  type: string;
  condition: string;
  bedroom: string;
  bath: string;
  facing: string;
  size: string;
  purpose: string;
  lead: string;
  min_price: string;
  max_price: string;
  locality: string;
  follow_up: string;
};

type Property = {
  id: string;
  title?: string;
  propertyFor?: string;
  property_for?: string;
  type?: string;
  bedroom?: string;
  bath?: string;
  size?: string;
  facing?: string;
  price?: number;
  min_price?: number;
  max_price?: number;
  locality?: string;
  address?: string;
};

export default function DemandPage() {

  const initialForm: Demand = {
    date: "",
    client_name: "",
    mobile: "",
    reference: "",
    property_for: "",
    type: "",
    condition: "",
    bedroom: "",
    bath: "",
    facing: "",
    size: "",
    purpose: "",
    lead: "",
    min_price: "",
    max_price: "",
    locality: "",
    follow_up: "",
  };

  const [form, setForm] = useState<Demand>(initialForm);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [selected, setSelected] = useState<Demand | null>(null);
  const [matchedProps, setMatchedProps] = useState<Property[]>([]);

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {

    const { data } = await supabase
      .from("demands")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setDemands(data);

  };

  const stats = useMemo(() => {
    return {
      total: demands.length,
      today: demands.length,
      withFollowUp: demands.filter((d) => d.follow_up).length,
    };
  }, [demands]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchMatching = async (demand: Demand) => {

    const { data } = await supabase
      .from("properties")
      .select("*");

    if (!data) {
      setMatchedProps([]);
      return;
    }

    const filtered = data.filter((p: any) => {

      const price =
        Number(p.price) ||
        Number(p.max_price) ||
        Number(p.min_price) ||
        0;

      const priceMatch =
        (!demand.min_price || price >= Number(demand.min_price)) &&
        (!demand.max_price || price <= Number(demand.max_price));

      const facingMatch =
        !demand.facing ||
        String(p.facing ?? "")
          .toLowerCase()
          .includes(demand.facing.toLowerCase());

      const locationMatch =
        !demand.locality ||
        (p.locality || p.address || "")
          .toLowerCase()
          .includes(demand.locality.toLowerCase());

      return priceMatch && facingMatch && locationMatch;

    });

    setMatchedProps(filtered);

  };

  const handleSubmit = async () => {

    if (!form.client_name) return alert("Client Name required");

    const { data, error } = await supabase
      .from("demands")
      .insert([form])
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {

      const newDemand = data[0];

      setDemands([newDemand, ...demands]);
      setSelected(newDemand);

      await fetchMatching(newDemand);

      setForm(initialForm);

    }

  };

  const handleDelete = async (id: string) => {

    if (!confirm("Delete this demand?")) return;

    await supabase
      .from("demands")
      .delete()
      .eq("id", id);

    setDemands(demands.filter((d) => d.id !== id));

  };

  const openWhatsApp = (mobile: string) => {
    window.open(`https://wa.me/91${mobile}`, "_blank");
  };

  const handleSeeDetails = async (d: Demand) => {

    setSelected(d);
    setMatchedProps([]);

    await fetchMatching(d);

  };

  return (

    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">

      <div className="flex items-center justify-between mb-6">

        <Link
          href="/dashboard"
          className="bg-black text-white px-4 py-2 rounded-xl text-sm shadow"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-extrabold text-black">
          Demand Dashboard
        </h1>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-5 rounded-3xl shadow-lg">

        {Object.keys(form).map((key) => (

          <input
            key={key}
            name={key}
            type={key === "date" ? "date" : "text"}
            placeholder={key}
            value={(form as any)[key]}
            onChange={handleChange}
            className="border p-2.5 rounded-xl text-black"
          />

        ))}

        <button
          onClick={handleSubmit}
          className="col-span-full bg-blue-600 text-white py-2.5 rounded-xl"
        >
          Save Demand
        </button>

      </div>

      <div className="mt-8 bg-white rounded-3xl p-5 shadow-lg overflow-x-auto">

        <h2 className="text-xl font-bold mb-4 text-black">
          All Demands
        </h2>

        <table className="min-w-full text-sm border border-gray-200">

          <thead className="bg-gray-100 text-black">

            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Reference</th>
              <th className="p-2 border">Property For</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Bedroom</th>
              <th className="p-2 border">Bath</th>
              <th className="p-2 border">Facing</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Budget</th>
              <th className="p-2 border">Locality</th>
              <th className="p-2 border">Follow Up</th>
              <th className="p-2 border">Actions</th>
            </tr>

          </thead>

          <tbody>

            {demands.map((d) => (

              <tr key={d.id} className="hover:bg-gray-50">

                <td className="p-2 border text-black">{d.date}</td>
                <td className="p-2 border font-semibold text-black">{d.client_name}</td>
                <td className="p-2 border text-black">{d.mobile}</td>
                <td className="p-2 border text-black">{d.reference}</td>
                <td className="p-2 border text-black">{d.property_for}</td>
                <td className="p-2 border text-black">{d.type}</td>
                <td className="p-2 border text-black">{d.bedroom}</td>
                <td className="p-2 border text-black">{d.bath}</td>
                <td className="p-2 border text-black">{d.facing}</td>
                <td className="p-2 border text-black">{d.size}</td>

                <td className="p-2 border text-green-600 font-semibold">
                  ₹{d.min_price} - ₹{d.max_price}
                </td>

                <td className="p-2 border text-black">{d.locality}</td>
                <td className="p-2 border text-black">{d.follow_up}</td>

                <td className="p-2 border">

                  <div className="flex gap-2">

                    <button
                      onClick={() => openWhatsApp(d.mobile)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      WA
                    </button>

                    <button
                      onClick={() => handleSeeDetails(d)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Match
                    </button>

                    <button
                      onClick={() => handleDelete(d.id!)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {selected && (

        <div className="mt-8 bg-white rounded-3xl p-5 shadow-lg">

          <h2 className="text-xl font-bold mb-4 text-black">
            Matching Properties for {selected.client_name}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {matchedProps.map((p) => (

              <div key={p.id} className="border rounded-2xl p-4">

                <p className="text-xs text-black">
                  Property ID: {p.id}
                </p>

                <h3 className="font-bold text-lg text-black">
                  {p.title || "Property"}
                </h3>

                <p className="text-sm text-black">
                  📍 {p.locality || p.address || "Location not available"}
                </p>

                <p className="text-sm text-black">
                  Facing: {p.facing}
                </p>

                <p className="text-sm font-semibold text-green-600">
                  💰 ₹{p.price || p.max_price || p.min_price}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}