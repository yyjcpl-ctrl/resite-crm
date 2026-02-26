"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PropertiesPage() {
  const [list, setList] = useState<any[]>([]);
  const [soldMap, setSoldMap] = useState<Record<string, boolean>>({});

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

  // ✅ LOAD PROPERTIES (ULTRA SAFE)
  useEffect(() => {
    const loadProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Properties load error:", error);
        return;
      }

      const mapped = (data || []).map((p: any) => ({
        ...p,

        // 🔥 FORCE SAFE VALUES
        id: p?.id ?? "",

        propertyFor: p?.property_for ?? p?.propertyFor ?? "",
        type: p?.type ?? "",
        condition: p?.condition ?? "",
        bedroom: p?.bedroom ?? "",
        bath: p?.bath ?? "",
        size: p?.size ?? "",

        address: p?.address ?? p?.locality ?? "",
        locality: p?.locality ?? p?.address ?? "",

        minPrice: p?.min_price ?? p?.minPrice ?? "",
        maxPrice: p?.max_price ?? p?.maxPrice ?? "",
        price:
          p?.price ??
          p?.max_price ??
          p?.min_price ??
          p?.maxPrice ??
          p?.minPrice ??
          0,
      }));

      console.log("MAPPED PROPERTIES:", mapped);
      setList(mapped);
    };

    loadProperties();
  }, []);

  // 🧠 UNIQUE
  const unique = (key: string) =>
    [...new Set(list.map((x) => x?.[key]).filter(Boolean))];

  // 🔥 MATCH CHECKER (CRASH PROOF)
  const checkMatch = (item: any) => {
    if (!item) return false;

    const price = Number(
      item?.price ?? item?.maxPrice ?? item?.minPrice ?? 0
    );

    return (
      (!filters.id || String(item?.id ?? "").includes(filters.id)) &&
      (!filters.propertyFor ||
        String(item?.propertyFor ?? "")
          .toLowerCase()
          .includes(filters.propertyFor.toLowerCase())) &&
      (!filters.type ||
        String(item?.type ?? "")
          .toLowerCase()
          .includes(filters.type.toLowerCase())) &&
      (!filters.condition ||
        String(item?.condition ?? "")
          .toLowerCase()
          .includes(filters.condition.toLowerCase())) &&
      (!filters.bedroom ||
        String(item?.bedroom ?? "").includes(filters.bedroom)) &&
      (!filters.bath ||
        String(item?.bath ?? "").includes(filters.bath)) &&
      (!filters.size ||
        String(item?.size ?? "").includes(filters.size)) &&
      (!filters.locality ||
        String(item?.locality ?? item?.address ?? "")
          .toLowerCase()
          .includes(filters.locality.toLowerCase())) &&
      (!filters.minPrice || price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || price <= Number(filters.maxPrice))
    );
  };

  // 🔥 SORT
  const filtered = useMemo(() => {
    return [...list].sort((a, b) => {
      const aMatch = checkMatch(a) ? 1 : 0;
      const bMatch = checkMatch(b) ? 1 : 0;
      return bMatch - aMatch || Number(b?.id || 0) - Number(a?.id || 0);
    });
  }, [list, filters]);

  const handleSold = (id: string) => {
    setSoldMap((p) => ({ ...p, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this property?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed");
      console.error(error);
      return;
    }

    setList((prev) => prev.filter((x) => String(x.id) !== String(id)));
  };

  const input =
    "w-full border border-white/30 bg-white/80 backdrop-blur p-2 rounded-lg text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-block mb-4 bg-white/90 hover:bg-white px-4 py-2 rounded-xl shadow transition text-black font-medium"
        >
          ← Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-white">
          📋 Resite Properties
        </h1>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl mb-6 shadow-xl">
          <h2 className="font-bold text-lg">🏠 Resite Properties Data</h2>
          <p>Total Properties: {list.length}</p>
          <p>
            Search Match: {filtered.filter((x) => checkMatch(x)).length}
          </p>
        </div>

        {/* FILTER CARD unchanged */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-6 shadow-xl">
          <div className="grid md:grid-cols-4 gap-3">
            {Object.keys(filters).map((key) => (
              <input
                key={key}
                placeholder={key}
                className={input}
                value={(filters as any)[key]}
                onChange={(e) => setF(key, e.target.value)}
              />
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-auto rounded-2xl shadow-2xl bg-white">
          <table className="w-full text-sm text-black">
            <tbody>
              {filtered.map((item, i) => {
                const isMatch = checkMatch(item);
                const isSold = soldMap[String(item.id)];

                return (
                  <tr
                    key={item.id || i}
                    className={`border-t transition hover:bg-blue-50 ${
                      isMatch ? "bg-green-100" : ""
                    }`}
                  >
                    <td className="p-3">{item.id}</td>
                    <td className="p-3">{item.propertyFor}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.condition}</td>
                    <td className="p-3">{item.bedroom}</td>
                    <td className="p-3">{item.bath}</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3 font-semibold text-green-700">
                      ₹ {item.price}
                    </td>
                    <td className="p-3">
                      {item.locality || item.address}
                    </td>

                    <td className="p-3">
                      {!isSold ? (
                        <button
                          onClick={() => handleSold(String(item.id))}
                          className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs hover:bg-orange-600"
                        >
                          Press For Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(String(item.id))}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
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

