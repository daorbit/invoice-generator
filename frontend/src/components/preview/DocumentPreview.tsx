import { forwardRef, type ComponentType } from 'react';
import type { DocumentDraft, TemplateId } from '@/types/document';
import { useDocumentView, type DocumentView } from './useDocumentView';
import { PageShell } from './templates/PageShell';
import { StandardTemplate } from './templates/StandardTemplate';
import { SpreadsheetTemplate } from './templates/SpreadsheetTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { GrandTemplate } from './templates/GrandTemplate';

const TEMPLATES: Record<TemplateId, ComponentType<{ view: DocumentView }>> = {
  classic: StandardTemplate,
  modern: SpreadsheetTemplate,
  minimal: MinimalistTemplate,
  bold: GrandTemplate,
};

export const DocumentPreview = forwardRef<HTMLDivElement, { draft: DocumentDraft }>(function DocumentPreview(
  { draft },
  ref
) {
  const view = useDocumentView(draft);
  const Template = TEMPLATES[draft.template] ?? StandardTemplate;

  return (
    <PageShell ref={ref} view={view}>
      <Template view={view} />
    </PageShell>
  );
});
