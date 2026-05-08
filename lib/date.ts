import { format, isBefore, parseISO, startOfDay } from "date-fns";

export function formatDueDate(value: string | null | undefined) {
  if (!value) return null;
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function isOverdue(dueDate: string | null | undefined, status: string) {
  if (!dueDate || status === "done") return false;
  try {
    return isBefore(startOfDay(parseISO(dueDate)), startOfDay(new Date()));
  } catch {
    return false;
  }
}
