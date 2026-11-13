import { forwardRef, useId } from 'react';
import { Button, Group, Text } from '@mantine/core';
import type { TourStep } from './types';
import classes from './Tour.module.css';

type Props = {
  step: TourStep;
  index: number;
  total: number;
  centered: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export const TourCard = forwardRef<HTMLDivElement, Props>(function TourCard(
  { step, index, total, centered, onBack, onNext, onSkip },
  ref,
) {
  const titleId = useId();
  const last = index === total - 1;

  return (
    <div
      ref={ref}
      className={classes.card}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-centered={centered || undefined}
    >
      {total > 1 && (
        <Text size="xs" c="dimmed" fw={500} className={classes.count}>
          {index + 1} of {total}
        </Text>
      )}
      <Text id={titleId} fw={650} className={classes.title}>
        {step.title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.55}>
        {step.body}
      </Text>
      <Group justify="space-between" wrap="nowrap" mt="sm">
        {last ? (
          <span />
        ) : (
          <Button variant="subtle" color="gray" size="xs" onClick={onSkip}>
            Skip tour
          </Button>
        )}
        <Group gap="xs" wrap="nowrap">
          {index > 0 && (
            <Button variant="default" size="xs" onClick={onBack}>
              Back
            </Button>
          )}
          <Button size="xs" onClick={onNext} data-autofocus>
            {last ? 'Done' : 'Next'}
          </Button>
        </Group>
      </Group>
    </div>
  );
});
