import React, { useRef, useEffect, useState } from 'react';
import { AsciiButton, AsciiBorder, TypewriterEffect } from './AsciiUI';

interface PhotoStripProps {
  photos: string[];
  onRestart: () => void;
}

type LayoutType = 'strip' | 'grid' | 'film';
type FilterType = 'normal' | 'bw' | 'sepia' | 'vintage' | 'dreamy';
type ThemeType = 'milk' | 'dark' | 'blue' | 'peach';

const THEMES: Record<ThemeType, { bg: string; text: string; accent: string; label: string }> = {
  milk: { bg: '#fff5fa', text: '#ff69b4', accent: '#ff1493', label: 'MILK' },
  dark: { bg: '#1a1a1a', text: '#ff69b4', accent: '#ffffff', label: 'DARK' },
  blue: { bg: '#e0f2fe', text: '#0284c7', accent: '#0ea5e9', label: 'SKY' },
  peach: { bg: '#fff7ed', text: '#ea580c', accent: '#f97316', label: 'PEACH' },
};

const FILTERS: Record<FilterType, { filter: string; label: string }> = {
  normal: { filter: 'none', label: 'NORM' },
  bw: { filter: 'grayscale(100%) contrast(120%)', label: 'B&W' },
  sepia: { filter: 'sepia(80%) contrast(90%)', label: 'SEPIA' },
  vintage: { filter: 'sepia(40%) contrast(120%) brightness(90%) saturate(150%)', label: 'RETRO' },
  dreamy: { filter: 'brightness(110%) contrast(90%) saturate(80%)', label: 'SOFT' },
};

