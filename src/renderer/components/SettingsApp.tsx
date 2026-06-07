import React, { useState, useEffect } from 'react';
import { PetType, ColorPalette, Accessory } from '../types';
import { PALETTES, drawPet } from '../utils/spriteRenderer';

const PET_TYPES: { value: PetType; label: string; emoji: string }[] = [
  { value: 'cat',  label: 'Cat',  emoji: '🐱' },
  { value: 'dog',  label: 'Dog',  emoji: '🐶' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
];

const PALETTE_LIST: { value: ColorPalette; label: string }[] = [
  { value: 'classic',  label: 'Classic Orange' },
  { value: 'midnight', label: 'Midnight Purple' },
  { value: 'forest',   label: 'Forest Green' },
  { value: 'sunset',   label: 'Sunset Red' },
  { value: 'ocean',    label: 'Ocean Blue' },
  { value: 'candy',    label: 'Candy Pink' },
];

const ACCESSORIES: { value: Accessory; label: string }[] = [
  { value: 'none',    label: 'None' },
  { value: 'hat',     label: '🎩 Top Hat' },
  { value: 'bow',     label: '🎀 Bow' },
  { value: 'glasses', label: '👓 Glasses' },
  { value: 'crown',   label: '👑 Crown' },
  { value: 'scarf',   label: '🧣 Scarf' },
];

export function SettingsApp() {
  const [petType, setPetType] = useState<PetType>('cat');
  const [petName, setPetName] = useState('Pixel');
  const [colorPalette, setColorPalette] = useState<ColorPalette>('classic');
  const [accessory, setAccessory] = useState<Accessory>('none');
  const [saved, setSaved] = useState(false);
  const previewRef = React.useRef<HTMLCanvasElement>(null);
  const frameRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!window.pixelpal) return;
      const s = await window.pixelpal.getSettings();
      setPetType(s.petType);
      setPetName(s.petName);
      setColorPalette(s.colorPalette);
      setAccessory(s.accessory);
    };
    load();
  }, []);

  // Animate preview
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let lastTime = 0;
    const tick = (t: number) => {
      if (t - lastTime > 400) {
        frameRef.current = (frameRef.current + 1) % 8;
        lastTime = t;
        drawPet(ctx, petType, 'happy', colorPalette, accessory, frameRef.current, 6, 'right');
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [petType, colorPalette, accessory]);

  const handleSave = async () => {
    if (!window.pixelpal) return;
    await window.pixelpal.saveSettings({ petType, petName, colorPalette, accessory });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pal = PALETTES[colorPalette];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      fontFamily: '"Courier New", monospace',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ fontSize: 28 }}>🐾</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 3 }}>PIXELPAL</div>
          <div style={{ fontSize: 10, color: '#aaa', letterSpacing: 2 }}>SETTINGS</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Preview Panel */}
        <div style={{
          width: 160,
          background: 'rgba(0,0,0,0.3)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 16,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: `2px solid ${pal.body}44`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <canvas
              ref={previewRef}
              width={120}
              height={120}
              style={{ imageRendering: 'pixelated', display: 'block' }}
            />
          </div>
          <div style={{
            fontSize: 11,
            color: pal.body,
            letterSpacing: 2,
            textAlign: 'center',
            maxWidth: 120,
            wordBreak: 'break-all',
          }}>
            {petName || 'Pixel'}
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <Section label="NAME">
            <input
              value={petName}
              onChange={(e) => setPetName(e.target.value.slice(0, 20))}
              maxLength={20}
              placeholder="Enter a name..."
              style={inputStyle}
            />
          </Section>

          <Section label="PET TYPE">
            <div style={{ display: 'flex', gap: 8 }}>
              {PET_TYPES.map((pt) => (
                <OptionBtn
                  key={pt.value}
                  selected={petType === pt.value}
                  onClick={() => setPetType(pt.value)}
                  accent={pal.body}
                >
                  <div style={{ fontSize: 22 }}>{pt.emoji}</div>
                  <div style={{ fontSize: 9 }}>{pt.label}</div>
                </OptionBtn>
              ))}
            </div>
          </Section>

          <Section label="COLOR">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {PALETTE_LIST.map((pl) => {
                const p = PALETTES[pl.value];
                return (
                  <div
                    key={pl.value}
                    onClick={() => setColorPalette(pl.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `2px solid ${colorPalette === pl.value ? p.body : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                      background: colorPalette === pl.value ? `${p.body}22` : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      background: p.body,
                      border: `2px solid ${p.shadow}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, color: colorPalette === pl.value ? '#fff' : '#aaa' }}>
                      {pl.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section label="ACCESSORY">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {ACCESSORIES.map((acc) => (
                <OptionBtn
                  key={acc.value}
                  selected={accessory === acc.value}
                  onClick={() => setAccessory(acc.value)}
                  accent={pal.body}
                >
                  <div style={{ fontSize: 10, textAlign: 'center' }}>{acc.label}</div>
                </OptionBtn>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <button onClick={handleSave} style={{
          ...btnStyle,
          background: saved ? '#52b788' : pal.body,
          color: '#fff',
          border: 'none',
        }}>
          {saved ? '✓ SAVED!' : 'SAVE'}
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 9,
        letterSpacing: 3,
        color: '#888',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>{label}</div>
      {children}
    </div>
  );
}

function OptionBtn({
  children, selected, onClick, accent,
}: { children: React.ReactNode; selected: boolean; onClick: () => void; accent: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 4px',
        borderRadius: 8,
        border: `2px solid ${selected ? accent : 'rgba(255,255,255,0.1)'}`,
        cursor: 'pointer',
        background: selected ? `${accent}22` : 'rgba(255,255,255,0.03)',
        transition: 'all 0.15s',
        color: selected ? '#fff' : '#aaa',
        minHeight: 52,
        gap: 4,
      }}
    >
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.07)',
  border: '2px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  color: '#fff',
  fontFamily: '"Courier New", monospace',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: '"Courier New", monospace',
  fontSize: 12,
  letterSpacing: 2,
  fontWeight: 'bold',
  transition: 'all 0.15s',
};
