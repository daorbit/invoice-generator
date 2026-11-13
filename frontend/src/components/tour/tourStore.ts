import { useSyncExternalStore } from 'react';
import { markTourSeen } from './tourSeen';
import type { TourDef } from './types';

let active: TourDef | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startTour(tour: TourDef): void {
  active = tour;
  emit();
}

export function endTour(): void {
  if (!active) return;
  markTourSeen(active);
  active = null;
  emit();
}

export function isTourRunning(): boolean {
  return active !== null;
}

export function useActiveTour(): TourDef | null {
  return useSyncExternalStore(subscribe, () => active);
}
