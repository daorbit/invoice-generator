import type { PaymentDetails } from '@/types/document';
import classes from './DocumentPreview.module.css';

interface Props {
  payment: PaymentDetails;
  qr: string | null;
}

export function PreviewPayment({ payment, qr }: Props) {
  const rows: [string, string][] = [
    ['Bank', payment.bankName],
    ['Account name', payment.accountName],
    ['Account number', payment.accountNumber],
    ['IFSC', payment.ifsc],
    ['UPI', payment.upiId],
  ];
  const filled = rows.filter(([, value]) => value);
  if (!filled.length) return null;

  return (
    <div className={classes.payment}>
      <div>
        <div className={classes.label}>Payment details</div>
        <div className={classes.paymentRows}>
          {filled.map(([label, value]) => (
            <div key={label} className={classes.metaRow}>
              <span className={classes.metaLabel}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      {qr && (
        <div className={classes.qr}>
          <img src={qr} alt="UPI payment QR code" />
          Scan to pay with any UPI app
        </div>
      )}
    </div>
  );
}
