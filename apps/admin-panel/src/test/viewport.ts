/** jsdom has no layout: this answers width media queries from a width the test chooses. */
const DESKTOP_WIDTH = 1280;
let width = DESKTOP_WIDTH;

function matches(query: string): boolean {
  const min = /\(min-width:\s*([\d.]+)px\)/.exec(query);
  const max = /\(max-width:\s*([\d.]+)px\)/.exec(query);
  if (min && width < Number(min[1])) return false;
  if (max && width > Number(max[1])) return false;
  return true;
}

export function installMatchMedia() {
  window.matchMedia = (query: string) =>
    ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

/** Call before rendering. */
export function setViewportWidth(px: number) {
  width = px;
}

export function resetViewport() {
  width = DESKTOP_WIDTH;
}
