import type { RotationAction } from "./validation";

/**
 * Rotation timeline computation.
 * Calculates timing, total duration, cooldown tracking, and downtime.
 */

export interface TimelineEntry {
  action: RotationAction;
  startTime: number;
  endTime: number;
  cooldownReady: number;
  isAvailable: boolean;
}

export interface TimelineSummary {
  entries: TimelineEntry[];
  totalDuration: number;
  totalCastTime: number;
  totalDowntime: number;
  downtimeWindows: Array<{ start: number; end: number; duration: number }>;
  skillUsageCounts: Record<string, number>;
  warnings: string[];
}

/**
 * Compute a timeline from a sequence of rotation actions.
 * Actions are executed in order. Each action starts after the previous ends.
 * Cooldowns are tracked per skill name.
 */
export function computeTimeline(actions: RotationAction[]): TimelineSummary {
  const entries: TimelineEntry[] = [];
  const cooldowns: Map<string, number> = new Map(); // skillName -> cooldownReady timestamp
  const usageCounts: Record<string, number> = {};
  const warnings: string[] = [];
  const downtimeWindows: Array<{
    start: number;
    end: number;
    duration: number;
  }> = [];

  let currentTime = 0;

  for (const action of actions) {
    const cooldownReady = cooldowns.get(action.skillName) ?? 0;
    const isAvailable = currentTime >= cooldownReady;

    // If skill is on cooldown, we wait (downtime)
    let startTime = currentTime;
    if (!isAvailable) {
      const waitTime = cooldownReady - currentTime;
      downtimeWindows.push({
        start: currentTime,
        end: cooldownReady,
        duration: waitTime,
      });
      warnings.push(
        `"${action.skillName}" on cooldown at ${currentTime.toFixed(1)}s, waiting ${waitTime.toFixed(1)}s`
      );
      startTime = cooldownReady;
    }

    const endTime = startTime + action.castTime;

    entries.push({
      action,
      startTime,
      endTime,
      cooldownReady,
      isAvailable,
    });

    // Track cooldown from when the skill was used
    if (action.cooldown > 0) {
      cooldowns.set(action.skillName, startTime + action.cooldown);
    }

    // Track usage
    usageCounts[action.skillName] =
      (usageCounts[action.skillName] ?? 0) + 1;

    currentTime = endTime;
  }

  const totalDuration =
    entries.length > 0 ? entries[entries.length - 1].endTime : 0;
  const totalCastTime = entries.reduce((sum, e) => sum + e.action.castTime, 0);
  const totalDowntime = downtimeWindows.reduce(
    (sum, w) => sum + w.duration,
    0
  );

  return {
    entries,
    totalDuration,
    totalCastTime,
    totalDowntime,
    downtimeWindows,
    skillUsageCounts: usageCounts,
    warnings,
  };
}

/**
 * Simulate N repetitions of a rotation to analyze sustained use.
 */
export function computeRepeatedTimeline(
  actions: RotationAction[],
  repetitions: number
): TimelineSummary {
  const clampedReps = Math.min(Math.max(repetitions, 1), 10);
  const repeated: RotationAction[] = [];

  for (let i = 0; i < clampedReps; i++) {
    for (const action of actions) {
      repeated.push({ ...action, id: `${action.id}-rep${i}` });
    }
  }

  return computeTimeline(repeated);
}

/**
 * Format seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(1)}s`;
}
