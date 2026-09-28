import React, { useId } from 'react';
import { useApp } from '../context/AppContext';
import { titleCase } from '../config/workspace';
import NoteButton from './NoteButton';
import Icon from './ui/Icon';

const categoryName = (categories, list, id) =>
  categories[list]?.find(c => c.id === id)?.name || id;

const Card = ({ item, type }) => {
  const {
    expandedCard,
    setExpandedCard,
    currentSession,
    toggleItemSelection,
    isItemSelected,
    highlightedItemIds,
  } = useApp();
  const detailsId = useId();
  const isExpanded = expandedCard === item.id;
  const isSelected = currentSession ? isItemSelected(item.id) : false;
  const isMatched = highlightedItemIds?.includes(item.id);

  const toggleExpand = () => setExpandedCard(isExpanded ? null : item.id);

  const Body = { discovery: Discovery, differentiator: Differentiator, objection: Objection, usecase: UseCase }[type];

  return (
    <article
      className={`panel transition-shadow
        ${isMatched ? 'ring-2 ring-warning/50 border-warning/40' : isExpanded ? 'ring-1 ring-line-strong shadow-pop' : 'hover:border-line-strong'}`}
    >
      <div className="flex items-start gap-2 p-1.5">
        <button
          type="button"
          onClick={toggleExpand}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="flex-1 min-w-0 text-left rounded-lg px-3 py-2.5 hover:bg-subtle transition-colors"
        >
          <Body item={item} part="summary" isExpanded={isExpanded} />
        </button>

        <div className="flex items-center gap-0.5 pt-2 pr-1.5">
          {isMatched && <span className="chip chip-warning mr-1 hidden sm:inline-flex"><Icon name="check" size={12} strokeWidth={2.5} /> Copilot match</span>}
          {currentSession && (
            <>
              <button
                type="button"
                onClick={() => toggleItemSelection(item.id)}
                aria-pressed={isSelected}
                aria-label={isSelected ? 'Remove from export' : 'Save to export'}
                title={isSelected ? 'Saved to export' : 'Save to export'}
                className={`icon-btn ${isSelected ? 'text-accent hover:text-accent' : ''}`}
              >
                <Icon name={isSelected ? 'bookmark-check' : 'bookmark'} size={16} />
              </button>
              <NoteButton itemId={item.id} />
            </>
          )}
          <button
            type="button"
            onClick={toggleExpand}
            className="icon-btn"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <Icon name="chevron-down" size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id={detailsId} className="border-t border-line px-4 sm:px-[1.375rem] py-5 animate-fade-in">
          <Body item={item} part="details" />
        </div>
      )}
    </article>
  );
};

// ── Building blocks ───────────────────────────────────────────────────────────

const Title = ({ children }) => (
  <h3 className="text-[15px] font-semibold text-fg leading-snug">{children}</h3>
);

const Meta = ({ children }) => <div className="mt-2 flex flex-wrap items-center gap-1.5">{children}</div>;

const Preview = ({ children }) => (
  <p className="mt-2 text-[13px] text-fg-2 leading-relaxed line-clamp-2">{children}</p>
);

const Section = ({ title, children }) => (
  <section>
    <h4 className="section-label mb-2">{title}</h4>
    {children}
  </section>
);

const Bullets = ({ items, marker = 'dot' }) => (
  <ul className="space-y-1.5">
    {items.map((text, i) => (
      <li key={i} className={`flex gap-2.5 text-sm text-fg leading-relaxed ${marker === 'number' ? 'items-baseline' : ''}`}>
        {marker === 'number' ? (
          <span className="w-5 shrink-0 text-xs font-medium text-fg-3 tabular-nums">{i + 1}.</span>
        ) : (
          <span className="mt-[0.55rem] w-1 h-1 shrink-0 rounded-full bg-fg-3" aria-hidden="true" />
        )}
        <span>{text}</span>
      </li>
    ))}
  </ul>
);

