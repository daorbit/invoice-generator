import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ReceiptText } from 'lucide-react';
import classes from './OpenFromQuantalog.module.css';

export function OpenFromQuantalog() {
  return (
    <div className={classes.page}>
      <Stack align="center" gap="sm" maw={380}>
        <ThemeIcon variant="light" size={48} radius="xl">
          <ReceiptText size={24} />
        </ThemeIcon>
        <Title order={2} ta="center">
          Open Invoices from Quantalog
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          Invoices belong to a Quantalog workspace. Open them from the Invoices page in your workspace.
        </Text>
      </Stack>
    </div>
  );
}
