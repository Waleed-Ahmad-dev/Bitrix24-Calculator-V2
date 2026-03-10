// utils/logger.ts
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${stack || message} ${metaString}`;
});

export const logger = createLogger({
  level: "info",

  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json(),
  ),

  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),

    new transports.File({ filename: "logs/combined.log" }),
  ],
});

logger.add(
  new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: "HH:mm:ss" }),
      consoleFormat,
    ),
  }),
);
