import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { DocumentGeneratorPage } from './pages/DocumentGeneratorPage';
import { DashboardPage } from './pages/DashboardPage';
import { OpenFromQuantalog } from './components/ui/OpenFromQuantalog';
import { WORKSPACE_ID } from './lib/bootParams';
import { legacyTheme } from './app/legacyTheme';

const App: React.FC = () => {
  if (!WORKSPACE_ID) return <OpenFromQuantalog />;

  return (
    <ThemeProvider theme={legacyTheme}>
      <CssBaseline />
      <BrowserRouter basename={`/${WORKSPACE_ID}`}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/invoice" element={<DocumentGeneratorPage mode="invoice" />} />
          <Route path="/quotation" element={<DocumentGeneratorPage mode="quotation" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