export const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // Customization State
  const [layout, setLayout] = useState<LayoutType>('strip');
  const [filter, setFilter] = useState<FilterType>('normal');
  const [theme, setTheme] = useState<ThemeType>('milk');

  // Drawing Constants
  const PHOTO_WIDTH = 400;
  const PHOTO_HEIGHT = 300; // 4:3 Aspect Ratio
  const PADDING = 40;
  const GAP = 20;
  const HEADER_HEIGHT = 120;
  const FOOTER_HEIGHT = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || photos.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = photos.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    Promise.all(images.map(img => new Promise(resolve => {
      if (img.complete) resolve(true);
      else img.onload = () => resolve(true);
    }))).then(() => {
      const currentTheme = THEMES[theme];
      const currentFilter = FILTERS[filter].filter;

      // 1. Calculate Dimensions based on Layout
      let canvasW = 0;
      let canvasH = 0;
      
      if (layout === 'strip') {
        canvasW = PADDING * 2 + PHOTO_WIDTH;
        canvasH = PADDING * 2 + HEADER_HEIGHT + FOOTER_HEIGHT + (4 * PHOTO_HEIGHT) + (3 * GAP);
      } else if (layout === 'grid') {
        canvasW = PADDING * 3 + (2 * PHOTO_WIDTH);
        canvasH = PADDING * 2 + HEADER_HEIGHT + FOOTER_HEIGHT + (2 * PHOTO_HEIGHT) + GAP;
      } else if (layout === 'film') {
        canvasW = PADDING * 2 + (4 * PHOTO_WIDTH) + (3 * GAP);
        canvasH = PADDING * 2 + HEADER_HEIGHT + FOOTER_HEIGHT + PHOTO_HEIGHT;
      }

      canvas.width = canvasW;
      canvas.height = canvasH;

      // 2. Draw Background
      ctx.fillStyle = currentTheme.bg;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 3. Draw Outer Border
      ctx.strokeStyle = currentTheme.text;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(10, 10, canvasW - 20, canvasH - 20);
      ctx.setLineDash([]);

      // 4. Draw Header
      ctx.fillStyle = currentTheme.text;
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("LIFE 4 CUTS", canvasW / 2, PADDING + 50);
      
      ctx.fillStyle = currentTheme.accent;
      ctx.font = '24px "Courier New", monospace';
      ctx.fillText("(｡♥‿♥｡)", canvasW / 2, PADDING + 85);

      // 5. Draw Photos
      const startY = PADDING + HEADER_HEIGHT;
      
      images.forEach((img, index) => {
        let x = 0;
        let y = 0;

        if (layout === 'strip') {
          x = PADDING;
          y = startY + index * (PHOTO_HEIGHT + GAP);
        } else if (layout === 'grid') {
          const col = index % 2;
          const row = Math.floor(index / 2);
          x = PADDING + col * (PHOTO_WIDTH + PADDING); // Extra padding between columns in grid
          y = startY + row * (PHOTO_HEIGHT + GAP);
        } else if (layout === 'film') {
          x = PADDING + index * (PHOTO_WIDTH + GAP);
          y = startY;
        }

        // Photo Background/Border
        ctx.fillStyle = currentTheme.text + '40'; // transparent version
        ctx.fillRect(x - 5, y - 5, PHOTO_WIDTH + 10, PHOTO_HEIGHT + 10);

        // Apply Filter & Draw Image
        ctx.filter = currentFilter;
        ctx.drawImage(img, x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
        ctx.filter = 'none'; // Reset filter for text/graphics

        // Overlay Number
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`#0${index + 1}`, x + 20, y + PHOTO_HEIGHT - 20);
      });

      // 6. Draw Footer
      ctx.textAlign = 'center';
      const date = new Date().toLocaleString();
      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = currentTheme.text;
      ctx.fillText(date, canvasW / 2, canvasH - PADDING - 35);
      ctx.fillStyle = currentTheme.accent;
      ctx.fillText("Made with ASCII Booth", canvasW / 2, canvasH - PADDING - 15);

      setDownloadUrl(canvas.toDataURL('image/png'));
    });
  }, [photos, layout, filter, theme]);

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.download = `ascii-4-cuts-${Date.now()}.png`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in pb-12 w-full max-w-full mx-auto px-2">
      <h2 className="text-2xl font-bold mb-8 text-pink-500">
        <TypewriterEffect text="PROCESSING COMPLETE..." />
      </h2>

      {/* Grid Layout: 
          Desktop: Left Column (Preview) | Right Column (Fixed Controls)
          Mobile: Stacked
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-8 w-full items-start relative">
        
        {/* Left Column: Preview Area */}
        {/* Min-height ensures container doesn't collapse while rendering */}
        <div className="w-full flex justify-center items-start min-h-[60vh]">
            <div className="relative bg-white shadow-2xl border-4 border-pink-100 p-2 md:p-4 max-w-full rounded-sm inline-block">
                 {/* Canvas scales to fit but preserves aspect ratio. max-h prevents it from being too tall on screen */}
                <canvas 
                    ref={canvasRef} 
                    className="max-w-full max-h-[75vh] w-auto h-auto object-contain mx-auto shadow-sm block"
                    style={{ imageRendering: 'high-quality' }}
                />
                <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 text-xs font-mono text-pink-400 pointer-events-none border border-pink-100">
                    PREVIEW
                </div>
            </div>
        </div>

        {/* Right Column: Customization Controls */}
        {/* sticky ensures controls stay visible when scrolling down a long photo strip */}
        <div className="w-full lg:sticky lg:top-8 h-fit">
            <AsciiBorder title="CUSTOMIZE" className="bg-white/90 backdrop-blur w-full shadow-sm">
                
                {/* Layouts */}
                <div className="mb-6">
                    <h3 className="font-mono text-sm font-bold text-pink-600 mb-3 flex items-center gap-2">
                        <span>[1]</span> LAYOUT
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {(['strip', 'grid', 'film'] as LayoutType[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLayout(l)}
                                className={`
                                    py-2 px-1 text-xs md:text-sm font-bold border-2 transition-all uppercase
                                    ${layout === l 
                                        ? 'bg-pink-500 text-white border-pink-600 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] translate-x-[1px] translate-y-[1px]' 
                                        : 'bg-white text-pink-500 border-pink-300 hover:border-pink-400 shadow-[4px_4px_0px_rgba(255,192,203,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(255,192,203,0.5)]'
                                    }
                                `}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <h3 className="font-mono text-sm font-bold text-pink-600 mb-3 flex items-center gap-2">
                        <span>[2]</span> FILTER
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(FILTERS) as FilterType[]).map((f) => (
                             <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                                    px-3 py-1 text-xs font-bold border-2 rounded-full transition-colors
                                    ${filter === f
                                        ? 'bg-pink-500 text-white border-pink-600'
                                        : 'bg-transparent text-pink-500 border-pink-300 hover:bg-pink-50'
                                    }
                                `}
                             >
                                {FILTERS[f].label}
                             </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div className="mb-6">
                    <h3 className="font-mono text-sm font-bold text-pink-600 mb-3 flex items-center gap-2">
                        <span>[3]</span> THEME
                    </h3>
                    <div className="flex gap-3">
                        {(Object.keys(THEMES) as ThemeType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`
                                    w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-transform hover:scale-110
                                    ${theme === t ? 'ring-2 ring-offset-2 ring-pink-400 border-transparent' : 'border-gray-200'}
                                `}
                                style={{ backgroundColor: THEMES[t].bg }}
                                title={THEMES[t].label}
                            >
                                {theme === t && <span className="text-xs font-bold" style={{ color: THEMES[t].text }}>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-dashed border-pink-200 my-4" />

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <AsciiButton onClick={handleDownload} className="w-full justify-center">
                        [ DOWNLOAD PNG ]
                    </AsciiButton>
                    <button 
                        onClick={onRestart}
                        className="text-xs text-pink-400 hover:text-pink-600 underline font-mono text-center mt-2"
                    >
                        &lt; Start Over (Delete Photos)
                    </button>
                </div>

            </AsciiBorder>
        </div>
      </div>
    </div>
  );
};