import type { RequestHandler } from 'express';
import { INVOICE_STATUSES } from '../models/invoice.model.js';
import { readInvoiceInput } from '../lib/document-input.js';
import { readListQuery } from '../lib/list-query.js';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  setInvoiceStatus,
  duplicateInvoice,
} from '../services/invoice.service.js';
import { actorOf, documentIdOf, readStatus, workspaceIdOf } from './shared.js';

export const list: RequestHandler = async (req, res) => {
  res.json(await listInvoices(workspaceIdOf(req), readListQuery(req.query, INVOICE_STATUSES)));
};

export const read: RequestHandler = async (req, res) => {
  res.json(await getInvoice(workspaceIdOf(req), documentIdOf(req)));
};

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await createInvoice(workspaceIdOf(req), actorOf(res), readInvoiceInput(req.body)));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await updateInvoice(workspaceIdOf(req), actorOf(res), documentIdOf(req), readInvoiceInput(req.body)));
};

export const remove: RequestHandler = async (req, res) => {
  await deleteInvoice(workspaceIdOf(req), documentIdOf(req));
  res.status(204).end();
};

export const updateStatus: RequestHandler = async (req, res) => {
  const status = readStatus(req.body, INVOICE_STATUSES);
  res.json(await setInvoiceStatus(workspaceIdOf(req), documentIdOf(req), status));
};

export const duplicate: RequestHandler = async (req, res) => {
  res.status(201).json(await duplicateInvoice(workspaceIdOf(req), actorOf(res), documentIdOf(req)));
};
