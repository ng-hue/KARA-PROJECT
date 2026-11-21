// One color per Sprint 5 status (lib/constants.js STATUSES), so a refused
// request never looks like a provided one.
const STYLES = {
  Drafted: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-800",
  Acknowledged: "bg-indigo-100 text-indigo-800",
  Provided: "bg-green-100 text-green-800",
  Partial: "bg-teal-100 text-teal-800",
  Refused: "bg-red-100 text-red-800",
  "No response by deadline": "bg-orange-100 text-orange-900",
  Withdrawn: "border border-dashed border-gray-400 bg-white text-gray-600",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] || STYLES.Drafted
      }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
