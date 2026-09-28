/**
 * Word export — an editable version of the session summary with full detail
 * for every selected library item.
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { ACCENTS, titleCase } from '../config/workspace';

const INK_2 = '4B5563';
const INK_3 = '6B7280';
const LINE = 'E5E7EB';

const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

const text = (value, opts = {}) => new TextRun({ text: String(value ?? ''), ...opts });

const para = (children, opts = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 120 }, ...opts });

const label = (value) => para(text(value.toUpperCase(), { bold: true, size: 16, color: INK_3 }), { spacing: { before: 160, after: 60 } });

const bullets = (items) => (items || []).map(item => new Paragraph({ children: [text(item)], bullet: { level: 0 }, spacing: { after: 60 } }));

const numbered = (items) => (items || []).map((item, i) => para([text(`${i + 1}. `, { color: INK_3 }), text(item)], { spacing: { after: 60 }, indent: { left: 280 } }));

/**
 * @param {Object} session
 * @param {Object} allContent - { discovery, usecases, differentiators, objections } (already filled)
 * @param {Object} ctx - { settings, threeWhys, categories }
 */
export const generateDocx = async (session, allContent, { settings, threeWhys = [], categories } = {}) => {
  const accent = (ACCENTS.find(a => a.id === settings?.accent)?.swatch || ACCENTS[0].swatch).replace('#', '');
  const product = titleCase(settings?.productName || 'our platform');
  const industryName = (id) => categories?.industries?.find(i => i.id === id)?.name || id;
  const catName = (list, id) => categories?.[list]?.find(c => c.id === id)?.name || id;
  const noteFor = (id) => session.notes.items[id]?.content?.trim() || null;

  const body = [];

  // ── Title block ───────────────────────────────────────────────────────────
  body.push(para(text(product.toUpperCase(), { bold: true, size: 18, color: INK_3 }), { spacing: { after: 80 } }));
  body.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [text(session.name, { bold: true })], spacing: { after: 80 } }));
  body.push(para(text('Session summary', { size: 26, color: INK_2 }), { spacing: { after: 320 } }));

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  const meta = [
    ['Meeting', formatDate(session.metadata.demoDate)],
    ['Stage', session.metadata.dealStage || '—'],
    ['Industry', session.metadata.industries?.length ? session.metadata.industries.map(industryName).join(', ') : '—'],
    ['Prepared', formatDate(new Date())],
  ];
  body.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder, insideHorizontal: cellBorder, insideVertical: cellBorder },
    rows: meta.map(([k, v]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F9FAFB' },
          children: [para(text(k, { bold: true, color: INK_2 }), { spacing: { before: 60, after: 60 } })],
        }),
        new TableCell({ children: [para(text(v), { spacing: { before: 60, after: 60 } })] }),
      ],
    })),
  }));

  const heading = (value) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [text(value, { bold: true, color: '111827' })],
    spacing: { before: 480, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } },
  });

  const itemTitle = (value) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [text(value, { bold: true, color: '111827' })],
    spacing: { before: 280, after: 60 },
  });

  const metaLine = (value) => para(text(value, { size: 18, color: INK_3 }), { spacing: { after: 100 } });

  const noteBlock = (value) => value ? [
    new Paragraph({
      children: [text('Note  ', { bold: true, color: accent }), text(value, { italics: true })],
      spacing: { before: 120, after: 120 },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F3F4F6' },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: accent, space: 8 } },
    }),
  ] : [];

  // ── 3 Why's ───────────────────────────────────────────────────────────────
  const whys = threeWhys.filter(q => session.threeWhys?.[q.id]?.trim());
  if (whys.length) {
    body.push(heading("The 3 Why's"));
    whys.forEach(q => {
      body.push(itemTitle(q.question));
      session.threeWhys[q.id].trim().split('\n').forEach(line => body.push(para(text(line))));
    });
  }

  // ── Meeting notes ─────────────────────────────────────────────────────────
  if (session.notes.general?.trim()) {
    body.push(heading('Meeting notes'));
    session.notes.general.trim().split('\n').forEach(line => body.push(para(text(line))));
  }

  // ── Library items ─────────────────────────────────────────────────────────
  if (allContent.discovery?.length) {
    body.push(heading('Discovery questions'));
    allContent.discovery.forEach(q => {
      body.push(itemTitle(q.question));
      body.push(metaLine(`${catName('discoveryCategories', q.category)}${q.priority === 'high' ? ' · High priority' : ''}`));
      body.push(label('Follow-ups'), ...numbered(q.followUp));
      body.push(...noteBlock(noteFor(q.id)));
    });
  }

  if (allContent.usecases?.length) {
    body.push(heading('Use cases'));
    allContent.usecases.forEach(u => {
      body.push(itemTitle(u.name));
      body.push(metaLine(catName('useCaseCategories', u.category)));
      body.push(para(text(u.description)));
      body.push(label('Key benefits'), ...bullets(u.keyBenefits));
      body.push(label('Typical challenges'), ...bullets(u.typicalChallenges));
      body.push(label('Ideal for'), ...bullets(u.idealFor));
      body.push(label('Demo scenarios'), ...numbered(u.demoScenarios));
      body.push(...noteBlock(noteFor(u.id)));
    });
  }

  if (allContent.differentiators?.length) {
    body.push(heading('Positioning'));
    allContent.differentiators.forEach(d => {
      body.push(itemTitle(d.feature));
      body.push(metaLine(`vs ${d.competitorName} · ${d.category}`));
      body.push(label(product), para(text(d.ours)));
      body.push(label(d.competitorName), para(text(d.theirs, { color: INK_2 })));
      body.push(label('Talking points'), ...bullets(d.talkingPoints));
      body.push(label('Show it in the demo'), para(text(d.demo)));
      body.push(...noteBlock(noteFor(d.id)));
    });
  }

  if (allContent.objections?.length) {
    body.push(heading('Objections'));
    allContent.objections.forEach(o => {
      body.push(itemTitle(`“${o.objection}”`));
      body.push(metaLine(catName('objectionCategories', o.category)));
      body.push(label('Response'), para(text(o.response)));
      body.push(label('Talking points'), ...bullets(o.talkingPoints));
      body.push(label('Questions to ask back'), ...numbered(o.questions));
      body.push(...noteBlock(noteFor(o.id)));
    });
  }

  const doc = new Document({
    creator: 'Demo Assistant',
    title: `${session.name} — Session summary`,
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22, color: '111827' } } },
    },
    sections: [{ properties: {}, children: body }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${session.name.replace(/[^a-z0-9]+/gi, '_')}_Session_Summary.docx`;
  saveAs(blob, fileName);
  return fileName;
};
