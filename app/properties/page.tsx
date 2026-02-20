"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PropertiesPage() {
  const [list, setList] = useState<any[]>([]);

  // 🔍 filters
  const [filters, setFilters] = useState({
    id: "",
    propertyFor: "",
    type: "",
    condition: "",
    bedroom: "",
    bath: "",
    size: "",
    minPrice: "",
    maxPrice: "",
    locality: "",
  });

  const setF = (k: string, v: string) =>
    setFilters((p) => ({ ...p, [k]: v }));

  // ✅ load properties from Supabase
  useEffect(() => {
    const loadProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) {
        // 🔁 map snake_case → camelCase (IMPORTANT)
        const mapped = data.map((p: any) => ({
          ...p,
          propertyFor: p.property_for,
          minPrice: p.min_price,
          maxPrice: p.max_price,
        }));

        setList(mapped);
      } else {
        console.error("Properties load error:", error);
      }
    };

    loadProperties();
  }, []);

  // 🧠 unique values
  const unique = (key: string) =>
    [...new Set(list.map((x) => x[key]).filter(Boolean))];

  // 🔥 match checker
  const checkMatch = (item: any) => {
    const price =
      Number(item.price || item.maxPrice || item.minPrice || 0);

    return (
      (!filters.id ||
        String(item.id || "").includes(filters.id)) &&
      (!filters.propertyFor ||
        (item.propertyFor || "")
          .toLowerCase()
          .includes(filters.propertyFor.toLowerCase())) &&
      (!filters.type ||
        (item.type || "")
          .toLowerCase()
          .includes(filters.type.toLowerCase())) &&
      (!filters.condition ||
        (item.condition || "")
          .toLowerCase()
          .includes(filters.condition.toLowerCase())) &&
      (!filters.bedroom ||
        String(item.bedroom || "").includes(filters.bedroom)) &&
      (!filters.bath ||
        String(item.bath || "").includes(filters.bath)) &&
      (!filters.size ||
        String(item.size || "").includes(filters.size)) &&
      (!filters.locality ||
        (item.address || "")
          .toLowerCase()
          .includes(filters.locality.toLowerCase())) &&
      (!filters.minPrice || price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || price <= Number(filters.maxPrice))
    );
  };

  // 🔥 sort: matched first
  const filtered = useMemo(() => {
    return [...list].sort((a, b) => {
      const aMatch = checkMatch(a) ? 1 : 0;
      const bMatch = checkMatch(b) ? 1 : 0;
      return bMatch - aMatch || Number(b.id || 0) - Number(a.id || 0);
    });
  }, [list, filters]);

  // ✅ INPUT STYLE
  const input =
    "w-full border border-white/30 bg-white/80 backdrop-blur p-2 rounded-lg text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* 🔙 back */}
        <Link
          href="/dashboard"
          className="inline-block mb-4 bg-white/90 hover:bg-white px-4 py-2 rounded-xl shadow transition text-black font-medium"
        >
          ← Dashboard
        </Link>

        {/* 🏷 heading */}
        <h1 className="text-3xl font-bold mb-6 text-white">
          📋 Resite Properties
        </h1>

        {/* 🟦 summary */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl mb-6 shadow-xl">
          <h2 className="font-bold text-lg">🏠 Resite Properties Data</h2>
          <p>Total Properties: {list.length}</p>
          <p>
            Search Match: {
              filtered.filter((x) => checkMatch(x)).length
            }
          </p>
        </div>

        {/* 🔍 FILTER CARD */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-6 shadow-xl">
          <div className="grid md:grid-cols-4 gap-3">

            {/* ID */}
            <input
              placeholder="ID"
              className={input}
              value={filters.id}
              onChange={(e) => setF("id", e.target.value)}
            />

            {/* PROPERTY FOR */}
            <>
              <input
                list="pfList"
                placeholder="Property For"
                className={input}
                value={filters.propertyFor}
                onChange={(e) => setF("propertyFor", e.target.value)}
              />
              <datalist id="pfList">
                <option value="Sale" />
                <option value="Rent" />
                <option value="Lease" />
                {unique("propertyFor").map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </>

            {/* TYPE */}
            <>
              <input
                list="typeList"
                placeholder="Type"
                className={input}
                value={filters.type}
                onChange={(e) => setF("type", e.target.value)}
              />
              <datalist id="typeList">
                <option value="Flat" />
                <option value="Villa" />
                <option value="Plot" />
                <option value="G+2" />
                <option value="G+3" />
                {unique("type").map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </>

            {/* CONDITION */}
            <>
              <input
                list="condList"
                placeholder="Resale/New"
                className={input}
                value={filters.condition}
                onChange={(e) => setF("condition", e.target.value)}
              />
              <datalist id="condList">
                <option value="New" />
                <option value="Resale" />
                {unique("condition").map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </>

            {/* BED */}
            <>
              <input
                list="bedList"
                placeholder="Bed"
                className={input}
                value={filters.bedroom}
                onChange={(e) => setF("bedroom", e.target.value)}
              />
              <datalist id="bedList">
                <option value="1" />
                <option value="2" />
                <option value="3" />
                <option value="4" />
                {unique("bedroom").map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </>

            {/* BATH */}
            <>
              <input
                list="bathList"
                placeholder="Bath"
                className={input}
                value={filters.bath}
                onChange={(e) => setF("bath", e.target.value)}
              />
              <datalist id="bathList">
                <option value="1" />
                <option value="2" />
                <option value="3" />
                {unique("bath").map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </>

            {/* SIZE */}
            <input
              placeholder="Size"
              className={input}
              value={filters.size}
              onChange={(e) => setF("size", e.target.value)}
            />

            {/* 💰 BUDGET */}
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Min Budget"
                className={input}
                value={filters.minPrice}
                onChange={(e) => setF("minPrice", e.target.value)}
              />
              <input
                placeholder="Max Budget"
                className={input}
                value={filters.maxPrice}
                onChange={(e) => setF("maxPrice", e.target.value)}
              />
            </div>

            {/* LOCALITY */}
            <input
              placeholder="Locality"
              className={input}
              value={filters.locality}
              onChange={(e) => setF("locality", e.target.value)}
            />
          </div>
        </div>

        {/* 📋 TABLE */}
        <div className="overflow-auto rounded-2xl shadow-2xl bg-white">
          <table className="w-full text-sm text-black">
            <tbody>
              {filtered.map((item, i) => {
                const isMatch = checkMatch(item);
                return (
                  <tr
                    key={item.id || i}
                    className={`border-t transition hover:bg-blue-50 ${
                      isMatch ? "bg-green-100" : ""
                    }`}
                  >
                    <td className="p-3">{item.id}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.condition}</td>
                    <td className="p-3">{item.bedroom}</td>
                    <td className="p-3">{item.bath}</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3 font-semibold text-green-700">
                      ₹ {item.maxPrice || item.price || item.minPrice}
                    </td>
                    <td className="p-3">{item.address}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

