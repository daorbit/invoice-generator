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
};
