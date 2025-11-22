import React, { useState } from 'react';
import { CameraShoot } from './components/CameraShoot';
import { PhotoStrip } from './components/PhotoStrip';
import { AsciiButton, AsciiBorder, AnimatedBackground, TypewriterEffect } from './components/AsciiUI';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('intro');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleStart = () => {
    setState('shooting');
  };

  const handlePhotosTaken = (capturedPhotos: string[]) => {
    setPhotos(capturedPhotos);
    setState('result');
  };

  const handleRestart = () => {
    setPhotos([]);
    setState('intro');
  };

  return (
    <main className="min-h-screen w-full relative p-4 py-8 flex flex-col items-center justify-start text-pink-600">
      <AnimatedBackground />

      {/* Increased max-width to 6xl to support side-by-side results layout */}
      <div className="w-full max-w-6xl z-10">
        
        {/* Header */}
        <header className="mb-8 text-center">
           <h1 className="text-3xl md:text-5xl font-bold text-pink-500 tracking-tighter drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
             &lt; LIFE 4 CUTS /&gt;
           </h1>
           <div className="text-pink-400 mt-2 text-sm md:text-base font-bold">
             <TypewriterEffect text="Capture your 8-bit memories..." delay={80} />
           </div>
        </header>

        {/* Content Area */}
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          
          {state === 'intro' && (
            <div className="animate-fade-in flex flex-col items-center w-full">
               <AsciiBorder title="WELCOME" className="bg-white/80 max-w-lg w-full text-center shadow-lg shadow-pink-100">
                  <div className="py-8 px-4">
                    <div className="text-6xl mb-6 text-pink-400 animate-bounce">
                        ( ˘ ³˘)♥
                    </div>
                    <p className="mb-6 text-lg leading-relaxed text-pink-700 font-medium">
                        Welcome to the Cyber-Cute Photo Booth.<br/>
                        We will take 4 consecutive photos.<br/>
                        Get your poses ready!
                    </p>
                    <div className="flex flex-col gap-2 items-center">
                        <AsciiButton onClick={handleStart}>
                            [ ENTER BOOTH ]
                        </AsciiButton>
                        <span className="text-xs text-pink-400 mt-2">
                            * Camera permission required
                        </span>
                    </div>
                  </div>
               </AsciiBorder>
               
               <div className="mt-8 grid grid-cols-4 gap-2 opacity-50">
                  {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-16 border border-pink-300 bg-pink-50 flex items-center justify-center text-xs text-pink-300">
                          {i}
                      </div>
                  ))}
               </div>
            </div>
          )}

          {state === 'shooting' && (
            <CameraShoot 
              onComplete={handlePhotosTaken} 
              onCancel={() => setState('intro')} 
            />
          )}

          {state === 'result' && (
            <PhotoStrip 
              photos={photos} 
              onRestart={handleRestart} 
            />
          )}

        </div>
        
        {/* Footer */}
        <footer className="mt-12 pb-4 text-center text-xs text-pink-400 font-mono">
            <p>SYSTEM.STATUS: ONLINE | VER: 1.1.0</p>
            <p>ASCII LOVE FOREVER</p>
        </footer>

      </div>
    </main>
  );
};

export default App;