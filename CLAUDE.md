# invoice-generator — invoices service

Invoices and quotations for Quantalog workspaces. A microservice in the same mould as `../da-forms`: a React + Mantine frontend in `frontend`, an Express + TypeScript + Mongoose backend in `backend`, one git repo, one Vercel project. Quantalog is live with real users, so this service has to be safe and fast from its first deploy.

`npm run install:all` installs all three packages. `npm run dev` at this root starts the backend on port 8082 and the frontend on port 3002, which proxies `/api` to 8082. These ports sit next to da-forms (8081 and 3001) and Quantalog (4000, 5173, 5777), so all three products can run at once. Backend tests use `node:test` (`npm test` in `backend`, files `src/**/*.test.ts`). `vercel.json` sends `/api/*` to `backend/api/index.ts` and everything else to the frontend build.

## Current state

The repo was a standalone frontend-only app. It is now a monorepo and the whole app is being redesigned.

- `frontend` is still the old app. It uses MUI with its own theme, its own login, register and Google sign-in (a JWT kept in `localStorage`), axios (`src/api/client.ts`), Redux slices (`src/store`) and `html2pdf.js`. `main.tsx` already wraps it in `MantineProvider` with the shared Quantalog theme, so redesigned screens are built in Mantine while the old MUI screens keep working until they are replaced.
- The old screens call an older external API: `/auth/*`, `/invoices/*`, `/quotations/*` (CRUD plus `status`, `pdf`, `email`, `duplicate` and `convert`) and `/dashboard/stats|recent`. That API is not in this repo. The new `backend` replaces it, scoped to Quantalog workspaces instead of its own user accounts.
- `DocumentGeneratorPage.old.tsx` is dead code, kept only as a reference while the screens are redone.
- `backend` so far has the app factory, the Mongo connection, the error, not-found and async handlers, the bearer-secret guard, workspace-token verification and `GET /api/health`. No domain models or routes exist yet.

## Structure

### Backend (`backend/src`)

Same layout as `da-forms/backend`. Reuse its patterns and copy its helpers rather than inventing new ones.

- `server.ts` exports the app and listens only outside Vercel. `api/index.ts` is the Vercel entry.
- `app.ts`: middleware order. It sets `trust proxy` and `cors()`, a 2mb JSON body limit, and connects to the database per request through `connectDb` (`config/db.ts` caches the connection promise), then mounts `/api`, `notFound` and `errorHandler`.
- `config/env.ts` is the only place that reads `process.env`.
- `routes/*.route.ts` are thin routers mounted in `routes/index.ts`. Controllers in `controllers/` parse input and respond. Logic lives in `services/*`, Mongoose models in `models/*`, and pure helpers in `lib/*`. Wrap async handlers with `asyncHandler`.
- `middleware/require-workspace-token.ts` guards every `/api/workspaces/:workspaceId/*` route. `middleware/require-bearer-secret.ts` guards `/api/internal/*` (with `INVOICE_SERVICE_SECRET`) and `/api/cron/*` (with `CRON_SECRET`). Both fail closed when their secret is unset.
- Errors return `{ error, message }` (`ApiError` in `types/index.ts`) with an accurate status code.

### Frontend (`frontend/src`)

- `main.tsx`: Mantine (`app/theme.ts`, `Notifications` at top-center) around the Redux provider and `App`.
- `app/theme.ts` is a copy of `da-forms/frontend/src/app/theme.ts`, which matches `real-ana-fe/src/app/theme.ts`. `styles/tokens.css`, `mantine-overrides.css`, `dropdown.css` and `fonts.css` (Google Sans Flex in `assets/fonts`) are copies of the da-forms files. Keep all three repos in step: a token or theme change goes to `real-ana-fe`, `da-forms` and here together.
- `lib/notify.ts` is the toast helper (the same as da-forms), styled by `components/ui/Toast.module.css`.
- The `@/` alias points to `src`.
- Target layout for redesigned code: `pages/*` for routes, `components/<area>/*` for UI, `hooks/*`, `lib/*` for pure helpers, and `api/*` for requests.

## Quantalog integration (planned, touches both repos)

