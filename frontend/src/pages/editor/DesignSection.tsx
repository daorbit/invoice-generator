import { Tooltip, UnstyledButton } from '@mantine/core';
import { Check } from 'lucide-react';
import { ACCENT_OPTIONS, TEMPLATE_OPTIONS } from '@/lib/designOptions';
import { EditorSection } from './EditorSection';
import type { SectionProps } from './types';
import classes from './DesignSection.module.css';

export function DesignSection({ draft, setField }: SectionProps) {
  const current = TEMPLATE_OPTIONS.find((option) => option.id === draft.template);

  return (
    <EditorSection title="Design">
      <div className={classes.templates} role="radiogroup" aria-label="Template">
        {TEMPLATE_OPTIONS.map((option) => (
          <UnstyledButton
            key={option.id}
            role="radio"
            aria-checked={draft.template === option.id}
            data-active={draft.template === option.id || undefined}
            className={classes.option}
            onClick={() => setField('template', option.id)}
          >
            <div className={classes.thumb} data-template={option.id} data-accent={draft.accent} aria-hidden>
              <div className={classes.thumbHead}>
                <span className={classes.thumbTitle} />
              </div>
              <span className={classes.thumbRule} />
              <span className={classes.thumbBar} />
              <span className={classes.thumbBar} />
              <span className={classes.thumbTotal} />
            </div>
            <span className={classes.optionLabel}>{option.label}</span>
          </UnstyledButton>
        ))}
      </div>
      {current && <span className={classes.hint}>{current.description}.</span>}
      <div className={classes.accents} role="radiogroup" aria-label="Colour">
        {ACCENT_OPTIONS.map((option) => (
          <Tooltip key={option.id} label={option.label} withArrow>
            <UnstyledButton
              role="radio"
              aria-checked={draft.accent === option.id}
              aria-label={option.label}
              data-accent={option.id}
              data-active={draft.accent === option.id || undefined}
              className={classes.swatch}
              onClick={() => setField('accent', option.id)}
            >
              {draft.accent === option.id && <Check size={14} />}
            </UnstyledButton>
          </Tooltip>
        ))}
      </div>
    </EditorSection>
  );
}
