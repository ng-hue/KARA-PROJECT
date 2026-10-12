"use client";

import { useState } from "react";
import Link from "next/link";
import { createRequest, validateRequest } from "@/lib/requests";
import { DEFAULT_STATUS, STATES, STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";

const EMPTY = {
  title: "",
  request_text: "",
  state: "",
  target_agency: "",
  date_sent: "",
  status: DEFAULT_STATUS,
};

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:border-[#009B91] focus:outline-none";

function Field({ label, name, error, required, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-red-700">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function NewRequestPage() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [saveError, setSaveError] = useState("");

  function update(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSave() {
    const found = validateRequest(values);
    setErrors(found);
    setSaveError("");
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      setSaved(await createRequest(values));
      setValues(EMPTY);
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

  if (saved) {
    return (
      <div className="max-w-xl rounded-lg border border-green-200 bg-green-50 p-6">
        <h1 className="text-xl font-semibold text-green-900">Request saved</h1>
        <p className="mt-2 text-green-900">
          "{saved.title}" was saved with status {saved.status}.
        </p>
        <p className="mt-1 text-green-900">
          Response deadline:{" "}
          {saved.deadline
            ? formatDate(saved.deadline)
            : `pending research for ${saved.state}`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/requests"
            className="rounded-md bg-[#012929] px-4 py-2 text-sm font-medium text-white"
          >
            View All Requests
          </Link>
          <button
            onClick={() => setSaved(null)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium"
          >
            Log Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">New Request</h1>
      <p className="mt-1 text-sm text-gray-600">
        The response deadline is calculated from the state and date sent.
      </p>

      <div className="mt-6 space-y-5">
        <Field label="Title" name="title" error={errors.title} required>
          <input id="title" name="title" value={values.title} onChange={update} className={inputClass} {...aria("title")} />
        </Field>

        <Field label="Request Text" name="request_text" error={errors.request_text} required>
          <textarea id="request_text" name="request_text" rows={5} value={values.request_text} onChange={update} className={inputClass} {...aria("request_text")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="State" name="state" error={errors.state} required>
            <select id="state" name="state" value={values.state} onChange={update} className={inputClass} {...aria("state")}>
              <option value="">Choose a state</option>
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date Sent" name="date_sent" error={errors.date_sent} required>
            <input id="date_sent" name="date_sent" type="date" value={values.date_sent} onChange={update} className={inputClass} {...aria("date_sent")} />
          </Field>
        </div>

        <Field label="Target Agency" name="target_agency" error={errors.target_agency} required>
          <input id="target_agency" name="target_agency" value={values.target_agency} onChange={update} className={inputClass} {...aria("target_agency")} />
        </Field>

        <Field label="Status" name="status" error={errors.status}>
          <select id="status" name="status" value={values.status} onChange={update} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        {saveError ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            Could not save the request: {saveError}
          </p>
        ) : null}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-md bg-[#012929] px-4 py-2.5 font-medium text-white hover:bg-[#023d3d] disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Request"}
        </button>
      </div>
    </div>
  );
}