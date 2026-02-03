/**
 * Lê variável de ambiente com suporte a runtime override.
 *
 * Prioridade:
 * 1. window.__ENV__ (injetado em runtime pelo Docker/nginx)
 * 2. import.meta.env (embutido em build time pelo Vite)
 *
 * Isso permite mudar configurações no EasyPanel sem rebuild.
 */

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

export function getEnv(key: string): string {
  // Runtime override (Docker)
  const runtimeVal = window.__ENV__?.[key];
  if (runtimeVal !== undefined && runtimeVal !== '') {
    return runtimeVal;
  }

  // Build time fallback (Vite)
  return (import.meta.env[key] as string) || '';
}
