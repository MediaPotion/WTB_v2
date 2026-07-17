import { buildTimelinePdfBlob } from "./exportPdf";

// URL of the PHP endpoint on Hostinger (see hostinger/send-timeline.php).
// Update this if you upload the script to a different path or domain.
const ENDPOINT_URL = "https://weddingpotion.com/wtb/send-timeline.php";

// Must match SECRET in hostinger/send-timeline.php.
const SHARED_SECRET = "46b8dc32b9ba8c17ad96c7237d352b0b953cd06ea8f8fb57";

/**
 * Generates the timeline PDF + project JSON in the browser and POSTs them to
 * the Hostinger endpoint, which emails both to info@mediapotion.net with the
 * subject "{Bride} & {Groom} Wedding Timeline".
 *
 * Throws on any failure; resolves on success.
 */
export async function sendToMediaPotion({ exportParams, projectData, jsonFilename }) {
  const { blob: pdfBlob, filename: pdfFilename } = await buildTimelinePdfBlob(exportParams);
  const jsonBlob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: "application/json",
  });

  const brideFirst = (exportParams.bride || "Bride").trim().split(/\s+/)[0];
  const groomFirst = (exportParams.groom || "Groom").trim().split(/\s+/)[0];

  const form = new FormData();
  form.append("secret", SHARED_SECRET);
  form.append("bride", brideFirst);
  form.append("groom", groomFirst);
  form.append("pdf", pdfBlob, pdfFilename);
  form.append("json", jsonBlob, jsonFilename || "wedding-timeline.json");

  let res;
  try {
    res = await fetch(ENDPOINT_URL, { method: "POST", body: form });
  } catch (err) {
    throw new Error("Could not reach the send service. Check your internet connection.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.ok !== true) {
    throw new Error((data && data.error) || `Send failed (HTTP ${res.status})`);
  }
  return data;
}
