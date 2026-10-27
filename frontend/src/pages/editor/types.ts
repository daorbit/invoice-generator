import type { useDocumentEditor } from '@/hooks/useDocumentEditor';
import type { DocumentDraft } from '@/types/document';

type Editor = ReturnType<typeof useDocumentEditor>;

export interface SectionProps {
  draft: DocumentDraft;
  setField: Editor['setField'];
}

export type ClientActions = Pick<Editor, 'setClient' | 'fillCustomer'>;
export type ItemActions = Pick<Editor, 'updateItem' | 'fillItem' | 'addItem' | 'removeItem'>;
export type TaxActions = Pick<Editor, 'applyTaxRate'>;
