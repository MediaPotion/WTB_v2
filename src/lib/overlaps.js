function computeOverlaps(rows) {
  // Returns Map<id, string> — each overlapping row ID mapped to the name it conflicts with.
  // TIME CONSTRAINT blocks (duration 0) are excluded.
  const sorted = [...rows]
    .filter(r => r.type !== "constraint")
    .sort((a, b) => a.time - b.time);
  const result = new Map();
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.time < prev.time + prev.duration) {
      if (!result.has(curr.id)) result.set(curr.id, prev.event || "previous event");
      if (!result.has(prev.id)) result.set(prev.id, curr.event || "next event");
    }
  }
  return result;
}

export { computeOverlaps };
