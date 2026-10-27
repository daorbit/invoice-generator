import { UnstyledButton } from '@mantine/core';
import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { TEMPLATE_OPTIONS } from '@/lib/designOptions';
import type { DocumentDraft, TemplateId } from '@/types/document';
import classes from './Design.module.css';

interface Props {
  draft: DocumentDraft;
  onChange: (value: TemplateId) => void;
}

export function TemplatePicker({ draft, onChange }: Props) {
  return (
    <div className={classes.templates} role="radiogroup" aria-label="Template">
      {TEMPLATE_OPTIONS.map((option) => (
        <UnstyledButton
          key={option.id}
          role="radio"
          aria-checked={draft.template === option.id}
          data-active={draft.template === option.id || undefined}
          className={classes.option}
          onClick={() => onChange(option.id)}
        >
          <div className={classes.thumb} aria-hidden>
            <ScaledPage>
              <DocumentPreview draft={{ ...draft, template: option.id, payment: undefined }} />
            </ScaledPage>
          </div>
          <span className={classes.optionLabel}>{option.label}</span>
          <span className={classes.optionHint}>{option.description}</span>
        </UnstyledButton>
      ))}
    </div>
  );
}
