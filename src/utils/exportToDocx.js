/**
 * Word Document Export Utility
 * Generates editable DOCX files with proper formatting
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Generate Word document from session data
 */
export const generateDocx = async (session, allContent) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: 'ThoughtSpot Demo Session',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  // Session name
  sections.push(
    new Paragraph({
      text: session.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    })
  );

  // Metadata table
  const metadataTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '00D2FF' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '00D2FF' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '00D2FF' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '00D2FF' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Demo Date', bold: true })],
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph(formatDate(session.metadata.demoDate))]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Deal Stage', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph(session.metadata.dealStage)]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Industries', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph(session.metadata.industries.length > 0 ? session.metadata.industries.join(', ') : 'None')]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Use Cases', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph(session.metadata.useCases.length > 0 ? session.metadata.useCases.join(', ') : 'None')]
          })
        ]
      })
    ]
  });

  sections.push(metadataTable);
  sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));

  // General Notes
  if (session.notes.general && session.notes.general.trim().length > 0) {
    sections.push(
      new Paragraph({
        text: 'General Notes',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    const notesLines = session.notes.general.split('\n');
    notesLines.forEach(line => {
      sections.push(
        new Paragraph({
          text: line,
          spacing: { after: 100 }
        })
      );
    });

    sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  }

  // 3 Why's
  if (session.threeWhys && Object.values(session.threeWhys).some(answer => answer && answer.trim().length > 0)) {
    sections.push(
      new Paragraph({
        text: '3 Why\'s',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    const whyQuestions = [
      { id: 'why-change', label: 'Why change' },
      { id: 'why-now', label: 'Why now' },
      { id: 'why-thoughtspot', label: 'Why ThoughtSpot' }
    ];

    whyQuestions.forEach((question, index) => {
      const answer = session.threeWhys[question.id];
      if (answer && answer.trim().length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${question.label}`,
                bold: true,
                color: '00D2FF'
              })
            ],
            spacing: { before: 200, after: 100 }
          })
        );

        const answerLines = answer.split('\n');
        answerLines.forEach(line => {
          sections.push(
            new Paragraph({
              text: line,
              spacing: { after: 100 }
            })
          );
        });

        sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
    });

    sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  }

  // Content sections
  const contentSections = [
    { title: 'Discovery Questions', data: allContent.discovery, type: 'discovery' },
    { title: 'Use Cases', data: allContent.usecases, type: 'usecase' },
    { title: 'Differentiators', data: allContent.differentiators, type: 'differentiator' },
    { title: 'Objections', data: allContent.objections, type: 'objection' }
  ];

  contentSections.forEach(section => {
    if (section.data && section.data.length > 0) {
      // Section heading
      sections.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      section.data.forEach((item, index) => {
        // Item number
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. `,
                bold: true,
                color: '00D2FF'
              })
            ],
            spacing: { before: 200, after: 100 }
          })
        );

        // Item title
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

        sections.push(
          new Paragraph({
            text: title,
            bold: true,
            spacing: { after: 100 }
          })
        );

        // Category and metadata
        const metadata = [];
        metadata.push(`Category: ${item.category}`);

        if (section.type === 'discovery' && item.priority) {
          metadata.push(`Priority: ${item.priority}`);
        }

        if (section.type === 'differentiator' && item.competitorName) {
          metadata.push(`vs ${item.competitorName}`);
        }

        sections.push(
          new Paragraph({
            text: metadata.join(' | '),
            italics: true,
            color: '6b7494',
            spacing: { after: 150 }
          })
        );

        // Discovery follow-ups
        if (section.type === 'discovery' && item.followUp && item.followUp.length > 0) {
          sections.push(
            new Paragraph({
              text: 'Follow-up Questions:',
              bold: true,
              spacing: { after: 100 }
            })
          );

          item.followUp.forEach(followUp => {
            sections.push(
              new Paragraph({
                text: `• ${followUp}`,
                spacing: { after: 50 }
              })
            );
          });
        }

        // Use Case details
        if (section.type === 'usecase') {
          if (item.description) {
            sections.push(
              new Paragraph({
                text: item.description,
                spacing: { after: 150 }
              })
            );
          }

          if (item.keyBenefits && item.keyBenefits.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Key Benefits:',
                bold: true,
                color: '4ade80',
                spacing: { before: 100, after: 50 }
              })
            );

            item.keyBenefits.forEach(benefit => {
              sections.push(
                new Paragraph({
                  text: `• ${benefit}`,
                  spacing: { after: 50 }
                })
              );
            });
          }

          if (item.typicalChallenges && item.typicalChallenges.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Typical Challenges:',
                bold: true,
                spacing: { before: 100, after: 50 }
              })
            );

            item.typicalChallenges.forEach(challenge => {
              sections.push(
                new Paragraph({
                  text: `• ${challenge}`,
                  spacing: { after: 50 }
                })
              );
            });
          }

          if (item.idealFor && item.idealFor.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Ideal For:',
                bold: true,
                color: '00D2FF',
                spacing: { before: 100, after: 50 }
              })
            );

            item.idealFor.forEach(target => {
              sections.push(
                new Paragraph({
                  text: `• ${target}`,
                  spacing: { after: 50 }
                })
              );
            });
          }

          if (item.demoScenarios && item.demoScenarios.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Demo Scenarios:',
                bold: true,
                color: '00D2FF',
                spacing: { before: 100, after: 50 }
              })
            );

            item.demoScenarios.forEach(scenario => {
              sections.push(
                new Paragraph({
                  text: `• ${scenario}`,
                  spacing: { after: 50 }
                })
              );
            });
          }
        }

        // Differentiator details
        if (section.type === 'differentiator') {
          sections.push(
            new Paragraph({
              text: 'ThoughtSpot:',
              bold: true,
              color: '4ade80',
              spacing: { before: 100, after: 50 }
            })
          );
          sections.push(
            new Paragraph({
              text: item.thoughtspot,
              spacing: { after: 100 }
            })
          );

          sections.push(
            new Paragraph({
              text: `${item.competitorName}:`,
              bold: true,
              color: 'f87171',
              spacing: { after: 50 }
            })
          );
          sections.push(
            new Paragraph({
              text: item.competitor,
              spacing: { after: 100 }
            })
          );

          if (item.talkingPoints && item.talkingPoints.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Talking Points:',
                bold: true,
                spacing: { after: 50 }
              })
            );

            item.talkingPoints.forEach(point => {
              sections.push(
                new Paragraph({
                  text: `• ${point}`,
                  spacing: { after: 50 }
                })
              );
            });
          }

          if (item.demo) {
            sections.push(
              new Paragraph({
                text: 'Demo Tip:',
                bold: true,
                color: '00D2FF',
                spacing: { before: 100, after: 50 }
              })
            );
            sections.push(
              new Paragraph({
                text: item.demo,
                spacing: { after: 100 }
              })
            );
          }
        }

        // Objection details
        if (section.type === 'objection') {
          sections.push(
            new Paragraph({
              text: 'Response:',
              bold: true,
              color: '00D2FF',
              spacing: { before: 100, after: 50 }
            })
          );
          sections.push(
            new Paragraph({
              text: item.response,
              spacing: { after: 100 }
            })
          );

          if (item.talkingPoints && item.talkingPoints.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Talking Points:',
                bold: true,
                spacing: { after: 50 }
              })
            );

            item.talkingPoints.forEach(point => {
              sections.push(
                new Paragraph({
                  text: `• ${point}`,
                  spacing: { after: 50 }
                })
              );
            });
          }

          if (item.questions && item.questions.length > 0) {
            sections.push(
              new Paragraph({
                text: 'Discovery Questions:',
                bold: true,
                spacing: { before: 100, after: 50 }
              })
            );

            item.questions.forEach(question => {
              sections.push(
                new Paragraph({
                  text: `? ${question}`,
                  spacing: { after: 50 }
                })
              );
            });
          }
        }

        // Item note
        const itemNote = session.notes.items[item.id];
        if (itemNote && itemNote.content) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '📌 Note: ',
                  bold: true,
                  color: '00D2FF'
                }),
                new TextRun({
                  text: itemNote.content,
                  italics: true
                })
              ],
              spacing: { before: 150, after: 100 },
              shading: {
                fill: 'FFF9E6'
              }
            })
          );
        }

        sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    }
  });

  // Summary
  sections.push(
    new Paragraph({
      text: 'Session Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })
  );

  const stats = [
    { label: 'Selected Items', value: Object.values(session.selectedItems).flat().length },
    { label: 'Item Notes', value: Object.keys(session.notes.items).length },
    { label: 'Discovery Questions', value: allContent.discovery?.length || 0 },
    { label: 'Use Cases', value: allContent.usecases?.length || 0 },
    { label: 'Differentiators', value: allContent.differentiators?.length || 0 },
    { label: 'Objections', value: allContent.objections?.length || 0 }
  ];

  stats.forEach(stat => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${stat.label}: `,
            bold: true
          }),
          new TextRun({
            text: String(stat.value),
            color: '00D2FF'
          })
        ],
        spacing: { after: 100 }
      })
    );
  });

  // Footer
  sections.push(
    new Paragraph({
      text: '',
      spacing: { before: 400 }
    })
  );

  sections.push(
    new Paragraph({
      text: `Generated by ThoughtSpot SE Demo Assistant on ${new Date().toLocaleString()}`,
      italics: true,
      color: '6b7494',
      alignment: AlignmentType.CENTER
    })
  );

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const fileName = `${session.name.replace(/[^a-z0-9]/gi, '_')}_Demo_Session.docx`;
  saveAs(blob, fileName);

  return fileName;
};
