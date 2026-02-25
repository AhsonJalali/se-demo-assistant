/**
 * PDF Export Utility
 * Generates professional PDF documents with dark theme and gold accents
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = {
  dark: '#08062B',
  darkSecondary: '#0D0A35',
  gold: '#00D2FF',
  goldMuted: '#0099CC',
  textPrimary: '#e8eaf0',
  textSecondary: '#a8b0c8',
  border: '#1B1B61',
  success: '#4ade80',
  danger: '#f87171'
};

/**
 * Generate PDF from session data
 */
export const generatePDF = async (session, allContent, appData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPos = margin;
  let pageNumber = 1;

  // Helper: Add header to each page
  const addPageHeader = (isFirstPage = false) => {
    if (!isFirstPage) {
      // Dark background
      doc.setFillColor(COLORS.dark);
      doc.rect(0, 0, pageWidth, 15, 'F');

      // ThoughtSpot branding
      doc.setFontSize(10);
      doc.setTextColor(COLORS.gold);
      doc.setFont('helvetica', 'bold');
      doc.text('ThoughtSpot', margin, 10);

      // Session name
      doc.setFontSize(8);
      doc.setTextColor(COLORS.textSecondary);
      doc.setFont('helvetica', 'normal');
      doc.text(session.name, pageWidth - margin, 10, { align: 'right' });
    }
  };

  // Helper: Add footer to each page
  const addPageFooter = () => {
    doc.setFillColor(COLORS.dark);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

    doc.setFontSize(8);
    doc.setTextColor(COLORS.textSecondary);
    doc.text(
      `Page ${pageNumber}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );

    const now = new Date().toLocaleDateString();
    doc.text(now, pageWidth - margin, pageHeight - 5, { align: 'right' });

    pageNumber++;
  };

  // Helper: Check if need new page
  const checkPageBreak = (requiredSpace = 40) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      addPageFooter();
      doc.addPage();
      addPageHeader();
      yPos = 25;
    }
  };

  // Helper: Add section header
  const addSectionHeader = (title, icon = '') => {
    checkPageBreak(25);

    // Gold line above
    doc.setDrawColor(COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    doc.setFontSize(16);
    doc.setTextColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(`${icon} ${title}`, margin, yPos);
    yPos += 8;
  };

  // ===== COVER PAGE =====
  // Dark background
  doc.setFillColor(COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold accent bar
  doc.setFillColor(COLORS.gold);
  doc.rect(0, 60, pageWidth, 2, 'F');
  doc.rect(0, 140, pageWidth, 2, 'F');

  // Title
  doc.setFontSize(28);
  doc.setTextColor(COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('Demo Session', pageWidth / 2, 85, { align: 'center' });

  // Session name
  doc.setFontSize(20);
  doc.setTextColor(COLORS.textPrimary);
  doc.setFont('helvetica', 'normal');
  const sessionNameLines = doc.splitTextToSize(session.name, contentWidth - 40);
  doc.text(sessionNameLines, pageWidth / 2, 105, { align: 'center' });

  // Metadata box
  yPos = 160;
  const metadataHeight = 55;
  doc.setFillColor(COLORS.darkSecondary);
  doc.roundedRect(margin + 20, yPos, contentWidth - 40, metadataHeight, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const metadataLines = [
    { label: 'Demo Date:', value: formatDate(session.metadata.demoDate) },
    { label: 'Deal Stage:', value: session.metadata.dealStage },
    { label: 'Industries:', value: session.metadata.industries.length > 0 ? session.metadata.industries.join(', ') : 'None' },
    { label: 'Use Cases:', value: session.metadata.useCases.length > 0 ? session.metadata.useCases.join(', ') : 'None' }
  ];

  let metaYPos = yPos + 10;
  metadataLines.forEach(line => {
    doc.setTextColor(COLORS.textSecondary);
    doc.text(line.label, margin + 30, metaYPos);
    doc.setTextColor(COLORS.textPrimary);
    const valueLines = doc.splitTextToSize(line.value, contentWidth - 90);
    doc.text(valueLines, margin + 70, metaYPos);
    metaYPos += valueLines.length * 5 + 3;
  });

  // Branding
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textSecondary);
  doc.text('ThoughtSpot SE Demo Assistant', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  addPageFooter();

  // ===== GENERAL NOTES PAGE =====
  if (session.notes.general && session.notes.general.trim().length > 0) {
    doc.addPage();
    addPageHeader();
    yPos = 25;

    addSectionHeader('General Notes', '📝');

    doc.setFontSize(10);
    doc.setTextColor(COLORS.textPrimary);
    doc.setFont('helvetica', 'normal');

    const notesLines = doc.splitTextToSize(session.notes.general, contentWidth);
    notesLines.forEach(line => {
      checkPageBreak(7);
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;
    addPageFooter();
  }

  // ===== 3 WHY'S PAGE =====
  if (session.threeWhys && Object.values(session.threeWhys).some(answer => answer && answer.trim().length > 0)) {
    doc.addPage();
    addPageHeader();
    yPos = 25;

    addSectionHeader('3 Why\'s', '💡');

    const whyQuestions = [
      { id: 'why-change', label: 'Why change' },
      { id: 'why-now', label: 'Why now' },
      { id: 'why-thoughtspot', label: 'Why ThoughtSpot' }
    ];

    whyQuestions.forEach((question, index) => {
      const answer = session.threeWhys[question.id];
      if (answer && answer.trim().length > 0) {
        checkPageBreak(30);

        // Question number badge
        doc.setFillColor(COLORS.gold);
        doc.circle(margin + 3, yPos - 1, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.dark);
        doc.setFont('helvetica', 'bold');
        doc.text(String(index + 1), margin + 3, yPos, { align: 'center' });

        // Question title
        doc.setFontSize(12);
        doc.setTextColor(COLORS.gold);
        doc.setFont('helvetica', 'bold');
        doc.text(question.label, margin + 10, yPos);

        yPos += 7;

        // Answer
        doc.setFontSize(10);
        doc.setTextColor(COLORS.textPrimary);
        doc.setFont('helvetica', 'normal');

        const answerLines = doc.splitTextToSize(answer, contentWidth - 5);
        answerLines.forEach(line => {
          checkPageBreak(7);
          doc.text(line, margin + 3, yPos);
          yPos += 5;
        });

        yPos += 10;
      }
    });

    addPageFooter();
  }

  // ===== CONTENT SECTIONS =====
  const sections = [
    { title: 'Discovery Questions', data: allContent.discovery, type: 'discovery', icon: '❓' },
    { title: 'Use Cases', data: allContent.usecases, type: 'usecase', icon: '📋' },
    { title: 'Differentiators', data: allContent.differentiators, type: 'differentiator', icon: '⭐' },
    { title: 'Objections', data: allContent.objections, type: 'objection', icon: '⚠️' }
  ];

  sections.forEach(section => {
    if (section.data && section.data.length > 0) {
      doc.addPage();
      addPageHeader();
      yPos = 25;

      addSectionHeader(section.title, section.icon);

      section.data.forEach((item, index) => {
        // Item box
        checkPageBreak(60);

        // Item background
        doc.setFillColor(COLORS.darkSecondary);
        const itemStartY = yPos;
        doc.roundedRect(margin, yPos, contentWidth, 5, 2, 2, 'F'); // Will adjust height after

        yPos += 5;

        // Item number
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gold);
        doc.setFont('helvetica', 'bold');
        doc.text(`#${index + 1}`, margin + 3, yPos);

        yPos += 2;

        // Item title
        doc.setFontSize(11);
        doc.setTextColor(COLORS.textPrimary);
        doc.setFont('helvetica', 'bold');

        let title = '';
        if (section.type === 'discovery') {
          title = item.question;
        } else if (section.type === 'usecase') {
          title = item.name;
        } else if (section.type === 'differentiator') {
          title = item.feature;
        } else if (section.type === 'objection') {
          title = `"${item.objection}"`;
        }

        const titleLines = doc.splitTextToSize(title, contentWidth - 10);
        titleLines.forEach(line => {
          checkPageBreak(7);
          doc.text(line, margin + 3, yPos);
          yPos += 5;
        });

        yPos += 3;

        // Category badge
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textSecondary);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${item.category}`, margin + 3, yPos);

        // Priority (for discovery)
        if (section.type === 'discovery' && item.priority) {
          doc.text(`• Priority: ${item.priority}`, margin + 40, yPos);
        }

        // Competitor (for differentiators)
        if (section.type === 'differentiator' && item.competitorName) {
          doc.text(`• vs ${item.competitorName}`, margin + 40, yPos);
        }

        yPos += 7;

        // Item note if exists
        const itemNote = session.notes.items[item.id];
        if (itemNote && itemNote.content) {
          checkPageBreak(20);

          doc.setFillColor(COLORS.gold + '33'); // Gold with transparency
          doc.roundedRect(margin + 3, yPos, contentWidth - 6, 5, 1, 1, 'F'); // Will adjust

          yPos += 4;

          doc.setFontSize(8);
          doc.setTextColor(COLORS.gold);
          doc.setFont('helvetica', 'bold');
          doc.text('📌 Note:', margin + 5, yPos);

          yPos += 4;

          doc.setFontSize(9);
          doc.setTextColor(COLORS.textPrimary);
          doc.setFont('helvetica', 'italic');

          const noteLines = doc.splitTextToSize(itemNote.content, contentWidth - 14);
          noteLines.forEach(line => {
            checkPageBreak(5);
            doc.text(line, margin + 5, yPos);
            yPos += 4;
          });

          yPos += 3;
        }

        // Update item box height
        const itemHeight = yPos - itemStartY;
        doc.setFillColor(COLORS.darkSecondary);
        doc.roundedRect(margin, itemStartY, contentWidth, itemHeight, 2, 2, 'F');

        // Redraw content on top
        // (In a real implementation, we'd need to buffer the content and draw it after the box)

        yPos += 8;
      });

      addPageFooter();
    }
  });

  // ===== SUMMARY PAGE =====
  doc.addPage();
  addPageHeader();
  yPos = 25;

  addSectionHeader('Session Summary', '📊');

  const stats = {
    'Selected Items': Object.values(session.selectedItems).flat().length,
    'Item Notes': Object.keys(session.notes.items).length,
    'Discovery Questions': allContent.discovery?.length || 0,
    'Use Cases': allContent.usecases?.length || 0,
    'Differentiators': allContent.differentiators?.length || 0,
    'Objections': allContent.objections?.length || 0
  };

  Object.entries(stats).forEach(([label, value]) => {
    checkPageBreak(10);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.text(label + ':', margin + 5, yPos);

    doc.setFontSize(12);
    doc.setTextColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), margin + 80, yPos);

    yPos += 8;
  });

  addPageFooter();

  // Save the PDF
  const fileName = `${session.name.replace(/[^a-z0-9]/gi, '_')}_Demo_Session.pdf`;
  doc.save(fileName);

  return fileName;
};
