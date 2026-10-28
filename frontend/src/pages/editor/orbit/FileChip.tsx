import { ActionIcon } from '@mantine/core';
import { FileImage, FileText, X } from 'lucide-react';
import classes from './OrbitStudio.module.css';

interface Props {
  name: string;
  kind?: 'image' | 'pdf';
  onRemove?: () => void;
}

export function FileChip({ name, kind, onRemove }: Props) {
  const Icon = kind === 'image' ? FileImage : FileText;
  return (
    <span className={classes.fileChip}>
      <Icon size={13} />
      <span className={classes.fileName}>{name}</span>
      {onRemove && (
        <ActionIcon variant="subtle" color="gray" size="xs" radius="xl" onClick={onRemove} aria-label="Remove attachment">
          <X size={12} />
        </ActionIcon>
      )}
    </span>
  );
}
