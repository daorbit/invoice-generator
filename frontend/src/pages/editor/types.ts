import type { useDocumentEditor } from '@/hooks/useDocumentEditor';
import type { DocumentDraft } from '@/types/document';

type Editor = ReturnType<typeof useDocumentEditor>;

export interface SectionProps {
  draft: DocumentDraft;
  setField: Editor['setField'];
}

export type ClientSetter = Editor['setClient'];
export type ItemActions = Pick<Editor, 'updateItem' | 'addItem' | 'removeItem'>;
