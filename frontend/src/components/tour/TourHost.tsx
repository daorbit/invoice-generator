import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { endTour, useActiveTour } from './tourStore';

const TourOverlay = lazy(() => import('./TourOverlay'));

export function TourHost() {
  const tour = useActiveTour();
  const { pathname } = useLocation();

  useEffect(() => endTour, [pathname]);

  if (!tour) return null;

  return (
    <Suspense fallback={null}>
      <TourOverlay key={tour.id} tour={tour} onClose={endTour} />
    </Suspense>
  );
}
