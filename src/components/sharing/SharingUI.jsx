import React, { useState } from "react";
import { formatWhen } from "../../lib/sharing";

/** One line under the header: is it saved online, who edited last; or the conflict banner. */
function ShareStatus({ sharing, onOpenShare }) {
  const { share, status, conflict, reload, readOnly } = sharing;
  if (status === "conflict" && conflict) {
    return (
      <div className="wtb-share-banner wtb-share-banner--conflict" role="alert">
        <span>
          {conflict.updatedBy || "Someone"} changed this timeline
          {conflict.updatedAt ? ` at ${formatWhen(conflict.updatedAt)}` : ""}. Your latest change here was not saved
          online. Reload to see their version.
        </span>
        <button type="button" onClick={reload}>Reload</button>
      </div>
    );
  }
  if (status === "loading") return <div className="wtb-share-banner">Opening shared timeline…</div>;
  if (!share && status !== "error" && status !== "saving") return null;

  let text;
  if (readOnly) text = "View only · you can read the timeline and add comments";
  else if (status === "saving") text = "Saving online…";
  else if (status === "error") text = "Not saved online yet — will try again shortly. Your changes are kept in this browser.";
  else {
    const who = share.updatedBy ? ` by ${share.updatedBy}` : "";
    const when = share.updatedAt ? ` at ${formatWhen(share.updatedAt)}` : "";
    text = `Saved online · last edited${who}${when}`;
  }
  return (
    <div className={`wtb-share-banner${status === "error" ? " wtb-share-banner--warn" : ""}`} role="status">
      <span>{text}</span>
      {share && (
        <button type="button" onClick={onOpenShare}>
          {readOnly ? "Your name" : "Share"}
        </button>
      )}
    </div>
  );
}

function CopyField({ label, hint, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      /* the field is selectable as a fallback */
    }
  };
  return (
    <div className="wtb-share-link">
      <div className="wtb-share-link-label">{label}</div>
      <div className="wtb-share-link-hint">{hint}</div>
      <div className="wtb-share-link-row">
        <input readOnly value={value} onFocus={(e) => e.target.select()} aria-label={label} />
        <button type="button" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
      </div>
    </div>
  );
}

/** Your name (shown with your edits and comments) and, for editors, both links. */
function ShareDialog({ sharing, onClose }) {
  const { links, myName, setMyName, readOnly, share } = sharing;
  const [name, setName] = useState(myName);
  const close = () => {
    if (name.trim() !== myName) setMyName(name.trim());
    onClose();
  };
  return (
    <div className="wtb-preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="wtb-share-dialog" role="dialog" aria-modal="true" aria-label="Share this timeline">
        <div className="wtb-preview-dialog-head">
          <h2>{readOnly ? "Your name" : "Share this timeline"}</h2>
          <button type="button" onClick={close} aria-label="Close">✕</button>
        </div>
        <label className="wtb-share-name">
          <span>Your name — shown with your {readOnly ? "comments" : "changes and comments"}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ava, or Jamie (planner)" maxLength={80} />
        </label>
        {!readOnly && share && (
          <>
            {links.edit && (
              <CopyField
                label="Can edit"
                hint="For the two of you and anyone who should change the timeline. Keep it private."
                value={links.edit}
              />
            )}
            {links.view && (
              <CopyField
                label="Can view and comment"
                hint="For planners, family and other vendors. They can't change events."
                value={links.view}
              />
            )}
            <p className="wtb-share-note">
              Changes save online automatically. You can still save a copy to your device or export a PDF.
            </p>
          </>
        )}
        <button type="button" className="wtb-share-done" onClick={close}>Done</button>
      </div>
    </div>
  );
}

export { ShareStatus, ShareDialog };
