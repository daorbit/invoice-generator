import { StudioPanel } from '@/components/studio/StudioPanel';
import type { AccentId, TemplateId } from '@/types/document';
import { TemplatePicker } from './TemplatePicker';
import { AccentPicker } from './AccentPicker';
import classes from './Design.module.css';

interface Props {
  template: TemplateId;
  accent: AccentId;
  onTemplate: (value: TemplateId) => void;
  onAccent: (value: AccentId) => void;
}

export function DesignPanel({ template, accent, onTemplate, onAccent }: Props) {
  return (
    <StudioPanel title="Design" subtitle="Changes apply to this document. Save it to keep them.">
      <div className={classes.group}>
        <div className={classes.groupLabel}>Template</div>
        <TemplatePicker value={template} accent={accent} onChange={onTemplate} />
      </div>
      <div className={classes.group}>
        <div className={classes.groupLabel}>Colour</div>
        <AccentPicker value={accent} onChange={onAccent} />
      </div>
    </StudioPanel>
  );
}
