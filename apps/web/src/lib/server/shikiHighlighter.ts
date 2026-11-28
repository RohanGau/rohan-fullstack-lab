import type { HighlighterCore, ThemedToken } from 'shiki/core';

const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  py: 'python',
};

let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, githubDark] =
        await Promise.all([
          import('shiki/core'),
          import('shiki/engine/javascript'),
          import('shiki/themes/github-dark.mjs'),
        ]);

      const langs = await Promise.all([
        import('shiki/langs/typescript.mjs').then((m) => m.default),
        import('shiki/langs/tsx.mjs').then((m) => m.default),
        import('shiki/langs/javascript.mjs').then((m) => m.default),
        import('shiki/langs/jsx.mjs').then((m) => m.default),
        import('shiki/langs/json.mjs').then((m) => m.default),
        import('shiki/langs/bash.mjs').then((m) => m.default),
        import('shiki/langs/css.mjs').then((m) => m.default),
        import('shiki/langs/html.mjs').then((m) => m.default),
        import('shiki/langs/markdown.mjs').then((m) => m.default),
        import('shiki/langs/yaml.mjs').then((m) => m.default),
        import('shiki/langs/python.mjs').then((m) => m.default),
        import('shiki/langs/sql.mjs').then((m) => m.default),
      ]);

      return createHighlighterCore({
        themes: [githubDark.default],
        langs,
        engine: createJavaScriptRegexEngine({ forgiving: true }),
      });
    })();
  }
  return highlighterPromise;
}

export async function highlightCodeTokens(
  code: string,
  language?: string
): Promise<{ tokens: ThemedToken[][]; fg?: string; bg?: string } | null> {
  try {
    const highlighter = await getHighlighter();
    const raw = (language || '').toLowerCase().trim();
    const resolved = LANG_ALIASES[raw] ?? raw;
    const loaded = highlighter.getLoadedLanguages();
    const lang = resolved && loaded.includes(resolved) ? resolved : 'text';

    const result = highlighter.codeToTokens(code, {
      lang: lang as any,
      theme: 'github-dark',
    });

    return {
      tokens: result.tokens,
      fg: result.fg,
      bg: result.bg,
    };
  } catch {
    return null;
  }
}
