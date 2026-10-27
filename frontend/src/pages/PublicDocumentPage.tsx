import { useRef } from 'react';
import { Button, Skeleton } from '@mantine/core';
import { Download, FileQuestion } from 'lucide-react';
import { getPublicDocument } from '@/api/public';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusPill } from '@/components/ui/StatusPill';
import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { PdfSource } from '@/components/preview/PdfSource';
import { BrandLogoProvider } from '@/components/preview/BrandLogo';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { PUBLIC_PREVIEW } from '@/lib/bootParams';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import { QuoteReply } from './public/QuoteReply';
import classes from './public/PublicDocument.module.css';

export default function PublicDocumentPage({ token }: { token: string }) {
  const { data, loading, failed, setData } = useAsyncData(() => getPublicDocument(token, PUBLIC_PREVIEW), token);
  const pdfRef = useRef<HTMLDivElement>(null);
  const pdf = usePdfDownload(pdfRef);

  if (failed && !data) {
    return (
      <div className={classes.page}>
        <EmptyState
          icon={FileQuestion}
          title="This link is not available"
          description="The sender may have turned it off. Ask them for a new link."
        />
      </div>
    );
  }

  const draft = data?.draft;
  const label = draft ? KIND_META[draft.kind].singular : '';
  const status = draft ? STATUS_META[draft.status] : null;
  const logo = draft?.logo || data?.brandLogo || '';

  return (
    <BrandLogoProvider logo={data?.brandLogo ?? ''}>
      <div className={classes.page}>
        <header className={classes.topbar}>
          <div className={classes.brand}>
            {logo && <img src={logo} alt="" className={classes.logo} />}
            <div className={classes.brandText}>
              <span className={classes.sender}>{draft?.from.name}</span>
              <span className={classes.title}>{draft ? `${label} ${draft.number}` : ''}</span>
            </div>
          </div>
          <div className={classes.actions}>
            {status && draft?.status !== 'draft' && <StatusPill tone={status.tone} label={status.label} />}
            <Button
              variant="default"
              leftSection={<Download size={15} />}
              loading={pdf.downloading}
              disabled={!draft}
              onClick={() => draft && void pdf.download(draft.number || label)}
            >
              Download PDF
            </Button>
          </div>
        </header>

        {data && draft?.kind === 'quotation' && (
          <QuoteReply token={token} document={data} onReplied={setData} />
        )}

        <main className={classes.sheet}>
          {loading && !draft ? (
            <Skeleton height={900} radius="md" />
          ) : (
            draft && (
              <ScaledPage>
                <DocumentPreview draft={draft} />
              </ScaledPage>
            )
          )}
        </main>

        <footer className={classes.footer}>Sent with Quantalog Invoicing</footer>

        {draft && <PdfSource ref={pdfRef} draft={draft} />}
      </div>
    </BrandLogoProvider>
  );
}
