/**
 * Notes and terms section
 */

import React from 'react';
import { TextField, Stack } from '@mui/material';
import { DocumentMode } from './types';

interface NotesSectionProps {
  mode: DocumentMode;
  document: any;
  onUpdateField: (field: string, value: any) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  mode,
  document,
  onUpdateField,
}) => {
  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label="Notes"
        value={document.notes || ''}
        onChange={(e) => onUpdateField('notes', e.target.value)}
        multiline
        rows={3}
        placeholder="Additional notes for the client..."
        size="small"
      />
      <TextField
        fullWidth
        label="Terms & Conditions"
        value={document.terms || ''}
        onChange={(e) => onUpdateField('terms', e.target.value)}
        multiline
        rows={3}
        placeholder="Payment terms, refund policy, etc..."
        size="small"
      />
      {mode === 'quotation' && 'paymentTerms' in document && (
        <TextField
          fullWidth
          label="Payment Terms"
          value={document.paymentTerms || ''}
          onChange={(e) => onUpdateField('paymentTerms', e.target.value)}
          placeholder="E.g., Net 30 days, 50% upfront..."
          size="small"
        />
      )}
    </Stack>
  );
};
