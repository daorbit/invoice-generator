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
- **Email.** Document emails go through Quantalog's mailer: `lib/quantalog.ts` posts to `POST /api/internal/invoices/email/:workspaceId` (`real-ana-be/src/http/routes/invoices-internal.ts`, `Bearer INVOICE_SERVICE_SECRET`, 200 a day per workspace, refused while the app is off). It sends from "Business via Quantalog" with Reply-To set to the business email, a button to the public link and the browser-made PDF attached.
- **Scheduled emails.** `EmailOutbox` rows are sent by `POST /api/cron/scheduled-emails` (`Bearer CRON_SECRET`), which the `sweep-uploads-cron` Worker calls every 5 minutes through `INVOICES_API_BASE`.
- **Env.** Quantalog backend: `INVOICES_API_BASE` (this service's origin) and `INVOICE_SERVICE_SECRET`. Quantalog dashboard: `VITE_INVOICES_URL` (this service's origin). Here: `INVOICE_SERVICE_SECRET` (same value), `MONGODB_URI`, `QUANTALOG_API_URL`, `CRON_SECRET` (same value as the Worker), `PUBLIC_APP_URL` (this service's origin, used for share links).

A change to a token claim, an internal route or a response shape updates both repos in the same change.

## Backend (`backend/src`)

Same layout as `da-forms/backend`.

- `app.ts`: `trust proxy`, `cors()`, a 4mb JSON limit for invoice and quotation bodies (they can carry a logo data URL), 2mb elsewhere, a per-request `connectDb`, then `/api`, `notFound`, `errorHandler`.
- `routes/index.ts`: `/health`, `/internal` (bearer secret), `/cron` (`CRON_SECRET`), `/public` (rate limited, no token) and `/workspaces/:workspaceId` (`workspace.route.ts`, guarded by `requireWorkspaceToken`) with `/invoices`, `/quotations`, `/customers`, `/items`, `/reports`, `/dashboard` and `/settings`.
- GST: lines carry `taxRate`, `hsn`, `unit` and `itemId`; documents carry `taxMode` (`line` for everything the editor saves, `document` for older single-rate documents), `pricesIncludeTax`, `roundOff`, `placeOfSupply`, `reverseCharge` and `exportUnderLut`. `lib/totals.ts` computes per-line tax after a pro-rata discount and stores `taxLines` (per rate), `taxableAmount`, `roundOffAmount`; `services/document-pricing.ts` adds `supplyState` and `interState` from `lib/gst.ts`. The frontend mirrors both in `lib/totals.ts`, `lib/gst.ts` and `lib/taxRows.ts`; change them together.
- Customers and items: `Customer` and `Item` models, unique by `{workspaceId, nameKey}`. Saving a document links or creates its customer (`ensureCustomer`) and stores `customerId`. The first customer list in a workspace seeds customers from existing documents once (`customer-seed.service.ts`, `BusinessProfile.customersSeededAt`).
- Sharing: `POST|DELETE /:kind/:id/share` sets or clears `shareToken`; `GET /api/public/documents/:token` serves the public page data and counts views (`?preview=1` does not); `POST .../respond` lets a client accept or decline an open quotation (`clientResponse`). `POST /:kind/:id/email` sends now or, with `sendAt`, schedules an `EmailOutbox` row; `DELETE /:kind/:id/email/schedule` cancels it. Responses carry `activity` (share URL, views, last and scheduled email).
- Reports (`services/reports/*`): `overview`, `receivables`, `sales?by=customer|item`, `payments` and `gst`, all for one currency, from issued invoices (`sent`, `paid`, `overdue`) dated in `from`–`to`. Paid date is `paidAt`, set when an invoice is marked paid, falling back to `updatedAt` for older ones.
- Invoices and quotations: list (paginated, `status`, `search`, `sortBy`, `sortOrder`), read, create, update, delete, `PATCH /:id/status`, `POST /:id/duplicate`. Quotations also have `POST /:id/convert`, which creates one invoice and links it through `convertedInvoiceId`. Dashboard: `GET /dashboard/stats` and `GET /dashboard/recent?limit=` (max 25).
- Settings: `GET /settings` returns `{ profile, complete }`, and `PUT /settings` validates and saves the business profile (`lib/business-profile-input.ts`: name, email and address are required; GSTIN, IFSC, UPI ID and account number formats are checked; prefixes are capital letters, digits and dashes; the logo is a `data:image/` URL under 300 KB; `defaultTemplate` and `accentColor` come from `lib/design.ts`).
- Design and payment: documents carry `template` (ids `classic`, `modern`, `minimal`, `bold`, `soft`, `studio`, `agency`, `capsule`, `banner`, `panel`, shown as Standard, Spreadsheet, Minimalist, Grand, Soft Cards, Studio, Agency, Capsule, Banner and Panel; the ids are stored, so never rename them, and a new one goes into `lib/design.ts`, the frontend `TemplateId`, `TEMPLATES` in `DocumentPreview.tsx`, `TEMPLATE_OPTIONS`, and Quantalog's `INVOICE_TEMPLATES`), `accent` (a palette id, not a hex) and a `payment` snapshot (bank, account, IFSC, UPI). Parties carry an optional `gstin`. From, payment, template and accent are copied from the profile when a document is created, so later profile changes never alter a sent document. The logo is branding, not a legal detail: a document without its own `logo` renders the profile's current logo (`components/preview/BrandLogo.tsx`, provided by the editor page).
- Models: `Invoice`, `Quotation` (shared parts in `models/document-parts.ts`), `Counter` (per workspace and kind) and `BusinessProfile`. Every query includes `workspaceId`, and unique indexes cover `{workspaceId, invoiceNumber}` and `{workspaceId, quotationNumber}`.
- Input never reaches a model unread: `lib/document-input.ts` whitelists fields, caps lengths, item count (200) and the logo size, and recomputes each line amount. `lib/totals.ts` computes subtotal, tax, discount and total on the server, using the editor's rules.
- Numbers: a blank number on create, every duplicate and every conversion take the next value from `services/numbering.service.ts` (`<prefix>-0001`, the prefix from the business profile).
- Response shapes (`lib/serialize.ts`), read by `frontend/src/lib/documentMapping.ts`: `{ id, invoice, status, createdAt, updatedAt }`, `{ id, quotation, … }`, and lists as `{ invoices|quotations, total, page, limit, totalPages }`. Dashboard routes wrap results in `{ success, data }`.
- Errors throw `HttpError` (`lib/http-error.ts`). Ids that are not ObjectIds, and documents from another workspace, answer 404.

## Frontend (`frontend/src`)

All Mantine, built from the same pieces as da-forms so the frame reads as part of Quantalog. MUI, Redux and recharts are gone; don't bring them back.

- `main.tsx`: reads the host theme from the boot URL (`app/themeParams.ts`, `app/hostTokens.ts`, `lib/color.ts`, copied from da-forms), then renders Mantine with `app/theme.ts` and the top-center `Notifications`.
- `app/App.tsx`: `/p/<token>` renders `PublicDocumentPage` (light theme, no workspace token, `api/public.ts`). Without a workspace id in the path it shows `OpenFromQuantalog`. Otherwise, under `basename=/<workspaceId>`: `/` and `/quotations` (`DocumentsPage` with `kind`; the old `/?view=quotations` redirects), `/invoices/new|:id` and `/quotations/new|:id` (`DocumentEditorPage`, `?customer=<id>` prefills a new document), `/customers` and `/customers/:id`, `/items`, `/reports` (`?report=` picks the tab). List pages share `components/layout/SectionPage` (a grouped left sidebar, `SectionNav`, that becomes one scrolling row below 56em), `components/list/RowList` and `ListRow`, `components/ui/StatStrip` and `ConfirmModal`.
- Editor sharing lives in `pages/editor/share/*` (`ShareDialog` with `EmailPanel` and `LinkPanel`), driven by `hooks/useShareActions.ts`; the PDF attachment comes from `usePdfDownload().dataUri`. `ActivityLine` shows views, emails and the client's answer under the title.
- `components/ui/*` are da-forms' building blocks: `PageHeader`, `DocsButton`, `HostNotificationsBell`, `EmptyState`, `SegmentedTabs`, `SearchField`, `StatusPill`, `toolbar.module.css`. Every page header shows the Docs button and, when embedded, the bell.
- `pages/DocumentsPage.tsx` with `pages/documents/*`: summary strip (paid, outstanding, invoices, open quotations), setup notice while the business profile is incomplete, invoice and quotation tabs, status menu, search, grouped hairline rows with a row menu (open, duplicate, convert, mark as, delete), pagination.
- `pages/DocumentEditorPage.tsx` with `pages/editor/*`: five numbered steps (`EditorStep`: client with past-client suggestions from `GET /clients`, items, dates with payment-term picks, tax with GST-rate picks, notes) and a `PreviewCanvas` (a live A4 preview on a grey canvas, scaled to fit by `components/preview/ScaledPage.tsx`, which sets `--page-scale` on its frame, with a toolbar button showing the current design). The page is a full-height workspace: the header holds the only actions (status, PDF, Preview, Create or Save) and the two panes scroll independently; below 980px they stack and the page scrolls normally. The editor has no design controls: **Preview** opens `components/preview/PreviewStudio.tsx` (lazy), a full-screen studio like da-forms' preview, with the document in a `da-frame-set` laptop or phone frame and the `DesignPanel` (template and colour) on the right. PDFs render from an off-screen `PdfSource` at exactly A4 (794px wide, 1123px tall pages, no PDF margin). The document is always a white sheet: `useDocumentView` builds one view model, `PageShell` sets the page, accent and stamp, and each template in `components/preview/templates/*` has its own markup and CSS module, with shared payment, notes and words blocks in `templates/Extras.tsx`; the Design panel's picker renders a live miniature of the current document in every template; `data-accent` sets `--doc-accent` from `styles/accents.css`, so no inline styles are needed. It shows the Tax invoice heading when the seller has a GSTIN, an amount-due box, amount in words (`lib/amountInWords.ts`, lakh and crore for INR), payment details with a UPI QR (`hooks/useUpiQr.ts`, `qrcode` loaded only when needed), a signature block and a Paid or Cancelled stamp. Saving a new document assigns its number and moves to its URL. The status menu saves straight away.
- Data: `api/documents.ts` and `api/workspace.ts` (axios in `api/client.ts`, workspace token on every call, one retry after a refresh). `lib/documentMapping.ts` turns invoice and quotation records into one `DocumentDraft` and back. `lib/totals.ts` mirrors the server's totals. Hooks: `useDocumentList`, `useDocumentEditor`, `useDocumentActions`, `useDashboardStats`, `useBusinessProfile` (cached once per load), `usePdfDownload` (imports `html2pdf.js` only when clicked).
- `lib/hostMessages.ts` talks to Quantalog: `openBusinessDetails` opens the Invoicing panel in Apps, and `requestOpenNotifications` opens the bell.
- `app/theme.ts` and `styles/*` are copies of da-forms', which match `real-ana-fe`; keep all three in step. Toasts go through `lib/notify.ts`. `@/` points to `src`.

## Roadmap

1. Creating a quotation straight from a da-forms lead.
2. Warn before leaving the editor with unsaved changes.
3. GST: numbering by financial year, e-invoicing (IRN) and e-way bills.
4. Payment links through the workspace's gateways, recorded payments and receipts, and paid status from their webhooks.
5. Credit notes, proforma invoices and recurring invoices.
6. Overdue reminders inside the existing `scheduled-emails` cron tick.
7. Plan limits through Quantalog (`/api/internal/invoices/*`), and paid revenue fed back into Quantalog analytics by lead source.
8. Keep the user docs (`quantalog-lp/src/content/docs/quantalog-invoicing.tsx`) in step: every new field, status or action updates that page in the same change.

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
