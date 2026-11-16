import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConflictError,
  createApi,
  parseShareHash,
  buildShareLinks,
  getSavedName,
  setSavedName,
} from "../lib/sharing";

const SAVE_DELAY = 1200; // ms after the last change
const RETRY_DELAY = 10000; // ms after a failed save
// "edit=<key>" / "view=<key>" of the shared timeline in the local autosave, so
// "Restore" reopens that link instead of starting a separate copy.
const AUTOSAVE_SHARE_KEY = "wtb_autosave_share";

function readAutosaveShareLink() {
  try {
    return parseShareHash(localStorage.getItem(AUTOSAVE_SHARE_KEY) || "");
  } catch (_) {
    return null;
  }
}
function writeAutosaveShareKey(link) {
  try {
    if (link) localStorage.setItem(AUTOSAVE_SHARE_KEY, link);
    else localStorage.removeItem(AUTOSAVE_SHARE_KEY);
  } catch (_) {
    /* ignore storage errors */
  }
}
function setHash(hash) {
  const url = window.location.pathname + window.location.search + (hash ? `#${hash}` : "");
  window.history.replaceState(null, "", url);
}

/**
 * Phase 4: a timeline stored on the server under secret links.
 *
 * - Opening a "#edit=…" or "#view=…" link loads that timeline.
 * - With sharing on, a timeline gets its server copy (and links) as soon as
 *   it has content; after that every change is saved automatically.
 * - Saves send the version they're based on. If someone else saved first,
 *   saving stops and `conflict` says who; `reload()` fetches their version.
 * - View links are read-only (`readOnly`) but can add comments.
 */
function useSharedTimeline({
  enabled,
  apiUrl,
  screen,
  projectJson,
  isEmpty,
  applyProjectData,
  setScreen,
  clearDirty,
  isApplyingProjectRef,
  setVersionNotice,
}) {
  const api = useMemo(() => createApi(apiUrl), [apiUrl]);
  const [share, setShare] = useState(null); // { role, key, editKey?, viewKey, version, updatedBy, updatedAt }
  const [status, setStatus] = useState("idle"); // idle | loading | saving | saved | error | conflict
  const [conflict, setConflict] = useState(null); // { updatedBy, updatedAt }
  const [comments, setComments] = useState([]);
  const [myName, setMyNameState] = useState(getSavedName);
  const [retryTick, setRetryTick] = useState(0);
  const lastSavedJsonRef = useRef(null); // what the server has
  const baselinePendingRef = useRef(false); // next projectJson is the loaded state
  const busyRef = useRef(false); // a create/save is in flight
  const latestJsonRef = useRef(projectJson);
  latestJsonRef.current = projectJson;

  const setMyName = useCallback((name) => {
    setMyNameState(name);
    setSavedName(name);
  }, []);

  const adoptServerCopy = useCallback(
    (role, key, res) => {
      isApplyingProjectRef.current = true;
      applyProjectData(res.data);
      isApplyingProjectRef.current = false;
      clearDirty();
      baselinePendingRef.current = true;
      setShare({
        role,
        key,
        editKey: role === "edit" ? key : undefined,
        viewKey: role === "edit" ? res.viewKey : key,
        version: res.version,
        updatedBy: res.updatedBy,
        updatedAt: res.updatedAt,
      });
      setComments(res.comments || []);
      setConflict(null);
      setStatus("saved");
      setScreen("timeline");
      writeAutosaveShareKey(`${role}=${key}`);
    },
    [applyProjectData, clearDirty, isApplyingProjectRef, setScreen]
  );

  const open = useCallback(
    async (role, key) => {
      setStatus("loading");
      try {
        const res = await api.load(key);
        adoptServerCopy(res.role, key, res);
        setHash(`${res.role}=${key}`);
      } catch (err) {
        setStatus("idle");
        setHash("");
        setVersionNotice?.(`Couldn't open the shared timeline: ${err.message}`);
      }
    },
    [api, adoptServerCopy, setVersionNotice]
  );

  // Opening the app from a share link.
  useEffect(() => {
    if (!enabled) return;
    const link = parseShareHash(window.location.hash);
    if (link) open(link.role, link.key);
  }, [enabled]); // once, on start

  // The first render after loading is the server's state: nothing to save.
  useEffect(() => {
    if (baselinePendingRef.current) {
      baselinePendingRef.current = false;
      lastSavedJsonRef.current = projectJson;
    }
  }, [projectJson]);

  // Give a new timeline its server copy once it has content.
  useEffect(() => {
    if (!enabled || share || busyRef.current || screen !== "timeline" || isEmpty) return;
    if (status === "loading") return;
    busyRef.current = true;
    const json = latestJsonRef.current;
    setStatus("saving");
    api
      .create(JSON.parse(json), myName)
      .then((res) => {
        lastSavedJsonRef.current = json;
        setShare({
          role: "edit",
          key: res.editKey,
          editKey: res.editKey,
          viewKey: res.viewKey,
          version: res.version,
          updatedBy: myName,
          updatedAt: res.updatedAt,
        });
        setComments([]);
        setStatus("saved");
        setHash(`edit=${res.editKey}`);
        writeAutosaveShareKey(`edit=${res.editKey}`);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => setRetryTick((n) => n + 1), RETRY_DELAY);
      })
      .finally(() => {
        busyRef.current = false;
      });
  }, [enabled, share, screen, isEmpty, status, api, myName, retryTick]);

  // Save changes automatically (editors only, never over someone else's save).
  useEffect(() => {
    if (!share || share.role !== "edit" || status === "conflict") return undefined;
    if (baselinePendingRef.current || projectJson === lastSavedJsonRef.current) return undefined;
    const timer = setTimeout(() => {
      if (busyRef.current) return; // the effect runs again when that finishes
      busyRef.current = true;
      const json = latestJsonRef.current;
      setStatus("saving");
      api
        .save(share.editKey, JSON.parse(json), share.version, myName)
        .then((res) => {
          lastSavedJsonRef.current = json;
          setShare((s) => (s ? { ...s, version: res.version, updatedBy: myName, updatedAt: res.updatedAt } : s));
          setStatus("saved");
        })
        .catch((err) => {
          if (err instanceof ConflictError) {
            setConflict(err.info);
            setStatus("conflict");
          } else {
            setStatus("error");
            setTimeout(() => setRetryTick((n) => n + 1), RETRY_DELAY);
          }
        })
        .finally(() => {
          busyRef.current = false;
        });
    }, SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [projectJson, share, status, api, myName, retryTick]);

  const reload = useCallback(() => {
    if (share) open(share.role, share.key);
  }, [share, open]);

  // Leaving this timeline (new timeline, file loaded): forget the link.
  const stop = useCallback(() => {
    setShare(null);
    setComments([]);
    setConflict(null);
    setStatus("idle");
    lastSavedJsonRef.current = null;
    setHash("");
    writeAutosaveShareKey("");
  }, []);

  const addComment = useCallback(
    async (rowId, body) => {
      if (!share) throw new Error("This timeline isn't shared yet.");
      const res = await api.comment(share.key, rowId, myName, body);
      setComments((list) => [...list, res.comment]);
    },
    [api, share, myName]
  );

  const links = useMemo(
    () => (share ? buildShareLinks(share, window.location.href) : { edit: null, view: null }),
    [share]
  );

  return {
    share,
    status,
    conflict,
    comments,
    myName,
    setMyName,
    links,
    readOnly: share?.role === "view",
    open,
    reload,
    stop,
    addComment,
    autosaveShareLink: readAutosaveShareLink,
  };
}

export { useSharedTimeline };
