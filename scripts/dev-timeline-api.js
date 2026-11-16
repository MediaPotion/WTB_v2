#!/usr/bin/env node
/**
 * Local stand-in for hostinger/timeline-api.php, for development only.
 * Same requests and responses, data kept in memory (lost on restart).
 *
 *   npm run dev:api          # http://localhost:3001/timeline-api.php
 *   REACT_APP_TIMELINE_API=http://localhost:3001/timeline-api.php npm start
 *
 * Keep it in step with the PHP file when the API changes.
 */
const http = require("http");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3001;
const MAX_DATA_BYTES = 1048576;
const timelines = []; // { id, editHash, viewHash, viewKey, data, version, updatedBy, updatedAt }
const comments = []; // { id, timelineId, rowId, author, body, createdAt }

const keyHash = (k) => crypto.createHash("sha256").update("wtb:" + k).digest("hex");
const newKey = () => crypto.randomBytes(16).toString("hex");
const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const clean = (s, max) => String(s ?? "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, max).trim();

function send(res, code, payload) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}
const fail = (res, code, error, extra = {}) => send(res, code, { ok: false, error, ...extra });
const ok = (res, payload) => send(res, 200, { ok: true, ...payload });

function timelineJson(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.userRows)) return null;
  const json = JSON.stringify(data);
  return json.length > MAX_DATA_BYTES ? null : json;
}

function findByKey(key) {
  if (typeof key !== "string" || !/^[a-f0-9]{32}$/.test(key)) return [null];
  const h = keyHash(key);
  const asEdit = timelines.find((t) => t.editHash === h);
  if (asEdit) return [asEdit, "edit"];
  const asView = timelines.find((t) => t.viewHash === h);
  return asView ? [asView, "view"] : [null];
}

const commentsFor = (id) =>
  comments.filter((c) => c.timelineId === id).map(({ id: cid, rowId, author, body, createdAt }) => ({ id: cid, rowId, author, body, createdAt }));

function handle(req, res, input) {
  const action = input.action;
  const actions = ["create", "load", "save", "comment"];
  if (!actions.includes(action)) return fail(res, 400, "Unknown action");
  if ((action === "load") !== (req.method === "GET")) return fail(res, 405, "Wrong method for this action");

  if (action === "create") {
    const json = timelineJson(input.data);
    if (!json) return fail(res, 400, "That is not a timeline");
    const editKey = newKey();
    const viewKey = newKey();
    const t = {
      id: timelines.length + 1,
      editHash: keyHash(editKey),
      viewHash: keyHash(viewKey),
      viewKey,
      data: json,
      version: 1,
      updatedBy: clean(input.name, 80),
      updatedAt: nowIso(),
    };
    timelines.push(t);
    return ok(res, { editKey, viewKey, version: 1, updatedAt: t.updatedAt });
  }

  const [t, role] = findByKey(input.key);
  if (!t) return fail(res, 404, "Timeline not found");

  if (action === "load") {
    const payload = {
      role,
      data: JSON.parse(t.data),
      version: t.version,
      updatedBy: t.updatedBy,
      updatedAt: t.updatedAt,
      comments: commentsFor(t.id),
    };
    if (role === "edit") payload.viewKey = t.viewKey;
    return ok(res, payload);
  }

  if (action === "save") {
    if (role !== "edit") return fail(res, 403, "This link can only view the timeline");
    const json = timelineJson(input.data);
    if (!json) return fail(res, 400, "That is not a timeline");
    if (Number(input.baseVersion) !== t.version) {
      return fail(res, 409, "Someone else changed this timeline", {
        conflict: true,
        version: t.version,
        updatedBy: t.updatedBy,
        updatedAt: t.updatedAt,
      });
    }
    t.data = json;
    t.version += 1;
    t.updatedBy = clean(input.name, 80);
    t.updatedAt = nowIso();
    return ok(res, { version: t.version, updatedAt: t.updatedAt });
  }

  if (action === "comment") {
    const author = clean(input.author, 80);
    const body = clean(input.body, 2000);
    const rowId = clean(input.rowId, 40);
    if (!author || !body || !rowId) return fail(res, 400, "A comment needs a name, an event and some text");
    const c = { id: comments.length + 1, timelineId: t.id, rowId, author, body, createdAt: nowIso() };
    comments.push(c);
    const { timelineId, ...comment } = c;
    return ok(res, { comment });
  }
  return undefined;
}

http
  .createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === "GET") return handle(req, res, Object.fromEntries(url.searchParams));
    if (req.method !== "POST") return fail(res, 405, "GET or POST only");
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > MAX_DATA_BYTES + 4096) req.destroy();
    });
    req.on("end", () => {
      let input;
      try {
        input = JSON.parse(raw || "");
      } catch (_) {
        return fail(res, 400, "Expected JSON");
      }
      return handle(req, res, input || {});
    });
    return undefined;
  })
  .listen(PORT, () => console.log(`Dev timeline API on http://localhost:${PORT}/timeline-api.php`));
