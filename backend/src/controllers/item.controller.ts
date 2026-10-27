import type { RequestHandler } from 'express';
import { readItemInput } from '../lib/item-input.js';
import { readPageQuery } from '../lib/list-query.js';
import { createItem, deleteItem, listItems, updateItem } from '../services/item.service.js';
import { actorOf, documentIdOf, workspaceIdOf } from './shared.js';

export const list: RequestHandler = async (req, res) => {
  res.json(await listItems(workspaceIdOf(req), readPageQuery(req.query)));
};

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await createItem(workspaceIdOf(req), actorOf(res), readItemInput(req.body)));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await updateItem(workspaceIdOf(req), documentIdOf(req), readItemInput(req.body)));
};

export const remove: RequestHandler = async (req, res) => {
  await deleteItem(workspaceIdOf(req), documentIdOf(req));
  res.status(204).end();
};
