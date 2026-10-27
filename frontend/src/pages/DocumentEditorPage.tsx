import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Box, Button, Skeleton, Tooltip } from '@mantine/core';
import { ArrowLeft, Download, FileQuestion } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentKind } from '@/types/document';
import { FromSummary } from './editor/FromSummary';
import { DesignSection } from './editor/DesignSection';
import { DetailsSection } from './editor/DetailsSection';
import { ClientSection } from './editor/ClientSection';
import { ItemsSection } from './editor/ItemsSection';
import { PricingSection } from './editor/PricingSection';
import { NotesSection } from './editor/NotesSection';
import { StatusMenu } from './editor/StatusMenu';
import classes from './DocumentEditorPage.module.css';

export function DocumentEditorPage({ kind }: { kind: DocumentKind }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hostPhone = useHostPhone();
  const { profile, loading: profileLoading } = useBusinessProfile();
  const editor = useDocumentEditor(kind, id, profile, profileLoading);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdf = usePdfDownload(previewRef);
  const meta = KIND_META[kind];
  const backTo = kind === 'quotation' ? '/?view=quotations' : '/';
  const { draft } = editor;

  const save = async () => {
    const savedId = await editor.save();
    if (savedId && !id) navigate(`${DOCUMENT_PATH[kind]}/${savedId}`, { replace: true });
  };

  const back = (
    <Tooltip label={`All ${meta.plural.toLowerCase()}`} withArrow>
      <ActionIcon variant="default" size="lg" radius="md" aria-label="Back" onClick={() => navigate(backTo)}>
        <ArrowLeft size={17} />
      </ActionIcon>
    </Tooltip>
  );

  if (editor.missing) {
    return (
      <Box className={classes.page}>
        <EmptyState
          icon={FileQuestion}
          title={`This ${meta.singular.toLowerCase()} could not be found`}
          description="It may have been deleted, or it belongs to another workspace."
          action={{ label: `All ${meta.plural.toLowerCase()}`, icon: ArrowLeft, onClick: () => navigate(backTo) }}
        />
      </Box>
    );
  }

  const title = id ? `${meta.singular} ${draft?.number ?? ''}` : `New ${meta.singular.toLowerCase()}`;

  return (
    <Box className={classes.page}>
      <PageHeader
        leading={back}
        title={title}
        description={draft?.client.name || `Fill in the details and the preview updates as you type.`}
        actions={
          <>
            {id && draft && (
              <StatusMenu
                kind={kind}
                id={id}
                status={draft.status}
                onChange={editor.markStatus}
              />
            )}
            <Button
              variant="default"
              leftSection={<Download size={16} />}
              loading={pdf.downloading}
              disabled={!draft}
              onClick={() => void pdf.download(draft?.number || meta.singular)}
            >
              PDF
            </Button>
            <Button loading={editor.saving} disabled={!draft || (Boolean(id) && !editor.dirty)} onClick={() => void save()}>
              {id ? 'Save changes' : `Create ${meta.singular.toLowerCase()}`}
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      {editor.loading || !draft ? (
        <div className={classes.loading}>
          <Skeleton height={120} radius="md" />
          <Skeleton height={220} radius="md" />
        </div>
      ) : (
        <div className={classes.layout}>
          <div className={classes.form}>
            <FromSummary from={draft.from} />
            <DesignSection draft={draft} setField={editor.setField} />
            <DetailsSection draft={draft} setField={editor.setField} />
            <ClientSection draft={draft} setClient={editor.setClient} />
            <ItemsSection
              draft={draft}
              updateItem={editor.updateItem}
              addItem={editor.addItem}
              removeItem={editor.removeItem}
            />
            <PricingSection draft={draft} setField={editor.setField} />
            <NotesSection draft={draft} setField={editor.setField} />
          </div>
          <aside className={classes.preview}>
            <span className={classes.previewLabel}>Preview</span>
            <DocumentPreview ref={previewRef} draft={draft} />
          </aside>
        </div>
      )}
    </Box>
  );
}
