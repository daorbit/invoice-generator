import 'da-frame-set/styles.css';
import { useState } from 'react';
import { Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Download, Palette } from 'lucide-react';
import { DeviceFrame, frameSize, getDevice, useFitScale } from 'da-frame-set';
import { StudioModal, studioClasses } from '@/components/studio/StudioModal';
import { StudioTopbar } from '@/components/studio/StudioTopbar';
import { DesignPanel } from '@/components/design/DesignPanel';
import { KIND_META } from '@/lib/documentMeta';
import type { AccentId, DocumentDraft, TemplateId } from '@/types/document';
import { DocumentScreen } from './DocumentScreen';
import { DEVICE_FRAME, DeviceSwitch, type PreviewDevice } from './DeviceSwitch';

interface Props {
  opened: boolean;
  draft: DocumentDraft;
  downloading: boolean;
  onClose: () => void;
  onTemplate: (value: TemplateId) => void;
  onAccent: (value: AccentId) => void;
  onDownload: () => void;
}

export default function PreviewStudio({ opened, draft, downloading, onClose, onTemplate, onAccent, onDownload }: Props) {
  const narrow = useMediaQuery('(max-width: 48em)', false, { getInitialValueInEffect: false });
  const [device, setDevice] = useState<PreviewDevice>(narrow ? 'phone' : 'laptop');
  const [designOpen, setDesignOpen] = useState(true);
  const size = frameSize(getDevice(DEVICE_FRAME[device]));
  const { ref, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 48, y: 48 },
  });
  const title = draft.number || `New ${KIND_META[draft.kind].singular.toLowerCase()}`;

  return (
    <StudioModal opened={opened} onClose={onClose}>
      <StudioTopbar
        title={title}
        subtitle="Preview"
        onClose={onClose}
        center={<DeviceSwitch value={device} onChange={setDevice} />}
        actions={
          <>
            <Button
              variant="transparent"
              className={studioClasses.pillButton}
              leftSection={<Download size={15} />}
              loading={downloading}
              onClick={onDownload}
            >
              PDF
            </Button>
            <Button
              variant="transparent"
              className={studioClasses.pillButton}
              data-active={designOpen || undefined}
              leftSection={<Palette size={15} />}
              onClick={() => setDesignOpen((open) => !open)}
            >
              Design
            </Button>
          </>
        }
      />
      <div className={studioClasses.body}>
        <div className={studioClasses.stage} ref={ref}>
          <DeviceFrame device={DEVICE_FRAME[device]} scale={scale} hidden={!measured}>
            <DocumentScreen draft={draft} device={device} />
          </DeviceFrame>
        </div>
        {designOpen && (
          <DesignPanel draft={draft} onTemplate={onTemplate} onAccent={onAccent} />
        )}
      </div>
    </StudioModal>
  );
}
