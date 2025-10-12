/**
 * Refactored Document Generator Page
 * Broken down into smaller, maintainable components
 */

import React, { useState } from "react";
import {
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Print as PrintIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DocumentPreview } from "../components/InvoicePreview/DocumentPreview";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../hooks/useInvoices";
import { useQuotations } from "../hooks/useQuotations";
import { resetInvoice } from "../store/invoiceSlice";
import { resetQuotation } from "../store/quotationSlice";

// Component imports
import { DocumentHeader } from "../components/DocumentGenerator/DocumentHeader";
import { LogoUpload } from "../components/DocumentGenerator/LogoUpload";
import { DocumentDetails } from "../components/DocumentGenerator/DocumentDetails";
import { FromSection } from "../components/DocumentGenerator/FromSection";
import { DatesSection } from "../components/DocumentGenerator/DatesSection";
import { ClientSection } from "../components/DocumentGenerator/ClientSection";
import { LineItems } from "../components/DocumentGenerator/LineItems";
import { AdditionalCharges } from "../components/DocumentGenerator/AdditionalCharges";
import { TotalsSummary } from "../components/DocumentGenerator/TotalsSummary";
import { NotesSection } from "../components/DocumentGenerator/NotesSection";

// Hook imports
import { useDocumentHandlers } from "../components/DocumentGenerator/useDocumentHandlers";
import { useDocumentCalculations } from "../components/DocumentGenerator/useDocumentCalculations";

// Type imports
import {
  DocumentMode,
  NotificationState,
} from "../components/DocumentGenerator/types";

interface DocumentGeneratorPageProps {
  mode: DocumentMode;
}

