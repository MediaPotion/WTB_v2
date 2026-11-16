import { sendToMediaPotion } from "./sendToMediaPotion";

jest.mock("./exportPdf", () => ({
  buildTimelinePdfBlob: () => Promise.resolve({ blob: new Blob(["%PDF-1.4"]), filename: "t.pdf" }),
}));

describe("sendToMediaPotion", () => {
  const exportParams = { bride: "Ava Smith", groom: "Liam" };
  let sent;
  beforeEach(() => {
    sent = null;
    global.fetch = jest.fn((url, init) => {
      sent = init.body;
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true }) });
    });
  });

  test("includes the shared timeline's link when there is one", async () => {
    await sendToMediaPotion({ exportParams, projectData: { userRows: [] }, link: "https://x.test/#edit=abc" });
    expect(sent.get("link")).toBe("https://x.test/#edit=abc");
    expect(sent.get("bride")).toBe("Ava");
    expect(sent.get("pdf")).toBeTruthy();
    expect(sent.get("json")).toBeTruthy();
  });

  test("no link field for a timeline that isn't shared", async () => {
    await sendToMediaPotion({ exportParams, projectData: { userRows: [] } });
    expect(sent.has("link")).toBe(false);
  });
});
