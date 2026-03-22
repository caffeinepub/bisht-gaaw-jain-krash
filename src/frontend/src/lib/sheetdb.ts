const SHEETDB_URL = "https://sheetdb.io/api/v1/2g09849sfrxfm";

export async function sheetdbGetAll(type: string): Promise<any[]> {
  try {
    const res = await fetch(`${SHEETDB_URL}/search?type=${type}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function sheetdbAdd(row: Record<string, string>): Promise<void> {
  try {
    await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [row] }),
    });
  } catch {}
}

export async function sheetdbDeleteById(
  type: string,
  id: string,
): Promise<void> {
  try {
    await fetch(`${SHEETDB_URL}/type/${type}/id/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch {}
}

export async function sheetdbUpdateById(
  type: string,
  id: string,
  row: Record<string, string>,
): Promise<void> {
  try {
    await fetch(`${SHEETDB_URL}/type/${type}/id/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: row }),
    });
  } catch {}
}
