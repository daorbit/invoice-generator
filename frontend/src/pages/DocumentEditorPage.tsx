import { Suspense, lazy, useCallback, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ActionIcon, Box, Button, Skeleton, Tooltip } from '@mantine/core';
import { ArrowLeft, Download, Eye, FileQuestion, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { PdfSource } from '@/components/preview/PdfSource';
import { BrandLogoProvider } from '@/components/preview/BrandLogo';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { useShareActions } from '@/hooks/useShareActions';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentKind } from '@/types/document';
import { ClientStep } from './editor/ClientStep';
import { ItemsStep } from './editor/ItemsStep';
import { ScheduleStep } from './editor/ScheduleStep';
import { PricingStep } from './editor/PricingStep';
import { NotesStep } from './editor/NotesStep';
import { PreviewCanvas } from './editor/PreviewCanvas';
import { StatusMenu } from './editor/StatusMenu';
import { ActivityLine } from './editor/ActivityLine';
import { ShareDialog } from './editor/share/ShareDialog';
import classes from './DocumentEditorPage.module.css';

const PreviewStudio = lazy(() => import('@/components/preview/PreviewStudio'));

export function DocumentEditorPage({ kind }: { kind: DocumentKind }) {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hostPhone = useHostPhone();
  const { profile, loading: profileLoading } = useBusinessProfile();
  const editor = useDocumentEditor(kind, id, profile, profileLoading, id ? null : params.get('customer'));
  const pdfRef = useRef<HTMLDivElement>(null);
  const pdf = usePdfDownload(pdfRef);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const meta = KIND_META[kind];
  const backTo = kind === 'quotation' ? '/?view=quotations' : '/';
  const { draft } = editor;

  const save = async () => {
    const savedId = await editor.save();
    if (savedId && !id) navigate(`${DOCUMENT_PATH[kind]}/${savedId}`, { replace: true });
  };

  const ensureSaved = useCallback(async () => (editor.dirty || !id ? editor.save() : id), [editor, id]);
  const renderPdf = useCallback(() => pdf.dataUri(draft?.number || meta.singular), [pdf, draft?.number, meta.singular]);

  const share = useShareActions({
    kind,
    ensureSaved,
    renderPdf,
    onLoaded: editor.apply,
    onShareUrl: editor.setShareUrl,
  });

  const download = () => void pdf.download(draft?.number || meta.singular);
  const openPreview = () => setPreviewOpen(true);

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
  const description = id ? (
    <ActivityLine client={draft?.client.name ?? ''} activity={editor.activity} response={editor.clientResponse} />
  ) : (
    'Fill in the steps and watch it come together on the right.'
  );

  return (
    <BrandLogoProvider logo={profile?.logo ?? ''}>
    <Box className={classes.page}>
      <PageHeader
        leading={back}
        title={title}
        description={description}
        actions={
          <>
            {id && draft && <StatusMenu kind={kind} id={id} status={draft.status} onChange={editor.markStatus} />}
            <Tooltip label="Download PDF" withArrow>
              <ActionIcon
                variant="default"
                size="lg"
                radius="md"
                aria-label="Download PDF"
                loading={pdf.downloading}
                disabled={!draft}
                onClick={download}
              >
                <Download size={17} />
              </ActionIcon>
            </Tooltip>
            <Button variant="default" leftSection={<Eye size={16} />} disabled={!draft} onClick={openPreview}>
              Preview
            </Button>
            <Tooltip label={`Create the ${meta.singular.toLowerCase()} first`} withArrow disabled={Boolean(id)}>
              <Button variant="default" leftSection={<Send size={15} />} disabled={!draft || !id} onClick={() => setShareOpen(true)}>
                Share
              </Button>
            </Tooltip>
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
          <Skeleton height={420} radius="md" />
          <Skeleton height={560} radius="md" />
        </div>
      ) : (
        <>
          <div className={classes.workspace}>
            <div className={classes.steps}>
              <ClientStep draft={draft} setClient={editor.setClient} fillCustomer={editor.fillCustomer} />
              <ItemsStep
                draft={draft}
                updateItem={editor.updateItem}
                fillItem={editor.fillItem}
                addItem={editor.addItem}
                removeItem={editor.removeItem}
              />
              <ScheduleStep draft={draft} setField={editor.setField} />
              <PricingStep draft={draft} setField={editor.setField} applyTaxRate={editor.applyTaxRate} />
              <NotesStep draft={draft} setField={editor.setField} />
            </div>
            <PreviewCanvas draft={draft} onDesign={openPreview} />
          </div>

          <PdfSource ref={pdfRef} draft={draft} />

          {previewOpen && (
            <Suspense fallback={null}>
              <PreviewStudio
                opened
                draft={draft}
                downloading={pdf.downloading}
                onClose={() => setPreviewOpen(false)}
                onTemplate={(value) => editor.setField('template', value)}
                onAccent={(value) => editor.setField('accent', value)}
                onDownload={download}
              />
            </Suspense>
          )}

          {id && (
            <ShareDialog
              opened={shareOpen}
              onClose={() => setShareOpen(false)}
              draft={draft}
              activity={editor.activity}
              dirty={editor.dirty}
              actions={share}
            />
          )}
        </>
      )}
    </Box>
    </BrandLogoProvider>
  );
}
