# invoice-generator — invoices service

Quotations and invoices for Quantalog workspaces, shipped as the Quantalog app **Invoicing** (`apps.invoicing`). A microservice in the same mould as `../da-forms`: a React + Mantine frontend in `frontend`, an Express + TypeScript + Mongoose backend in `backend`, one git repo, one Vercel project. Quantalog is live with real users, so this service has to be safe and fast.

`npm run install:all` installs all three packages. `npm run dev` at this root starts the backend on port 8082 and the frontend on port 3002, which proxies `/api` to 8082. These ports sit next to da-forms (8081 and 3001) and Quantalog (4000, 5173, 5777), so all three products can run at once. Backend tests use `node:test` (`npm test` in `backend`, files `src/**/*.test.ts`). `vercel.json` sends `/api/*` to `backend/api/index.ts` and everything else to the frontend build.

Positioning: a connected Quantalog app (leads → quote → invoice → paid), GST-ready for Indian businesses. It is not an accounting tool; no expenses, ledgers or inventory.

## How it fits into Quantalog

There are no accounts here. Quantalog owns the session; this service trusts a workspace token.

- **Turning it on.** A workspace admin enables Invoicing in Quantalog → Apps. The app panel then shows the business details form (`real-ana-fe/src/features/invoices/components/InvoicingSettings.tsx`, registered in `APP_SETTINGS`), which saves to this service's `PUT /settings`. The sidebar item **Invoices** (`/app/invoices`) appears once the app is on. The tile stays hidden while `VITE_INVOICES_URL` is unset, and the app is always off in demo.
- **Token.** Quantalog mints a one-hour token at `POST /api/workspaces/:wid/invoices-token` (`real-ana-be/src/http/routes/invoices-token.ts`, editor and above, refuses while the app is off). It has the forms-token format (`workspaceId.expiresAt.actorId.signature`, HMAC-SHA256, base64url) signed with `INVOICE_SERVICE_SECRET`. `backend/src/lib/workspace-token.ts` verifies it.
- **Embedding.** `real-ana-fe/src/features/invoices/pages/Invoices.tsx` loads `${VITE_INVOICES_URL}/<workspaceId>?embedded=1&mode=…&wt=<token>` in an iframe. The frontend reads the workspace id from the first path segment and the token from `wt` (`frontend/src/lib/bootParams.ts`), then uses the path as the router `basename`. When the token expires, `lib/workspaceToken.ts` asks the host for a new one with `quantalog:workspace-token-request`; the host answers through `useHostFrameToken`.
- **Purge.** Deleting a workspace in Quantalog calls `DELETE /api/internal/workspaces/:workspaceId` here (`purgeInvoiceWorkspace` in `real-ana-be/src/infra/http-client/invoice-service.ts`), with `Bearer INVOICE_SERVICE_SECRET`.
- **Production.** This service runs at `https://invoicing.daorbit.in` (Vercel project `invoicing-generaotr`).
- **Env.** Quantalog backend: `INVOICES_API_BASE` (this service's origin) and `INVOICE_SERVICE_SECRET`. Quantalog dashboard: `VITE_INVOICES_URL` (this service's origin). Here: `INVOICE_SERVICE_SECRET` (same value), `MONGODB_URI`, `QUANTALOG_API_URL`, `CRON_SECRET`.

A change to a token claim, an internal route or a response shape updates both repos in the same change.

## Backend (`backend/src`)

Same layout as `da-forms/backend`.

- `app.ts`: `trust proxy`, `cors()`, a 4mb JSON limit for invoice and quotation bodies (they can carry a logo data URL), 2mb elsewhere, a per-request `connectDb`, then `/api`, `notFound`, `errorHandler`.
- `routes/index.ts`: `/health`, `/internal` (bearer secret), and `/workspaces/:workspaceId` (`workspace.route.ts`, guarded by `requireWorkspaceToken`) with `/invoices`, `/quotations`, `/dashboard` and `/settings`.
- Invoices and quotations: list (paginated, `status`, `search`, `sortBy`, `sortOrder`), read, create, update, delete, `PATCH /:id/status`, `POST /:id/duplicate`. Quotations also have `POST /:id/convert`, which creates one invoice and links it through `convertedInvoiceId`. Dashboard: `GET /dashboard/stats` and `GET /dashboard/recent?limit=` (max 25).
- Settings: `GET /settings` returns `{ profile, complete }`, and `PUT /settings` validates and saves the business profile (`lib/business-profile-input.ts`: name, email and address are required; the GSTIN format is checked; prefixes are capital letters, digits and dashes).
- Models: `Invoice`, `Quotation` (shared parts in `models/document-parts.ts`), `Counter` (per workspace and kind) and `BusinessProfile`. Every query includes `workspaceId`, and unique indexes cover `{workspaceId, invoiceNumber}` and `{workspaceId, quotationNumber}`.
- Input never reaches a model unread: `lib/document-input.ts` whitelists fields, caps lengths, item count (200) and the logo size, and recomputes each line amount. `lib/totals.ts` computes subtotal, tax, discount and total on the server, using the editor's rules.
- Numbers: a blank number on create, every duplicate and every conversion take the next value from `services/numbering.service.ts` (`<prefix>-0001`, the prefix from the business profile).
- Response shapes (`lib/serialize.ts`), read by `frontend/src/lib/documentMapping.ts`: `{ id, invoice, status, createdAt, updatedAt }`, `{ id, quotation, … }`, and lists as `{ invoices|quotations, total, page, limit, totalPages }`. Dashboard routes wrap results in `{ success, data }`.
- Errors throw `HttpError` (`lib/http-error.ts`). Ids that are not ObjectIds, and documents from another workspace, answer 404.

