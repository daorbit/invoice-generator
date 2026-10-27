import type { RequestHandler } from 'express';
import { QUOTATION_STATUSES } from '../models/quotation.model.js';
import { readQuotationInput } from '../lib/document-input.js';
import { readListQuery } from '../lib/list-query.js';
import {
  listQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  setQuotationStatus,
  duplicateQuotation,
  convertQuotation,
} from '../services/quotation.service.js';
import { actorOf, documentIdOf, readStatus, workspaceIdOf } from './shared.js';

export const list: RequestHandler = async (req, res) => {
  res.json(await listQuotations(workspaceIdOf(req), readListQuery(req.query, QUOTATION_STATUSES)));
};

export const read: RequestHandler = async (req, res) => {
  res.json(await getQuotation(workspaceIdOf(req), documentIdOf(req)));
};

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await createQuotation(workspaceIdOf(req), actorOf(res), readQuotationInput(req.body)));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await updateQuotation(workspaceIdOf(req), actorOf(res), documentIdOf(req), readQuotationInput(req.body)));
};

export const remove: RequestHandler = async (req, res) => {
  await deleteQuotation(workspaceIdOf(req), documentIdOf(req));
  res.status(204).end();
};

export const updateStatus: RequestHandler = async (req, res) => {
  const status = readStatus(req.body, QUOTATION_STATUSES);
  res.json(await setQuotationStatus(workspaceIdOf(req), documentIdOf(req), status));
};

export const duplicate: RequestHandler = async (req, res) => {
  res.status(201).json(await duplicateQuotation(workspaceIdOf(req), actorOf(res), documentIdOf(req)));
};

export const convert: RequestHandler = async (req, res) => {
  res.json(await convertQuotation(workspaceIdOf(req), actorOf(res), documentIdOf(req)));
};
