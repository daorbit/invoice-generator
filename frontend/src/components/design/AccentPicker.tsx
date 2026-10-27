import { Tooltip, UnstyledButton } from '@mantine/core';
import { Check } from 'lucide-react';
import { ACCENT_OPTIONS } from '@/lib/designOptions';
import type { AccentId } from '@/types/document';
import classes from './Design.module.css';

export function AccentPicker({ value, onChange }: { value: AccentId; onChange: (value: AccentId) => void }) {
  return (
    <div className={classes.accents} role="radiogroup" aria-label="Colour">
      {ACCENT_OPTIONS.map((option) => (
        <Tooltip key={option.id} label={option.label} withArrow>
          <UnstyledButton
            role="radio"
            aria-checked={value === option.id}
            aria-label={option.label}
            data-accent={option.id}
            data-active={value === option.id || undefined}
            className={classes.swatch}
            onClick={() => onChange(option.id)}
          >
            {value === option.id && <Check size={14} />}
          </UnstyledButton>
        </Tooltip>
      ))}
    </div>
  );
}
