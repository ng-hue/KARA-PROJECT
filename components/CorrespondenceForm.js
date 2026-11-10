"use client";

import { useEffect, useState } from "react";
import {
  DIRECTIONS,
  SUMMARY_MAX_LENGTH,
  validateCorrespondence,
} from "@/lib/correspondenceRules";
import {
  createCorrespondence,
  createSignedAttachmentUrl,
  listCorrespondence,
} from "@/lib/correspondence";
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  validateAttachment,
} from "@/lib/attachmentRules";

const EMPTY = {
  direction: "",
  correspondence_date: "",
  sender: "",
  summary: "",
};

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:border-[#009B91] focus:outline-none";

function Field({
  label,
  name,
  error,
  hint,
  required = true,
  children,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-700">*</span>
        ) : null}
      </label>

      {children}

      {hint ? (
        <p className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Log one email or letter on a request (S4 US2, SCRUM-210).
// S4 US3 adds an optional attachment with client-side validation.
// onSaved receives the saved row so the page can refresh its list (S4 US4).
export default function CorrespondenceForm({
  requestId,
  onSaved,
}) {
  const [values, setValues] = useState(EMPTY);
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [errors, setErrors] = useState({});
  const [entries, setEntries] = useState([]);
  const [entriesError, setEntriesError] = useState("");
  const [openingAttachmentId, setOpeningAttachmentId] = useState("");
  const [attachmentOpenError, setAttachmentOpenError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let active = true;

    listCorrespondence(requestId)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((err) => {
        if (active) setEntriesError(err.message);
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  function update(e) {
    const { name, value } = e.target;

    setValues((v) => ({
      ...v,
      [name]: value,
    }));

    setSavedMessage("");
  }

  function handleAttachmentChange(e) {
    const file = e.target.files?.[0] || null;
    const error = validateAttachment(file);

    if (error) {
      setAttachment(null);
      setAttachmentError(error);
      e.target.value = "";
      return;
    }

    setAttachment(file);
    setAttachmentError("");
    setSavedMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const found = validateCorrespondence(values);
    const fileError = validateAttachment(attachment);

    setErrors(found);
    setAttachmentError(fileError);
    setSaveError("");
    setSavedMessage("");

    if (
      Object.keys(found).length > 0 ||
      fileError
    ) {
      return;
    }

    setSaving(true);

    try {
      const saved = await createCorrespondence(
        requestId,
        values,
        attachment
      );

      setEntries((current) =>
        [...current, saved].sort(
          (a, b) =>
            b.correspondence_date.localeCompare(a.correspondence_date) ||
            b.created_at.localeCompare(a.created_at)
        )
      );
      setValues(EMPTY);
      setAttachment(null);
      setAttachmentError("");
      setSavedMessage("Correspondence entry saved.");

      const fileInput =
        document.getElementById("attachment");

      if (fileInput) {
        fileInput.value = "";
      }

      if (onSaved) {
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenAttachment(entry) {
    setAttachmentOpenError("");
    const openedWindow = window.open("about:blank", "_blank");

    if (!openedWindow) {
      setAttachmentOpenError("Allow pop-ups to open the attachment.");
      return;
    }

    openedWindow.opener = null;
    setOpeningAttachmentId(entry.id);

    try {
      const signedUrl = await createSignedAttachmentUrl(entry.attachment_ref);
      openedWindow.location.replace(signedUrl);
    } catch (err) {
      openedWindow.close();
      setAttachmentOpenError(err.message);
    } finally {
      setOpeningAttachmentId("");
    }
  }

  function aria(name) {
    return errors[name]
      ? {
          "aria-invalid": true,
          "aria-describedby": `${name}-error`,
        }
      : {};
  }

  const summaryLength =
    values.summary.trim().length;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold">
        Log Correspondence
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Record one email or letter exchanged with the agency.
        Fictional data only; do not name or describe a child,
        family, or case.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-5 space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Direction"
            name="direction"
            error={errors.direction}
          >
            <select
              id="direction"
              name="direction"
              value={values.direction}
              onChange={update}
              className={inputClass}
              {...aria("direction")}
            >
              <option value="">
                Choose a direction
              </option>

              {DIRECTIONS.map((d) => (
                <option
                  key={d.value}
                  value={d.value}
                >
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Date"
            name="correspondence_date"
            error={errors.correspondence_date}
            hint="The date on the message, as MM/DD/YYYY."
          >
            <input
              id="correspondence_date"
              name="correspondence_date"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              value={values.correspondence_date}
              onChange={update}
              className={inputClass}
              {...aria("correspondence_date")}
            />
          </Field>
        </div>

        <Field
          label="Sender"
          name="sender"
          error={errors.sender}
          hint="The person or office that sent it, as written on the message."
        >
          <input
            id="sender"
            name="sender"
            value={values.sender}
            onChange={update}
            className={inputClass}
            {...aria("sender")}
          />
        </Field>

        <Field
          label="Summary"
          name="summary"
          error={errors.summary}
          hint={`${summaryLength} of ${SUMMARY_MAX_LENGTH} characters. One to three sentences on what the message says or asks.`}
        >
          <textarea
            id="summary"
            name="summary"
            rows={3}
            value={values.summary}
            onChange={update}
            className={inputClass}
            {...aria("summary")}
          />
        </Field>

        <Field
          label="Attachment"
          name="attachment"
          error={attachmentError}
          required={false}
          hint="Optional. One PDF, PNG, JPG, or DOCX file up to 10 MB."
        >
          <input
            id="attachment"
            name="attachment"
            type="file"
            accept={ATTACHMENT_ACCEPT}
            onChange={handleAttachmentChange}
            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#012929] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#023d3d]"
            aria-invalid={
              attachmentError ? true : undefined
            }
            aria-describedby={
              attachmentError
                ? "attachment-error"
                : undefined
            }
          />

          {attachment ? (
            <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <p className="font-medium">
                {attachment.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {formatFileSize(attachment.size)}
              </p>
            </div>
          ) : null}
        </Field>

        {saveError ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            Could not save the entry: {saveError}
          </p>
        ) : null}

        {savedMessage ? (
          <p
            role="status"
            className="rounded-md bg-green-50 p-3 text-sm text-green-900"
          >
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

      <div className="mt-8 border-t border-gray-100 pt-5">
        <h3 className="text-base font-semibold">Saved Correspondence</h3>

        {entriesError ? (
          <p className="mt-3 text-sm text-red-700">
            Could not load correspondence: {entriesError}
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">
            No correspondence entries yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {entries.map((entry) => (
              <li key={entry.id} className="py-3 text-sm">
                <p className="font-medium">
                  {entry.direction === "incoming" ? "Incoming" : "Outgoing"}{" "}
                  · {entry.correspondence_date} · {entry.sender}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {entry.summary}
                </p>
                {entry.attachment_ref ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAttachment(entry)}
                    disabled={openingAttachmentId === entry.id}
                    className="mt-2 text-[#007a72] underline disabled:opacity-60"
                  >
                    {openingAttachmentId === entry.id
                      ? "Opening attachment..."
                      : entry.attachment_ref.split("/").pop()}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {attachmentOpenError ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Could not open attachment: {attachmentOpenError}
          </p>
        ) : null}
      </div>
    </section>
  );
}