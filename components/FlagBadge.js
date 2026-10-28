const TONES = {
  urgent: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-900",
};

// Renders the flag from getRequestFlag, or nothing when there is none.
export default function FlagBadge({ flag }) {
  if (!flag) return null;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        TONES[flag.tone] || TONES.warning
      }`}
    >
      {flag.label}
    </span>
  );
}
