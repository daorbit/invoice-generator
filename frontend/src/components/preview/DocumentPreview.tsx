import { forwardRef, type ComponentType } from 'react';
import type { DocumentDraft, TemplateId } from '@/types/document';
import { useDocumentView, type DocumentView } from './useDocumentView';
import { PageShell } from './templates/PageShell';
import { StandardTemplate } from './templates/StandardTemplate';
import { SpreadsheetTemplate } from './templates/SpreadsheetTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { GrandTemplate } from './templates/GrandTemplate';
import { SoftTemplate } from './templates/SoftTemplate';
import { StudioTemplate } from './templates/StudioTemplate';
import { AgencyTemplate } from './templates/AgencyTemplate';
import { CapsuleTemplate } from './templates/CapsuleTemplate';
import { BannerTemplate } from './templates/BannerTemplate';
import { PanelTemplate } from './templates/PanelTemplate';

const TEMPLATES: Record<TemplateId, ComponentType<{ view: DocumentView }>> = {
  classic: StandardTemplate,
  modern: SpreadsheetTemplate,
  minimal: MinimalistTemplate,
  bold: GrandTemplate,
  soft: SoftTemplate,
  studio: StudioTemplate,
  agency: AgencyTemplate,
  capsule: CapsuleTemplate,
  banner: BannerTemplate,
  panel: PanelTemplate,
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
