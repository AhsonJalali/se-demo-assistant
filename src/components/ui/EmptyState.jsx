import React from 'react';
import Icon from './Icon';

const EmptyState = ({ icon = 'info', title, children, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}>
    <div className="w-11 h-11 rounded-xl bg-muted text-fg-3 flex items-center justify-center mb-4">
      <Icon name={icon} size={20} />
    </div>
    <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
    {children && <div className="mt-1.5 max-w-sm text-sm text-fg-2 leading-relaxed">{children}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
