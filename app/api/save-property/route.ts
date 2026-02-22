import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ===============================
    // ✅ SUPABASE INSERT (MAIN DB)
    // ===============================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabase
      .from("properties")
      .insert([
        {
          date: data.date,
          propertyFor: data.propertyFor,
          condition: data.condition,
          type: data.type,
          subType: data.subType,
          bedroom: data.bedroom,
          bath: data.bath,
          size: data.size,
          facing: data.facing,
          totalFloor: data.totalFloor,
          floorNo: data.floorNo,
          road: data.road,
          furnished: data.furnished,
          parking: data.parking,
          contact: data.contact,
          referenceBy: data.referenceBy,
          projectName: data.projectName,
          address: data.address,
          additional: data.additional,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          fileBase64: data.fileBase64,
          fileType: data.fileType,
          files: data.files,
        },
      ]);

    console.log("SUPABASE ERROR:", dbError);

    if (dbError) {
      return Response.json({ success: false, error: dbError.message });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("API ERROR:", error);
    return Response.json({ success: false, error: String(error) });
  }
}