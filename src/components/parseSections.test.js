import { describe, it, expect } from 'vitest';
import { parseSections } from './AIPrepTab';
import { parseCopilotSections } from './ObjectionCopilot';

describe('parseSections (AI Prep streaming parser)', () => {
  it('splits text into the four sections by header', () => {
    const text = [
      '## BRIEF',
      'Brief content.',
      '## DISCOVERY',
      'Discovery content.',
      '## TALKING_POINTS',
      'Talking points content.',
      '## DEMO_FLOW',
      'Demo flow content.',
    ].join('\n');

    const sections = parseSections(text);

    expect(sections.BRIEF).toBe('Brief content.\n');
    expect(sections.DISCOVERY).toBe('Discovery content.\n');
    expect(sections.TALKING_POINTS).toBe('Talking points content.\n');
    expect(sections.DEMO_FLOW).toBe('Demo flow content.\n');
  });

  it('handles a partial stream where only the first header has arrived', () => {
    const sections = parseSections('## BRIEF\nStreaming so far...');
    expect(sections.BRIEF).toBe('Streaming so far...\n');
    expect(sections.DISCOVERY).toBe('');
  });

  it('normalizes header variants (case, spacing, hyphen/underscore, bold, hash count)', () => {
    const text = [
      '# brief',
      'a',
      '### **Talking-Points**',
      'b',
      '## demo flow',
      'c',
    ].join('\n');

    const sections = parseSections(text);

    expect(sections.BRIEF).toBe('a\n');
    expect(sections.TALKING_POINTS).toBe('b\n');
    expect(sections.DEMO_FLOW).toBe('c\n');
  });

  it('falls back to putting all text under BRIEF when no headers are recognized', () => {
    const sections = parseSections('Just plain text with no headers at all.');
    expect(sections.BRIEF).toBe('Just plain text with no headers at all.');
    expect(sections.DISCOVERY).toBe('');
  });

  it('returns all-empty sections for empty input', () => {
    const sections = parseSections('');
    expect(sections).toEqual({ BRIEF: '', DISCOVERY: '', TALKING_POINTS: '', DEMO_FLOW: '' });
  });
});

describe('parseCopilotSections (Objection Copilot streaming parser)', () => {
  it('splits text into READ / RESPONSE / REDIRECT sections', () => {
    const text = [
      '## READ',
      'This is a pricing objection.',
      '## RESPONSE',
      'Here is what to say.',
      '## REDIRECT',
      'Ask this question next.',
    ].join('\n');

    const sections = parseCopilotSections(text);

    expect(sections.READ).toBe('This is a pricing objection.\n');
    expect(sections.RESPONSE).toBe('Here is what to say.\n');
    expect(sections.REDIRECT).toBe('Ask this question next.\n');
  });

  it('falls back to RESPONSE when no headers are recognized', () => {
    const sections = parseCopilotSections('Unheadered model output.');
    expect(sections.RESPONSE).toBe('Unheadered model output.');
    expect(sections.READ).toBe('');
    expect(sections.REDIRECT).toBe('');
  });

  it('returns all-empty sections for empty input', () => {
    expect(parseCopilotSections('')).toEqual({ READ: '', RESPONSE: '', REDIRECT: '' });
  });
});
