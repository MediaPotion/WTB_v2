import React, { useState } from "react";
import { QUICK_START_DEFAULTS } from "../lib/quickStart";
import { formatTime, parseTimeInput, MINUTE_OPTIONS_5 } from "../lib/time";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const COVERAGE_HOURS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

function TimeSelect({ value, onChange, label }) {
  const t = formatTime(value);
  const set = (h, m, p) => onChange(parseTimeInput(h, m, p));
  return (
    <span className="wtb-qs-time" role="group" aria-label={label}>
      <select aria-label={`${label} hour`} value={t.hour} onChange={(e) => set(e.target.value, t.minute, t.period)}>
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span aria-hidden>:</span>
      <select aria-label={`${label} minute`} value={t.minute} onChange={(e) => set(t.hour, e.target.value, t.period)}>
        {MINUTE_OPTIONS_5.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select aria-label={`${label} AM or PM`} value={t.period} onChange={(e) => set(t.hour, t.minute, e.target.value)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </span>
  );
}

function Choice({ value, options, onChange, label }) {
  return (
    <span className="wtb-qs-choice" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? "is-on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

/**
 * Phase 3 quick start: one short screen of questions, every one pre-filled,
 * then a full-day draft in the editor.
 */
function QuickStartScreen({ onBuild, onBlank, onBack }) {
  const [a, setA] = useState(QUICK_START_DEFAULTS);
  const set = (key) => (value) => setA((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="wtb-qs">
      <h1>Let&rsquo;s sketch your day</h1>
      <p className="wtb-qs-lead">
        A few quick answers and we&rsquo;ll draft a full timeline you can change. Everything is filled in already, so skip anything you&rsquo;re unsure about.
      </p>

      <form
        className="wtb-qs-card"
        onSubmit={(e) => {
          e.preventDefault();
          onBuild(a);
        }}
      >
        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Your names <em>(optional)</em></span>
          <span className="wtb-qs-names">
            <input aria-label="First partner's name" placeholder="First name" value={a.bride} onChange={(e) => set("bride")(e.target.value)} />
            <span aria-hidden>&amp;</span>
            <input aria-label="Second partner's name" placeholder="First name" value={a.groom} onChange={(e) => set("groom")(e.target.value)} />
          </span>
        </div>

        <label className="wtb-qs-row">
          <span className="wtb-qs-label">Wedding date <em>(optional)</em></span>
          <input type="date" value={a.date} onChange={(e) => set("date")(e.target.value)} />
        </label>

        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Ceremony starts at</span>
          <TimeSelect label="Ceremony start" value={a.ceremonyTime} onChange={set("ceremonyTime")} />
        </div>

        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Ceremony length</span>
          <Choice
            label="Ceremony length"
            value={a.ceremonyLength}
            onChange={set("ceremonyLength")}
            options={[
              { value: 30, label: "About 30 min" },
              { value: 60, label: "Full Mass, about 1 hr" },
            ]}
          />
        </div>

        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Seeing each other before the ceremony (first look)?</span>
          <Choice
            label="First look"
            value={a.firstLook}
            onChange={set("firstLook")}
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
          />
        </div>

        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Ceremony and reception</span>
          <Choice
            label="Ceremony and reception venues"
            value={a.twoVenues}
            onChange={set("twoVenues")}
            options={[
              { value: false, label: "Same place" },
              { value: true, label: "Two places" },
            ]}
          />
        </div>

        <div className="wtb-qs-row">
          <span className="wtb-qs-label">Photo &amp; video coverage</span>
          <span className="wtb-qs-coverage">
            <span>from</span>
            <TimeSelect label="Coverage start" value={a.coverageStart} onChange={set("coverageStart")} />
            <span>for</span>
            <select aria-label="Coverage hours" value={a.coverageHours} onChange={(e) => set("coverageHours")(Number(e.target.value))}>
              {COVERAGE_HOURS.map((h) => <option key={h} value={h}>{h} hours</option>)}
            </select>
          </span>
        </div>

        <button type="submit" className="wtb-qs-build">Build my draft timeline</button>
      </form>

      <div className="wtb-qs-alt">
        <button type="button" onClick={onBlank}>Start with a blank timeline instead</button>
        {onBack && <button type="button" onClick={onBack}>Back</button>}
      </div>
    </div>
  );
}

export { QuickStartScreen };
