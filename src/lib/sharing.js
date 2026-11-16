/**
 * Shared timelines (Phase 4) — client for hostinger/timeline-api.php.
 *
 * Sharing is switched on only when the build sets REACT_APP_TIMELINE_API to
 * the API's URL. Without it the app behaves as before (files + this browser).
 *
 * Links carry the secret key in the URL hash (#edit=… / #view=…), which
 * browsers never send to the web server hosting the app.
 */

const API_URL = process.env.REACT_APP_TIMELINE_API || "";
const NAME_KEY = "wtb_name";

class ConflictError extends Error {
  constructor(info) {
    super("Someone else changed this timeline");
    this.name = "ConflictError";
    this.info = info; // { version, updatedBy, updatedAt }
  }
}

function sharingEnabled(apiUrl = API_URL) {
  return !!apiUrl;
}

/** "#edit=<32 hex>" / "#view=<32 hex>" → { role, key }, else null. */
function parseShareHash(hash) {
  const m = /^#?(edit|view)=([a-f0-9]{32})$/.exec(String(hash || "").trim());
  return m ? { role: m[1], key: m[2] } : null;
}

/** Both links for a timeline, from the page's address without its hash. */
function buildShareLinks({ editKey, viewKey }, pageUrl) {
  const base = String(pageUrl || "").split("#")[0];
  return {
    edit: editKey ? `${base}#edit=${editKey}` : null,
    view: viewKey ? `${base}#view=${viewKey}` : null,
  };
}

async function request(apiUrl, { method = "POST", body, query } = {}, fetchImpl = fetch) {
  const url = query ? `${apiUrl}?${new URLSearchParams(query)}` : apiUrl;
  let res;
  try {
    res = await fetchImpl(url, {
      method,
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
  } catch (_) {
    throw new Error("Could not reach the timeline service. Check your internet connection.");
  }
  const data = await res.json().catch(() => null);
  if (res.status === 409 && data?.conflict) {
    throw new ConflictError({ version: data.version, updatedBy: data.updatedBy, updatedAt: data.updatedAt });
  }
  if (!res.ok || !data || data.ok !== true) {
    throw new Error((data && data.error) || `Request failed (HTTP ${res.status})`);
  }
  return data;
}

function createApi(apiUrl = API_URL, fetchImpl = (...args) => fetch(...args)) {
  return {
    create: (data, name) => request(apiUrl, { body: { action: "create", data, name } }, fetchImpl),
    load: (key) => request(apiUrl, { method: "GET", query: { action: "load", key } }, fetchImpl),
    save: (key, data, baseVersion, name) =>
      request(apiUrl, { body: { action: "save", key, data, baseVersion, name } }, fetchImpl),
    comment: (key, rowId, author, body) =>
      request(apiUrl, { body: { action: "comment", key, rowId: String(rowId), author, body } }, fetchImpl),
  };
}

function getSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch (_) {
    return "";
  }
}
function setSavedName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch (_) {
    /* ignore storage errors */
  }
}

/** "3:42 PM" today, else "Jun 12, 3:42 PM". */
function formatWhen(iso, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toDateString() === now.toDateString()
    ? time
    : `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

export {
  API_URL,
  ConflictError,
  sharingEnabled,
  parseShareHash,
  buildShareLinks,
  createApi,
  getSavedName,
  setSavedName,
  formatWhen,
};
