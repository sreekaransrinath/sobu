export async function fetchSheetRows() {
  const id = process.env.NEXT_PUBLIC_SHEET_ID;
  const key = process.env.NEXT_PUBLIC_GSHEETS_API_KEY;
  const range = encodeURIComponent(process.env.NEXT_PUBLIC_SHEET_RANGE || "Sheet1");
  if (!id || !key) throw new Error("Missing env vars");

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: "Unknown API error" } }));
    console.error("Google Sheets API Error:", errorData);
    throw new Error(`Sheets API error: ${errorData?.error?.message || res.statusText}`);
  }
  const json: { values: string[][] } = await res.json();
  const [headers, ...rows] = json.values;
  return rows.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
}
