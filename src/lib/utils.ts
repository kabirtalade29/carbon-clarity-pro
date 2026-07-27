import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";
  if (typeof err === "string" && err.trim()) return err;
  if (err instanceof Error) {
    if (
      err.message &&
      typeof err.message === "string" &&
      err.message.trim() &&
      err.message !== "[object Object]" &&
      err.message !== "{}"
    ) {
      return err.message;
    }
  }
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (
      typeof e.message === "string" &&
      e.message.trim() &&
      e.message !== "[object Object]" &&
      e.message !== "{}"
    ) {
      return e.message;
    }
    if (typeof e.error_description === "string" && e.error_description.trim()) {
      return e.error_description;
    }
    if (typeof e.error === "string" && e.error.trim()) {
      return e.error;
    }
    if (typeof e.msg === "string" && e.msg.trim()) {
      return e.msg;
    }
    if (e.error && typeof e.error === "object") {
      const nested = getErrorMessage(e.error);
      if (nested !== "An unexpected error occurred.") return nested;
    }
  }
  return "An unexpected error occurred. Please check your network connection or try again.";
}
