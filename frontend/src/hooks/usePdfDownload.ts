import { useCallback, useState, type RefObject } from 'react';
import { notify } from '@/lib/notify';

const MARGIN_MM = 10;

export function usePdfDownload(target: RefObject<HTMLElement | null>) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(
    async (fileName: string) => {
      const element = target.current;
      if (!element) return;
      setDownloading(true);
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf()
          .set({
            margin: MARGIN_MM,
            filename: `${fileName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(element)
          .save();
      } catch {
        notify.error('Could not create the PDF. Try again.');
      } finally {
        setDownloading(false);
      }
    },
    [target]
  );

  return { download, downloading };
}
