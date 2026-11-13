import type { TourDef } from './types';

const SEEN_KEY = 'invoicing:tours-seen';
const SESSION_KEY = 'invoicing:tour-auto-ran';

function readSeen(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function hasSeenTour(tour: TourDef): boolean {
  return (readSeen()[tour.id] ?? 0) >= tour.version;
}

export function markTourSeen(tour: TourDef): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify({ ...readSeen(), [tour.id]: tour.version }));
  } catch {
    return;
  }
}

export function autoTourRanThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return true;
  }
}

export function noteAutoTourRan(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    return;
  }
}
