import type { ReactNode } from 'react';
import { SectionNav } from './SectionNav';
import classes from './SectionPage.module.css';

export function SectionPage({ children }: { children: ReactNode }) {
  return (
    <div className={classes.shell}>
      <main className={classes.content}>{children}</main>
      <SectionNav />
    </div>
  );
}
