import type { RequestHandler } from 'express';
import { readReportPeriod, readReportScope } from '../lib/report-period.js';
import { overviewReport } from '../services/reports/overview-report.js';
import { receivablesReport } from '../services/reports/receivables-report.js';
import { SALES_GROUPINGS, salesReport, type SalesGrouping } from '../services/reports/sales-report.js';
import { paymentsReport } from '../services/reports/payments-report.js';
import { gstReport } from '../services/reports/gst-report.js';
import { workspaceIdOf } from './shared.js';

function grouping(value: unknown): SalesGrouping {
  return (SALES_GROUPINGS as readonly unknown[]).includes(value) ? (value as SalesGrouping) : 'customer';
}

export const overview: RequestHandler = async (req, res) => {
  res.json(await overviewReport(workspaceIdOf(req), readReportPeriod(req.query)));
};

export const receivables: RequestHandler = async (req, res) => {
  res.json(await receivablesReport(workspaceIdOf(req), readReportScope(req.query)));
};

export const sales: RequestHandler = async (req, res) => {
  res.json(await salesReport(workspaceIdOf(req), readReportPeriod(req.query), grouping(req.query.by)));
};

export const payments: RequestHandler = async (req, res) => {
  res.json(await paymentsReport(workspaceIdOf(req), readReportPeriod(req.query)));
};

export const gst: RequestHandler = async (req, res) => {
  res.json(await gstReport(workspaceIdOf(req), readReportPeriod(req.query)));
};