const Callout = ({ tone = 'neutral', icon, title, children }) => {
  const tones = {
    neutral: 'bg-subtle border-line',
    accent: 'bg-accent-soft/60 border-accent/20',
    success: 'bg-success-soft border-success/20',
  };
  const iconTones = { neutral: 'text-fg-3', accent: 'text-accent-text', success: 'text-success' };
  return (
    <div className={`rounded-lg border p-3.5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon && <Icon name={icon} size={14} className={iconTones[tone]} />}
        <h4 className="text-xs font-semibold text-fg">{title}</h4>
      </div>
      <div className="text-sm text-fg leading-relaxed">{children}</div>
    </div>
  );
};

// ── Card bodies ───────────────────────────────────────────────────────────────

const Discovery = ({ item, part }) => {
  const { categories } = useApp();
  if (part === 'summary') {
    return (
      <>
        <Title>{item.question}</Title>
        <Meta>
          <span className="chip">{categoryName(categories, 'discoveryCategories', item.category)}</span>
          {item.priority === 'high' && <span className="chip chip-accent">High priority</span>}
          <span className="text-xs text-fg-3">{item.followUp.length} follow-ups</span>
        </Meta>
      </>
    );
  }
  return (
    <Section title="Follow-up questions">
      <Bullets items={item.followUp} marker="number" />
    </Section>
  );
};

const Differentiator = ({ item, part, isExpanded }) => {
  const { settings } = useApp();
  if (part === 'summary') {
    return (
      <>
        <Title>{item.feature}</Title>
        <Meta>
          <span className="chip">vs {item.competitorName}</span>
          <span className="chip">{item.category}</span>
        </Meta>
        {!isExpanded && <Preview>{item.ours}</Preview>}
      </>
    );
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Callout tone="success" icon="check-circle" title={titleCase(settings.productName)}>{item.ours}</Callout>
        <Callout icon="x-circle" title={item.competitorName}>{item.theirs}</Callout>
      </div>
      <Section title="Talking points"><Bullets items={item.talkingPoints} /></Section>
      <Callout tone="accent" icon="play" title="Show it in the demo">{item.demo}</Callout>
    </div>
  );
};

const Objection = ({ item, part, isExpanded }) => {
  const { categories } = useApp();
  if (part === 'summary') {
    return (
      <>
        <Title>“{item.objection}”</Title>
        <Meta>
          <span className="chip">{categoryName(categories, 'objectionCategories', item.category)}</span>
        </Meta>
        {!isExpanded && <Preview>{item.response}</Preview>}
      </>
    );
  }
  return (
    <div className="space-y-5">
      <Callout tone="accent" icon="message" title="Response">{item.response}</Callout>
      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Talking points"><Bullets items={item.talkingPoints} /></Section>
        <Section title="Questions to ask back"><Bullets items={item.questions} marker="number" /></Section>
      </div>
    </div>
  );
};

const UseCase = ({ item, part, isExpanded }) => {
  const { categories, currentSession, setSelectedUseCaseId, setShowUseCasePanel, getUseCaseDocumentation } = useApp();
  if (part === 'summary') {
    const documented = currentSession && getUseCaseDocumentation(item.id);
    return (
      <>
        <Title>{item.name}</Title>
        <Meta>
          <span className="chip">{categoryName(categories, 'useCaseCategories', item.category)}</span>
          {documented && <span className="chip chip-success"><Icon name="check" size={12} strokeWidth={2.5} /> Documented</span>}
        </Meta>
        {!isExpanded && <Preview>{item.description}</Preview>}
      </>
    );
  }
  return (
    <div className="space-y-5">
      <p className="text-sm text-fg leading-relaxed">{item.description}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Key benefits"><Bullets items={item.keyBenefits} /></Section>
        <Section title="Typical challenges"><Bullets items={item.typicalChallenges} /></Section>
        <Section title="Ideal for"><Bullets items={item.idealFor} /></Section>
        <Section title="Demo scenarios"><Bullets items={item.demoScenarios} marker="number" /></Section>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!currentSession}
          onClick={() => { setSelectedUseCaseId(item.id); setShowUseCasePanel(true); }}
        >
          <Icon name="file-text" size={14} />
          Document for {currentSession ? currentSession.name : 'this deal'}
        </button>
        {!currentSession && <span className="text-xs text-fg-3">Start a session to document this use case.</span>}
      </div>
    </div>
  );
};

export default Card;
