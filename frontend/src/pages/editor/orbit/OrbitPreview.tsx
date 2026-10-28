import { Loader } from '@mantine/core';
import { Check } from 'lucide-react';
import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import type { OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

export function OrbitPreview({ studio, actionLabel }: { studio: OrbitStudioState; actionLabel: string }) {
  const { draft, busy, changed } = studio;

  return (
    <section className={classes.pane} aria-label="Preview">
      <div className={classes.previewBar}>
        <span className={classes.status}>
          {busy ? (
            <>
              <Loader size={12} type="dots" color="var(--accent)" />
              Orbit is working
            </>
          ) : changed ? (
            <>
              <Check size={14} className={classes.statusTick} />
              Ready
            </>
          ) : (
            'Preview'
          )}
        </span>
        {changed && !busy && <span className={classes.statusHint}>Press {actionLabel} to keep it</span>}
      </div>
      <div className={classes.canvas}>
        <div className={classes.sheet}>
          <ScaledPage>
            <DocumentPreview draft={draft} />
          </ScaledPage>
        </div>
      </div>
    </section>
  );
}
