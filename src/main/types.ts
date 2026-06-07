export type PetType = 'cat' | 'dog' | 'bird';
export type ColorPalette = 'classic' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'candy';
export type Accessory = 'none' | 'hat' | 'bow' | 'glasses' | 'crown' | 'scarf';
export type MoodType = 'happy' | 'idle' | 'sleepy' | 'excited' | 'curious' | 'focused';

export interface PetSettings {
  petType: PetType;
  petName: string;
  colorPalette: ColorPalette;
  accessory: Accessory;
  position: { x: number; y: number };
  mood: MoodType;
}

export interface PetStore extends PetSettings {
  windowBounds: { x: number; y: number; width: number; height: number };
}

export interface ActivityState {
  isIdle: boolean;
  idleTime: number;
  lastActivity: number;
}
