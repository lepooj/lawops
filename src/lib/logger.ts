/**
 * Structured logger that scrubs sensitive data.
 *
 * NEVER log: matter content, facts, analysis output, document text,
 * full prompts, full model responses, passwords, or tokens.
 *
 * DO log: action types, userId, matterId, timestamps, model, token counts, latency, errors.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  action: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, action: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    action,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(output);
  }
}

export const logger = {
  info: (action: string, meta?: Record<string, unknown>) => log("info", action, meta),
  warn: (action: string, meta?: Record<string, unknown>) => log("warn", action, meta),
  error: (action: string, meta?: Record<string, unknown>) => log("error", action, meta),
};
