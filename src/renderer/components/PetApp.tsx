import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePetStore } from '../store/petStore';
import { PetCanvas } from './PetCanvas';
import { ParticleSystem } from './ParticleSystem';
import { ContextMenu } from './ContextMenu';
import { getNextState, getRandomWalkTarget } from '../utils/behaviorFSM';
import { PetState } from '../types';

const SCALE = 5;
const PET_SIZE = SCALE * 20; // 100px
const WALK_SPEED = 1.5; // px per frame

export function PetApp() {
  const store = usePetStore();
  const behaviorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const walkAnimRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const pettingCountRef = useRef(0);
  const pettingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      if (!window.pixelpal) return;
      const settings = await window.pixelpal.getSettings();
      store.applySettings({
        petType: settings.petType,
        petName: settings.petName,
        colorPalette: settings.colorPalette,
        accessory: settings.accessory,
      });
      const bounds = await window.pixelpal.getScreenBounds();
      store.setScreenBounds(bounds);
    };
    load();

    // Listen for settings changes from settings window
    const unsub = window.pixelpal?.onSettingsUpdated((s) => {
      store.applySettings(s as Parameters<typeof store.applySettings>[0]);
    });
    return () => { unsub?.(); };
  }, []);

  // Behavior FSM loop
  const scheduleBehavior = useCallback(() => {
    if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);

    const { petState, isUserIdle, userIdleTime } = usePetStore.getState();
    const { state: nextState, duration } = getNextState(petState, isUserIdle, userIdleTime);

    behaviorTimerRef.current = setTimeout(() => {
      const s = usePetStore.getState();

      // Don't interrupt dragging or petting
      if (isDraggingRef.current || s.isPetting) {
        scheduleBehavior();
        return;
      }

      store.setPetState(nextState);

      // Kick off walking to random spot
      if (nextState === 'walking') {
        const { screenBounds } = usePetStore.getState();
        // Get current window position via IPC later; use stored
        const target = getRandomWalkTarget(0, 0, screenBounds.width, screenBounds.height);
        store.setTargetPosition(target);
      } else {
        store.setTargetPosition(null);
      }

      // Add particles for happy/jumping
      if (nextState === 'happy') {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => store.addParticle('sparkle'), i * 200);
        }
      }

      scheduleBehavior();
    }, duration);
  }, []);

  // Walking movement loop
  useEffect(() => {
    let lastPos = { x: 0, y: 0 };

    const tick = async () => {
      const s = usePetStore.getState();
      if (s.petState === 'walking' && s.targetPosition && !isDraggingRef.current) {
        const dx = s.targetPosition.x - lastPos.x;
        const dy = s.targetPosition.y - lastPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          const newX = lastPos.x + (dx / dist) * WALK_SPEED;
          const newY = lastPos.y + (dy / dist) * WALK_SPEED;
          lastPos = { x: newX, y: newY };
          store.setFacing(dx > 0 ? 'right' : 'left');
          await window.pixelpal?.moveWindow(Math.round(newX), Math.round(newY));
        } else {
          store.setTargetPosition(null);
          store.setPetState('idle');
        }
      }
      walkAnimRef.current = requestAnimationFrame(tick);
    };

    walkAnimRef.current = requestAnimationFrame(tick);
    return () => {
      if (walkAnimRef.current) cancelAnimationFrame(walkAnimRef.current);
    };
  }, []);

  // Activity polling
  useEffect(() => {
    activityTimerRef.current = setInterval(async () => {
      if (!window.pixelpal) return;
      const { isIdle, idleTime } = await window.pixelpal.getActivity();
      store.setUserActivity(isIdle, idleTime);

      // React to idle state changes
      const s = usePetStore.getState();
      if (isIdle && idleTime > 60 && s.petState !== 'sleeping') {
        store.setPetState('sleeping');
        store.addParticle('zzz');
      }
      if (!isIdle && s.petState === 'sleeping') {
        store.setPetState('happy');
        for (let i = 0; i < 4; i++) setTimeout(() => store.addParticle('heart'), i * 150);
      }
    }, 3000);

    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, []);

  // Particle cleanup
  useEffect(() => {
    const cleanup = setInterval(() => store.clearOldParticles(), 1000);
    return () => clearInterval(cleanup);
  }, []);

  // Start behavior FSM
  useEffect(() => {
    scheduleBehavior();
    return () => {
      if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    };
  }, [scheduleBehavior]);

  // ─── Interaction handlers ───────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return; // right click handled separately
    e.preventDefault();
    isDraggingRef.current = true;
    dragOffsetRef.current = { x: e.screenX, y: e.screenY };
    store.setPetState('idle');
    window.pixelpal?.setIgnoreMouse(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    // Electron window follows mouse via move-window IPC
    // We track relative to drag start
    const dx = e.screenX - dragOffsetRef.current.x;
    const dy = e.screenY - dragOffsetRef.current.y;
    dragOffsetRef.current = { x: e.screenX, y: e.screenY };
    // Move window by delta — main process handles clamping
    void window.pixelpal?.moveWindow(dx, dy); // main uses relative deltas
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleClick = useCallback((_e: React.MouseEvent) => {
    store.incrementClick();
    const { clickCount } = usePetStore.getState();

    if (clickCount >= 3) {
      // Triple click = super happy
      store.setPetState('jumping');
      for (let i = 0; i < 5; i++) {
        setTimeout(() => store.addParticle(Math.random() > 0.5 ? 'heart' : 'sparkle'), i * 100);
      }
    } else {
      store.setPetState('happy');
      store.addParticle('heart');
    }
    scheduleBehavior();
  }, [scheduleBehavior]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePetting = useCallback(() => {
    pettingCountRef.current++;
    store.setIsPetting(true);
    store.incrementPetCount();
    store.setPetState('petting');
    store.addParticle('heart');

    if (pettingTimerRef.current) clearTimeout(pettingTimerRef.current);
    pettingTimerRef.current = setTimeout(() => {
      store.setIsPetting(false);
      store.setPetState('happy');
      scheduleBehavior();
    }, 1500);
  }, [scheduleBehavior]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handlePetting}
    >
      <PetCanvas scale={SCALE} />
      <ParticleSystem />
      <PetNameTag />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenSettings={() => {
            setContextMenu(null);
            window.pixelpal?.openSettings();
          }}
        />
      )}
    </div>
  );
}

function PetNameTag() {
  const { petName, petState } = usePetStore();
  const isVisible = petState === 'happy' || petState === 'petting' || petState === 'jumping';

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 2,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.6)',
      color: '#fff',
      fontSize: 9,
      padding: '1px 5px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      fontFamily: 'monospace',
      letterSpacing: 1,
      imageRendering: 'pixelated',
    }}>
      {petName}
    </div>
  );
}
