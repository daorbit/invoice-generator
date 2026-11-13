import type { Rect, TourSide, TourStep } from './types';

const GAP = 12;
const MARGIN = 16;
const PAD = 6;

export function findTarget(target: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
}

function isShown(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function shownSteps(steps: TourStep[]): TourStep[] {
  return steps.filter((s) => {
    if (!s.target) return true;
    const el = findTarget(s.target);
    return el !== null && isShown(el);
  });
}

export function hasShownTarget(steps: TourStep[]): boolean {
  return shownSteps(steps.filter((s) => s.target)).length > 0;
}

export function screenQuiet(): boolean {
  return !document.querySelector('[aria-modal="true"]');
}

export function paddedRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max));
}

export function placeCard(
  rect: Rect | null,
  card: { width: number; height: number },
  preferred: TourSide | undefined,
): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { width: w, height: h } = card;

  if (!rect) return { x: (vw - w) / 2, y: (vh - h) / 2 };

  const centerX = clamp(rect.left + rect.width / 2 - w / 2, MARGIN, vw - w - MARGIN);
  const centerY = clamp(rect.top + rect.height / 2 - h / 2, MARGIN, vh - h - MARGIN);
  const fits: Record<TourSide, () => { x: number; y: number } | null> = {
    bottom: () => (rect.top + rect.height + GAP + h <= vh - MARGIN ? { x: centerX, y: rect.top + rect.height + GAP } : null),
    top: () => (rect.top - GAP - h >= MARGIN ? { x: centerX, y: rect.top - GAP - h } : null),
    right: () => (rect.left + rect.width + GAP + w <= vw - MARGIN ? { x: rect.left + rect.width + GAP, y: centerY } : null),
    left: () => (rect.left - GAP - w >= MARGIN ? { x: rect.left - GAP - w, y: centerY } : null),
  };

  const order: TourSide[] = ['bottom', 'top', 'right', 'left'];
  if (preferred) order.unshift(preferred);
  for (const side of order) {
    const spot = fits[side]();
    if (spot) return spot;
  }
  return { x: centerX, y: vh - h - MARGIN };
}

export function inView(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.top >= MARGIN && r.bottom <= window.innerHeight - MARGIN;
}
