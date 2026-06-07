import React, { useEffect, useRef } from 'react';
import { usePetStore } from '../store/petStore';
import { Particle } from '../types';

export function ParticleSystem() {
  const { particles, removeParticle } = usePetStore();

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
    }}>
      {particles.map((p) => (
        <ParticleItem key={p.id} particle={p} onDone={() => removeParticle(p.id)} />
      ))}
    </div>
  );
}

function ParticleItem({ particle, onDone }: { particle: Particle; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const emoji = getEmoji(particle.type);
  const color = getColor(particle.type);
  const driftX = (Math.random() - 0.5) * 40;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        fontSize: 14,
        lineHeight: 1,
        color,
        animation: `particle-float 2.5s ease-out forwards`,
        '--drift-x': `${driftX}px`,
        pointerEvents: 'none',
        userSelect: 'none',
        imageRendering: 'pixelated',
        fontFamily: 'monospace',
        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
      } as React.CSSProperties}
    >
      {emoji}
    </div>
  );
}

function getEmoji(type: Particle['type']): string {
  switch (type) {
    case 'heart':   return '♥';
    case 'sparkle': return '✦';
    case 'zzz':     return 'z';
    case 'star':    return '★';
    case 'bubble':  return '○';
  }
}

function getColor(type: Particle['type']): string {
  switch (type) {
    case 'heart':   return '#ff6b9d';
    case 'sparkle': return '#ffd166';
    case 'zzz':     return '#a8a4ff';
    case 'star':    return '#ffd166';
    case 'bubble':  return '#aef;';
  }
}

// Inject keyframes once
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-float {
      0%   { opacity: 1; transform: translate(0, 0) scale(1); }
      50%  { opacity: 1; transform: translate(var(--drift-x, 0), -30px) scale(1.3); }
      100% { opacity: 0; transform: translate(calc(var(--drift-x, 0) * 1.5), -60px) scale(0.6); }
    }
  `;
  document.head.appendChild(style);
}
