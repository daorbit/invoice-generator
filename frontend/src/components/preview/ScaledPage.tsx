import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useElementSize } from '@mantine/hooks';
import classes from './ScaledPage.module.css';

const PAGE_WIDTH = 794;

export function ScaledPage({ children }: { children: ReactNode }) {
  const viewport = useElementSize();
  const page = useElementSize();
  const frameRef = useRef<HTMLDivElement>(null);
  const scale = viewport.width ? Math.min(1, viewport.width / PAGE_WIDTH) : 0;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty('--page-scale', String(scale));
    if (page.height) frame.style.setProperty('--page-height', `${page.height}px`);
  }, [scale, page.height]);

  return (
    <div ref={viewport.ref} className={classes.viewport}>
      <div ref={frameRef} className={classes.frame}>
        <div ref={page.ref} className={classes.page}>
          {children}
        </div>
      </div>
    </div>
  );
}
