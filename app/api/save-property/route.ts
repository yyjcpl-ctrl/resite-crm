import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ===============================
    // ✅ SUPABASE CLIENT
    // ===============================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ===============================
    // ✅ INSERT (snake_case columns)
    // ===============================
    const { error: dbError } = await supabase
      .from("properties")
      .insert([
        {
          date: data.date,
          property_for: data.propertyFor,
          condition: data.condition,
          type: data.type,
          sub_type: data.subType,
          bedroom: data.bedroom,
          bath: data.bath,
          size: data.size,
          facing: data.facing,
          total_floor: data.totalFloor,
          floor_no: data.floorNo,
          road: data.road,
          furnished: data.furnished,
          parking: data.parking,
          contact: data.contact,
          reference_by: data.referenceBy,
          project_name: data.projectName,
          address: data.address,
          additional: data.additional,
          min_price: data.minPrice,
          max_price: data.maxPrice,
          file_base64: data.fileBase64,
          file_type: data.fileType,
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