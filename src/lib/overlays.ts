const closers: Array<() => boolean> = [];

export function registerOverlayCloser(fn: () => boolean): () => void {
  closers.push(fn);
  return () => {
    const i = closers.lastIndexOf(fn);
    if (i >= 0) closers.splice(i, 1);
  };
}

export function closeTopOverlay(): boolean {
  for (let i = closers.length - 1; i >= 0; i--) {
    if (closers[i]()) return true;
  }
  return false;
}
