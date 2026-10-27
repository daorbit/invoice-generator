import classes from './ui.module.css';

export type PillTone = 'live' | 'idle' | 'warn' | 'good' | 'bad';

export function StatusPill({ tone, label }: { tone: PillTone; label: string }) {
  return (
    <span className={classes.pill} data-tone={tone}>
      <span className={classes.dot} />
      {label}
    </span>
  );
}
