"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function PropertiesPage() {
  const [list, setList] = useState<any[]>([]);
  const [soldMap, setSoldMap] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    id: "",
    property_id: "",
    property_for: "",
    type: "",
    sub_type: "",
    condition: "",
    bedroom: "",
    bath: "",
    size: "",
    facing: "",
    total_floor: "",
    floor_no: "",
    road: "",
    furnished: "",
    parking: "",
    contact_mobile: "",
    reference_by: "",
    project_name: "",
    address: "",
    additional: "",
    min_price: "",
    max_price: "",
  });

  const setF = (k: string, v: string) =>
    setFilters((p) => ({ ...p, [k]: v }));

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

      setList(data || []);
    };

    loadProperties();
  }, []);

  const checkMatch = (item: any) => {
    const price = Number(item?.max_price ?? item?.min_price ?? 0);

    return (
      (!filters.id || String(item?.id ?? "").includes(filters.id)) &&
      (!filters.property_id ||
        String(item?.property_id ?? "").includes(filters.property_id)) &&
      (!filters.property_for ||
        String(item?.property_for ?? "")
          .toLowerCase()
          .includes(filters.property_for.toLowerCase())) &&
      (!filters.type ||
        String(item?.type ?? "")
          .toLowerCase()
          .includes(filters.type.toLowerCase())) &&
      (!filters.sub_type ||
        String(item?.sub_type ?? "")
          .toLowerCase()
          .includes(filters.sub_type.toLowerCase())) &&
      (!filters.condition ||
        String(item?.condition ?? "")
          .toLowerCase()
          .includes(filters.condition.toLowerCase())) &&
      (!filters.bedroom ||
        String(item?.bedroom ?? "").includes(filters.bedroom)) &&
      (!filters.bath || String(item?.bath ?? "").includes(filters.bath)) &&
      (!filters.size || String(item?.size ?? "").includes(filters.size)) &&
      (!filters.facing ||
        String(item?.facing ?? "")
          .toLowerCase()
          .includes(filters.facing.toLowerCase())) &&
      (!filters.total_floor ||
        String(item?.total_floor ?? "").includes(filters.total_floor)) &&
      (!filters.floor_no ||
        String(item?.floor_no ?? "").includes(filters.floor_no)) &&
      (!filters.road || String(item?.road ?? "").includes(filters.road)) &&
      (!filters.furnished ||
        String(item?.furnished ?? "")
          .toLowerCase()
          .includes(filters.furnished.toLowerCase())) &&
      (!filters.parking ||
        String(item?.parking ?? "")
          .toLowerCase()
          .includes(filters.parking.toLowerCase())) &&
      (!filters.contact_mobile ||
        String(item?.contact_mobile ?? "").includes(filters.contact_mobile)) &&
      (!filters.reference_by ||
        String(item?.reference_by ?? "")
          .toLowerCase()
          .includes(filters.reference_by.toLowerCase())) &&
      (!filters.project_name ||
        String(item?.project_name ?? "")
          .toLowerCase()
          .includes(filters.project_name.toLowerCase())) &&
      (!filters.address ||
        String(item?.address ?? "")
          .toLowerCase()
          .includes(filters.address.toLowerCase())) &&
      (!filters.additional ||
        String(item?.additional ?? "")
          .toLowerCase()
          .includes(filters.additional.toLowerCase())) &&
      (!filters.min_price || price >= Number(filters.min_price)) &&
      (!filters.max_price || price <= Number(filters.max_price))
    );
  };

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

    if (!error) {
      setList((prev) => prev.filter((x) => String(x.id) !== String(id)));
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Resite_Properties.xlsx");
  };

  const input =
    "w-full border border-white/30 bg-white/80 p-2 rounded text-sm text-black";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">

        <Link
          href="/dashboard"
          className="inline-block mb-4 bg-white px-4 py-2 rounded shadow text-black"
        >
          ← Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-white">
          📋 Resite Properties
        </h1>

        <div className="bg-blue-600 text-white p-5 rounded mb-6">
          <p>Total Properties: {list.length}</p>
          <p>Search Match: {filtered.filter((x) => checkMatch(x)).length}</p>

          <button
            onClick={exportToExcel}
            className="mt-3 px-4 py-2 bg-green-500 rounded"
          >
            Export to Excel
          </button>
        </div>

        <div className="bg-white p-4 mb-6 rounded shadow">
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

        <div className="overflow-auto bg-white rounded shadow">
          <table className="w-full text-sm text-black">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Property ID</th>
                <th className="p-3">Property For</th>
                <th className="p-3">Type</th>
                <th className="p-3">Sub Type</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Bedroom</th>
                <th className="p-3">Bath</th>
                <th className="p-3">Size</th>
                <th className="p-3">Facing</th>
                <th className="p-3">Total Floor</th>
                <th className="p-3">Floor No</th>
                <th className="p-3">Road</th>
                <th className="p-3">Furnished</th>
                <th className="p-3">Parking</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Project</th>
                <th className="p-3">Address</th>
                <th className="p-3">Additional</th>
                <th className="p-3">Min Price</th>
                <th className="p-3">Max Price</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item, i) => {
                const isMatch = checkMatch(item);

                return (
                  <tr
                    key={item.id || i}
                    className={`border-t ${isMatch ? "bg-green-100" : ""}`}
                  >
                    <td className="p-3">{item.id}</td>
                    <td className="p-3">{item.property_id}</td>
                    <td className="p-3">{item.property_for}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.sub_type}</td>
                    <td className="p-3">{item.condition}</td>
                    <td className="p-3">{item.bedroom}</td>
                    <td className="p-3">{item.bath}</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3">{item.facing}</td>
                    <td className="p-3">{item.total_floor}</td>
                    <td className="p-3">{item.floor_no}</td>
                    <td className="p-3">{item.road}</td>
                    <td className="p-3">{item.furnished}</td>
                    <td className="p-3">{item.parking}</td>
                    <td className="p-3">{item.contact_mobile}</td>
                    <td className="p-3">{item.reference_by}</td>
                    <td className="p-3">{item.project_name}</td>
                    <td className="p-3">{item.address}</td>
                    <td className="p-3">{item.additional}</td>
                    <td className="p-3">{item.min_price}</td>
                    <td className="p-3">{item.max_price}</td>

                    <td className="p-3">
                      <button
                        onClick={() => handleSold(item.id)}
                        className="mr-2 text-green-600"
                      >
                        Sold
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
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