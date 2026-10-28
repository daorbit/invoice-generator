import { useCallback, useState, type RefObject } from 'react';
import { notify } from '@/lib/notify';

const MARGIN_MM = 0;

async function loadHtml2pdf() {
  return (await import('html2pdf.js')).default;
}

function pdfOptions(fileName: string) {
  return {
    margin: MARGIN_MM,
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };
}

export function usePdfDownload(target: RefObject<HTMLElement | null>) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(
    async (fileName: string) => {
      const element = target.current;
      if (!element) return;
      setDownloading(true);
      try {
        const html2pdf = await loadHtml2pdf();
        await html2pdf().set(pdfOptions(fileName)).from(element).save();
      } catch {
        notify.error('Could not create the PDF. Try again.');
      } finally {
        setDownloading(false);
      }
    },
    [target]
  );

  const dataUri = useCallback(
    async (fileName: string): Promise<string> => {
      const element = target.current;
      if (!element) throw new Error('The preview is not ready yet.');
      const html2pdf = await loadHtml2pdf();
      return html2pdf().set(pdfOptions(fileName)).from(element).outputPdf('datauristring');
    },
    [target]
  );

  return { download, downloading, dataUri };
}
