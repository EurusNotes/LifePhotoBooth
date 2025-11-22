import React from 'react';

export const AsciiButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group font-bold text-lg md:text-xl
        px-6 py-2 m-2
        border-2 border-pink-450
        text-pink-600
        hover:bg-pink-450 hover:text-white
        transition-colors duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        uppercase tracking-wider
        ${className}
      `}
    >
      <span className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-pink-450 group-hover:text-pink-450">
        &gt;&gt;
      </span>
      {children}
      <span className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-pink-450 group-hover:text-pink-450">
        &lt;&lt;
      </span>
    </button>
  );
};

export const AsciiBorder: React.FC<{ children: React.ReactNode; title?: string, className?: string }> = ({ children, title, className = "" }) => {
  return (
    <div className={`relative border-2 border-dashed border-pink-450 p-4 md:p-6 ${className}`}>
      {title && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-milk px-4 text-pink-500 font-bold uppercase tracking-widest whitespace-nowrap">
          [ {title} ]
        </div>
      )}
      {children}
      {/* Corner Decorations */}
      <div className="absolute -top-1 -left-1 text-pink-500">+</div>
      <div className="absolute -top-1 -right-1 text-pink-500">+</div>
      <div className="absolute -bottom-1 -left-1 text-pink-500">+</div>
      <div className="absolute -bottom-1 -right-1 text-pink-500">+</div>
    </div>
  );
};

export const AnimatedBackground: React.FC = () => {
  // Generate random hearts and stars
  const chars = "♥★✿NO●°";
  const rows = Array.from({ length: 50 }).map((_, i) => {
    return Array.from({ length: 40 }).map(() => 
      Math.random() > 0.95 ? chars[Math.floor(Math.random() * chars.length)] : " "
    ).join("");
  });

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 opacity-10 overflow-hidden flex flex-col select-none">
       <div className="animate-scroll-bg whitespace-pre font-mono text-pink-600 leading-none">
          {rows.map((row, i) => <div key={i}>{row}</div>)}
          {rows.map((row, i) => <div key={`dup-${i}`}>{row}</div>)}
       </div>
    </div>
  );
};

export const TypewriterEffect: React.FC<{ text: string; delay?: number }> = ({ text, delay = 50 }) => {
  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayText}<span className="animate-blink">_</span></span>;
};