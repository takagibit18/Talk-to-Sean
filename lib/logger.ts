type LogLevel = "info" | "warn" | "error";

type LogData = Record<string, unknown>;

function write(level: LogLevel, requestId: string, message: string, data: LogData = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    requestId,
    message,
    ...data,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (requestId: string, message: string, data?: LogData) =>
    write("info", requestId, message, data),
  warn: (requestId: string, message: string, data?: LogData) =>
    write("warn", requestId, message, data),
  error: (requestId: string, message: string, data?: LogData) =>
    write("error", requestId, message, data),
};
