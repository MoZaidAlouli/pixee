import React, { useEffect, useRef } from 'react';
import { usePetStore } from '../store/petStore';
import { drawPet } from '../utils/spriteRenderer';

interface PetCanvasProps {
  scale: number;
}

const CANVAS_GRID = 20; // 20x20 pixel grid
const FRAME_RATES: Record<string, number> = {
  idle:       600,
  walking:    150,
  sleeping:   1000,
  happy:      200,
  jumping:    120,
  curious:    400,
  thinking:   300,
  petting:    150,
  focused:    800,
  stretching: 400,
};

export function PetCanvas({ scale }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const { petType, colorPalette, accessory, petState, facing } = usePetStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const fps = FRAME_RATES[petState] ?? 400;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= fps) {
        frameRef.current = (frameRef.current + 1) % 16;
        lastFrameTimeRef.current = timestamp;

        drawPet(ctx, petType, petState, colorPalette, accessory, frameRef.current, scale, facing);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [petType, petState, colorPalette, accessory, scale, facing]);

  const size = CANVAS_GRID * scale;

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        width: size,
        height: size,
        display: 'block',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        filter: getShadowFilter(petState),
      }}
    />
  );
}

function getShadowFilter(state: string): string {
  switch (state) {
    case 'happy':   return 'drop-shadow(0 0 4px rgba(255,220,0,0.8))';
    case 'petting': return 'drop-shadow(0 0 6px rgba(255,100,200,0.9))';
    case 'jumping': return 'drop-shadow(0 0 8px rgba(100,200,255,0.9))';
    case 'sleeping':return 'drop-shadow(0 2px 4px rgba(100,100,200,0.6))';
    default:        return 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))';
  }
}
