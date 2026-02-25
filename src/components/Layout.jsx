import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-accent-cyan)] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 opacity-[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative flex flex-col h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;
