"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { RotationAction } from "@/lib/validation";
import { computeTimeline, formatDuration } from "@/lib/rotation";
import RotationTimeline from "./RotationTimeline";

interface RotationEditorProps {
  actions: RotationAction[];
  onChange: (actions: RotationAction[]) => void;
  readOnly?: boolean;
}

const SKILL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function RotationEditor({
  actions,
  onChange,
  readOnly = false,
}: RotationEditorProps) {
  const [skillName, setSkillName] = useState("");
  const [castTime, setCastTime] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [buffDuration, setBuffDuration] = useState(0);
  const [notes, setNotes] = useState("");

  const timeline = computeTimeline(actions);

  const addAction = useCallback(() => {
    if (!skillName.trim()) return;

    const colorIndex = actions.length % SKILL_COLORS.length;
    const newAction: RotationAction = {
      id: nanoid(8),
      skillName: skillName.trim(),
      castTime: Math.max(0, castTime),
      cooldown: Math.max(0, cooldown),
      ...(buffDuration > 0 ? { buffDuration } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      color: SKILL_COLORS[colorIndex],
    };

    onChange([...actions, newAction]);
    setSkillName("");
    setNotes("");
  }, [skillName, castTime, cooldown, buffDuration, notes, actions, onChange]);

  const removeAction = (id: string) => {
    onChange(actions.filter((a) => a.id !== id));
  };

  const moveAction = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= actions.length) return;
    const newActions = [...actions];
    [newActions[index], newActions[newIndex]] = [
      newActions[newIndex],
      newActions[index],
    ];
    onChange(newActions);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Visualization */}
      {actions.length > 0 && (
        <RotationTimeline timeline={timeline} />
      )}

      {/* Add action form */}
      {!readOnly && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="rot-skill" className="block text-xs text-gray-400 mb-1">
                Skill Name
              </label>
              <input
                id="rot-skill"
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                maxLength={100}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="Skill name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAction();
                  }
                }}
              />
            </div>
            <div>
              <label htmlFor="rot-cast" className="block text-xs text-gray-400 mb-1">
                Cast Time (s)
              </label>
              <input
                id="rot-cast"
                type="number"
                value={castTime}
                onChange={(e) => setCastTime(parseFloat(e.target.value) || 0)}
                min={0}
                max={300}
                step={0.1}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="rot-cd" className="block text-xs text-gray-400 mb-1">
                Cooldown (s)
              </label>
              <input
                id="rot-cd"
                type="number"
                value={cooldown}
                onChange={(e) => setCooldown(parseFloat(e.target.value) || 0)}
                min={0}
                max={600}
                step={0.1}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="rot-buff" className="block text-xs text-gray-400 mb-1">
                Buff Duration (s)
              </label>
              <input
                id="rot-buff"
                type="number"
                value={buffDuration}
                onChange={(e) =>
                  setBuffDuration(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={600}
                step={0.1}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="rot-notes" className="block text-xs text-gray-400 mb-1">
                Notes
              </label>
              <input
                id="rot-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="Optional notes..."
              />
            </div>
            <button
              type="button"
              onClick={addAction}
              disabled={!skillName.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Action list */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">
            Actions ({actions.length})
          </h4>
          <div className="space-y-1">
            {actions.map((action, i) => (
              <div
                key={action.id}
                className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 text-sm"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: action.color || "#888" }}
                  aria-hidden="true"
                />
                <span className="text-white font-medium min-w-0 truncate">
                  {i + 1}. {action.skillName}
                </span>
                <span className="text-gray-400 shrink-0">
                  {action.castTime}s cast
                </span>
                {action.cooldown > 0 && (
                  <span className="text-gray-500 shrink-0">
                    / {action.cooldown}s CD
                  </span>
                )}
                {action.notes && (
                  <span
                    className="text-gray-500 truncate hidden md:inline"
                    title={action.notes}
                  >
                    — {action.notes}
                  </span>
                )}
                {!readOnly && (
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveAction(i, -1)}
                      disabled={i === 0}
                      className="text-gray-500 hover:text-white disabled:opacity-30 p-1"
                      aria-label={`Move ${action.skillName} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAction(i, 1)}
                      disabled={i === actions.length - 1}
                      className="text-gray-500 hover:text-white disabled:opacity-30 p-1"
                      aria-label={`Move ${action.skillName} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAction(action.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      aria-label={`Remove ${action.skillName}`}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {actions.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Timeline Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Total Duration</span>
              <p className="text-white font-mono">
                {formatDuration(timeline.totalDuration)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Active Cast Time</span>
              <p className="text-white font-mono">
                {formatDuration(timeline.totalCastTime)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Downtime (CD waits)</span>
              <p className="text-amber-400 font-mono">
                {formatDuration(timeline.totalDowntime)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Unique Skills</span>
              <p className="text-white font-mono">
                {Object.keys(timeline.skillUsageCounts).length}
              </p>
            </div>
          </div>
          {timeline.warnings.length > 0 && (
            <div className="mt-3 space-y-1">
              {timeline.warnings.map((w, i) => (
                <p key={i} className="text-amber-400 text-xs">
                  ⚠ {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
