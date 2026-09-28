import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './ui/Icon';

/** Title block shared by every view, with the mobile menu button. */
const PageHeader = ({ title, description, actions, children }) => {
  const { setSidebarOpen } = useApp();
  return (
    <header className="shrink-0 border-b border-line bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="icon-btn lg:hidden -ml-1.5 mt-0.5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-fg tracking-tight">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-fg-2">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
