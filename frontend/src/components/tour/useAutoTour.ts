import { useEffect } from 'react';
import { hasShownTarget, screenQuiet } from './tourGeometry';
import { autoTourRanThisSession, hasSeenTour, noteAutoTourRan } from './tourSeen';
import { isTourRunning, startTour } from './tourStore';
import type { TourDef } from './types';

const FIRST_TRY_MS = 1500;
const RETRY_MS = 1000;
const MAX_TRIES = 12;

export function useAutoTour(tour: TourDef, ready: boolean): void {
  useEffect(() => {
    if (!ready || navigator.webdriver) return;
    if (hasSeenTour(tour) || autoTourRanThisSession()) return;

    let tries = 0;
    let timer = 0;
    const attempt = () => {
      if (isTourRunning() || autoTourRanThisSession()) return;
      if (screenQuiet() && hasShownTarget(tour.steps)) {
        noteAutoTourRan();
        startTour(tour);
        return;
      }
      tries += 1;
      if (tries < MAX_TRIES) timer = window.setTimeout(attempt, RETRY_MS);
    };
    timer = window.setTimeout(attempt, FIRST_TRY_MS);

    return () => window.clearTimeout(timer);
  }, [tour, ready]);
}
