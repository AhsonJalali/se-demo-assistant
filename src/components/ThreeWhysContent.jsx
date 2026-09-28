import React from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from './PageHeader';
import EmptyState from './ui/EmptyState';
import { getView } from '../config/views';

const ThreeWhysContent = () => {
  const { currentSession, updateSession, openNewSession, content, saveState } = useApp();
  const view = getView('three-whys');

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title={view.label} description={view.description} />
        <EmptyState
          icon="target"
          title="Open a session to capture the 3 Why’s"
          action={<button type="button" className="btn btn-primary" onClick={openNewSession}>New session</button>}
          className="flex-1"
        >
          Answers are saved per prospect and included when you export the session.
        </EmptyState>
      </div>
    );
  }

  const answers = currentSession.threeWhys || {};
  const setAnswer = (id, value) => updateSession({ threeWhys: { ...answers, [id]: value } });
  const answered = content.threeWhys.filter(q => answers[q.id]?.trim()).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title={view.label}
        description={`${view.description} For ${currentSession.name}.`}
        actions={
          <span className="text-xs text-fg-3 tabular-nums" role="status" aria-live="polite">
            {answered}/3 answered · {saveState.status === 'saving' ? 'Saving…' : 'Saved'}
          </span>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid gap-4 lg:grid-cols-3 lg:h-full">
          {content.threeWhys.map((q, index) => {
            const value = answers[q.id] || '';
            return (
              <section key={q.id} className="panel flex flex-col p-4 min-h-[260px]">
                <div className="flex items-start gap-3 mb-3 lg:min-h-[5.25rem]">
                  <span
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
                      ${value.trim() ? 'bg-accent text-accent-fg' : 'bg-muted text-fg-2'}`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <label htmlFor={q.id} className="block text-[15px] font-semibold text-fg">{q.question}</label>
                    <p id={`${q.id}-hint`} className="mt-0.5 text-[13px] text-fg-2 leading-snug">{q.prompt}</p>
                  </div>
                </div>
                <textarea
                  id={q.id}
                  value={value}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  aria-describedby={`${q.id}-hint`}
                  placeholder="Write it in the prospect’s words…"
                  className="field flex-1 min-h-[160px] resize-none leading-relaxed"
                />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThreeWhysContent;
