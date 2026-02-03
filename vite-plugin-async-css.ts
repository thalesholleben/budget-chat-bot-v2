import type { Plugin } from 'vite';

export function asyncCssPlugin(): Plugin {
  return {
    name: 'vite-plugin-async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Transform CSS link to async load (media="print" trick)
      return html.replace(
        /<link rel="stylesheet"([^>]*) href="([^"]*\.css)"([^>]*)>/g,
        (match, before, href, after) => {
          // Don't transform if already has media attribute
          if (match.includes('media=')) return match;

          return `<link rel="preload" as="style" href="${href}"${before}${after}><link rel="stylesheet"${before} href="${href}"${after} media="print" onload="this.media='all'; this.onload=null;"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
        }
      );
    }
  };
}
