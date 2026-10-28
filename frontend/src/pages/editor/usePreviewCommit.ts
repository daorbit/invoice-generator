import { useCallback } from 'react';
import type { InlineCommit } from '@/components/preview/inline/InlineEditContext';
import type { ClientActions, ItemActions, SectionProps } from './types';

type Actions = Pick<ClientActions, 'setClient'> & Pick<ItemActions, 'updateItem'> & Pick<SectionProps, 'setField'>;

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function usePreviewCommit({ setClient, updateItem, setField }: Actions): InlineCommit {
  return useCallback<InlineCommit>(
    (target, text) => {
      if (target.kind === 'client') return setClient(target.key, text);
      if (target.kind === 'field') return setField(target.key, text);
      if (target.key === 'description') return updateItem(target.id, { description: text, itemId: undefined });
      const value = parseAmount(text);
      if (value === null) return;
      updateItem(target.id, target.key === 'quantity' ? { quantity: value } : { rate: value });
    },
    [setClient, updateItem, setField]
  );
}
