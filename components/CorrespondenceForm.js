"use client";

import { useState } from "react";
import {
  DIRECTIONS,
  SUMMARY_MAX_LENGTH,
  validateCorrespondence,
} from "@/lib/correspondenceRules";
import { createCorrespondence } from "@/lib/correspondence";

const EMPTY = {
  direction: "",
  correspondence_date: "",
  sender: "",
  summary: "",
};

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:border-[#009B91] focus:outline-none";

function Field({ label, name, error, hint, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        <span className="ml-0.5 text-red-700">*</span>
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Log one email or letter on a request (S4 US2, SCRUM-210).
// onSaved receives the saved row so the page can refresh its list (S4 US4).
export default function CorrespondenceForm({ requestId, onSaved }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  function update(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setSavedMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateCorrespondence(values);
    setErrors(found);
    setSaveError("");
    setSavedMessage("");
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const saved = await createCorrespondence(requestId, values);
      setValues(EMPTY);
      setSavedMessage("Correspondence entry saved.");
      if (onSaved) onSaved(saved);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function aria(name) {
    return errors[name]
      ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
      : {};
  }

  const summaryLength = values.summary.trim().length;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Log Correspondence</h2>
      <p className="mt-1 text-sm text-gray-600">
        Record one email or letter exchanged with the agency. Fictional data only; do not name or describe a child, family, or case.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Direction" name="direction" error={errors.direction}>
            <select id="direction" name="direction" value={values.direction} onChange={update} className={inputClass} {...aria("direction")}>
              <option value="">Choose a direction</option>
              {DIRECTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Date" name="correspondence_date" error={errors.correspondence_date} hint="The date on the message, as MM/DD/YYYY.">
            <input id="correspondence_date" name="correspondence_date" inputMode="numeric" placeholder="MM/DD/YYYY" value={values.correspondence_date} onChange={update} className={inputClass} {...aria("correspondence_date")} />
          </Field>
        </div>

        <Field label="Sender" name="sender" error={errors.sender} hint="The person or office that sent it, as written on the message.">
          <input id="sender" name="sender" value={values.sender} onChange={update} className={inputClass} {...aria("sender")} />
        </Field>

        <Field label="Summary" name="summary" error={errors.summary} hint={`${summaryLength} of ${SUMMARY_MAX_LENGTH} characters. One to three sentences on what the message says or asks.`}>
          <textarea id="summary" name="summary" rows={3} value={values.summary} onChange={update} className={inputClass} {...aria("summary")} />
        </Field>

        {saveError ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            Could not save the entry: {saveError}
          </p>
        ) : null}

        {savedMessage ? (
          <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-900">
            {savedMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-[#012929] px-4 py-2.5 font-medium text-white hover:bg-[#023d3d] disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </section>
  );
}
