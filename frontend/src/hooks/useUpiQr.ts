import { useEffect, useState } from 'react';

const RENDER_DELAY_MS = 250;
const QR_SIZE_PX = 240;

interface UpiRequest {
  upiId: string | undefined;
  payee: string;
  amount: number;
  currency: string;
  note: string;
}

function upiUri({ upiId, payee, amount, note }: UpiRequest): string {
  const params = new URLSearchParams({ pa: upiId ?? '', pn: payee, am: amount.toFixed(2), cu: 'INR', tn: note });
  return `upi://pay?${params.toString()}`;
}

export function useUpiQr(request: UpiRequest): string | null {
  const [src, setSrc] = useState<string | null>(null);
  const enabled = Boolean(request.upiId) && request.currency === 'INR' && request.amount > 0;
  const uri = enabled ? upiUri(request) : '';

  useEffect(() => {
    if (!uri) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      import('qrcode')
        .then(({ default: QRCode }) =>
          QRCode.toDataURL(uri, {
            margin: 0,
            width: QR_SIZE_PX,
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
    }, RENDER_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [uri]);

  return src;
}
