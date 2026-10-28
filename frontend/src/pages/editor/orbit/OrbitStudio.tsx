import { Button } from '@mantine/core';
import { Undo2 } from 'lucide-react';
import { StudioModal, studioClasses } from '@/components/studio/StudioModal';
import { StudioTopbar } from '@/components/studio/StudioTopbar';
import { KIND_META } from '@/lib/documentMeta';
import { isBlankDraft } from '@/lib/orbit/orbitSnapshot';
import type { DocumentDraft } from '@/types/document';
import { OrbitHero } from './OrbitHero';
import { OrbitPanel } from './OrbitPanel';
import { OrbitPreview } from './OrbitPreview';
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
  const actionLabel = startedBlank ? `Use this ${label}` : 'Apply changes';
  const showHero = startedBlank && studio.turns.length === 0;

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
          !showHero && (
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
                {actionLabel}
              </Button>
            </>
          )
        }
      />
      {showHero ? (
        <OrbitHero studio={studio} />
      ) : (
        <div className={classes.split}>
          <OrbitPanel studio={studio} />
          <OrbitPreview studio={studio} actionLabel={actionLabel} />
        </div>
      )}
    </StudioModal>
  );
}
