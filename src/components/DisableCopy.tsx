import { useEffect } from 'react';

export const DisableCopy = () => {
  useEffect(() => {
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
      }
      
      
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
      
      
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
      }

      
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};
