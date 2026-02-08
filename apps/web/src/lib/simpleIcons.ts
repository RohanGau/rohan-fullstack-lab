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
import { getSimpleIconSlug } from './utils';

type SimpleIconGlyph = {
  path: string;
  hex: string;
  svg?: string;
};

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
