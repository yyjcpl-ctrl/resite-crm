"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Demand = {
  id?: string;
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
  title: string;
  propertyFor?: string;
  property_for?: string;
  type: string;
  bedroom: string;
  bath: string;
  size: string;
  price: number;
  locality: string;
  condition?: string;
};

export default function DemandPage() {

  const initialForm: Demand = {
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

    const { data, error } = await supabase
      .from("demands")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDemands(data);
    }

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
      setDemands([data[0], ...demands]);
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

  /* -------- MATCHING PROPERTY LOGIC (PROPERTY PAGE STYLE) -------- */

  const fetchMatching = async (demand: Demand) => {

    const { data, error } = await supabase
      .from("properties")
      .select("*");

    if (error || !data) {
      setMatchedProps([]);
      return;
    }

    const filtered = data.filter((p: any) => {

      const propertyFor = p.property_for ?? p.propertyFor ?? "";
      const price = Number(
        p.price ??
        p.max_price ??
        p.min_price ??
        0
      );

      const priceMatch =
        (!demand.min_price || price >= Number(demand.min_price)) &&
        (!demand.max_price || price <= Number(demand.max_price));

      const propertyForMatch =
        !demand.property_for ||
        propertyFor
          .toLowerCase()
          .includes(demand.property_for.toLowerCase());

      const typeMatch =
        !demand.type ||
        p.type?.toLowerCase().includes(demand.type.toLowerCase());

      const localityMatch =
        !demand.locality ||
        p.locality?.toLowerCase().includes(demand.locality.toLowerCase());

      const bedroomMatch =
        !demand.bedroom ||
        String(p.bedroom ?? "")
          .toLowerCase()
          .includes(demand.bedroom.toLowerCase());

      const bathMatch =
        !demand.bath ||
        String(p.bath ?? "")
          .toLowerCase()
          .includes(demand.bath.toLowerCase());

      return (
        priceMatch &&
        propertyForMatch &&
        typeMatch &&
        localityMatch &&
        bedroomMatch &&
        bathMatch
      );

    });

    setMatchedProps(filtered);

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
          className="bg-black text-white px-4 py-2 rounded-xl text-sm shadow hover:opacity-90"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-extrabold text-black">
          Demand Dashboard
        </h1>

      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-5 rounded-3xl shadow-lg border border-gray-100">

        {Object.keys(form).map((key) => (

          <input
            key={key}
            name={key}
            placeholder={key}
            value={(form as any)[key]}
            onChange={handleChange}
            className="border border-gray-200 p-2.5 rounded-xl text-black bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />

        ))}

        <button
          onClick={handleSubmit}
          className="col-span-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold shadow-md hover:opacity-90"
        >
          Save Demand
        </button>

      </div>

      <div className="mt-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-5">

        <h2 className="text-xl font-bold mb-4 text-black">All Demands</h2>

        {demands.length === 0 ? (

          <p className="text-gray-500">No demands added yet</p>

        ) : (

          <div className="grid md:grid-cols-2 gap-4">

            {demands.map((d) => (

              <div
                key={d.id}
                className="border border-gray-200 rounded-2xl p-4 shadow-sm"
              >

                <h3 className="font-bold text-lg text-black">
                  {d.client_name}
                </h3>

                <p className="text-sm text-gray-600">
                  📞 {d.mobile}
                </p>

                <p className="text-sm text-gray-600">
                  📍 {d.locality} | {d.type}
                </p>

                <p className="text-sm text-gray-600">
                  🛏 {d.bedroom} Bed | 🛁 {d.bath} Bath
                </p>

                <p className="text-sm text-gray-600">
                  💰 {d.min_price} - {d.max_price}
                </p>

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => openWhatsApp(d.mobile)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => handleSeeDetails(d)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Match Properties
                  </button>

                  <button
                    onClick={() => handleDelete(d.id!)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {selected && (

        <div className="mt-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-5">

          <h2 className="text-xl font-bold mb-4 text-black">
            Matching Properties for {selected.client_name}
          </h2>

          {matchedProps.length === 0 ? (

            <p className="text-gray-500">
              No matching properties found
            </p>

          ) : (

            <div className="grid md:grid-cols-2 gap-4">

              {matchedProps.map((p) => (

                <div
                  key={p.id}
                  className="border border-gray-200 rounded-2xl p-4 shadow-sm"
                >

                  <h3 className="font-bold text-lg text-black">
                    {p.title}
                  </h3>

                  <p className="text-sm text-gray-600">
                    📍 {p.locality}
                  </p>

                  <p className="text-sm text-gray-600">
                    🛏 {p.bedroom} Bed | 🛁 {p.bath} Bath
                  </p>

                  <p className="text-sm text-gray-600">
                    📏 {p.size}
                  </p>

                  <p className="text-sm font-semibold text-green-600">
                    💰 ₹{p.price}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}