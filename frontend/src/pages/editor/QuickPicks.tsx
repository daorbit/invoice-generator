import { UnstyledButton } from '@mantine/core';
import classes from './QuickPicks.module.css';

interface Pick<T> {
  value: T;
  label: string;
}

interface Props<T> {
  label: string;
  picks: Pick<T>[];
  active: T | null;
  onPick: (value: T) => void;
}

export function QuickPicks<T extends string | number>({ label, picks, active, onPick }: Props<T>) {
  return (
    <div className={classes.row} role="group" aria-label={label}>
      {picks.map((pick) => (
        <UnstyledButton
          key={String(pick.value)}
          className={classes.pick}
          data-active={active === pick.value || undefined}
          onClick={() => onPick(pick.value)}
        >
          {pick.label}
        </UnstyledButton>
      ))}
    </div>
  );
}
