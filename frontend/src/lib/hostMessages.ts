import { IS_EMBEDDED } from './bootParams';

const APP_TILE = 'quantalog-invoicing';

function postToHost(message: Record<string, unknown>): boolean {
  if (!IS_EMBEDDED || window.parent === window) return false;
  window.parent.postMessage(message, '*');
  return true;
}

export function requestOpenNotifications() {
  postToHost({ type: 'quantalog:open-notifications' });
}

export function openBusinessDetails() {
  postToHost({ type: 'quantalog:open-integrations', app: APP_TILE });
}
