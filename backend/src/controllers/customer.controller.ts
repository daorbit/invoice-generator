import type { RequestHandler } from 'express';
import { readCustomerInput } from '../lib/customer-input.js';
import { readPageQuery } from '../lib/list-query.js';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from '../services/customer.service.js';
import { actorOf, documentIdOf, workspaceIdOf } from './shared.js';

export const list: RequestHandler = async (req, res) => {
  res.json(await listCustomers(workspaceIdOf(req), readPageQuery(req.query)));
};

export const read: RequestHandler = async (req, res) => {
  res.json(await getCustomer(workspaceIdOf(req), documentIdOf(req)));
};

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await createCustomer(workspaceIdOf(req), actorOf(res), readCustomerInput(req.body)));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await updateCustomer(workspaceIdOf(req), documentIdOf(req), readCustomerInput(req.body)));
};

export const remove: RequestHandler = async (req, res) => {
  await deleteCustomer(workspaceIdOf(req), documentIdOf(req));
  res.status(204).end();
};
