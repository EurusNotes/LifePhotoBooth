import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AsciiBorder, AsciiButton } from './AsciiUI';

interface CameraShootProps {
  onComplete: (photos: string[]) => void;
  onCancel: () => void;
}

export const CameraShoot: React.FC<CameraShootProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [status, setStatus] = useState<'setup' | 'running' | 'waiting'>('setup');
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string>('');
  
  const isMounted = useRef(true);
  const isShooting = useRef(false);

  const TOTAL_SHOTS = 4;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        if (isMounted.current) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError('CAMERA ERROR: Permission denied or no device found.');
          console.error(err);
        }
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureCanvas = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Calculate 4:3 crop from the video source (likely 16:9)
      const videoW = video.videoWidth;
      const videoH = video.videoHeight;
      const targetAspect = 4 / 3;
      
      let renderW, renderH, startX, startY;

      // Determine if video is wider or taller than target 4:3
      const videoAspect = videoW / videoH;

      if (videoAspect > targetAspect) {
        // Video is wider (e.g. 16:9), crop the sides
        renderH = videoH;
        renderW = videoH * targetAspect;
        startX = (videoW - renderW) / 2;
        startY = 0;
      } else {
        // Video is taller (unlikely for landscape webcam), crop top/bottom
        renderW = videoW;
        renderH = videoW / targetAspect;
        startX = 0;
        startY = (videoH - renderH) / 2;
      }

      // Set canvas to the cropped size
      canvas.width = renderW;
      canvas.height = renderH;
      
      // Mirror the context horizontally
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      // Draw the cropped portion of the video
      ctx.drawImage(
        video, 
        startX, startY, renderW, renderH, // Source Rectangle
        0, 0, canvas.width, canvas.height // Destination Rectangle
      );
      
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    return null;
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startSequence = async () => {
    if (isShooting.current) return;
    isShooting.current = true;
    setStatus('running');
    setPhotos([]);
    setCountdown(null);
    
    const capturedPhotos: string[] = [];

    try {
      for (let i = 0; i < TOTAL_SHOTS; i++) {
        if (!isMounted.current) return;

        // 1. Intermission Phase
        if (i > 0) {
            setCountdown(null);
            // User Request: "Wait 2 seconds, then start 321"
            await sleep(2000);
        }

        // 2. Countdown Phase (3-2-1)
        for (let c = 3; c > 0; c--) {
          if (!isMounted.current) return;
          setCountdown(c);
          await sleep(1000);
        }

        if (!isMounted.current) return;
        setCountdown(0); // SNAP Visuals

        // 3. Capture Phase
        const photo = captureCanvas();
        if (photo) {
          capturedPhotos.push(photo);
          setPhotos([...capturedPhotos]);
          
          // Flash effect
          setFlash(true);
          setTimeout(() => {
             if (isMounted.current) setFlash(false);
          }, 200);
        }
        
        // Short buffer after snap to finish flash effect
        await sleep(500); 
      }

      // Finished Sequence
      if (!isMounted.current) return;
      setStatus('waiting');
      await sleep(1000);
      if (isMounted.current) {
        onComplete(capturedPhotos);
      }

    } catch (e) {
      console.error(e);
    } finally {
      isShooting.current = false;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono">
        <p>{error}</p>
        <AsciiButton onClick={onCancel}>[ RETURN ]</AsciiButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      
      {/* Status Bar */}
      <div className="w-full mb-4 flex justify-between font-mono text-sm text-pink-600 font-bold">
        <span>SHOTS: {photos.length} / {TOTAL_SHOTS}</span>
        <span>{status === 'running' ? (countdown === 0 ? 'SNAP!' : 'RECORDING') : (status === 'waiting' ? 'PROCESSING...' : 'READY')}</span>
      </div>

      {/* Camera Container - Forces 4:3 Aspect Ratio */}
      <AsciiBorder className="w-full relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden shadow-xl">
        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Feed - object-cover ensures visual crop matches our canvas crop */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 border-2 border-pink-500/50">
            <div className="w-full h-1/3 border-b border-dashed border-pink-500/50"></div>
            <div className="w-full h-1/3 border-b border-dashed border-pink-500/50"></div>
            <div className="absolute top-0 left-1/3 w-1/3 h-full border-l border-r border-dashed border-pink-500/50"></div>
            
            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-pink-500"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-pink-500"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-pink-500"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-pink-500"></div>
        </div>

        {/* Countdown Overlay */}
        {status === 'running' && countdown !== null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
                <div className="text-[10rem] leading-none font-bold text-white drop-shadow-[0_4px_0_rgba(255,105,180,1)] animate-bounce">
                    {countdown}
                </div>
            </div>
        )}

        {/* Wait Intermission Overlay */}
        {status === 'running' && countdown === null && photos.length > 0 && photos.length < TOTAL_SHOTS && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
                <div className="text-4xl font-bold text-white drop-shadow-[0_2px_0_rgba(255,105,180,1)] animate-pulse tracking-widest">
                    NEXT SHOT...
                </div>
            </div>
        )}

        {/* Flash Overlay */}
        {flash && (
            <div className="absolute inset-0 bg-white z-50 animate-pulse"></div>
        )}

        {/* Start Screen Overlay (Inside Camera) */}
        {status === 'setup' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-milk/90 backdrop-blur-sm z-10">
                <div className="text-center p-6 border-2 border-pink-500 bg-white max-w-xs shadow-[8px_8px_0px_rgba(255,105,180,0.3)]">
                    <p className="mb-4 text-pink-600 font-bold font-mono">
                       READY FOR 4 SHOTS?<br/>
                       3..2..1.. SNAP!
                    </p>
                    <AsciiButton onClick={startSequence}>
                        [ START ]
                    </AsciiButton>
                </div>
             </div>
        )}
      </AsciiBorder>
      
      {/* Footer Decor */}
      <div className="w-full mt-4 flex justify-between text-xs text-pink-400 opacity-60 font-mono">
        <span>// SYSTEM.READY</span>
        <span>CAM_01_ACTIVE</span>
      </div>

    </div>
  );
};