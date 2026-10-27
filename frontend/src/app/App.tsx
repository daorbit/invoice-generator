import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OpenFromQuantalog } from '@/components/ui/OpenFromQuantalog';
import { useDismissOnHostFocus } from '@/hooks/useDismissOnHostFocus';
import { PUBLIC_TOKEN, WORKSPACE_ID } from '@/lib/bootParams';

const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const DocumentEditorPage = lazy(() =>
  import('@/pages/DocumentEditorPage').then((m) => ({ default: m.DocumentEditorPage }))
);
const CustomersPage = lazy(() => import('@/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() =>
  import('@/pages/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage }))
);
const ItemsPage = lazy(() => import('@/pages/ItemsPage').then((m) => ({ default: m.ItemsPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const PublicDocumentPage = lazy(() => import('@/pages/PublicDocumentPage'));

export function App() {
  useDismissOnHostFocus();

  if (PUBLIC_TOKEN) {
    return (
      <Suspense fallback={null}>
        <PublicDocumentPage token={PUBLIC_TOKEN} />
      </Suspense>
    );
  }

  if (!WORKSPACE_ID) return <OpenFromQuantalog />;

  return (
    <BrowserRouter basename={`/${WORKSPACE_ID}`}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<DocumentsPage key="invoices" kind="invoice" />} />
          <Route path="/quotations" element={<DocumentsPage key="quotations" kind="quotation" />} />
          <Route path="/invoices/new" element={<DocumentEditorPage key="invoice-new" kind="invoice" />} />
          <Route path="/invoices/:id" element={<DocumentEditorPage kind="invoice" />} />
          <Route path="/quotations/new" element={<DocumentEditorPage key="quotation-new" kind="quotation" />} />
          <Route path="/quotations/:id" element={<DocumentEditorPage kind="quotation" />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
