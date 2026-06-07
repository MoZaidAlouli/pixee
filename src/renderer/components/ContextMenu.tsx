import React, { useEffect, useRef } from 'react';
import { usePetStore } from '../store/petStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function ContextMenu({ x, y, onClose, onOpenSettings }: ContextMenuProps) {
  const { petName, petState, petType } = usePetStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handle), 10);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const moodIcon = {
    idle: '😐', walking: '🚶', sleeping: '😴',
    happy: '😊', focused: '🧐', curious: '🤔',
    jumping: '🤸', thinking: '💭', petting: '😍', stretching: '🙆',
  }[petState] ?? '😐';

  const petIcon = { cat: '🐱', dog: '🐶', bird: '🐦' }[petType];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: Math.min(x, window.innerWidth - 160),
        top: Math.min(y, window.innerHeight - 200),
        background: 'rgba(20,20,30,0.95)',
        border: '2px solid rgba(255,255,255,0.15)',
        borderRadius: 8,
        padding: '4px 0',
        minWidth: 150,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 9999,
        fontFamily: '"Courier New", monospace',
        fontSize: 11,
        color: '#fff',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        padding: '6px 12px 4px',
        color: '#aaa',
        fontSize: 10,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 2,
      }}>
        {petIcon} {petName} · {moodIcon} {petState}
      </div>
      <MenuItem label="⚙️ Settings" onClick={onOpenSettings} />
      <MenuItem label="💤 Make Sleep" onClick={() => {
        usePetStore.getState().setPetState('sleeping');
        usePetStore.getState().addParticle('zzz');
        onClose();
      }} />
      <MenuItem label="🎉 Cheer Up" onClick={() => {
        const s = usePetStore.getState();
        s.setPetState('happy');
        for (let i = 0; i < 5; i++) setTimeout(() => s.addParticle('heart'), i * 100);
        onClose();
      }} />
      <MenuItem label="✨ Sparkle" onClick={() => {
        const s = usePetStore.getState();
        for (let i = 0; i < 6; i++) setTimeout(() => s.addParticle('sparkle'), i * 80);
        onClose();
      }} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 2, paddingTop: 2 }}>
        <MenuItem label="🚪 Quit" onClick={() => window.close()} danger />
      </div>
    </div>
  );
}

function MenuItem({
  label, onClick, danger,
}: { label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '5px 12px',
        cursor: 'pointer',
        background: hover ? (danger ? 'rgba(220,50,50,0.3)' : 'rgba(255,255,255,0.1)') : 'transparent',
        color: danger ? '#ff6b6b' : '#fff',
        transition: 'background 0.1s',
      }}
    >
      {label}
    </div>
  );
}