This service follows da-forms' contract with Quantalog. None of it is wired yet. Each step changes `real-ana-be`, `real-ana-fe` and this repo together.

1. **Workspace token.** Quantalog mints a one-hour token for editors and above, the same format as the forms token (`workspaceId.expiresAt.actorId.signature`, HMAC-SHA256, base64url), signed with `INVOICE_SERVICE_SECRET`. It needs a new route next to `real-ana-be/src/http/routes/forms-token.ts`. `lib/workspace-token.ts` here already verifies that format. The token rides in `Authorization: Bearer`, or in `?wt=` on the first iframe load.
2. **Embedding.** The dashboard embeds the frontend in an iframe with `?embedded=1` and passes its theme. Port da-forms' `lib/bootParams.ts`, `app/themeParams.ts`, `app/hostTokens.ts` and `hooks/useEmbedded.ts`. Every embedded page header shows the Quantalog notification bell next to the Docs button.
3. **Replace standalone auth.** Once embedded, the login, register and Google screens, the `authToken` in `localStorage` and the 401 redirect in `api/client.ts` go away. Every request carries the workspace token, and every route is under `/api/workspaces/:workspaceId/*`.
4. **Service to service.** Calls to Quantalog (plan limits, branding, the bell, audit) go through one `lib/quantalog.ts` client to `/api/internal/invoices/*` with `Bearer INVOICE_SERVICE_SECRET`, like da-forms' `lib/quantalog.ts`. Plan limits refuse with Quantalog's `planLimit` shape (402, `quota_exceeded` or `plan_required`).
5. **Workspace purge.** `DELETE /api/internal/workspaces/:workspaceId` deletes every invoice, quotation and client of a workspace when Quantalog deletes the workspace.
6. **Apps tile and docs.** Register the app on Quantalog's Apps page (follow the checklist in `../real-time-analytics/CLAUDE.md` → Apps), and add a docs page in `quantalog-lp/src/content/docs`.

Scheduled work, such as overdue reminders or recurring invoices, runs inside an existing Cloudflare Worker tick (the account is at its trigger limit) by calling `/api/cron/*` here with `Bearer CRON_SECRET`. Never use a timer or in-process cron.

## Roadmap

1. Backend models and routes, scoped by `workspaceId`: `Invoice`, `Quotation` and `Client`, with per-workspace numbering through an atomic counter (`findOneAndUpdate` with `$inc`), status, quotation → invoice convert and duplicate.
2. The Quantalog token, embedding and auth replacement above.
3. Redesign every screen in Mantine: the list and dashboard, the document editor with a live preview, and the client book. Remove a screen's MUI code in the same change. When the last MUI screen is gone, drop `@mui/*`, `@emotion/*` and the MUI `ThemeProvider` in `App.tsx`.
4. PDF export without the eager `html2pdf.js` import (load it only on the screen that downloads), and email sending through the workspace's email app in da-forms or Quantalog.
5. Payment links through the workspace's existing gateways (Razorpay, Cashfree, PayU), and paid status from their webhooks.
6. Overdue reminders and recurring invoices inside an existing cron tick.

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
   - The accent marks selected states, and only the primary button is monochrome.
6. Every workspace query includes `workspaceId`. Bound every list with a limit or pagination, use `.select()` and `.lean()` for read-only results, and add an index for every new query shape.
7. Run independent awaits with `Promise.all`. No queries inside loops.
8. Deployed to Vercel serverless. Don't rely on in-memory state. Work after a response (email, webhooks) goes through Vercel's `waitUntil`, as in da-forms' `lib/afterResponse.ts`.
9. Keep response shapes stable once Quantalog reads them. A change to a token claim, internal route or shape updates both repos in the same change.
10. Load heavy frontend libraries (PDF, charts) only on the screen that uses them. No polling and no refetch on focus.
11. Secrets (gateway keys, SMTP passwords) are encrypted at rest and only ever returned masked. Never put a real secret in an `.env.example`.
12. The developer runs type-checks, builds and tests. Don't run `tsc`, builds or test suites unless asked. In the final message, say what changed, what to check by hand, and any new endpoint, index, cron work or startup request.
