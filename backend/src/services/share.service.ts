import { randomBytes } from 'node:crypto';
import { notFoundError } from '../lib/http-error.js';
import { shareUrlFor } from '../lib/serialize.js';
import { ownedFilter } from './owned-document.js';
import { DOCUMENT_LABEL, documentModel, type DocumentKind } from './document-models.js';

const TOKEN_BYTES = 18;

function newToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export async function ensureShareToken(workspaceId: string, kind: DocumentKind, id: string): Promise<string> {
  const model = documentModel(kind);
  const filter = ownedFilter(workspaceId, id, DOCUMENT_LABEL[kind]);
  const existing = await model.findOne(filter).select('shareToken').lean();
  if (!existing) throw notFoundError(DOCUMENT_LABEL[kind]);
  if (existing.shareToken) return existing.shareToken;

  await model.updateOne({ ...filter, shareToken: { $exists: false } }, { $set: { shareToken: newToken() } });
  const saved = await model.findOne(filter).select('shareToken').lean();
  if (!saved?.shareToken) throw notFoundError(DOCUMENT_LABEL[kind]);
  return saved.shareToken;
}

export async function enableSharing(workspaceId: string, kind: DocumentKind, id: string) {
  return { shareUrl: shareUrlFor(await ensureShareToken(workspaceId, kind, id)) };
}

export async function disableSharing(workspaceId: string, kind: DocumentKind, id: string) {
  const result = await documentModel(kind).updateOne(ownedFilter(workspaceId, id, DOCUMENT_LABEL[kind]), {
    $unset: { shareToken: '' },
  });
  if (result.matchedCount === 0) throw notFoundError(DOCUMENT_LABEL[kind]);
  return { shareUrl: null };
}
