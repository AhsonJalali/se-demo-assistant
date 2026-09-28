// Navigation model. Library views are reference content shared across deals;
// deal views are scoped to the active session.
export const VIEWS = [
  { id: 'discovery', label: 'Discovery', group: 'library', icon: 'compass', description: 'Questions that uncover pain, impact, and the decision process.' },
  { id: 'differentiators', label: 'Differentiators', group: 'library', icon: 'swords', description: 'How to position against the alternatives the prospect is weighing.' },
  { id: 'objections', label: 'Objections', group: 'library', icon: 'shield', description: 'Proven responses, plus a live copilot for what the prospect actually said.' },
  { id: 'usecases', label: 'Use cases', group: 'library', icon: 'layers', description: 'Business outcomes to anchor the demo, with space to document them per deal.' },
  { id: 'ai-prep', label: 'Prep brief', group: 'deal', icon: 'sparkles', description: 'A personalised pre-call brief generated from public info and your notes.' },
  { id: 'three-whys', label: "3 Why's", group: 'deal', icon: 'target', description: 'Why change, why now, and why us — the core of the business case.' },
];

export const LIBRARY_VIEWS = new Set(VIEWS.filter(v => v.group === 'library').map(v => v.id));

export const getView = (id) => VIEWS.find(v => v.id === id) || VIEWS[0];

export const DEAL_STAGES = [
  'Discovery',
  'Demo',
  'Technical validation',
  'Proposal',
  'Negotiation',
  'Closed won',
  'Closed lost',
];
