import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OpenFromQuantalog } from '@/components/ui/OpenFromQuantalog';
import { useDismissOnHostFocus } from '@/hooks/useDismissOnHostFocus';
import { WORKSPACE_ID } from '@/lib/bootParams';

const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const DocumentEditorPage = lazy(() =>
  import('@/pages/DocumentEditorPage').then((m) => ({ default: m.DocumentEditorPage }))
);

export function App() {
  useDismissOnHostFocus();

  if (!WORKSPACE_ID) return <OpenFromQuantalog />;

  return (
    <BrowserRouter basename={`/${WORKSPACE_ID}`}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<DocumentsPage />} />
          <Route path="/invoices/new" element={<DocumentEditorPage key="invoice-new" kind="invoice" />} />
          <Route path="/invoices/:id" element={<DocumentEditorPage kind="invoice" />} />
          <Route path="/quotations/new" element={<DocumentEditorPage key="quotation-new" kind="quotation" />} />
          <Route path="/quotations/:id" element={<DocumentEditorPage kind="quotation" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
