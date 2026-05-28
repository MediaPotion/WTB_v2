import { prepareTimelineExportRows, layoutPreviewPages, layoutPdfPages } from "./exportPdf";

describe("prepareTimelineExportRows", () => {
  it("sorts rows by time ascending", () => {
    const rows = [
      { id: 2, time: 16 * 60 + 10, event: "Ceremony: Audio/Video Setup" },
      { id: 1, time: 15 * 60 + 15, event: "Group Photos: Family" },
    ];
    const out = prepareTimelineExportRows(rows);
    expect(out.map((r) => r.id)).toEqual([1, 2]);
  });

  it("removes duplicate row ids", () => {
    const rows = [
      { id: 1, time: 100, event: "Group Photos: Family" },
      { id: 1, time: 100, event: "Group Photos: Family" },
      { id: 2, time: 200, event: "Ceremony: Audio/Video Setup" },
    ];
    const out = prepareTimelineExportRows(rows);
    expect(out).toHaveLength(2);
    expect(out.map((r) => r.id)).toEqual([1, 2]);
  });
});

describe("layoutPreviewPages", () => {
  it("paginates prepared rows without duplication across pages", () => {
    const rows = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      time: 12 * 60 + i * 15,
      event: `Event ${i}`,
      duration: 30,
      type: "event",
    }));
    const pages = layoutPreviewPages(rows);
    const flat = pages.flat();
    const ids = flat.map((r) => r.id);
    expect(ids.length).toBe(new Set(ids).size);
    expect(ids.length).toBe(rows.length);
  });
});

describe("layoutPdfPages", () => {
  it("fits multiple event rows per page (not one row per page)", () => {
    const rows = Array.from({ length: 22 }, (_, i) => ({
      id: i + 1,
      time: 12 * 60 + i * 15,
      event: `Details: Event ${i}`,
      duration: 30,
      type: "event",
    }));
    const pages = layoutPdfPages(rows, null);
    const previewPages = layoutPreviewPages(rows);
    expect(pages.length).toBeLessThan(22);
    expect(pages.length).toBe(previewPages.length);
    expect(pages.flat()).toHaveLength(22);
  });
});
