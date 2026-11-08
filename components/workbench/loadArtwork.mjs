// onload is the compatibility fallback for browsers that reject decode() on SVGs.
export function loadArtworkImage(url, createImage = () => new Image(), timeoutMs = 12000) {
  return new Promise(resolve => {
    const image = createImage();
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true; clearTimeout(timer); image.onload = image.onerror = null; resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    image.fetchPriority = 'low';
    image.onload = () => finish(image.naturalWidth || image.width ? image : null);
    image.onerror = () => finish(null);
    image.src = url;
    if (typeof image.decode === 'function') image.decode().then(() => finish(image), () => {
      if (image.complete && (image.naturalWidth || image.width)) finish(image);
    });
  });
}
