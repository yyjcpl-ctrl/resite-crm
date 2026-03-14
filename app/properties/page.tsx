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
    propertyFor: "",
    type: "",
    subType: "",
    condition: "",
    bedroom: "",
    bath: "",
    size: "",
    roadWidth: "",
    facing: "",
    totalFloor: "",
    floorNo: "",
    furnished: "",
    parking: "",
    contactName: "",
    contactMobile: "",
    reference: "",
    projectName: "",
    address: "",
    additionalDetails: "",
    minPrice: "",
    maxPrice: "",
    locality: "",
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

      const mapped = (data || []).map((p: any) => ({
        ...p,
        id: p?.id ?? "",
        propertyFor: p?.property_for ?? p?.propertyFor ?? "",
        type: p?.type ?? "",
        subType: p?.sub_type ?? "",
        condition: p?.condition ?? "",
        bedroom: p?.bedroom ?? "",
        bath: p?.bath ?? "",
        size: p?.size ?? "",
        roadWidth: p?.road_width ?? "",
        facing: p?.facing ?? "",
        totalFloor: p?.total_floor ?? "",
        floorNo: p?.floor_no ?? "",
        furnished: p?.furnished ?? "",
        parking: p?.parking ?? "",
        contactName: p?.contact_name ?? "",
        contactMobile: p?.contact_mobile ?? "",
        reference: p?.reference ?? "",
        projectName: p?.project_name ?? "",
        additionalDetails: p?.additional_details ?? "",
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

      setList(mapped);
    };

    loadProperties();
  }, []);

  const checkMatch = (item: any) => {
    if (!item) return false;

    const price = Number(item?.price ?? item?.maxPrice ?? item?.minPrice ?? 0);

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
      (!filters.subType ||
        String(item?.subType ?? "")
          .toLowerCase()
          .includes(filters.subType.toLowerCase())) &&
      (!filters.condition ||
        String(item?.condition ?? "")
          .toLowerCase()
          .includes(filters.condition.toLowerCase())) &&
      (!filters.bedroom ||
        String(item?.bedroom ?? "").includes(filters.bedroom)) &&
      (!filters.bath || String(item?.bath ?? "").includes(filters.bath)) &&
      (!filters.size || String(item?.size ?? "").includes(filters.size)) &&
      (!filters.roadWidth ||
        String(item?.roadWidth ?? "").includes(filters.roadWidth)) &&
      (!filters.facing ||
        String(item?.facing ?? "")
          .toLowerCase()
          .includes(filters.facing.toLowerCase())) &&
      (!filters.totalFloor ||
        String(item?.totalFloor ?? "").includes(filters.totalFloor)) &&
      (!filters.floorNo ||
        String(item?.floorNo ?? "").includes(filters.floorNo)) &&
      (!filters.furnished ||
        String(item?.furnished ?? "")
          .toLowerCase()
          .includes(filters.furnished.toLowerCase())) &&
      (!filters.parking ||
        String(item?.parking ?? "")
          .toLowerCase()
          .includes(filters.parking.toLowerCase())) &&
      (!filters.contactName ||
        String(item?.contactName ?? "")
          .toLowerCase()
          .includes(filters.contactName.toLowerCase())) &&
      (!filters.contactMobile ||
        String(item?.contactMobile ?? "").includes(filters.contactMobile)) &&
      (!filters.reference ||
        String(item?.reference ?? "")
          .toLowerCase()
          .includes(filters.reference.toLowerCase())) &&
      (!filters.projectName ||
        String(item?.projectName ?? "")
          .toLowerCase()
          .includes(filters.projectName.toLowerCase())) &&
      (!filters.locality ||
        String(item?.locality ?? item?.address ?? "")
          .toLowerCase()
          .includes(filters.locality.toLowerCase())) &&
      (!filters.minPrice || price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || price <= Number(filters.maxPrice))
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

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      alert("Delete failed");
      console.error(error);
      return;
    }

    setList((prev) => prev.filter((x) => String(x.id) !== String(id)));
  };

  const input =
    "w-full border border-white/30 bg-white/80 backdrop-blur p-2 rounded-lg text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400";

  const exportToExcel = () => {
    const headers = [
      "id",
      "propertyFor",
      "type",
      "subType",
      "condition",
      "bedroom",
      "bath",
      "size",
      "roadWidth",
      "facing",
      "totalFloor",
      "floorNo",
      "furnished",
      "parking",
      "contactName",
      "contactMobile",
      "reference",
      "projectName",
      "additionalDetails",
      "minPrice",
      "maxPrice",
      "locality",
    ];

    const data = filtered.map((item) => [
      item.id ?? "",
      item.propertyFor ?? "",
      item.type ?? "",
      item.subType ?? "",
      item.condition ?? "",
      item.bedroom ?? "",
      item.bath ?? "",
      item.size ?? "",
      item.roadWidth ?? "",
      item.facing ?? "",
      item.totalFloor ?? "",
      item.floorNo ?? "",
      item.furnished ?? "",
      item.parking ?? "",
      item.contactName ?? "",
      item.contactMobile ?? "",
      item.reference ?? "",
      item.projectName ?? "",
      item.additionalDetails ?? "",
      item.minPrice ?? "",
      item.maxPrice ?? "",
      item.locality ?? item.address ?? "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Resite_Properties.xlsx");
  };

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
          <p>Search Match: {filtered.filter((x) => checkMatch(x)).length}</p>

          <button
            onClick={exportToExcel}
            className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold"
          >
            Export to Excel
          </button>
        </div>

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

        <div className="overflow-auto rounded-2xl shadow-2xl bg-white">
          <table className="w-full text-sm text-black">
            <thead className="bg-gray-200 font-semibold">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Property For</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Sub Type</th>
                <th className="p-3 text-left">Condition</th>
                <th className="p-3 text-left">Bedroom</th>
                <th className="p-3 text-left">Bath</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Road Width</th>
                <th className="p-3 text-left">Facing</th>
                <th className="p-3 text-left">Total Floor</th>
                <th className="p-3 text-left">Floor No</th>
                <th className="p-3 text-left">Furnished</th>
                <th className="p-3 text-left">Parking</th>
                <th className="p-3 text-left">Contact Name</th>
                <th className="p-3 text-left">Contact Mobile</th>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-left">Project Name</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Locality</th>
                <th className="p-3 text-left">Additional Details</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

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
                    <td className="p-3">{item.propertyFor}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.subType}</td>
                    <td className="p-3">{item.condition}</td>
                    <td className="p-3">{item.bedroom}</td>
                    <td className="p-3">{item.bath}</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3">{item.roadWidth}</td>
                    <td className="p-3">{item.facing}</td>
                    <td className="p-3">{item.totalFloor}</td>
                    <td className="p-3">{item.floorNo}</td>
                    <td className="p-3">{item.furnished}</td>
                    <td className="p-3">{item.parking}</td>
                    <td className="p-3">{item.contactName}</td>
                    <td className="p-3">{item.contactMobile}</td>
                    <td className="p-3">{item.reference}</td>
                    <td className="p-3">{item.projectName}</td>
                    <td className="p-3 font-semibold text-green-700">
                      ₹ {item.price}
                    </td>
                    <td className="p-3">{item.locality || item.address}</td>
                    <td className="p-3">{item.additionalDetails}</td>

                    <td className="p-3 relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === String(item.id)
                                ? null
                                : String(item.id)
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-300"
                        >
                          ⋮
                        </button>

                        {openMenu === String(item.id) && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50">
                            {!soldMap[String(item.id)] && (
                              <button
                                onClick={() => {
                                  handleSold(String(item.id));
                                  setOpenMenu(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                Press For Sold
                              </button>
                            )}

                            <Link
                              href={`/properties/edit/${item.id}`}
                              className="block px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => setOpenMenu(null)}
                            >
                              Edit
                            </Link>

                            <button
                              onClick={() => {
                                handleDelete(String(item.id));
                                setOpenMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
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