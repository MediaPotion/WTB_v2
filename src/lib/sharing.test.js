import { parseShareHash, buildShareLinks, createApi, ConflictError, sharingEnabled, formatWhen } from "./sharing";

const KEY = "0123456789abcdef0123456789abcdef";

describe("parseShareHash", () => {
  test("edit and view links", () => {
    expect(parseShareHash(`#edit=${KEY}`)).toEqual({ role: "edit", key: KEY });
    expect(parseShareHash(`#view=${KEY}`)).toEqual({ role: "view", key: KEY });
  });
  test("anything else is not a share link", () => {
    expect(parseShareHash("")).toBeNull();
    expect(parseShareHash("#edit=short")).toBeNull();
    expect(parseShareHash(`#admin=${KEY}`)).toBeNull();
    expect(parseShareHash(`#edit=${KEY.toUpperCase()}`)).toBeNull();
  });
});

describe("buildShareLinks", () => {
  test("puts the keys in the hash of the page address", () => {
    expect(buildShareLinks({ editKey: KEY, viewKey: "v".repeat(32) }, "https://example.test/wtb/#edit=old")).toEqual({
      edit: `https://example.test/wtb/#edit=${KEY}`,
      view: `https://example.test/wtb/#view=${"v".repeat(32)}`,
    });
  });
  test("a viewer has no edit link", () => {
    expect(buildShareLinks({ viewKey: KEY }, "https://x.test/").edit).toBeNull();
  });
});

test("sharing is off without an API address", () => {
  expect(sharingEnabled("")).toBe(false);
  expect(sharingEnabled("https://x.test/timeline-api.php")).toBe(true);
});

describe("createApi", () => {
  const reply = (status, body) => jest.fn().mockResolvedValue({ status, ok: status < 300, json: () => Promise.resolve(body) });

  test("save sends the base version and returns the new one", async () => {
    const fetchImpl = reply(200, { ok: true, version: 4, updatedAt: "2026-11-16T10:00:00Z" });
    const api = createApi("https://x.test/api.php", fetchImpl);
    await expect(api.save(KEY, { userRows: [] }, 3, "Ava")).resolves.toMatchObject({ version: 4 });
    const [, init] = fetchImpl.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ action: "save", key: KEY, data: { userRows: [] }, baseVersion: 3, name: "Ava" });
  });

  test("a 409 becomes a ConflictError carrying who saved last", async () => {
    const api = createApi(
      "https://x.test/api.php",
      reply(409, { ok: false, conflict: true, version: 5, updatedBy: "Liam", updatedAt: "2026-11-16T10:00:00Z" })
    );
    const err = await api.save(KEY, { userRows: [] }, 3, "Ava").catch((e) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect(err.info).toEqual({ version: 5, updatedBy: "Liam", updatedAt: "2026-11-16T10:00:00Z" });
  });

  test("load uses GET with the key in the query", async () => {
    const fetchImpl = reply(200, { ok: true, role: "view", data: { userRows: [] }, version: 1, comments: [] });
    await createApi("https://x.test/api.php", fetchImpl).load(KEY);
    expect(fetchImpl.mock.calls[0][0]).toBe(`https://x.test/api.php?action=load&key=${KEY}`);
    expect(fetchImpl.mock.calls[0][1].method).toBe("GET");
  });

  test("server errors and network failures surface as messages", async () => {
    await expect(createApi("u", reply(404, { ok: false, error: "Timeline not found" })).load(KEY)).rejects.toThrow("Timeline not found");
    await expect(createApi("u", jest.fn().mockRejectedValue(new Error("offline"))).load(KEY)).rejects.toThrow(/Could not reach/);
  });
});

test("formatWhen shows only the time for today", () => {
  const now = new Date("2026-11-16T15:00:00");
  expect(formatWhen(new Date("2026-11-16T09:05:00").toISOString(), now)).toBe("9:05 AM");
  expect(formatWhen(new Date("2026-11-10T09:05:00").toISOString(), now)).toBe("Nov 10, 9:05 AM");
  expect(formatWhen("nonsense", now)).toBe("");
});
