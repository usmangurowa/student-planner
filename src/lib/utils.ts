import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Get the UTC offset string for a given timezone
 * e.g., "Africa/Lagos" returns "+01:00"
 */
export const getTimezoneOffset = (timezone: string): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "";

  // Extract offset from string like "GMT+1"
  const match = offsetPart.match(/GMT([+-]\d{1,2})/);
  if (match) {
    const hours = parseInt(match[1]);
    return `${hours >= 0 ? "+" : ""}${String(hours).padStart(2, "0")}:00`;
  }

  return "+00:00";
};

/**
 * Convert a local time string to ISO format with timezone offset
 * Input: "2025-10-20T08:00:00" and timezone "Africa/Lagos"
 * Output: "2025-10-20T08:00:00+01:00"
 */
export const addTimezoneOffset = (
  localTimeString: string,
  timezone: string
): string => {
  const offset = getTimezoneOffset(timezone);
  // Ensure the time string doesn't already have Z or offset
  const cleanTime = localTimeString
    .replace(/Z$/, "")
    .split("+")[0]
    .split("-")[0];
  return `${cleanTime}${offset}`;
};

/**
 * Convert UTC ISO string to local time string with timezone offset
 * This properly accounts for the user's timezone
 */
export const convertUTCToLocalWithTimezone = (
  utcTimeString: string,
  timezone: string
): string => {
  const date = new Date(utcTimeString);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;

  const localTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const offset = getTimezoneOffset(timezone);

  return `${localTime}${offset}`;
};

/**
 * Parse an ISO string with timezone offset to UTC ISO string
 * Input: "2025-10-20T08:00:00+01:00"
 * Output: "2025-10-20T07:00:00Z" (UTC equivalent)
 */
export const parseLocalTimeToUTC = (timeWithOffset: string): string => {
  const date = new Date(timeWithOffset);
  return date.toISOString();
};

/**
 * Format a UTC date to local timezone display string (without offset)
 * This is for UI display purposes only
 */
export const formatUTCToLocalDisplay = (
  utcTimeString: string,
  timezone: string
): string => {
  const date = new Date(utcTimeString);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};
