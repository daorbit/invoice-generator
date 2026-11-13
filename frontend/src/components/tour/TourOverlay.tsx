import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FocusTrap, Portal } from '@mantine/core';
import { placeCard, shownSteps } from './tourGeometry';
import { useTargetRect } from './useTargetRect';
import { TourCard } from './TourCard';
import type { TourDef } from './types';
import classes from './Tour.module.css';

function px(v: number) {
  return `${Math.round(v)}px`;
}

export default function TourOverlay({ tour, onClose }: { tour: TourDef; onClose: () => void }) {
  const [steps] = useState(() => shownSteps(tour.steps));
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const rect = useTargetRect(step?.target);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const next = () => (index < steps.length - 1 ? setIndex(index + 1) : onClose());
  const back = () => setIndex(Math.max(0, index - 1));

  useEffect(() => {
    if (steps.length === 0) onClose();
  }, [steps.length, onClose]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const spot = placeCard(rect, { width: card.offsetWidth, height: card.offsetHeight }, step?.side);
    card.style.setProperty('--tour-x', px(spot.x));
    card.style.setProperty('--tour-y', px(spot.y));
    const hole = spotRef.current;
    if (!hole || !rect) return;
    hole.style.setProperty('--tour-top', px(rect.top));
    hole.style.setProperty('--tour-left', px(rect.left));
    hole.style.setProperty('--tour-w', px(rect.width));
    hole.style.setProperty('--tour-h', px(rect.height));
  }, [rect, step, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!step) return null;

  return (
    <Portal>
      <div className={classes.root}>
        {rect ? <div ref={spotRef} className={classes.spot} aria-hidden /> : <div className={classes.scrim} aria-hidden />}
        <FocusTrap active>
          <TourCard
            ref={cardRef}
            step={step}
            index={index}
            total={steps.length}
            centered={!rect}
            onBack={back}
            onNext={next}
            onSkip={onClose}
          />
        </FocusTrap>
      </div>
    </Portal>
  );
}
