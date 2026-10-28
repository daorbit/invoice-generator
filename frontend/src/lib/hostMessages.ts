import { IS_EMBEDDED } from './bootParams';

function postToHost(message: Record<string, unknown>): boolean {
  if (!IS_EMBEDDED || window.parent === window) return false;
  window.parent.postMessage(message, '*');
  return true;
}

export function requestOpenNotifications() {
  postToHost({ type: 'quantalog:open-notifications' });
}
