import type { useDocumentEditor } from '@/hooks/useDocumentEditor';
import type { DocumentDraft } from '@/types/document';

type Editor = ReturnType<typeof useDocumentEditor>;

export interface SectionProps {
  draft: DocumentDraft;
  setField: Editor['setField'];
}

export type ClientActions = Pick<Editor, 'setClient' | 'fillClient'>;
export type ItemActions = Pick<Editor, 'updateItem' | 'addItem' | 'removeItem'>;
