# invoice-generator

Invoices and quotations for Quantalog workspaces.

| Folder | What it is |
|---|---|
| `frontend` | React 19, Vite, Mantine, embedded in Quantalog at `/app/invoices` |
| `backend` | Express 4, Mongoose 9, TypeScript ESM, Vercel serverless |

## Run locally

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

The backend runs on http://localhost:8082 and the frontend on http://localhost:3002, which proxies `/api` to the backend.

See `CLAUDE.md` for the structure, the Quantalog integration and the roadmap.
