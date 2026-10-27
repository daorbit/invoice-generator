import { UnstyledButton } from '@mantine/core';
import { TEMPLATE_OPTIONS } from '@/lib/designOptions';
import type { AccentId, TemplateId } from '@/types/document';
import classes from './Design.module.css';

interface Props {
  value: TemplateId;
  accent: AccentId;
  onChange: (value: TemplateId) => void;
}

export function TemplatePicker({ value, accent, onChange }: Props) {
  return (
    <div className={classes.templates} role="radiogroup" aria-label="Template">
      {TEMPLATE_OPTIONS.map((option) => (
        <UnstyledButton
          key={option.id}
          role="radio"
          aria-checked={value === option.id}
          data-active={value === option.id || undefined}
          className={classes.option}
          onClick={() => onChange(option.id)}
        >
          <div className={classes.thumb} data-template={option.id} data-accent={accent} aria-hidden>
            <div className={classes.thumbHead}>
              <span className={classes.thumbTitle} />
            </div>
            <span className={classes.thumbRule} />
            <span className={classes.thumbBar} />
            <span className={classes.thumbBar} />
            <span className={classes.thumbBar} />
            <span className={classes.thumbTotal} />
          </div>
          <span className={classes.optionLabel}>{option.label}</span>
          <span className={classes.optionHint}>{option.description}</span>
        </UnstyledButton>
      ))}
    </div>
  );
}
