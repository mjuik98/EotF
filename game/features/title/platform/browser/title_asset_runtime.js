function getAssetRuntimeCache(data) {
  if (!data || typeof data !== 'object') return new Map();
  if (!(data.__assetRuntimeCache instanceof Map)) {
    Object.defineProperty(data, '__assetRuntimeCache', {
      value: new Map(),
      configurable: true,
      enumerable: false,
      writable: true,
    });
  }
  return data.__assetRuntimeCache;
}

function resolveExplicitAssetUrl(manifest, domain, id) {
  const entry = manifest?.[domain]?.[id];
  if (!entry || typeof entry !== 'object') return '';

  const explicitUrl = entry.src || entry.href || entry.url || '';
  return explicitUrl ? String(explicitUrl) : '';
}

export function resolveTitleAssetUrl(data, domain, id) {
  const explicitUrl = resolveExplicitAssetUrl(data?.assetManifest, domain, id);
  if (explicitUrl) return String(explicitUrl);

  return data?.assetPreview?.resolveUrl?.(domain, id) || '';
}

function loadImageUrl(url, createImage) {
  return new Promise((resolve, reject) => {
    const image = typeof createImage === 'function'
      ? createImage()
      : null;
    if (!image) {
      resolve(false);
      return;
    }

    image.onload = () => resolve(true);
    image.onerror = (error) => reject(error || new Error(`Failed to load image asset: ${url}`));
    image.src = url;
  });
}

export async function preloadAssetRefs(data, refs = [], options = {}) {
  const createImage = options.createImage
    || (() => (typeof Image !== 'undefined' ? new Image() : null));
  const cache = getAssetRuntimeCache(data);
  const normalizedRefs = refs
    .map((ref) => ({
      domain: String(ref?.domain || ''),
      id: String(ref?.id || ''),
    }))
    .filter((ref) => ref.domain && ref.id);

  await Promise.all(
    normalizedRefs.map(async ({ domain, id }) => {
      const key = `${domain}.${id}`;
      if (cache.has(key)) {
        await cache.get(key);
        return;
      }

      const url = resolveTitleAssetUrl(data, domain, id);
      if (!url) return;

      const pending = loadImageUrl(url, createImage)
        .catch(() => false);
      cache.set(key, pending);
      await pending;
    }),
  );

  return { loaded: normalizedRefs.length };
}

export async function preloadAssetDomain(data, domain, options = {}) {
  const ids = Object.keys(data?.assetManifest?.[domain] || {});
  return preloadAssetRefs(
    data,
    ids.map((id) => ({ domain, id })),
    options,
  );
}
