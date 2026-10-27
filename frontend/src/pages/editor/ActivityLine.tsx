import dayjs from 'dayjs';
import type { ClientResponse, DocumentActivity } from '@/types/document';
import classes from './ActivityLine.module.css';

interface Props {
  client: string;
  activity: DocumentActivity | null;
  response: ClientResponse | null;
}

function when(value: string): string {
  return dayjs(value).format('D MMM, h:mm A');
}

function parts(activity: DocumentActivity | null, response: ClientResponse | null): string[] {
  const list: string[] = [];
  if (response) {
    const verb = response.decision === 'accepted' ? 'Accepted' : 'Declined';
    const note = response.comment ? `: “${response.comment}”` : '';
    list.push(`${verb} by ${response.name} on ${when(response.at)}${note}`);
  }
  if (activity?.scheduledEmail) list.push(`Email scheduled for ${when(activity.scheduledEmail.at)}`);
  if (activity?.lastEmail) list.push(`Emailed ${when(activity.lastEmail.at)}`);
  if (activity?.views.count && activity.views.lastAt) {
    const times = activity.views.count === 1 ? 'once' : `${activity.views.count} times`;
    list.push(`Viewed ${times}`);
  }
  return list;
}

export function ActivityLine({ client, activity, response }: Props) {
  const items = [client, ...parts(activity, response)].filter(Boolean);
  return (
    <span className={classes.line}>
      {items.map((item) => (
        <span key={item} className={classes.item}>
          {item}
        </span>
      ))}
    </span>
  );
}
