import type { RequestHandler } from 'express';
import { asObject, text } from '../lib/document-input.js';
import { badRequestError } from '../lib/http-error.js';
import { CLIENT_DECISIONS, type ClientDecision } from '../models/quotation.model.js';
import { readPublicDocument, replyToQuotation } from '../services/public-document.service.js';

function tokenOf(token: unknown): string {
  return typeof token === 'string' ? token : '';
}

function readReply(body: unknown) {
  const raw = asObject(body);
  if (!(CLIENT_DECISIONS as readonly unknown[]).includes(raw.decision)) {
    throw badRequestError('Choose to accept or decline');
  }
  const name = text(raw.name, 120);
  if (!name) throw badRequestError('Add your name');
  return { decision: raw.decision as ClientDecision, name, comment: text(raw.comment, 1000) };
}

export const read: RequestHandler = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await readPublicDocument(tokenOf(req.params.token), req.query.preview !== '1'));
};

export const respond: RequestHandler = async (req, res) => {
  res.json(await replyToQuotation(tokenOf(req.params.token), readReply(req.body)));
};
