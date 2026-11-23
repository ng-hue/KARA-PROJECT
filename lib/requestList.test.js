// List sorting and filters for Sprint 5, checked against the seed scenario.
// Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WAITING_FILTER,
  applyFilters,
  filtersToQuery,
  parseFilters,
  sortForList,
  withDeadlines,
} from "./requestList.js";

const today = "2026-10-26";

// CA deadlines are date sent + 10 calendar days.
const rows = withDeadlines(
  [
    {
      id: "drafted",
      state: "CA",
      status: "Drafted",
      date_sent: null,
    },
    {
      id: "soon-6",
      state: "CA",
      status: "Sent",
      date_sent: "2026-10-22",
    },
    {
      id: "late-2",
      state: "CA",
      status: "Sent",
      date_sent: "2026-10-10",
    },
    {
      id: "provided",
      state: "CA",
      status: "Provided",
      date_sent: "2026-09-01",
    },
    {
      id: "soon-4",
      state: "CA",
      status: "Acknowledged",
      date_sent: "2026-10-20",
    },
    {
      id: "late-1",
      state: "CA",
      status: "Acknowledged",
      date_sent: "2026-10-01",
    },
    {
      id: "later",
      state: "CA",
      status: "Sent",
      date_sent: "2026-10-25",
    },
  ],
  today
);

describe("withDeadlines", () => {
  it("Drafted has no deadline", () => {
    assert.equal(
      rows.find((r) => r.id === "drafted").deadlineInfo,
      null
    );
  });
});

describe("sortForList", () => {
  it("overdue first, then deadline ascending, no deadline last", () => {
    assert.deepEqual(
      sortForList(rows).map((r) => r.id),
      [
        "late-1",
        "late-2",
        "provided",
        "soon-4",
        "soon-6",
        "later",
        "drafted",
      ]
    );
  });
});

describe("rows with missing values", () => {
  it("null status and date_sent sort last without errors and are never flagged", () => {
    const messy = withDeadlines(
      [
        {
          id: "no-date",
          state: "CA",
          status: "Sent",
          date_sent: null,
        },
        {
          id: "no-status",
          state: "CA",
          status: null,
          date_sent: "2026-10-01",
        },
        ...rows,
      ],
      today
    );

    const sorted = sortForList(messy);

    assert.equal(sorted[0].id, "late-1");

    assert.equal(
      messy.find((r) => r.id === "no-date").flag,
      null
    );

    assert.equal(
      messy.find((r) => r.id === "no-status").flag,
      null
    );
  });
});

describe("applyFilters", () => {
  it("overdue filter", () => {
    assert.deepEqual(
      applyFilters(rows, {
        status: "",
        flag: "overdue",
      })
        .map((r) => r.id)
        .sort(),
      ["late-1", "late-2"]
    );
  });

  it("due soon filter", () => {
    assert.deepEqual(
      applyFilters(rows, {
        status: "",
        flag: "due_soon",
      })
        .map((r) => r.id)
        .sort(),
      ["soon-4", "soon-6"]
    );
  });

  it("status and flag together", () => {
    assert.deepEqual(
      applyFilters(rows, {
        status: "Sent",
        flag: "overdue",
      }).map((r) => r.id),
      ["late-2"]
    );
  });

  it("waiting filter returns Sent and Acknowledged rows only", () => {
    assert.deepEqual(
      applyFilters(rows, { status: WAITING_FILTER, flag: "", state: "" })
        .map((r) => r.id)
        .sort(),
      ["late-1", "late-2", "later", "soon-4", "soon-6"]
    );
  });

  it("state filter", () => {
    const mixed = withDeadlines(
      [
        { id: "ak", state: "AK", status: "Sent", date_sent: "2026-10-20" },
        ...rows,
      ],
      today
    );
    assert.deepEqual(
      applyFilters(mixed, { status: "", flag: "", state: "AK" }).map((r) => r.id),
      ["ak"]
    );
  });

  it("no filters returns every row", () => {
    assert.equal(
      applyFilters(rows, {
        status: "",
        flag: "",
      }).length,
      rows.length
    );
  });
});

describe("query string", () => {
  it("round trips", () => {
    const query = filtersToQuery({
      status: "Sent",
      flag: "overdue",
    });

    assert.equal(
      query,
      "?status=Sent&flag=overdue"
    );

    assert.deepEqual(
      parseFilters(
        new URLSearchParams(query)
      ),
      {
        status: "Sent",
        flag: "overdue",
        state: "",
      }
    );
  });

  it("round trips the state filter", () => {
    const query = filtersToQuery({ status: "Sent", flag: "", state: "AK" });
    assert.equal(query, "?status=Sent&state=AK");
    assert.deepEqual(parseFilters(new URLSearchParams(query)), {
      status: "Sent",
      flag: "",
      state: "AK",
    });
  });

  it("round trips the waiting filter", () => {
    const query = filtersToQuery({ status: WAITING_FILTER, flag: "", state: "" });
    assert.equal(query, "?status=waiting");
    assert.equal(parseFilters(new URLSearchParams(query)).status, WAITING_FILTER);
  });

  it("ignores unknown values", () => {
    assert.deepEqual(
      parseFilters(
        new URLSearchParams(
          "?status=Lost&flag=late&state=ZZ"
        )
      ),
      {
        status: "",
        flag: "",
        state: "",
      }
    );

    assert.equal(
      filtersToQuery({
        status: "",
        flag: "",
      }),
      ""
    );
  });
});