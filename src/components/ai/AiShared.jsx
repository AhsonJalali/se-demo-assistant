import React, { useState } from 'react';
import Icon from '../ui/Icon';

/** In dev the browser needs VITE_ANTHROPIC_API_KEY; in prod the server proxy holds the key. */
export const aiKeyMissing = () => import.meta.env.DEV && !import.meta.env.VITE_ANTHROPIC_API_KEY;

export function aiErrorMessage(err) {
  const code = typeof err === 'string' ? err : err?.message;
  switch (code) {
    case 'NO_API_KEY':
      return 'AI features aren’t configured. Add VITE_ANTHROPIC_API_KEY to .env and restart the dev server.';
    case 'AUTH_EXPIRED':
      return 'Your sign-in expired. Reload the page and sign in again.';
    case 'RATE_LIMITED':
      return 'You’ve hit the hourly limit for AI requests. Try again in a few minutes.';
    case 'SERVER_API_KEY_INVALID':
      return 'The server’s Anthropic API key was rejected. An admin needs to update ANTHROPIC_API_KEY in the deployment.';
    default:
      if (code?.startsWith('API_ERROR:')) {
        const [, status, ...rest] = code.split(':');
        const body = rest.join(':');
        if (/credit balance/i.test(body)) return 'The Anthropic account behind this app is out of credits.';
        return `The AI service returned an error (${status}). Try again in a moment.`;
      }
      if (err?.name === 'TypeError') return 'Couldn’t reach the AI service. Check your connection and try again.';
      return 'Something went wrong generating a response. Try again.';
  }
}

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); nothing useful to do.
    }
  };
  return (
    <button type="button" onClick={copy} className={`btn btn-ghost btn-sm ${className}`} aria-live="polite">
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      {copied ? 'Copied' : label}
    </button>
  );
}

export const Cursor = () => (
  <span className="inline-block w-[2px] h-4 bg-accent ml-0.5 align-[-2px] animate-pulse" aria-hidden="true" />
);

export function AiSetupNotice() {
  return (
    <div className="rounded-lg border border-line bg-subtle p-3.5 text-[13px]">
      <div className="flex items-center gap-2 font-medium text-fg">
        <Icon name="info" size={15} className="text-fg-3" />
        AI isn’t set up in this environment
      </div>
      <p className="mt-1 text-fg-2 leading-relaxed">
        Add <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">VITE_ANTHROPIC_API_KEY</code> to <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">.env</code> and
        restart <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">npm run dev</code>. Deployed builds use the server-side key instead.
      </p>
    </div>
  );
}

export function ErrorNotice({ children, onRetry }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/25 bg-danger-soft p-3 text-[13px] text-fg">
      <Icon name="alert" size={15} className="text-danger mt-0.5" />
      <p className="flex-1 leading-relaxed">{children}</p>
      {onRetry && <button type="button" className="btn btn-secondary btn-sm h-7" onClick={onRetry}>Retry</button>}
    </div>
  );
}

/** Renders model text with light markdown: headings, bullets, numbered lists, bold. */
export function RichText({ text, streaming }) {
  const lines = text.replace(/\n{3,}/g, '\n\n').trim().split('\n');
  const inline = (s) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="font-semibold text-fg">{part.slice(2, -2)}</strong> : part
    );

  return (
    <div className="text-sm text-fg leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        const last = i === lines.length - 1;
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        const heading = trimmed.match(/^#{2,4}\s+(.*)/);
        if (heading) return <h4 key={i} className="pt-2 text-[13px] font-semibold text-fg">{inline(heading[1])}</h4>;
        const bullet = trimmed.match(/^[-*•]\s+(.*)/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2.5 pl-1">
              <span className="mt-[0.6rem] w-1 h-1 shrink-0 rounded-full bg-fg-3" aria-hidden="true" />
              <p>{inline(bullet[1])}{streaming && last && <Cursor />}</p>
            </div>
          );
        }
        const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)/);
        if (numbered) {
          return (
            <div key={i} className="flex items-baseline gap-2.5">
              <span className="w-5 shrink-0 text-xs font-medium text-fg-3 tabular-nums">{numbered[1]}.</span>
              <p>{inline(numbered[2])}{streaming && last && <Cursor />}</p>
            </div>
          );
        }
        if (/^>\s?/.test(trimmed)) {
          return <p key={i} className="pl-3 border-l-2 border-line-strong text-fg-2">{inline(trimmed.replace(/^>\s?/, ''))}</p>;
        }
        return <p key={i} className={line.startsWith('   ') ? 'pl-7 text-fg-2' : ''}>{inline(trimmed)}{streaming && last && <Cursor />}</p>;
      })}
    </div>
  );
}
