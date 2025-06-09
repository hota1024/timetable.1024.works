import superjson from "superjson";
import type { EventData } from "@/models/event";

const STORAGE_PREFIX = "eventData:";

export function saveEventDataToStorage(event: EventData, key: string) {
  const serialized = superjson.stringify(event);
  localStorage.setItem(STORAGE_PREFIX + key, serialized);
}

export function loadEventDataFromStorage(key: string): EventData | null {
  const serialized = localStorage.getItem(STORAGE_PREFIX + key);
  if (!serialized) return null;
  try {
    return superjson.parse<EventData>(serialized);
  } catch {
    return null;
  }
}

export function removeEventDataFromStorage(key: string) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}
