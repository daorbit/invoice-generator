import { WORKSPACE_TOKEN } from './bootParams';

let current = WORKSPACE_TOKEN;

export function workspaceToken(): string {
  return current;
}

let askedOnce = false;
let asking: Promise<string> | null = null;

export async function ensureWorkspaceToken(): Promise<string> {
  if (current) return current;
  if (asking) return asking;
  if (askedOnce) return '';
  askedOnce = true;
  asking = refreshWorkspaceToken().finally(() => {
    asking = null;
  });
  return asking;
}

type Waiter = (token: string) => void;
let waiters: Waiter[] = [];
let pending = false;

export function refreshWorkspaceToken(timeoutMs = 5000): Promise<string> {
  if (typeof window === 'undefined' || window.parent === window) {
    return Promise.resolve('');
  }
  askedOnce = true;

  return new Promise((resolve) => {
    waiters.push(resolve);
    if (pending) return;
    pending = true;

    const settle = (token: string) => {
      if (!pending) return;
      pending = false;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      if (token) current = token;
      const pendingWaiters = waiters;
      waiters = [];
      for (const waiter of pendingWaiters) waiter(token);
    };

    function onMessage(event: MessageEvent) {
      if (event.data?.type !== 'quantalog:workspace-token') return;
      settle(typeof event.data.token === 'string' ? event.data.token : '');
    }

    const timer = setTimeout(() => settle(''), timeoutMs);
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'quantalog:workspace-token-request' }, '*');
  });
}
