import { useState } from 'react';
import { askOrbit } from '@/api/orbit';
import { notify } from '@/lib/notify';
import { applyOrbitOps } from '@/lib/orbit/applyOrbitOps';
import { gstChecks } from '@/lib/orbit/gstChecks';
import { isBlankDraft, orbitDocumentMeta, orbitSnapshot } from '@/lib/orbit/orbitSnapshot';
import type { OrbitAttachment } from '@/lib/orbit/readAttachment';
import type { DocumentDraft } from '@/types/document';
import type { OrbitReply } from '@/types/orbit';

export interface OrbitTurn {
  id: string;
  ask: string;
  attachment?: string;
  pending: boolean;
  reply: string;
  notes: string[];
}

interface Run {
  ask: string;
  attachment?: OrbitAttachment | null;
  request: () => Promise<OrbitReply>;
  withChecks: boolean;
}

export const GST_ASK = 'Check GST and HSN codes';

export function useOrbitStudio(initial: DocumentDraft) {
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<DocumentDraft[]>([]);
  const [turns, setTurns] = useState<OrbitTurn[]>([]);
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState<OrbitAttachment | null>(null);
  const [busy, setBusy] = useState(false);

  async function perform({ ask, attachment: file, request, withChecks }: Run) {
    const id = crypto.randomUUID();
    setTurns((current) => [...current, { id, ask, attachment: file?.name, pending: true, reply: '', notes: [] }]);
    setBusy(true);
    try {
      const reply = await request();
      const next = reply.ops.length ? applyOrbitOps(draft, reply.ops) : draft;
      if (reply.ops.length) {
        setHistory((past) => [...past, draft]);
        setDraft(next);
      }
      const done = { pending: false, reply: reply.summary || 'Nothing to change.', notes: withChecks ? gstChecks(next) : [] };
      setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, ...done } : turn)));
    } catch (error) {
      setTurns((current) => current.filter((turn) => turn.id !== id));
      if (!withChecks) {
        setPrompt(ask === file?.name ? '' : ask);
        setAttachment(file ?? null);
      }
      notify.error(error instanceof Error ? error.message : 'Orbit could not answer. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function send(text?: string) {
    const ask = (text ?? prompt).trim();
    const file = attachment;
    if ((!ask && !file) || busy) return;
    setPrompt('');
    setAttachment(null);
    const document = orbitDocumentMeta(draft);
    const drafting = Boolean(file) || isBlankDraft(draft);
    void perform({
      ask: ask || file?.name || '',
      attachment: file,
      withChecks: false,
      request: () =>
        drafting
          ? askOrbit('draft', { prompt: ask, attachment: file?.dataUrl, document })
          : askOrbit('edit', { prompt: ask, document, snapshot: orbitSnapshot(draft) }),
    });
  }

  function checkGst() {
    if (busy) return;
    void perform({
      ask: GST_ASK,
      withChecks: true,
      request: () => askOrbit('gst', { document: orbitDocumentMeta(draft), snapshot: orbitSnapshot(draft) }),
    });
  }

  function undo() {
    const previous = history[history.length - 1];
    if (!previous || busy) return;
    setDraft(previous);
    setHistory((past) => past.slice(0, -1));
  }

  return {
    draft,
    turns,
    prompt,
    setPrompt,
    attachment,
    setAttachment,
    busy,
    blank: isBlankDraft(draft),
    changed: history.length > 0,
    send,
    checkGst,
    undo,
  };
}

export type OrbitStudioState = ReturnType<typeof useOrbitStudio>;
