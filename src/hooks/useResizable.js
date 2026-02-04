import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for resizable panel functionality
 * @param {number} initialWidth - Initial width as percentage (default: 60)
 * @returns {object} { width, startResize, isResizing }
 */
export const useResizable = (initialWidth = 60) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;

      // Constrain between 40% and 80%
      const constrainedWidth = Math.min(Math.max(newWidth, 40), 80);
      setWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return { width, startResize, isResizing };
};
