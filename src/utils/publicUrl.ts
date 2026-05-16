/** Public asset path with Vite `base` (e.g. `/country_janggi/` on GitHub Pages). */
export function publicUrl(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? `${base}${normalized}` : `${base}/${normalized}`;
}
