"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // ✅ added

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
    videos: [] as File[],
  };

  const [form, setForm] = useState<any>(initialForm);
  const [preview, setPreview] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string[]>([]);

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

  // ✅ Supabase upload helper
  const uploadMedia = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("property-media")
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("property-media")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  // ✅ MULTI FILE
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const arr = Array.from(files);

    const images = arr.filter((f) => f.type.startsWith("image"));
    const videos = arr.filter((f) => f.type.startsWith("video"));

    setForm((p: any) => ({
      ...p,
      files: images,
      videos: videos,
    }));

    // image preview
    const imgUrls = images.map((f) => URL.createObjectURL(f));
    setPreview(imgUrls);

    // ✅ LIMITED video preview (VERY IMPORTANT)
    const vidUrls = videos
      .slice(0, 6)
      .map((f) => URL.createObjectURL(f));

    setVideoPreview(vidUrls);
  };

  // 🔥 base64 (unchanged — tumne bola remove na kare)
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

      // ✅ sequential image upload
      if (form.files?.length) {
        const imageUrls: string[] = [];

        for (const file of form.files) {
          const url = await uploadMedia(file);
          imageUrls.push(url);
          await new Promise((r) => setTimeout(r, 200));
        }

        payload.imageUrls = imageUrls;
      }

      // ✅ sequential video upload (ULTRA IMPORTANT)
      if (form.videos?.length) {
        const videoUrls: string[] = [];

        for (const file of form.videos) {
          const url = await uploadMedia(file);
          videoUrls.push(url);
          await new Promise((r) => setTimeout(r, 300));
        }

        payload.videoUrls = videoUrls;
      }

      await fetch("/api/save-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("✅ Property Saved Successfully!");
      setForm(initialForm);
      setPreview([]);
      setVideoPreview([]);
    } catch (err) {
      console.error(err);
      alert("❌ Error saving property");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">
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

          {/* ❗ Rest of your UI SAME as before — untouched */}

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

            {videoPreview.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {videoPreview.map((src, i) => (
                  <video
                    key={i}
                    src={src}
                    controls
                    className="w-full h-40 object-cover rounded-lg"
                  />
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









