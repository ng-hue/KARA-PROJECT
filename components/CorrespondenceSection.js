"use client";

import { useCallback, useEffect, useState } from "react";
import CorrespondenceForm from "@/components/CorrespondenceForm";
import { listCorrespondence } from "@/lib/correspondence";
import { DIRECTIONS } from "@/lib/correspondenceRules";
import { formatDate } from "@/lib/format";

const DIRECTION_STYLES = {
  outgoing: "bg-blue-100 text-blue-800",
  incoming: "bg-teal-100 text-teal-800",
};

function DirectionBadge({ direction }) {
  const match = DIRECTIONS.find((d) => d.value === direction);

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        DIRECTION_STYLES[direction] || "bg-gray-100 text-gray-700"
      }`}
    >
      {match ? match.label : direction}
    </span>
  );
}

export default function CorrespondenceSection({ requestId }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const rows = await listCorrespondence(requestId);
      setEntries(rows);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [requestId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return (
    <>
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">
          Correspondence{entries ? ` (${entries.length})` : ""}
        </h2>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            Could not load correspondence: {error}
          </p>
        ) : !entries ? (
          <p className="mt-4 text-sm text-gray-600">Loading correspondence...</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No correspondence recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {entries.map((entry) => (
              <li key={entry.id} className="py-4 text-sm first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">{formatDate(entry.correspondence_date)}</span>
                  <DirectionBadge direction={entry.direction} />
                  <span className="text-gray-600">{entry.sender}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{entry.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6">
        <CorrespondenceForm requestId={requestId} onSaved={loadEntries} />
      </div>
    </>
  );
}
