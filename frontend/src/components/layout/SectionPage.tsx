import type { ReactNode } from 'react';
import { Box } from '@mantine/core';
import { SectionNav } from './SectionNav';
import classes from './SectionPage.module.css';

export function SectionPage({ children }: { children: ReactNode }) {
  return (
    <Box className={classes.page}>
      <SectionNav />
      {children}
    </Box>
  );
}
