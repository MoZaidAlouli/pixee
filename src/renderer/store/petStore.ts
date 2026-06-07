import { create } from 'zustand';
import { PetType, ColorPalette, Accessory, PetState, Particle, Position, ScreenBounds } from '../types';

interface PetStore {
  // Settings
  petType: PetType;
  petName: string;
  colorPalette: ColorPalette;
  accessory: Accessory;

  // State machine
  petState: PetState;
  previousState: PetState;
  stateTimer: number;

  // Position & movement
  position: Position;
  targetPosition: Position | null;
  facing: 'left' | 'right';
  isMoving: boolean;

  // Screen
  screenBounds: ScreenBounds;

  // Particles / effects
  particles: Particle[];

  // Interaction
  clickCount: number;
  lastClickTime: number;
  isPetting: boolean;
  petCount: number;

  // Activity
  isUserIdle: boolean;
  userIdleTime: number;

  // Actions
  setPetType: (type: PetType) => void;
  setPetName: (name: string) => void;
  setColorPalette: (palette: ColorPalette) => void;
  setAccessory: (acc: Accessory) => void;
  setPetState: (state: PetState) => void;
  setPosition: (pos: Position) => void;
  setTargetPosition: (pos: Position | null) => void;
  setFacing: (dir: 'left' | 'right') => void;
  setScreenBounds: (bounds: ScreenBounds) => void;
  addParticle: (type: Particle['type']) => void;
  removeParticle: (id: string) => void;
  clearOldParticles: () => void;
  incrementClick: () => void;
  setIsPetting: (v: boolean) => void;
  incrementPetCount: () => void;
  setUserActivity: (isIdle: boolean, idleTime: number) => void;
  applySettings: (settings: Partial<{
    petType: PetType;
    petName: string;
    colorPalette: ColorPalette;
    accessory: Accessory;
  }>) => void;
}

export const usePetStore = create<PetStore>((set, get) => ({
  petType: 'cat',
  petName: 'Pixel',
  colorPalette: 'classic',
  accessory: 'none',

  petState: 'idle',
  previousState: 'idle',
  stateTimer: 0,

  position: { x: 0, y: 0 },
  targetPosition: null,
  facing: 'right',
  isMoving: false,

  screenBounds: { width: 1920, height: 1080 },

  particles: [],

  clickCount: 0,
  lastClickTime: 0,
  isPetting: false,
  petCount: 0,

  isUserIdle: false,
  userIdleTime: 0,

  setPetType: (petType) => set({ petType }),
  setPetName: (petName) => set({ petName }),
  setColorPalette: (colorPalette) => set({ colorPalette }),
  setAccessory: (accessory) => set({ accessory }),

  setPetState: (petState) =>
    set((s) => ({ petState, previousState: s.petState, stateTimer: Date.now() })),

  setPosition: (position) => set({ position }),
  setTargetPosition: (targetPosition) => set({ targetPosition }),
  setFacing: (facing) => set({ facing }),
  setScreenBounds: (screenBounds) => set({ screenBounds }),

  addParticle: (type) => {
    const id = `${Date.now()}-${Math.random()}`;
    const particle: Particle = {
      id,
      x: 60 + (Math.random() - 0.5) * 40,
      y: 20 + (Math.random() - 0.5) * 20,
      type,
      createdAt: Date.now(),
    };
    set((s) => ({ particles: [...s.particles.slice(-20), particle] }));
  },

  removeParticle: (id) =>
    set((s) => ({ particles: s.particles.filter((p) => p.id !== id) })),

  clearOldParticles: () => {
    const now = Date.now();
    set((s) => ({ particles: s.particles.filter((p) => now - p.createdAt < 3000) }));
  },

  incrementClick: () => {
    const now = Date.now();
    const { clickCount, lastClickTime } = get();
    set({
      clickCount: now - lastClickTime < 500 ? clickCount + 1 : 1,
      lastClickTime: now,
    });
  },

  setIsPetting: (isPetting) => set({ isPetting }),
  incrementPetCount: () => set((s) => ({ petCount: s.petCount + 1 })),

  setUserActivity: (isUserIdle, userIdleTime) => set({ isUserIdle, userIdleTime }),

  applySettings: (settings) => set(settings as Partial<PetStore>),
}));
