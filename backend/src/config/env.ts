import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8082),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: process.env.MONGODB_URI ?? '',
  quantalogApiUrl: (process.env.QUANTALOG_API_URL ?? '').replace(/\/$/, ''),
  invoiceServiceSecret: process.env.INVOICE_SERVICE_SECRET ?? '',
  formsInvoiceSecret: process.env.FORMS_INVOICE_SECRET ?? '',
  cronSecret: process.env.CRON_SECRET ?? '',
  publicAppUrl: (process.env.PUBLIC_APP_URL || 'https://invoicing.daorbit.in').replace(/\/$/, ''),
  dashboardOrigins: originList(process.env.DASHBOARD_ORIGINS),
};

function originList(raw: string | undefined): string[] {
  const value = raw || 'https://studio-quantalog.daorbit.in,http://localhost:5173,http://localhost:5174';
  return value.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
}
