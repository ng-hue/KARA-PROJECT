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

      setNextStatus("");
      setNote("");

      await loadHistory();

      if (onStatusChanged) {
        onStatusChanged(nextStatus);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Status</h2>

      <p>
        Current status: <strong>{currentStatus}</strong>
      </p>

      {allowedStatuses.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="next-status">Change status</label>

            <select
              id="next-status"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
              required
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
            <label htmlFor="status-note">Note (optional)</label>

            <textarea
              id="status-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: Agency acknowledged by email"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Change Status"}
          </button>
        </form>
      ) : (
        <p>No further status changes are available.</p>
      )}

      {error && <p>{error}</p>}

      <h3>Status History</h3>

      {history.length === 0 ? (
        <p>No status history available.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              <strong>
                {entry.from_status
                  ? `${entry.from_status} → ${entry.to_status}`
                  : `Created as ${entry.to_status}`}
              </strong>

              <div>
                {new Date(entry.changed_at).toLocaleString()}
              </div>

              {entry.note && <div>{entry.note}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}