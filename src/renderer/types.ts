export type PetType = 'cat' | 'dog' | 'bird';
export type ColorPalette = 'classic' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'candy';
export type Accessory = 'none' | 'hat' | 'bow' | 'glasses' | 'crown' | 'scarf';
export type PetState =
  | 'idle'
  | 'walking'
  | 'sleeping'
  | 'happy'
  | 'focused'
  | 'curious'
  | 'jumping'
  | 'thinking'
  | 'petting'
  | 'stretching';

export interface PetSettings {
  petType: PetType;
  petName: string;
  colorPalette: ColorPalette;
  accessory: Accessory;
}

export interface Position {
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  type: 'heart' | 'sparkle' | 'zzz' | 'star' | 'bubble';
  createdAt: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
}

// Window API exposed by preload
declare global {
  interface Window {
    pixelpal: {
      getSettings: () => Promise<PetSettings & { position: Position; mood: string }>;
      saveSettings: (settings: Partial<PetSettings>) => Promise<{ success: boolean }>;
      openSettings: () => Promise<void>;
      getActivity: () => Promise<{ isIdle: boolean; idleTime: number }>;
      moveWindow: (x: number, y: number) => Promise<void>;
      getScreenBounds: () => Promise<ScreenBounds>;
      setIgnoreMouse: (ignore: boolean) => Promise<void>;
      onSettingsUpdated: (cb: (s: Partial<PetSettings>) => void) => () => void;
    };
  }
}
