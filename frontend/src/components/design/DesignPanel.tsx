import { StudioPanel } from '@/components/studio/StudioPanel';
import type { AccentId, DocumentDraft, TemplateId } from '@/types/document';
import { TemplatePicker } from './TemplatePicker';
import { AccentPicker } from './AccentPicker';
import classes from './Design.module.css';

interface Props {
  draft: DocumentDraft;
  onTemplate: (value: TemplateId) => void;
  onAccent: (value: AccentId) => void;
}

export function DesignPanel({ draft, onTemplate, onAccent }: Props) {
  return (
    <StudioPanel title="Design" subtitle="Changes apply to this document. Save it to keep them.">
      <div className={classes.group}>
        <div className={classes.groupLabel}>Colour</div>
        <AccentPicker value={draft.accent} onChange={onAccent} />
      </div>
      <div className={classes.group}>
        <div className={classes.groupLabel}>Template</div>
        <TemplatePicker draft={draft} onChange={onTemplate} />
      </div>
    </StudioPanel>
  );
}
