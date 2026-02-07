interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const TAG_COLORS: Record<string, string> = {
  PvE: "bg-green-900/50 text-green-300 border-green-700",
  PvP: "bg-red-900/50 text-red-300 border-red-700",
  Solo: "bg-blue-900/50 text-blue-300 border-blue-700",
  Group: "bg-purple-900/50 text-purple-300 border-purple-700",
  Beginner: "bg-teal-900/50 text-teal-300 border-teal-700",
  Advanced: "bg-orange-900/50 text-orange-300 border-orange-700",
  Meta: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  Fun: "bg-pink-900/50 text-pink-300 border-pink-700",
  Tank: "bg-slate-700/50 text-slate-300 border-slate-600",
  DPS: "bg-red-800/50 text-red-200 border-red-600",
  Support: "bg-cyan-900/50 text-cyan-300 border-cyan-700",
  Healer: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
};

const DEFAULT_COLOR = "bg-gray-800 text-gray-300 border-gray-600";

export default function Tag({ label, active, onClick }: TagProps) {
  const colorClass = TAG_COLORS[label] || DEFAULT_COLOR;
  const activeClass = active ? "ring-2 ring-amber-400" : "";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-block text-xs px-2 py-1 rounded border ${colorClass} ${activeClass} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={`inline-block text-xs px-2 py-1 rounded border ${colorClass}`}
    >
      {label}
    </span>
  );
}
