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
- Response shapes match what the old screens expect (`lib/serialize.ts`): `{ id, invoice, status, createdAt, updatedAt }`, `{ id, quotation, … }`, and lists as `{ invoices|quotations, total, page, limit, totalPages }`. Dashboard routes wrap results in `{ success, data }`.
- Errors throw `HttpError` (`lib/http-error.ts`). Ids that are not ObjectIds, and documents from another workspace, answer 404.

## Frontend (`frontend/src`)

- `main.tsx`: Mantine (`app/theme.ts`, color scheme forced from the host's `mode`) around the Redux provider and `App`.
- `App.tsx`: without a workspace id in the path it shows `OpenFromQuantalog`. Otherwise it routes `/` (dashboard), `/invoice` and `/quotation` under `basename=/<workspaceId>`.
- `api/client.ts`: axios against `/api/workspaces/<workspaceId>`, with the workspace token on every request and one retry after a token refresh.
- `hooks/useBusinessDefaults.ts` fills a fresh draft's "From" details, currency, notes and terms from the business profile.
- The screens are still the old MUI ones (`pages/*`, `components/DocumentGenerator/*`, `app/legacyTheme.ts`) and are being redesigned in Mantine. `app/theme.ts` and `styles/*` are copies of da-forms', which match `real-ana-fe`; keep all three in step. Toasts go through `lib/notify.ts`. `@/` points to `src`.
- PDFs are made in the browser with `html2pdf.js`, which is imported dynamically on download.

## Roadmap

1. Redesign every screen in Mantine: the list and dashboard, the editor with a live preview, and the client book. Add `HostNotificationsBell` and a Docs button to each embedded header. Remove a screen's MUI code in the same change, then drop `@mui/*`, `@emotion/*` and `legacyTheme`.
2. Open, edit and delete saved documents from the dashboard (the old Edit and View buttons do nothing). Leave the number blank on new documents, so workspace numbering always applies.
3. Scope the Redux drafts kept in `localStorage` by workspace id.
4. GST invoices: HSN/SAC per line, CGST/SGST or IGST by place of supply, numbering by financial year.
5. Payment links through the workspace's gateways, and paid status from their webhooks.
6. Send quotations and invoices by email, through the workspace's email app.
7. Overdue reminders inside an existing cron tick (`/api/cron/*` with `Bearer CRON_SECRET`; the Cloudflare account is at its trigger limit).
8. Plan limits through Quantalog (`/api/internal/invoices/*`), and paid revenue fed back into Quantalog analytics by lead source.
9. Docs page `quantalog-lp/src/content/docs/quantalog-invoicing.tsx`, and an entry in the landing page Apps carousel.

## Rules

1. No comments in any code file, including CSS.
2. No inline CSS. Use Mantine props, CSS modules and the shared token files. No new MUI code: everything new or redesigned is Mantine.
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
