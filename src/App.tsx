import { useEffect, useState } from 'react';
import { Controls } from './components/Controls';
import { ImageContainer } from './components/ImageContainer';
import { MarkerPanel } from './components/MarkerPanel';
import { useAppStore } from './store';

function App() {
  const { toggleAddingMarker } = useAppStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update canvas dimensions based on window resize
  useEffect(() => {
    const updateDimensions = () => {
      // Calculate based on the available space (roughly half width minus padding/panel)
      // Panel is 320px wide (w-80), side padding is 16*2
      const availableWidth = window.innerWidth - 320 - 32;
      const width = Math.max(300, (availableWidth / 2) - 16);
      
      // Header is ~73px tall, top/bottom padding is 16*2
      const height = Math.max(400, window.innerHeight - 73 - 32);
      
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Add spacebar toggle for adding marker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.code === 'Space' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault(); // Prevent page scrolling
        toggleAddingMarker();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAddingMarker]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Controls />
      
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex gap-4 p-4 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
          <ImageContainer imageIndex={1} dimensions={dimensions} />
          <ImageContainer imageIndex={2} dimensions={dimensions} />
        </div>

        <MarkerPanel />
      </div>
    </div>
  );
}

export default App;

