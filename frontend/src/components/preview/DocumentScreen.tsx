import type { DocumentDraft } from '@/types/document';
import { DocumentPreview } from './DocumentPreview';
import type { PreviewDevice } from './DeviceSwitch';
import classes from './DocumentScreen.module.css';

export function DocumentScreen({ draft, device }: { draft: DocumentDraft; device: PreviewDevice }) {
  return (
    <div className={classes.screen} data-device={device}>
      <div className={classes.page}>
        <DocumentPreview draft={draft} />
      </div>
    </div>
  );
}
