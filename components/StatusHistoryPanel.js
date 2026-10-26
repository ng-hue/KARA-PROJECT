"use client";

import { useEffect, useState } from "react";
import {
  changeRequestStatus,
  listStatusHistory,
} from "../lib/statusHistory";
import { getAllowedNextStatuses } from "../lib/statusTransitions";

export default function StatusHistoryPanel({
  requestId,
  currentStatus,
  onStatusChanged,
}) {
  const [history, setHistory] = useState([]);
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedStatuses = getAllowedNextStatuses(currentStatus);

  async function loadHistory() {
    try {
      const rows = await listStatusHistory(requestId);
      setHistory(rows);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [requestId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!nextStatus) return;

    setLoading(true);
    setError("");

    try {
      await changeRequestStatus(
        requestId,
        currentStatus,
        nextStatus,
        note
      );

      const updatedStatus = nextStatus;

      setNextStatus("");
      setNote("");

      await loadHistory();

      if (onStatusChanged) {
        onStatusChanged(updatedStatus);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="mt-1 text-sm text-gray-600">
          Current status:{" "}
          <span className="font-semibold text-gray-900">
            {currentStatus}
          </span>
        </p>
      </div>

      {allowedStatuses.length > 0 ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-gray-100 pt-5"
        >
          <div>
            <label
              htmlFor="next-status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Change status
            </label>

            <select
              id="next-status"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#007a72] focus:outline-none focus:ring-1 focus:ring-[#007a72]"
            >
              <option value="">Select next status</option>

              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status-note"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Note <span className="font-normal text-gray-500">(optional)</span>
            </label>

            <textarea
              id="status-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: Agency acknowledged by email"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007a72] focus:outline-none focus:ring-1 focus:ring-[#007a72]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[#007a72] px-4 py-2 text-sm font-medium text-white hover:bg-[#006860] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Change Status"}
          </button>
        </form>
      ) : (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm text-gray-600">
            No further status changes are available.
          </p>
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold">Status History</h3>

        {history.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No status history available.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {history.map((entry) => (
              <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900">
                  {entry.from_status
                    ? `${entry.from_status} → ${entry.to_status}`
                    : `Created as ${entry.to_status}`}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {new Date(entry.changed_at).toLocaleString()}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Changed by: {entry.changed_by || "System"}
                </p>

                {entry.note ? (
                  <p className="mt-2 text-sm text-gray-700">
                    {entry.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}