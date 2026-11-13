import { useLayoutEffect, useState } from 'react';
import { findTarget, inView, paddedRect } from './tourGeometry';
import type { Rect } from './types';

export function useTargetRect(target: string | undefined): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const el = target ? findTarget(target) : null;
    if (!el) {
      setRect(null);
      return;
    }
    if (!inView(el)) el.scrollIntoView({ block: 'center', inline: 'nearest' });
    setRect(paddedRect(el));

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(paddedRect(el)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [target]);

  return rect;
}
