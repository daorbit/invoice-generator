import type { TourDef, TourStep } from '@/components/tour/types';
import type { DocumentKind } from '@/types/document';

const NAV_STEP: TourStep = {
  target: 'inv-nav',
  title: 'Everything in one rail',
  body: 'Invoices, quotations, customers, saved items and reports. Business details, numbering and GST live under Settings at the bottom.',
  side: 'left',
};

export const DOCUMENTS_TOUR: Record<DocumentKind, TourDef> = {
  invoice: {
    id: 'invoices',
    version: 1,
    steps: [
      {
        target: 'docs-new',
        title: 'Create an invoice',
        body: 'Fill in five short steps and watch the invoice build itself. Numbers are given out for you.',
      },
      {
        target: 'docs-overview',
        title: 'Money at a glance',
        body: 'What is still owed, how much is overdue, what you have collected and how many drafts are waiting.',
      },
      {
        target: 'docs-status',
        title: 'Filter by status',
        body: 'Jump to drafts, sent, overdue or paid invoices. The counts update as you work.',
      },
      {
        target: 'docs-row-menu',
        title: 'Quick actions',
        body: 'Duplicate an invoice, mark it paid or delete it without opening it.',
        side: 'left',
      },
      NAV_STEP,
    ],
  },
  quotation: {
    id: 'quotations',
    version: 1,
    steps: [
      {
        target: 'docs-new',
        title: 'Send a quotation',
        body: 'Build it in five short steps, then share a link your client can accept or decline.',
      },
      {
        target: 'docs-overview',
        title: 'Your pipeline',
        body: 'Open, accepted and declined quotations, your win rate and the ones that have expired.',
      },
      {
        target: 'docs-row-menu',
        title: 'Turn a yes into an invoice',
        body: 'Use the row menu to convert an accepted quotation into an invoice in one click.',
        side: 'left',
      },
      NAV_STEP,
    ],
  },
};

export const EDITOR_TOUR: TourDef = {
  id: 'document-editor',
  version: 1,
  steps: [
    {
      target: 'editor-steps',
      title: 'Five quick steps',
      body: 'Client, items, dates, tax and notes. Start typing a client or item you used before and pick it to fill the rest.',
      side: 'right',
    },
    {
      target: 'editor-canvas',
      title: 'Edit right on the page',
      body: 'Click the client name, an item, a quantity or the notes on the preview to change them in place.',
      side: 'left',
    },
    {
      target: 'editor-preview',
      title: 'Pick a design',
      body: 'Preview the document full screen and choose from 15 templates and an accent colour.',
    },
    {
      target: 'editor-save',
      title: 'Save it',
      body: 'Saving gives the document its number. Nothing is sent to your client until you share it.',
    },
    {
      target: 'editor-share',
      title: 'Share it',
      body: 'Email it with the PDF attached, schedule the email, or copy a link your client can open in any browser.',
    },
  ],
};
