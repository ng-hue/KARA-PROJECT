// Turns "2026-10-08" into "10/08/2026" without time zone shifts.
export function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${m}/${d}/${y}`;
}
