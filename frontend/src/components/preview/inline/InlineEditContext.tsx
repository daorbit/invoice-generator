import { createContext, useContext, type ReactNode } from 'react';
import type { InlineTarget } from './inlineTargets';

export type InlineCommit = (target: InlineTarget, text: string) => void;

const InlineEditContext = createContext<InlineCommit | null>(null);

export function InlineEditProvider({ onCommit, children }: { onCommit: InlineCommit; children: ReactNode }) {
  return <InlineEditContext.Provider value={onCommit}>{children}</InlineEditContext.Provider>;
}

export function useInlineCommit(): InlineCommit | null {
  return useContext(InlineEditContext);
}
