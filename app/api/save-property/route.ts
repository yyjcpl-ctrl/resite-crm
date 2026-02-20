import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ✅ env check (important)
    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      throw new Error("Missing Google environment variables");
    }

    // ✅ auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ row mapping
    const row = [
      data.date || "",
      data.propertyFor || "",
      data.condition || "",
      data.type || "",
      data.bedroom || "",
      data.bath || "",
      data.size || "",
      data.facing || "",
      data.totalFloor || "",
      data.floorNo || "",
      data.road || "",
      data.furnished || "",
      data.parking || "",
      data.contact || "",
      data.referenceBy || "",
      data.projectName || "",
      data.address || "",
      data.additional || "",
      data.minPrice || "",
      data.maxPrice || "",
      data.fileBase64 || "",
      data.fileType || "",
    ];

    // ✅ append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPERTY Sheet!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error(
      "SHEET ERROR FULL:",
      error?.response?.data || error
    );

    return Response.json({
      success: false,
      error: String(error),
    });
  }
}

