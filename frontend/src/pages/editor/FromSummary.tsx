import { Button } from '@mantine/core';
import { Building2 } from 'lucide-react';
import { openBusinessDetails } from '@/lib/hostMessages';
import type { Party } from '@/types/document';
import { EditorSection } from './EditorSection';
import classes from './FromSummary.module.css';

export function FromSummary({ from }: { from: Party }) {
  const contact = [from.email, from.phone, from.website].filter(Boolean).join(' · ');

  return (
    <EditorSection
      title="From"
      action={
        <Button variant="subtle" size="compact-sm" leftSection={<Building2 size={14} />} onClick={openBusinessDetails}>
          Business details
        </Button>
      }
    >
      {from.name ? (
        <div>
          <div className={classes.name}>{from.name}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          {contact && <div className={classes.lines}>{contact}</div>}
        </div>
      ) : (
        <span className={classes.empty}>
          Add your business details in Quantalog Apps and they will fill in here on every new document.
        </span>
      )}
    </EditorSection>
  );
}
