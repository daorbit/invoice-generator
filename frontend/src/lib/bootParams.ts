export const BOOT_SEARCH = window.location.search;

const params = new URLSearchParams(BOOT_SEARCH);

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function bootWorkspaceId(): string {
  const [first = ''] = window.location.pathname.split('/').filter(Boolean);
  return OBJECT_ID.test(first) ? first : '';
}

export const WORKSPACE_ID = bootWorkspaceId();

export const IS_EMBEDDED = params.get('embedded') === '1';

export const WORKSPACE_TOKEN = params.get('wt') ?? '';

export type HostColorScheme = 'light' | 'dark' | 'auto';

export const HOST_COLOR_SCHEME: HostColorScheme = (() => {
  const mode = params.get('mode');
  return mode === 'light' || mode === 'dark' ? mode : 'auto';
})();
