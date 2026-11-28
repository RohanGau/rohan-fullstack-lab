import {
  siCss,
  siHtml5,
  siJavascript,
  siMui,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siRedux,
  siTypescript,
} from 'simple-icons/icons';

type SimpleIconGlyph = {
  path: string;
  hex: string;
  svg?: string;
};

const CUSTOM_SIMPLE_ICON_SLUGS: Record<string, string> = {
  'Next.js': 'nextdotjs',
  'Node.js': 'nodedotjs',
  'Express.js': 'express',
  'Vue.js': 'vuedotjs',
  'Nuxt.js': 'nuxtdotjs',
  'Deno.js': 'denodotjs',
  RxJS: 'rxjs',
};

export function getSimpleIconSlug(skillName: string): string {
  const normalized = skillName.trim();
  if (CUSTOM_SIMPLE_ICON_SLUGS[normalized]) {
    return CUSTOM_SIMPLE_ICON_SLUGS[normalized];
  }
  return normalized.toLowerCase().replace(/\s+/g, '').replace(/\./g, 'dot');
}

// Keep this registry intentionally small to avoid shipping the full simple-icons catalog.
const SIMPLE_ICONS_BY_SLUG: Record<string, SimpleIconGlyph> = {
  css: siCss,
  html5: siHtml5,
  javascript: siJavascript,
  mui: siMui,
  nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  react: siReact,
  redux: siRedux,
  typescript: siTypescript,
};

export function getSimpleIconByName(name: string): SimpleIconGlyph | undefined {
  return SIMPLE_ICONS_BY_SLUG[getSimpleIconSlug(name)];
}
