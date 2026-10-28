import { Button } from '@mantine/core';
import { Undo2 } from 'lucide-react';
import { StudioModal, studioClasses } from '@/components/studio/StudioModal';
import { StudioTopbar } from '@/components/studio/StudioTopbar';
import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { KIND_META } from '@/lib/documentMeta';
import { isBlankDraft } from '@/lib/orbit/orbitSnapshot';
import type { DocumentDraft } from '@/types/document';
import { OrbitPanel } from './OrbitPanel';
import { useOrbitStudio } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

interface Props {
  opened: boolean;
  draft: DocumentDraft;
  onApply: (draft: DocumentDraft) => void;
  onClose: () => void;
}

export default function OrbitStudio({ opened, draft, onApply, onClose }: Props) {
  const studio = useOrbitStudio(draft);
  const label = KIND_META[draft.kind].singular.toLowerCase();
  const startedBlank = isBlankDraft(draft);

  const apply = () => {
    onApply(studio.draft);
    onClose();
  };

  return (
    <StudioModal opened={opened} onClose={onClose}>
      <StudioTopbar
        title="Orbit"
        subtitle={draft.number || `New ${label}`}
        onClose={onClose}
        actions={
          <>
            <Button
              variant="transparent"
              className={studioClasses.pillButton}
              leftSection={<Undo2 size={15} />}
              disabled={!studio.changed || studio.busy}
              onClick={studio.undo}
            >
              Undo
            </Button>
            <Button disabled={!studio.changed || studio.busy} onClick={apply}>
              {startedBlank ? `Use this ${label}` : 'Apply changes'}
            </Button>
          </>
        }
      />
      <div className={studioClasses.body}>
        <OrbitPanel studio={studio} />
        <section className={studioClasses.stage} aria-label="Preview">
          <div className={classes.sheet}>
            <ScaledPage>
              <DocumentPreview draft={studio.draft} />
            </ScaledPage>
          </div>
        </section>
      </div>
    </StudioModal>
  );
}
