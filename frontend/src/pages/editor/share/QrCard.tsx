import { Button, Skeleton } from '@mantine/core';
import { Download } from 'lucide-react';
import { useQrCode } from '@/hooks/useQrCode';
import classes from './Share.module.css';

const QR_WIDTH = 512;

function fileNameFor(name: string): string {
  const slug = name.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return `${slug || 'document'}-qr.png`;
}

export function QrCard({ url, name }: { url: string; name: string }) {
  const src = useQrCode(url, { width: QR_WIDTH, margin: 1 });

  return (
    <div className={classes.qrRow}>
      <div className={classes.qr}>{src ? <img src={src} alt="QR code for the link" /> : <Skeleton w={84} h={84} />}</div>
      <div className={classes.qrText}>
        <span className={classes.muted}>Scanning it opens the link on a phone.</span>
        <Button
          component="a"
          href={src ?? undefined}
          download={fileNameFor(name)}
          variant="default"
          size="xs"
          leftSection={<Download size={14} />}
          disabled={!src}
        >
          Download PNG
        </Button>
      </div>
    </div>
  );
}
