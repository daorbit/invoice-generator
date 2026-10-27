export const BOOT_SEARCH = window.location.search;

const params = new URLSearchParams(BOOT_SEARCH);

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function bootWorkspaceId(): string {
  const [first = ''] = window.location.pathname.split('/').filter(Boolean);
  return OBJECT_ID.test(first) ? first : '';
}

export const WORKSPACE_ID = bootWorkspaceId();

const PUBLIC_PATH = /^\/p\/([A-Za-z0-9_-]{20,64})\/?$/;

export const PUBLIC_TOKEN = PUBLIC_PATH.exec(window.location.pathname)?.[1] ?? '';

export const PUBLIC_PREVIEW = params.get('preview') === '1';

export const IS_EMBEDDED = params.get('embedded') === '1';

export const WORKSPACE_TOKEN = params.get('wt') ?? '';

export const HOST_TEXTURED_BG = IS_EMBEDDED && params.get('bg') === 'textured';

export const HOST_BG_WASH: string | null = (() => {
  if (!HOST_TEXTURED_BG) return null;
  const raw = params.get('bgwash');
  if (!raw || raw.length > 4000) return null;
  if (/url\(|expression|image-set|[;{}<>@\\]/i.test(raw)) return null;
  return raw;
})();
