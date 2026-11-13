import { ActionIcon, Tooltip } from '@mantine/core';
import { Compass } from 'lucide-react';
import { startTour } from './tourStore';
import { useAutoTour } from './useAutoTour';
import type { TourDef } from './types';

const LABEL = 'Take a quick tour';

export function TourButton({ tour, ready = true }: { tour: TourDef; ready?: boolean }) {
  useAutoTour(tour, ready);

  return (
    <Tooltip label={LABEL} withArrow>
      <ActionIcon variant="default" size="lg" radius="md" aria-label={LABEL} onClick={() => startTour(tour)}>
        <Compass size={17} />
      </ActionIcon>
    </Tooltip>
  );
}
