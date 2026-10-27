import { Button } from '@mantine/core';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';
import type { EmailStamp } from '@/types/document';
import classes from './Share.module.css';

interface Props {
  stamp: EmailStamp;
  cancelling: boolean;
  onCancel: () => void;
}

export function ScheduledRow({ stamp, cancelling, onCancel }: Props) {
  return (
    <div className={classes.scheduled}>
      <Clock size={15} className={classes.scheduledIcon} />
      <span className={classes.scheduledText}>
        Scheduled for <b>{dayjs(stamp.at).format('D MMM, h:mm A')}</b> to {stamp.to.join(', ')}
      </span>
      <Button variant="subtle" color="gray" size="compact-sm" loading={cancelling} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
