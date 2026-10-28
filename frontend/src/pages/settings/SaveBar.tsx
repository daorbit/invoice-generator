import { Button } from '@mantine/core';
import { Check } from 'lucide-react';
import classes from './SettingsPage.module.css';

interface Props {
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ saving, onSave, onDiscard }: Props) {
  return (
    <div className={classes.saveBar} role="region" aria-label="Unsaved changes">
      <span className={classes.saveText}>You have unsaved changes</span>
      <div className={classes.saveActions}>
        <Button variant="default" onClick={onDiscard} disabled={saving}>
          Discard
        </Button>
        <Button leftSection={<Check size={15} />} loading={saving} onClick={onSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
