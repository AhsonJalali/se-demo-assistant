/**
 * PDF export — a clean, print-friendly session summary.
 *
 * Every block is measured before it is drawn, so backgrounds are painted
 * first and text always lands on top, and blocks never split awkwardly
 * across a page break.
 */

import { jsPDF } from 'jspdf';
import { ACCENTS, titleCase } from '../config/workspace';

const INK = '#111827';
const INK_2 = '#4B5563';
const INK_3 = '#6B7280';
const LINE = '#E5E7EB';
const SUBTLE = '#F9FAFB';

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const tint = (hex, amount) => hexToRgb(hex).map(c => Math.round(c + (255 - c) * amount));

const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 * @param {Object} session
 * @param {Object} allContent - { discovery, usecases, differentiators, objections } (already filled)
 * @param {Object} ctx - { settings, threeWhys, categories }
 */
export const generatePDF = async (session, allContent, { settings, threeWhys = [], categories } = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const accent = ACCENTS.find(a => a.id === settings?.accent)?.swatch || ACCENTS[0].swatch;
  const product = titleCase(settings?.productName || 'our platform');

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 18; // margin
  const W = pageW - M * 2;
  const TOP = 22;
  const BOTTOM = pageH - 16;
  let y = TOP;

  const setText = (size, color = INK, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };
  const lineH = (size) => size * 0.42; // mm per line for a given pt size
  const wrap = (text, width, size) => {
    doc.setFontSize(size);
    return doc.splitTextToSize(String(text ?? ''), width);
  };

  const newPage = () => {
    doc.addPage();
    y = TOP;
  };
  const ensure = (h) => {
    if (y + h > BOTTOM) newPage();
  };

  const industryName = (id) => categories?.industries?.find(i => i.id === id)?.name || id;
  const catName = (list, id) => categories?.[list]?.find(c => c.id === id)?.name || id;

  // ── Cover ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...hexToRgb(accent));
  doc.rect(0, 0, pageW, 4, 'F');

  setText(9, INK_3, 'bold');
  doc.text(product.toUpperCase(), M, 20);

  setText(26, INK, 'bold');
  const nameLines = wrap(session.name, W, 26);
  doc.text(nameLines, M, 34);
  y = 34 + nameLines.length * lineH(26) + 2;

  setText(12, INK_2);
  doc.text('Session summary', M, y);
  y += 12;

  const meta = [
    ['Meeting', formatDate(session.metadata.demoDate)],
    ['Stage', session.metadata.dealStage || '—'],
    ['Industry', session.metadata.industries?.length ? session.metadata.industries.map(industryName).join(', ') : '—'],
    ['Prepared', formatDate(new Date())],
  ];
  const colW = W / meta.length;
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.3);
  doc.line(M, y - 5, M + W, y - 5);
  meta.forEach(([k, v], i) => {
    const x = M + colW * i;
    setText(8, INK_3, 'bold');
    doc.text(k.toUpperCase(), x, y);
    setText(10, INK);
    doc.text(wrap(v, colW - 4, 10), x, y + 5.5);
  });
  y += 16;
  doc.line(M, y - 3, M + W, y - 3);
  y += 6;

  // ── Section helpers ───────────────────────────────────────────────────────
  const sectionTitle = (title, count) => {
    ensure(24);
    setText(14, INK, 'bold');
    doc.text(title, M, y);
    if (count != null) {
      const tw = doc.getTextWidth(title);
      setText(10, INK_3);
      doc.text(String(count), M + tw + 3, y);
    }
    y += 3;
    doc.setDrawColor(...hexToRgb(accent));
    doc.setLineWidth(0.6);
    doc.line(M, y, M + 12, y);
    y += 7;
  };

  const paragraph = (text, { size = 10, color = INK, indent = 0, style = 'normal', gap = 2 } = {}) => {
    const lines = wrap(text, W - indent, size);
    lines.forEach(line => {
      ensure(lineH(size) + 1);
      setText(size, color, style);
      doc.text(line, M + indent, y);
      y += lineH(size) + 0.8;
    });
    y += gap;
  };

  /**
   * A card: title, meta line, optional body, optional note. Measured up front
   * so the background is drawn before the text.
   */
  const card = ({ title, metaLine, body, note }) => {
    const pad = 5;
    const inner = W - pad * 2;
    const titleLines = wrap(title, inner, 11);
    const bodyLines = body ? wrap(body, inner, 9.5) : [];
    const noteLines = note ? wrap(note, inner - 6, 9) : [];
    const h =
      pad +
      titleLines.length * (lineH(11) + 0.8) +
      (metaLine ? 5 : 0) +
      (bodyLines.length ? 2 + bodyLines.length * (lineH(9.5) + 0.8) : 0) +
      (noteLines.length ? 6 + noteLines.length * (lineH(9) + 0.8) + 3 : 0) +
      pad - 1;

    if (h < BOTTOM - TOP) ensure(h + 4);
    const top = y;

    doc.setFillColor(SUBTLE);
    doc.setDrawColor(LINE);
    doc.setLineWidth(0.25);
    doc.roundedRect(M, top, W, h, 2, 2, 'FD');

    y = top + pad + 3;
    titleLines.forEach(line => {
      setText(11, INK, 'bold');
      doc.text(line, M + pad, y);
      y += lineH(11) + 0.8;
    });
    if (metaLine) {
      setText(8.5, INK_3);
      doc.text(metaLine, M + pad, y + 0.5);
      y += 5;
    }
    if (bodyLines.length) {
      y += 2;
      bodyLines.forEach(line => {
        setText(9.5, INK_2);
        doc.text(line, M + pad, y);
        y += lineH(9.5) + 0.8;
      });
    }
    if (noteLines.length) {
      y += 2;
      const noteTop = y - 1;
      const noteH = 4 + noteLines.length * (lineH(9) + 0.8) + 2;
      doc.setFillColor(...tint(accent, 0.9));
      doc.roundedRect(M + pad, noteTop, inner, noteH, 1.5, 1.5, 'F');
      doc.setFillColor(...hexToRgb(accent));
      doc.rect(M + pad, noteTop, 0.8, noteH, 'F');
      y += 3;
      setText(8, accent, 'bold');
      doc.text('NOTE', M + pad + 3, y);
      y += 4;
      noteLines.forEach(line => {
        setText(9, INK);
        doc.text(line, M + pad + 3, y);
        y += lineH(9) + 0.8;
      });
    }
    y = top + h + 4;
  };

  // ── 3 Why's ───────────────────────────────────────────────────────────────
  const whys = threeWhys.filter(q => session.threeWhys?.[q.id]?.trim());
  if (whys.length) {
    sectionTitle("The 3 Why's");
    whys.forEach(q => {
      ensure(16);
      setText(11, INK, 'bold');
      doc.text(q.question, M, y);
      y += 5.5;
      paragraph(session.threeWhys[q.id].trim(), { color: INK_2, gap: 4 });
    });
    y += 4;
  }

  // ── Meeting notes ─────────────────────────────────────────────────────────
  if (session.notes.general?.trim()) {
    sectionTitle('Meeting notes');
    session.notes.general.trim().split(/\n{2,}/).forEach(p => paragraph(p, { color: INK_2, gap: 3 }));
    y += 4;
  }

  // ── Library items ─────────────────────────────────────────────────────────
  const noteFor = (id) => session.notes.items[id]?.content?.trim() || null;
  const groups = [
    {
      title: 'Discovery questions',
      items: allContent.discovery,
      map: q => ({ title: q.question, metaLine: catName('discoveryCategories', q.category), body: q.followUp?.map(f => `– ${f}`).join('\n'), note: noteFor(q.id) }),
    },
    {
      title: 'Use cases',
      items: allContent.usecases,
      map: u => ({ title: u.name, metaLine: catName('useCaseCategories', u.category), body: u.description, note: noteFor(u.id) }),
    },
    {
      title: 'Positioning',
      items: allContent.differentiators,
      map: d => ({ title: d.feature, metaLine: `vs ${d.competitorName} · ${d.category}`, body: d.ours, note: noteFor(d.id) }),
    },
    {
      title: 'Objections',
      items: allContent.objections,
      map: o => ({ title: `“${o.objection}”`, metaLine: catName('objectionCategories', o.category), body: o.response, note: noteFor(o.id) }),
    },
  ];

  groups.forEach(group => {
    if (!group.items?.length) return;
    sectionTitle(group.title, group.items.length);
    group.items.forEach(item => card(group.map(item)));
    y += 4;
  });

  // ── Footer on every page ──────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(LINE);
    doc.setLineWidth(0.25);
    doc.line(M, pageH - 11, pageW - M, pageH - 11);
    setText(8, INK_3);
    doc.text(`${session.name} · ${product}`, M, pageH - 6.5);
    doc.text(`${i} / ${pages}`, pageW - M, pageH - 6.5, { align: 'right' });
  }

  const fileName = `${session.name.replace(/[^a-z0-9]+/gi, '_')}_Session_Summary.pdf`;
  doc.save(fileName);
  return fileName;
};
