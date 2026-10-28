import { Progress } from '@mantine/core';
import classes from './SplitMeter.module.css';

export type MeterTone = 'accent' | 'good' | 'bad' | 'warn';

export interface MeterSegment {
  key: string;
  label: string;
  value: number;
  display: string;
  tone: MeterTone;
}

const TONE_COLOR: Record<MeterTone, string> = {
  accent: 'var(--accent)',
  good: 'var(--green)',
  bad: 'var(--red)',
  warn: 'var(--amber)',
};

export function SplitMeter({ segments, ariaLabel }: { segments: MeterSegment[]; ariaLabel: string }) {
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);

  return (
    <div className={classes.root}>
      <Progress.Root size={8} radius="xl" className={classes.track} aria-label={ariaLabel}>
        {total > 0 &&
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <Progress.Section key={segment.key} value={(segment.value / total) * 100} color={TONE_COLOR[segment.tone]} />
            ))}
      </Progress.Root>
      <div className={classes.legend}>
        {segments.map((segment) => (
          <span key={segment.key} className={classes.item}>
            <span className={classes.swatch} data-tone={segment.tone} aria-hidden />
            <span className={classes.label}>{segment.label}</span>
            <span className={classes.value}>{segment.display}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
