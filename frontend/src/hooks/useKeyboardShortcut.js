import { useEffect, useCallback } from 'react';

export const useKeyboardShortcut = (keys, callback) => {
  const handleKeyPress = useCallback(
    (event) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const keyMatch = keys.some(key => {
        if (key.toLowerCase() === 'cmd') return isCmdOrCtrl;
        return event.key.toLowerCase() === key.toLowerCase();
      });

      // Simple implementation: checks if all required keys are pressed
      // In a more robust version, you'd track active keys
      if (
        (keys.includes('cmd') ? isCmdOrCtrl : true) &&
        (keys.includes('shift') ? event.shiftKey : true) &&
        event.key.toLowerCase() === keys[keys.length - 1].toLowerCase()
      ) {
        event.preventDefault();
        callback();
      }
    },
    [keys, callback]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};
