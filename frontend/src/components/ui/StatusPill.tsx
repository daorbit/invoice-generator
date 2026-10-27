import classes from './ui.module.css';

export type PillTone = 'live' | 'idle' | 'warn' | 'good' | 'bad';

export function StatusDot({ tone }: { tone: PillTone }) {
  return <span className={classes.dot} data-tone={tone} aria-hidden />;
}

export function StatusPill({ tone, label }: { tone: PillTone; label: string }) {
  return (
    <span className={classes.pill} data-tone={tone}>
      <StatusDot tone={tone} />
      {label}
    </span>
  );
}
