import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {

    const formData = await req.formData();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const data = {
      property_id: formData.get("property_id"),
      date: formData.get("date"),

      property_for: formData.get("property_for"),
      type: formData.get("type"),
      sub_type: formData.get("sub_type"),
      condition: formData.get("condition"),

      bedroom: formData.get("bedroom"),
      bath: formData.get("bath"),

      size: formData.get("size"),
      facing: formData.get("facing"),

      total_floor: formData.get("total_floor"),
      floor_no: formData.get("floor_no"),

      road: formData.get("road"),

      furnished: formData.get("furnished"),
      parking: formData.get("parking"),

      contact_mobile: formData.get("contact_mobile"),
      reference_by: formData.get("reference_by"),

      project_name: formData.get("project_name"),
      address: formData.get("address"),

      additional: formData.get("additional"),

      min_price: formData.get("min_price"),
      max_price: formData.get("max_price"),
    };

    console.log("INSERT DATA:", data);

    const { error } = await supabase
      .from("properties")
      .insert([data]);

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return Response.json({ success: false, error: error.message });
    }

    return Response.json({ success: true });

  } catch (err: any) {

    console.log("API ERROR:", err);

    return Response.json({
      success: false,
      error: err.message,
    });

  }
}