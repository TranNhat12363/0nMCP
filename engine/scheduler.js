// ============================================================
// 0nMCP -Engine: Cron Scheduler
// ============================================================
// Minimal 5-field cron parser + scheduler.
// Pure JS, zero external dependencies (Node.js builtins only).
//
// Cron format: minute hour day-of-month month day-of-week
//   - Standard 5 fields
//   - Supports: * ranges (1-5) steps (*/15) lists (1,3,5)
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

/**
 * Parse a single cron field into an array of valid values.
 *
 * @param {string} field - Cron field expression
 * @param {number} min - Minimum value for this field
 * @param {number} max - Maximum value for this field
 * @returns {number[]} Array of matching values
 */
function parseField(field, min, max) {
  const values = new Set();

  for (const part of field.split(",")) {
    const trimmed = part.trim();

    // Step: */n or range/n
    if (trimmed.includes("/")) {
      const [range, stepStr] = trimmed.split("/");
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) continue;

      let start = min;
      let end = max;

      if (range !== "*") {
        if (range.includes("-")) {
          [start, end] = range.split("-").map(Number);
        } else {
          start = parseInt(range, 10);
        }
      }

      for (let i = start; i <= end; i += step) {
        if (i >= min && i <= max) values.add(i);
      }
      continue;
    }

    // Range: a-b
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map(Number);
      for (let i = a; i <= b; i++) {
        if (i >= min && i <= max) values.add(i);
      }
      continue;
    }

    // Wildcard
    if (trimmed === "*") {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }

    // Single value
    const val = parseInt(trimmed, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      values.add(val);
    }
  }

  return [...values].sort((a, b) => a - b);
}

/**
 * Parse a 5-field cron expression.
 *
 * @param {string} expr -e.g., "0 9 * * *" (9:00 AM daily)
 * @returns {{ minutes: number[], hours: number[], days: number[], months: number[], weekdays: number[], matches: (date: Date) => boolean, nextRun: (from?: Date) => Date }}
 */
export function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: "${expr}" -must have 5 fields (minute hour day month weekday)`);
  }

  const [minField, hourField, dayField, monthField, weekdayField] = parts;

  const minutes = parseField(minField, 0, 59);
  const hours = parseField(hourField, 0, 23);
  const days = parseField(dayField, 1, 31);
  const months = parseField(monthField, 1, 12);
  const weekdays = parseField(weekdayField, 0, 6); // 0 = Sunday

  if (minutes.length === 0) throw new Error(`Invalid minute field: ${minField}`);
  if (hours.length === 0) throw new Error(`Invalid hour field: ${hourField}`);
  if (days.length === 0) throw new Error(`Invalid day field: ${dayField}`);
  if (months.length === 0) throw new Error(`Invalid month field: ${monthField}`);
  if (weekdays.length === 0) throw new Error(`Invalid weekday field: ${weekdayField}`);

  const minuteSet = new Set(minutes);
  const hourSet = new Set(hours);
  const daySet = new Set(days);
  const monthSet = new Set(months);
  const weekdaySet = new Set(weekdays);

  /**
   * Check if a Date matches this cron expression.
   */
  function matches(date) {
    return (
      minuteSet.has(date.getMinutes()) &&
      hourSet.has(date.getHours()) &&
      daySet.has(date.getDate()) &&
      monthSet.has(date.getMonth() + 1) &&
      weekdaySet.has(date.getDay())
    );
  }

  /**
   * Calculate the next run time from a given date.
   * Searches forward up to 2 years to find a match.
   */
  function nextRun(from) {
    const d = from ? new Date(from) : new Date();
    // Advance to next minute boundary
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);

    const maxDate = new Date(d.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

    while (d < maxDate) {
      // Check month
      if (!monthSet.has(d.getMonth() + 1)) {
        d.setMonth(d.getMonth() + 1, 1);
        d.setHours(0, 0, 0, 0);
        continue;
      }

      // Check day and weekday
      if (!daySet.has(d.getDate()) || !weekdaySet.has(d.getDay())) {
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        continue;
      }

      // Check hour
      if (!hourSet.has(d.getHours())) {
        d.setHours(d.getHours() + 1, 0, 0, 0);
        continue;
      }

      // Check minute
      if (!minuteSet.has(d.getMinutes())) {
        d.setMinutes(d.getMinutes() + 1, 0, 0);
        continue;
      }

      return new Date(d);
    }

    throw new Error(`No matching time found within 2 years for cron: ${expr}`);
  }

  return { minutes, hours, days, months, weekdays, matches, nextRun };
}

/**
 * Cron-based scheduler. Schedules callbacks to fire on cron expressions.
 */
export class CronScheduler {
  constructor() {
    /** @type {Map<string, { timer: NodeJS.Timeout, cron: object, expr: string, cb: Function }>} */
    this._jobs = new Map();
  }

  /**
   * Schedule a callback on a cron expression.
   *
   * @param {string} id -Unique job ID
   * @param {string} expr -Cron expression (5 fields)
   * @param {Function} cb -Callback to invoke (receives { id, scheduledTime, expr })
   * @param {object} [options]
   * @param {string} [options.timezone] -Timezone (informational only -uses system TZ)
   * @returns {{ id: string, nextRun: Date }}
   */
  schedule(id, expr, cb, options = {}) {
    if (this._jobs.has(id)) {
      this.stop(id);
    }

    const cron = parseCron(expr);
    const job = { cron, expr, cb, timezone: options.timezone };

    const scheduleNext = () => {
      const now = new Date();
      const next = cron.nextRun(now);
      const delay = next.getTime() - now.getTime();

      job.timer = setTimeout(() => {
        try {
          cb({ id, scheduledTime: next, expr });
        } catch (err) {
          console.error(`Cron job ${id} error:`, err.message);
        }
        // Schedule the next run
        scheduleNext();
      }, delay);

      // Prevent timer from keeping process alive if it's the only thing running
      if (job.timer.unref) job.timer.unref();

      job.nextRun = next;
    };

    scheduleNext();
    this._jobs.set(id, job);

    return { id, nextRun: job.nextRun };
  }

  /**
   * Stop a scheduled job.
   * @param {string} id
   * @returns {boolean} True if job was stopped
   */
  stop(id) {
    const job = this._jobs.get(id);
    if (!job) return false;

    clearTimeout(job.timer);
    this._jobs.delete(id);
    return true;
  }

  /**
   * Stop all scheduled jobs.
   * @returns {number} Number of jobs stopped
   */
  stopAll() {
    let count = 0;
    for (const [id] of this._jobs) {
      this.stop(id);
      count++;
    }
    return count;
  }

  /**
   * List all active jobs.
   * @returns {Array<{ id: string, expr: string, nextRun: Date }>}
   */
  list() {
    return [...this._jobs.entries()].map(([id, job]) => ({
      id,
      expr: job.expr,
      nextRun: job.nextRun,
      timezone: job.timezone,
    }));
  }

  /**
   * Get the number of active jobs.
   * @returns {number}
   */
  get size() {
    return this._jobs.size;
  }
}
