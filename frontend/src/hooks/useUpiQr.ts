import { useQrCode } from './useQrCode';

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
  const enabled = Boolean(request.upiId) && request.currency === 'INR' && request.amount > 0;
  return useQrCode(enabled ? upiUri(request) : '', { width: QR_SIZE_PX, margin: 0, delayMs: RENDER_DELAY_MS });
}
