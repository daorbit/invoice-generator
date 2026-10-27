import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentEditorPage } from '@/pages/DocumentEditorPage';
import { OpenFromQuantalog } from '@/components/ui/OpenFromQuantalog';
import { useDismissOnHostFocus } from '@/hooks/useDismissOnHostFocus';
import { WORKSPACE_ID } from '@/lib/bootParams';

export function App() {
  useDismissOnHostFocus();

  if (!WORKSPACE_ID) return <OpenFromQuantalog />;

  return (
    <BrowserRouter basename={`/${WORKSPACE_ID}`}>
      <Routes>
        <Route path="/" element={<DocumentsPage />} />
        <Route path="/invoices/new" element={<DocumentEditorPage key="invoice-new" kind="invoice" />} />
        <Route path="/invoices/:id" element={<DocumentEditorPage kind="invoice" />} />
        <Route path="/quotations/new" element={<DocumentEditorPage key="quotation-new" kind="quotation" />} />
        <Route path="/quotations/:id" element={<DocumentEditorPage kind="quotation" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
