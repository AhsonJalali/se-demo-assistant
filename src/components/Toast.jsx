import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './ui/Icon';

const STYLES = {
  success: { icon: 'check-circle', color: 'text-success' },
  error: { icon: 'x-circle', color: 'text-danger' },
  warning: { icon: 'alert', color: 'text-warning' },
  info: { icon: 'info', color: 'text-accent' },
};

const Toast = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[90] flex flex-col items-end gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(({ id, message, type }) => {
        const style = STYLES[type] || STYLES.info;
        return (
          <div
            key={id}
            role={type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto w-full sm:w-auto sm:max-w-sm flex items-start gap-2.5 pl-3 pr-2 py-2.5 bg-surface border border-line rounded-xl shadow-pop animate-pop-in"
          >
            <Icon name={style.icon} size={16} className={`mt-0.5 ${style.color}`} />
            <p className="flex-1 text-[13px] text-fg leading-snug">{message}</p>
            <button type="button" onClick={() => dismissToast(id)} className="icon-btn w-6 h-6 -my-0.5" aria-label="Dismiss">
              <Icon name="x" size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
