import { useEffect, useState } from 'react';

interface QrOptions {
  width: number;
  margin: number;
  delayMs?: number;
}

export function useQrCode(value: string, { width, margin, delayMs = 0 }: QrOptions): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      import('qrcode')
        .then(({ default: QRCode }) =>
          QRCode.toDataURL(value, {
            margin,
            width,
            errorCorrectionLevel: 'M',
            color: { dark: '#111827', light: '#ffffff' },
          })
        )
        .then((url) => {
          if (!cancelled) setSrc(url);
        })
        .catch(() => {
          if (!cancelled) setSrc(null);
        });
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, width, margin, delayMs]);

  return src;
}