export const DocumentGeneratorPage: React.FC<DocumentGeneratorPageProps> = ({
  mode,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const { saveInvoice, syncing: invoiceSyncing } = useInvoices();
  const { saveQuotation, syncing: quotationSyncing } = useQuotations();

  // Get the appropriate state based on mode
  const invoice = useAppSelector((state) => state.invoice);
  const quotation = useAppSelector((state) => state.quotation);
  const document = mode === "invoice" ? invoice : quotation;

  // Local state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Determine if saving is in progress
  const isSaving = mode === "invoice" ? invoiceSyncing : quotationSyncing;

  // Theme colors based on mode
  const themeColor = mode === "quotation" ? "#2196f3" : "#4caf50";
  const themeLightBg = mode === "quotation" ? "#e3f2fd" : "#e8f5e9";

  // Custom hooks
  const handlers = useDocumentHandlers(mode, document);
  const calculations = useDocumentCalculations(document, mode);

  // Logo upload handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "File size must be less than 2MB",
          severity: "error",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setNotification({
          open: true,
          message: "Please upload an image file",
          severity: "error",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handlers.handleSetLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "File size must be less than 2MB",
          severity: "error",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setNotification({
          open: true,
          message: "Please upload an image file",
          severity: "error",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handlers.handleSetLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF and Print handlers
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = window.document.getElementById("invoice-preview");

      if (!element) {
        throw new Error("Preview element not found");
      }

      const filename =
        mode === "invoice"
          ? `invoice-${(document as any).invoiceNumber}.pdf`
          : `quotation-${(document as any).quotationNumber}.pdf`;

      const opt = {
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      setNotification({
        open: true,
        message: "PDF downloaded successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);

      // Extract error message if available
      let errorMessage = "Failed to generate PDF";
      if (error?.message) {
        errorMessage = `Failed to generate PDF: ${error.message}`;
      }

      setNotification({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToServer = async () => {
    if (!isAuthenticated || user?.isAnonymous) {
      setNotification({
        open: true,
        message: "Please login to save to server",
        severity: "error",
      });
      return;
    }

    try {
      if (mode === "invoice") {
        const invoiceId = (invoice as any).id;
        await saveInvoice(invoiceId);
        setNotification({
          open: true,
          message: "Invoice saved to server successfully!",
          severity: "success",
        });

        // Reset the form and navigate to dashboard after successful save
        setTimeout(() => {
          dispatch(resetInvoice());
          navigate("/");
        }, 1500); // Wait 1.5s to show success message
      } else {
        const quotationId = (quotation as any).id;
        await saveQuotation(quotationId);
        setNotification({
          open: true,
          message: "Quotation saved to server successfully!",
          severity: "success",
        });

        // Reset the form and navigate to dashboard after successful save
        setTimeout(() => {
          dispatch(resetQuotation());
          navigate("/");
        }, 1500); // Wait 1.5s to show success message
      }
    } catch (error: any) {
      console.error("Error saving to server:", error);

      // Extract error message from server response if available
      let errorMessage = `Failed to save ${mode} to server`;

      if (error?.response?.data?.message) {
        // Server returned a specific error message
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        // Alternative error field
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        // Generic error message
        errorMessage = error.message;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handlePrint = () => {
    const printContent = window.document.getElementById("invoice-preview");
    if (!printContent) {
      setNotification({
        open: true,
        message: "Preview content not found",
        severity: "error",
      });
      return;
    }

    // Clone the element to get all computed styles
    const clonedContent = printContent.cloneNode(true) as HTMLElement;

    // Get all elements with computed styles
    const getAllElements = (element: HTMLElement): HTMLElement[] => {
      const elements: HTMLElement[] = [element];
      const children = element.querySelectorAll("*");
      children.forEach((child) => elements.push(child as HTMLElement));
      return elements;
    };

    const originalElements = getAllElements(printContent);
    const clonedElements = getAllElements(clonedContent);

    // Copy computed styles to inline styles
    originalElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const clonedElement = clonedElements[index];

      // Copy important styles
      const stylesToCopy = [
        "color",
        "background-color",
        "font-family",
        "font-size",
        "font-weight",
        "line-height",
        "text-align",
        "padding",
        "margin",
        "border",
        "border-radius",
        "display",
        "width",
        "height",
        "max-width",
        "max-height",
        "min-width",
        "min-height",
        "box-shadow",
        "letter-spacing",
        "text-transform",
        "white-space",
        "flex-direction",
        "align-items",
        "justify-content",
        "gap",
        "flex",
        "flex-wrap",
      ];

      stylesToCopy.forEach((property) => {
        const value = computedStyle.getPropertyValue(property);
        if (value && value !== "" && value !== "none" && value !== "0px") {
          clonedElement.style.setProperty(property, value, "important");
        }
      });
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setNotification({
        open: true,
        message: "Unable to open print window",
        severity: "error",
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${mode === "invoice" ? "Invoice" : "Quotation"}</title>
          <meta charset="UTF-8">
          <style>
            * {
              box-sizing: border-box;
            }
            body { 
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background: #fff;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10mm;
              }
              @page { 
                margin: 10mm;
                size: A4 portrait;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${clonedContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const confirmPrint = () => {
    setIsPrintPreview(false);
    setTimeout(() => window.print(), 100);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? All unsaved data will be lost."
      )
    ) {
      if (mode === "invoice") {
        dispatch(resetInvoice());
      } else {
        dispatch(resetQuotation());
      }
      setNotification({
        open: true,
        message: `${
          mode === "invoice" ? "Invoice" : "Quotation"
        } form has been reset`,
        severity: "success",
      });
    }
  };

  // Get labels based on mode
  const getLabel = (key: string): string => {
    const labels: Record<string, { invoice: string; quotation: string }> = {
      title: { invoice: "Invoice Generator", quotation: "Quotation Generator" },
      header: { invoice: "INVOICE", quotation: "QUOTATION" },
      number: { invoice: "Invoice Number", quotation: "Quotation Number" },
      date: { invoice: "Invoice Date", quotation: "Quotation Date" },
      secondDate: { invoice: "Due Date", quotation: "Valid Until" },
      client: { invoice: "BILL TO", quotation: "QUOTE FOR" },
      total: { invoice: "Total", quotation: "Total Quote" },
    };
    return labels[key]?.[mode] || "";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Top Navigation Bar - Sticky */}
      <Box
        sx={{
          bgcolor: "#ffffff",
           position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        <DocumentHeader
          mode={mode}
          document={document}
          isAuthenticated={isAuthenticated}
          isAnonymous={user?.isAnonymous || false}
          isSaving={isSaving}
          isDownloading={isDownloading}
          onBack={() => navigate("/")}
          onSave={handleSaveToServer}
          onPreview={() => setIsPreviewOpen(true)}
          onDownload={handleDownloadPDF}
          onPrint={handlePrint}
          onReset={handleReset}
          getLabel={getLabel}
        />
      </Box>

      {/* Split Screen Layout */}
      <Box
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f1f5f9",
        }}
      >
        {/* Left Side - Form */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", lg: "1 1 50%" },
            maxWidth: { xs: "100%", lg: "50%" },
            overflowY: "auto",
            height: "calc(100vh - 64px)",
            backgroundColor: "#ffffff",
            p: { xs: 3, sm: 4, md: 5 },
            borderRight: { lg: "1px solid #e2e8f0" },
            // Custom scrollbar styles
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              opacity: 1,
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent',
          }}
        >
          {/* ROW 1: Logo + Document Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              mb: 4,
              alignItems: "flex-start",
            }}
          >
            <LogoUpload
              logo={document.logo || ""}
              isDragging={isDragging}
              themeColor={themeColor}
              themeLightBg={themeLightBg}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={() => handlers.handleSetLogo("")}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
            <DocumentDetails
              mode={mode}
              document={document}
              themeColor={themeColor}
              onUpdateField={handlers.handleUpdateField}
              getLabel={getLabel}
            />
          </Box>

          {/* ROW 2: FROM + Dates */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              mb: 4,
            }}
          >
            <FromSection
              from={document.from}
              onUpdateFromField={handlers.handleUpdateFromField}
            />
            <DatesSection
              mode={mode}
              document={document}
              themeColor={themeColor}
              themeLightBg={themeLightBg}
              onUpdateField={handlers.handleUpdateField}
              getLabel={getLabel}
            />
          </Box>

          {/* ROW 3: Client Info */}
          <ClientSection
            mode={mode}
            document={document}
            onUpdateClientField={handlers.handleUpdateClientField}
            getLabel={getLabel}
          />

          {/* ROW 4: LINE ITEMS */}
          <LineItems
            items={document.items}
            currency={document.currency}
            themeColor={themeColor}
            onItemChange={handlers.handleItemChange}
            onDeleteItem={handlers.handleDeleteItem}
            onAddItem={handlers.handleAddItem}
          />

          {/* ROW 5: Additional Charges + Totals Summary */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: { xs: 3, md: 3 },
              mb: 4,
            }}
          >
            <AdditionalCharges
              mode={mode}
              document={document}
              onUpdateField={handlers.handleUpdateField}
            />
            <TotalsSummary
              mode={mode}
              document={document}
              themeColor={themeColor}
              subtotal={calculations.calculateSubtotal()}
              tax={calculations.calculateTax()}
              discount={calculations.calculateDiscount()}
              total={calculations.calculateTotal()}
              balance={calculations.calculateBalance()}
            />
          </Box>

          {/* ROW 6: Notes, Terms, and Payment Terms */}
          <NotesSection
            mode={mode}
            document={document}
            onUpdateField={handlers.handleUpdateField}
          />
        </Box>

        {/* Right Side - Live Preview (Desktop Only) */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            flex: "1 1 50%",
            maxWidth: "50%",
            overflowY: "auto",
            height: "calc(100vh - 64px)",
            backgroundColor: "#f8fafc",
            p: 4,
            position: "sticky",
            top: 64,
            // Custom scrollbar styles
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              opacity: 1,
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent',
          }}
        >
          <Box id="invoice-preview">
            <DocumentPreview document={document} mode={mode} />
          </Box>
        </Box>
      </Box>

      {/* Preview Dialog (Mobile) */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: "80vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {mode === "invoice" ? "Invoice" : "Quotation"} Preview
          </Typography>
          <IconButton onClick={() => setIsPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DocumentPreview document={document} mode={mode} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog
        open={isPrintPreview}
        onClose={() => setIsPrintPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: "80vh" } }}
      >
        <DialogTitle>Print Preview</DialogTitle>
        <DialogContent>
          <Box id="print-preview">
            <DocumentPreview document={document} mode={mode} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPrintPreview(false)}>Cancel</Button>
          <Button
            onClick={confirmPrint}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};
