import { forwardRef, type ReactNode } from 'react';
import type { DocumentView } from '../useDocumentView';
import classes from './page.module.css';

interface Props {
  view: DocumentView;
  children: ReactNode;
}

export const PageShell = forwardRef<HTMLDivElement, Props>(function PageShell({ view, children }, ref) {
  return (
    <div ref={ref} className={classes.page} data-template={view.draft.template} data-accent={view.draft.accent}>
      {view.stamp && (
        <span className={classes.stamp} data-tone={view.stamp.tone}>
          {view.stamp.label}
        </span>
      )}
      {children}
    </div>
  );
});

export function UpiQr({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    <div className={classes.qr}>
      <img src={src} alt="UPI payment QR code" />
      Scan to pay with any UPI app
    </div>
  );
}

export { classes as pageClasses };
