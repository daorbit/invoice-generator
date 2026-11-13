export type TourSide = 'top' | 'bottom' | 'left' | 'right';

export type TourStep = {
  target?: string;
  title: string;
  body: string;
  side?: TourSide;
};

export type TourDef = {
  id: string;
  version: number;
  steps: TourStep[];
};

export type Rect = { top: number; left: number; width: number; height: number };