## Frontend (`frontend/src`)

All Mantine, built from the same pieces as da-forms so the frame reads as part of Quantalog. MUI, Redux and recharts are gone; don't bring them back.

- `main.tsx`: reads the host theme from the boot URL (`app/themeParams.ts`, `app/hostTokens.ts`, `lib/color.ts`, copied from da-forms), then renders Mantine with `app/theme.ts` and the top-center `Notifications`.
- `app/App.tsx`: without a workspace id in the path it shows `OpenFromQuantalog`. Otherwise, under `basename=/<workspaceId>`: `/` (`DocumentsPage`, `?view=quotations` for the quotations tab), `/invoices/new|:id` and `/quotations/new|:id` (`DocumentEditorPage`).
- `components/ui/*` are da-forms' building blocks: `PageHeader`, `DocsButton`, `HostNotificationsBell`, `EmptyState`, `SegmentedTabs`, `SearchField`, `StatusPill`, `toolbar.module.css`. Every page header shows the Docs button and, when embedded, the bell.
- `pages/DocumentsPage.tsx` with `pages/documents/*`: summary strip (paid, outstanding, invoices, open quotations), setup notice while the business profile is incomplete, invoice and quotation tabs, status menu, search, grouped hairline rows with a row menu (open, duplicate, convert, mark as, delete), pagination.
- `pages/DocumentEditorPage.tsx` with `pages/editor/*`: grouped sections (From from the business profile, details, client, items, tax, discount and payment, notes and terms) beside a live preview (`components/preview/DocumentPreview.tsx`, always a white sheet). Saving a new document assigns its number and moves to its URL. The status menu saves straight away.
- Data: `api/documents.ts` and `api/workspace.ts` (axios in `api/client.ts`, workspace token on every call, one retry after a refresh). `lib/documentMapping.ts` turns invoice and quotation records into one `DocumentDraft` and back. `lib/totals.ts` mirrors the server's totals. Hooks: `useDocumentList`, `useDocumentEditor`, `useDocumentActions`, `useDashboardStats`, `useBusinessProfile` (cached once per load), `usePdfDownload` (imports `html2pdf.js` only when clicked).
- `lib/hostMessages.ts` talks to Quantalog: `openBusinessDetails` opens the Invoicing panel in Apps, and `requestOpenNotifications` opens the bell.
- `app/theme.ts` and `styles/*` are copies of da-forms', which match `real-ana-fe`; keep all three in step. Toasts go through `lib/notify.ts`. `@/` points to `src`.

## Roadmap

1. A client book, so a client picked once is filled in on the next document, and creating a quotation straight from a da-forms lead.
2. Warn before leaving the editor with unsaved changes, and a logo from Quantalog Branding on the preview.
3. GST invoices: HSN/SAC per line, CGST/SGST or IGST by place of supply, numbering by financial year.
4. Payment links through the workspace's gateways, and paid status from their webhooks.
5. Send quotations and invoices by email, through the workspace's email app.
6. Overdue reminders inside an existing cron tick (`/api/cron/*` with `Bearer CRON_SECRET`; the Cloudflare account is at its trigger limit).
7. Plan limits through Quantalog (`/api/internal/invoices/*`), and paid revenue fed back into Quantalog analytics by lead source.
8. Docs page `quantalog-lp/src/content/docs/quantalog-invoicing.tsx`, and an entry in the landing page Apps carousel.

## Rules

1. No comments in any code file, including CSS.
2. No inline CSS. Use Mantine props, CSS modules and the shared token files. Mantine only.
3. Split code into components, hooks, services and utilities. Never put a whole feature in one file.
4. Before writing anything new, search this repo, then `../da-forms`, then `../real-time-analytics` for an existing helper, component or style, and reuse it.
5. Design rules from `../CLAUDE.md`:
   - Apple-like grouped lists, hairline borders and generous spacing.
   - No gradients, glow or coloured shadows. Hover changes border, background, colour or opacity only.
   - Errors and status go in the top-center toast (`lib/notify.ts`), in one short sentence.
   - Literal `lucide-react` icons, no sparkle icons, no monogram tiles. Prices are green (`var(--green)`).
6. Every workspace query includes `workspaceId`. Bound every list, use `.select()` and `.lean()` for reads, and add an index for every new query shape.
7. Run independent awaits with `Promise.all`. No queries inside loops. Take a new document number only after the source document has been found, so failed requests leave no gaps.
8. Deployed to Vercel serverless. Don't rely on in-memory state. Work after a response goes through Vercel's `waitUntil`, as in da-forms' `lib/afterResponse.ts`.
9. Keep response shapes stable once Quantalog reads them.
10. Load heavy frontend libraries only on the screen that uses them. No polling and no refetch on focus.
11. Never put a real secret in an `.env.example`.
12. The developer runs type-checks, builds and tests. Don't run `tsc`, builds or test suites unless asked. In the final message, say what changed, what to check by hand, and any new endpoint, index, cron work or startup request.
