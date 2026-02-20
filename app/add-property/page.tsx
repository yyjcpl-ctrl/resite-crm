"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AddPropertyPage() {
  const initialForm = {
    id: "",
    date: "",
    propertyFor: "",
    type: "",
    subType: "",
    condition: "",
    bedroom: "",
    bath: "",
    size: "",
    facing: "",
    totalFloor: "",
    floorNo: "",
    road: "",
    furnished: "",
    parking: "",
    contact: "",
    referenceBy: "",
    projectName: "",
    address: "",
    additional: "",
    minPrice: "",
    maxPrice: "",
    files: [] as File[],
  };

  const [form, setForm] = useState<any>(initialForm);
  const [preview, setPreview] = useState<string[]>([]);

  const setVal = (k: string, v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));

  const input =
    "w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl outline-none transition bg-white text-gray-900 placeholder:text-gray-400";

  // ✅ AUTO DATE + AUTO ID
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((p: any) => ({
      ...p,
      date: p.date || today,
      id: p.id || String(Date.now()).slice(-6),
    }));
  }, []);

  // ✅ MULTI FILE
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const arr = Array.from(files);
    setForm((p: any) => ({ ...p, files: arr }));

    const urls = arr
      .filter((f) => f.type.startsWith("image"))
      .map((f) => URL.createObjectURL(f));

    setPreview(urls);
  };

  // 🔥 base64
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });

  // ✅ SUBMIT
  const handleSubmit = async () => {
    try {
      let payload: any = { ...form };

      if (form.files?.length) {
        payload.filesBase64 = await Promise.all(
          form.files.map((f: File) => toBase64(f))
        );
      }

      await fetch("/api/save-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("✅ Property Saved Successfully!");
      setForm(initialForm);
      setPreview([]);
    } catch (err) {
      console.error(err);
      alert("❌ Error saving property");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ✅ WHITE DASHBOARD BUTTON */}
        <Link
          href="/dashboard"
          className="inline-block mb-4 bg-white text-black px-4 py-2 rounded-xl shadow hover:scale-105 transition font-semibold"
        >
          ← Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            ➕ Add Property
          </h1>

          {/* ROW 1 */}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              placeholder="Property ID"
              className={input}
              value={form.id}
              onChange={(e) => setVal("id", e.target.value)}
            />

            <input
              type="date"
              className={input}
              value={form.date}
              onChange={(e) => setVal("date", e.target.value)}
            />

            <input
              list="propertyForList"
              placeholder="Property For"
              className={input}
              value={form.propertyFor}
              onChange={(e) => setVal("propertyFor", e.target.value)}
            />
            <datalist id="propertyForList">
              <option value="Sale" />
              <option value="Rent" />
              <option value="Lease" />
            </datalist>
          </div>

          {/* ROW 2 */}
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <input list="typeList" placeholder="Type" className={input}
              value={form.type}
              onChange={(e) => setVal("type", e.target.value)} />
            <datalist id="typeList">
              <option value="Residential" />
              <option value="Commercial" />
            </datalist>

            <input list="subTypeList" placeholder="Sub Type" className={input}
              value={form.subType}
              onChange={(e) => setVal("subType", e.target.value)} />
            <datalist id="subTypeList">
              <option value="Flat" />
              <option value="Villa" />
              <option value="Office" />
            </datalist>

            <input list="conditionList" placeholder="New / Resale" className={input}
              value={form.condition}
              onChange={(e) => setVal("condition", e.target.value)} />
            <datalist id="conditionList">
              <option value="New" />
              <option value="Resale" />
            </datalist>
          </div>

          {/* ROW 3 */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input list="bedroomList" placeholder="Bedroom" className={input}
              value={form.bedroom}
              onChange={(e) => setVal("bedroom", e.target.value)} />
            <datalist id="bedroomList">
              <option value="1" />
              <option value="2" />
              <option value="3" />
              <option value="4" />
            </datalist>

            <input list="bathList" placeholder="Bathroom" className={input}
              value={form.bath}
              onChange={(e) => setVal("bath", e.target.value)} />
            <datalist id="bathList">
              <option value="1" />
              <option value="2" />
              <option value="3" />
              <option value="4" />
            </datalist>
          </div>

          {/* ROW 4 */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input list="facingList" placeholder="Facing" className={input}
              value={form.facing}
              onChange={(e) => setVal("facing", e.target.value)} />
            <datalist id="facingList">
              <option value="East" />
              <option value="West" />
              <option value="North" />
              <option value="South" />
            </datalist>

            <input placeholder="Total Floor" className={input}
              value={form.totalFloor}
              onChange={(e) => setVal("totalFloor", e.target.value)} />
          </div>

          {/* ROW 5 */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input placeholder="Floor No" className={input}
              value={form.floorNo}
              onChange={(e) => setVal("floorNo", e.target.value)} />
            <input placeholder="Road" className={input}
              value={form.road}
              onChange={(e) => setVal("road", e.target.value)} />
          </div>

          {/* ROW 6 */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input list="furnishedList" placeholder="Furnished" className={input}
              value={form.furnished}
              onChange={(e) => setVal("furnished", e.target.value)} />
            <datalist id="furnishedList">
              <option value="Full" />
              <option value="Semi" />
              <option value="Unfurnished" />
            </datalist>

            <input list="parkingList" placeholder="Parking" className={input}
              value={form.parking}
              onChange={(e) => setVal("parking", e.target.value)} />
            <datalist id="parkingList">
              <option value="Yes" />
              <option value="No" />
              <option value="Covered" />
              <option value="Open" />
            </datalist>
          </div>

          {/* REST OF YOUR ORIGINAL CODE CONTINUES EXACT SAME */}
          {/* CONTACT */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input placeholder="Contact Person" className={input}
              value={form.contact}
              onChange={(e) => setVal("contact", e.target.value)} />
            <input placeholder="Reference By" className={input}
              value={form.referenceBy}
              onChange={(e) => setVal("referenceBy", e.target.value)} />
          </div>

          <input placeholder="Project Name" className={`${input} mt-4`}
            value={form.projectName}
            onChange={(e) => setVal("projectName", e.target.value)} />

          <textarea placeholder="Address" className={`${input} mt-4`}
            value={form.address}
            onChange={(e) => setVal("address", e.target.value)} />

          <textarea placeholder="Additional Details" className={`${input} mt-4`}
            value={form.additional}
            onChange={(e) => setVal("additional", e.target.value)} />

          {/* PRICE */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input placeholder="Min Budget" className={input}
              value={form.minPrice}
              onChange={(e) => setVal("minPrice", e.target.value)} />
            <input placeholder="Max Budget" className={input}
              value={form.maxPrice}
              onChange={(e) => setVal("maxPrice", e.target.value)} />
          </div>

          {/* FILE */}
          <div className="mt-4">
            <label className="font-semibold text-black">
              Upload Photos / Video
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="w-full mt-2 text-black"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {preview.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {preview.map((src, i) => (
                  <img key={i} src={src}
                    className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-black
            bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
          >
            🚀 Save Property
          </button>

        </div>
      </div>
    </div>
  );
}










