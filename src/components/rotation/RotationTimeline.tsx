"use client";

import type { TimelineSummary } from "@/lib/rotation";

interface RotationTimelineProps {
  timeline: TimelineSummary;
}

export default function RotationTimeline({ timeline }: RotationTimelineProps) {
  if (timeline.entries.length === 0 || timeline.totalDuration === 0) {
    return null;
  }

  const totalWidth = timeline.totalDuration;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-400">
        Visual Timeline
      </h4>

      {/* Timeline bar */}
      <div
        className="relative bg-gray-900 rounded-lg h-12 overflow-hidden border border-gray-700"
        role="img"
        aria-label={`Rotation timeline spanning ${totalWidth.toFixed(1)} seconds with ${timeline.entries.length} actions`}
      >
        {/* Downtime windows */}
        {timeline.downtimeWindows.map((w, i) => (
          <div
            key={`dt-${i}`}
            className="absolute top-0 h-full bg-yellow-900/30 border-x border-yellow-700/30"
            style={{
              left: `${(w.start / totalWidth) * 100}%`,
              width: `${(w.duration / totalWidth) * 100}%`,
            }}
            title={`Downtime: ${w.duration.toFixed(1)}s`}
          />
        ))}

        {/* Skill blocks */}
        {timeline.entries.map((entry, i) => {
          const width = (entry.action.castTime / totalWidth) * 100;
          const left = (entry.startTime / totalWidth) * 100;

          return (
            <div
              key={entry.action.id || i}
              className="absolute top-1 bottom-1 rounded flex items-center justify-center text-xs text-white font-medium overflow-hidden px-1"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 1)}%`,
                backgroundColor: entry.action.color || "#6b7280",
                opacity: entry.isAvailable ? 1 : 0.6,
              }}
              title={`${entry.action.skillName}: ${entry.startTime.toFixed(1)}s - ${entry.endTime.toFixed(1)}s${entry.action.notes ? ` (${entry.action.notes})` : ""}`}
            >
              <span className="truncate">
                {width > 5 ? entry.action.skillName : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time markers */}
      <div className="relative h-4 text-xs text-gray-500">
        <span className="absolute left-0">0s</span>
        {totalWidth > 5 && (
          <span className="absolute left-1/4 -translate-x-1/2">
            {(totalWidth * 0.25).toFixed(1)}s
          </span>
        )}
        {totalWidth > 10 && (
          <span className="absolute left-1/2 -translate-x-1/2">
            {(totalWidth * 0.5).toFixed(1)}s
          </span>
        )}
        {totalWidth > 15 && (
          <span className="absolute left-3/4 -translate-x-1/2">
            {(totalWidth * 0.75).toFixed(1)}s
          </span>
        )}
        <span className="absolute right-0">
          {totalWidth.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
