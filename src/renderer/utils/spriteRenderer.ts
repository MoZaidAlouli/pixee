import { PetType, ColorPalette, Accessory, PetState } from '../types';

// Palette color type
export interface PaletteColors {
  body: string; shadow: string; highlight: string;
  outline: string; eye: string; accent: string;
}

// Color palettes
export const PALETTES: Record<ColorPalette, PaletteColors> = {
  classic:  { body: '#f4a261', shadow: '#e76f51', highlight: '#ffd166', outline: '#2d1b0e', eye: '#2d1b0e', accent: '#e63946' },
  midnight: { body: '#6c63ff', shadow: '#4a41cc', highlight: '#a8a4ff', outline: '#1a1a2e', eye: '#e0e0e0', accent: '#ff6b9d' },
  forest:   { body: '#52b788', shadow: '#2d6a4f', highlight: '#95d5b2', outline: '#1b4332', eye: '#1b4332', accent: '#f4a261' },
  sunset:   { body: '#ff6b6b', shadow: '#c9184a', highlight: '#ffb3c1', outline: '#590d22', eye: '#590d22', accent: '#ffd166' },
  ocean:    { body: '#48cae4', shadow: '#0096c7', highlight: '#ade8f4', outline: '#03045e', eye: '#03045e', accent: '#ffd166' },
  candy:    { body: '#f72585', shadow: '#b5179e', highlight: '#ff8fab', outline: '#480ca8', eye: '#480ca8', accent: '#7209b7' },
};

// Pixel grid helpers
type Pixel = [number, number, string];

function drawPixels(ctx: CanvasRenderingContext2D, pixels: Pixel[], scale: number) {
  for (const [px, py, color] of pixels) {
    ctx.fillStyle = color;
    ctx.fillRect(px * scale, py * scale, scale, scale);
  }
}

// ─── CAT SPRITES ─────────────────────────────────────────────────────────────

function getCatPixels(frame: number, state: PetState, pal: PaletteColors): Pixel[] {
  const { body: B, shadow: S, highlight: H, outline: O, eye: E, accent: A } = pal;
  const pixels: Pixel[] = [];
  const ox = 2;
  let oy = 2;

  if (state === 'sleeping') {
    oy = 4;
    const base: Pixel[] = [
      [4,8,O],[5,8,B],[6,8,B],[7,8,B],[8,8,B],[9,8,B],[10,8,B],[11,8,O],
      [3,9,O],[4,9,B],[5,9,B],[6,9,B],[7,9,B],[8,9,B],[9,9,B],[10,9,B],[11,9,B],[12,9,O],
      [3,10,O],[4,10,S],[5,10,B],[6,10,B],[7,10,B],[8,10,B],[9,10,B],[10,10,B],[11,10,S],[12,10,O],
      [3,11,O],[4,11,S],[5,11,S],[6,11,B],[7,11,B],[8,11,B],[9,11,B],[10,11,S],[11,11,S],[12,11,O],
      [4,12,O],[5,12,O],[6,12,O],[7,12,O],[8,12,O],[9,12,O],[10,12,O],[11,12,O],
      [11,10,B],[12,9,B],[13,8,B],[13,9,S],[12,10,S],
      [5,9,E],[6,9,O],[7,9,O],
      [9,9,E],[10,9,O],[11,9,O],
    ];
    return base;
  }

  if (state === 'jumping') oy = frame % 2 === 0 ? 0 : 1;
  if (state === 'walking') oy = frame % 4 < 2 ? 2 : 3;
  if (state === 'happy')   oy = frame % 3 === 0 ? 1 : 2;

  const baseX = ox, baseY = oy;

  // Ears
  pixels.push(
    [baseX+2, baseY, O], [baseX+3, baseY, B], [baseX+3, baseY+1, B],
    [baseX+8, baseY, O], [baseX+9, baseY, B], [baseX+9, baseY+1, B],
    [baseX+2, baseY+1, B], [baseX+10, baseY+1, B],
    [baseX+3, baseY+1, A], [baseX+8, baseY+1, A],
  );

  // Head
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const x = baseX + col + 1, y = baseY + 2 + row;
      const isEdge = row === 0 || row === 4 || col === 0 || col === 8;
      const isCorner = (row === 0 && (col === 0 || col === 8)) || (row === 4 && (col === 0 || col === 8));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : (row === 1 ? H : B)]);
    }
  }

  // Eyes
  const eyeY = baseY + 3;
  if (state === 'thinking') {
    pixels.push([baseX+3, eyeY, E],[baseX+4, eyeY, O],[baseX+5, eyeY, O]);
    pixels.push([baseX+7, eyeY, E],[baseX+8, eyeY, O],[baseX+9, eyeY, O]);
  } else if (state === 'happy') {
    pixels.push([baseX+3, eyeY, E],[baseX+4, eyeY+1, E]);
    pixels.push([baseX+7, eyeY, E],[baseX+8, eyeY+1, E]);
  } else {
    pixels.push(
      [baseX+3, eyeY, O],[baseX+4, eyeY, E],[baseX+5, eyeY, O],
      [baseX+7, eyeY, O],[baseX+8, eyeY, E],[baseX+9, eyeY, O],
      [baseX+4, eyeY, H],[baseX+8, eyeY, H],
    );
  }

  // Nose & mouth
  pixels.push([baseX+6, baseY+5, A],[baseX+5, baseY+6, O],[baseX+7, baseY+6, O]);

  // Whiskers
  pixels.push(
    [baseX+1, eyeY+1, S],[baseX, eyeY+1, S],
    [baseX+11, eyeY+1, S],[baseX+12, eyeY+1, S],
    [baseX+1, eyeY+2, S],[baseX, eyeY+2, S],
    [baseX+11, eyeY+2, S],[baseX+12, eyeY+2, S],
  );

  // Body
  const bodyY = baseY + 7;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const x = baseX + col + 1, y = bodyY + row;
      const isEdge = row === 0 || row === 4 || col === 0 || col === 8;
      const isCorner = (row === 0 && (col === 0 || col === 8)) || (row === 4 && (col === 0 || col === 8));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : (col < 2 || col > 6 ? S : B)]);
    }
  }
  pixels.push([baseX+4, bodyY+1, H],[baseX+5, bodyY+1, H],[baseX+6, bodyY+1, H]);
  pixels.push([baseX+4, bodyY+2, H],[baseX+5, bodyY+2, H],[baseX+6, bodyY+2, H]);

  // Legs
  const legY = bodyY + 5;
  const legAnim = state === 'walking' ? (frame % 4) : 0;
  pixels.push(
    [baseX+2, legY, O],[baseX+3, legY, B],[baseX+3, legY+1, B],[baseX+2, legY+1, O],
    [baseX+7, legY, B],[baseX+8, legY, O],[baseX+7, legY+1, B],[baseX+8, legY+1, O],
  );
  if (legAnim < 2) {
    pixels.push([baseX+3, legY-1, B],[baseX+7, legY, B]);
  } else {
    pixels.push([baseX+3, legY, B],[baseX+7, legY-1, B]);
  }

  // Tail
  const tailX = baseX + 11;
  const tailWag = state === 'happy' ? (frame % 3 === 0 ? -1 : 0) : 0;
  pixels.push(
    [tailX, bodyY+1+tailWag, B],[tailX+1, bodyY+tailWag, S],
    [tailX, bodyY+2, B],[tailX+1, bodyY+1, S],
    [tailX+1, bodyY+2, H],
  );

  return pixels;
}

// ─── DOG SPRITES ─────────────────────────────────────────────────────────────

function getDogPixels(frame: number, state: PetState, pal: PaletteColors): Pixel[] {
  const { body: B, shadow: S, highlight: H, outline: O, eye: E, accent: A } = pal;
  const pixels: Pixel[] = [];
  const ox = 1;
  let oy = 1;

  if (state === 'happy')   oy = frame % 3 === 0 ? 0 : 1;
  if (state === 'walking') oy = frame % 4 < 2 ? 1 : 2;
  if (state === 'jumping') oy = frame % 2 === 0 ? 0 : 2;

  const bx = ox, by = oy;

  // Floppy ears
  pixels.push(
    [bx, by+2, O],[bx+1, by+2, S],[bx+1, by+3, S],[bx+1, by+4, S],[bx, by+3, O],
    [bx+12, by+2, O],[bx+11, by+2, S],[bx+11, by+3, S],[bx+11, by+4, S],[bx+12, by+3, O],
  );

  // Head
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 11; c++) {
      const x = bx+c+1, y = by+r+1;
      const isEdge = r===0||r===5||c===0||c===10;
      const isCorner = (r===0&&(c===0||c===10))||(r===5&&(c===0||c===10));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : B]);
    }
  }

  // Snout
  pixels.push(
    [bx+3,by+5,S],[bx+4,by+5,S],[bx+5,by+5,H],[bx+6,by+5,H],[bx+7,by+5,S],[bx+8,by+5,S],
    [bx+4,by+6,O],[bx+5,by+6,A],[bx+6,by+6,A],[bx+7,by+6,O],
    [bx+5,by+7,O],[bx+6,by+7,O],
  );

  // Eyes
  if (state === 'sleeping') {
    pixels.push([bx+3,by+3,O],[bx+4,by+3,O],[bx+8,by+3,O],[bx+9,by+3,O]);
  } else if (state === 'happy') {
    pixels.push([bx+3,by+3,E],[bx+4,by+2,E],[bx+8,by+3,E],[bx+9,by+2,E]);
  } else {
    pixels.push(
      [bx+3,by+3,O],[bx+4,by+3,E],[bx+4,by+2,H],
      [bx+8,by+3,O],[bx+9,by+3,E],[bx+9,by+2,H],
    );
  }

  // Body
  const bdY = by + 7;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 10; c++) {
      const x = bx+c+1, y = bdY+r;
      const isEdge = r===0||r===4||c===0||c===9;
      const isCorner = (r===0&&(c===0||c===9))||(r===4&&(c===0||c===9));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : (r===2&&c>2&&c<7 ? H : B)]);
    }
  }

  // Legs
  const legY = bdY + 5;
  const lf = state === 'walking' ? frame % 4 : 0;
  pixels.push(
    [bx+2, legY+(lf<2?-1:0), B],[bx+3, legY, B],[bx+2, legY+1, O],[bx+3, legY+1, O],
    [bx+8, legY+(lf>=2?-1:0), B],[bx+9, legY, B],[bx+8, legY+1, O],[bx+9, legY+1, O],
  );

  // Tail wag
  const tw = state === 'happy' ? Math.floor(frame/2)%3-1 : 0;
  pixels.push([bx+12,bdY+1+tw,B],[bx+13,bdY+tw,S],[bx+13,bdY+1+tw,H]);

  return pixels;
}

// ─── BIRD SPRITES ─────────────────────────────────────────────────────────────

function getBirdPixels(frame: number, state: PetState, pal: PaletteColors): Pixel[] {
  const { body: B, shadow: S, highlight: H, outline: O, eye: E, accent: A } = pal;
  const pixels: Pixel[] = [];
  const ox = 3;
  let oy = 2;

  if (state === 'happy' || state === 'jumping') oy = frame%2===0 ? 1 : 3;
  if (state === 'walking') oy = frame%4<2 ? 2 : 3;

  const bx = ox, by = oy;

  // Wings
  const wingUp = (state === 'happy' || state === 'jumping') && frame%2===0;
  const wingY = wingUp ? by+2 : by+4;
  pixels.push(
    [bx-1,wingY,O],[bx,wingY,B],[bx+1,wingY,B],[bx+1,wingY+1,S],
    [bx+9,wingY,B],[bx+10,wingY,B],[bx+11,wingY,O],[bx+9,wingY+1,S],
  );

  // Body
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      const x = bx+c+1, y = by+r+1;
      const isEdge = r===0||r===5||c===0||c===7;
      const isCorner = (r===0&&(c===0||c===7))||(r===5&&(c===0||c===7));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : (c===2||c===3 ? H : B)]);
    }
  }

  // Head
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const x = bx+c+2, y = by-3+r;
      const isEdge = r===0||r===3||c===0||c===5;
      const isCorner = (r===0&&(c===0||c===5))||(r===3&&(c===0||c===5));
      if (isCorner) continue;
      pixels.push([x, y, isEdge ? O : B]);
    }
  }

  // Beak
  pixels.push([bx+5,by+0,A],[bx+6,by+0,A],[bx+7,by+1,A]);

  // Eye
  if (state === 'sleeping') {
    pixels.push([bx+3,by-1,O],[bx+4,by-1,O]);
  } else {
    pixels.push([bx+3,by-1,O],[bx+4,by-1,E],[bx+3,by-2,H]);
  }

  // Crest
  pixels.push([bx+4,by-4,B],[bx+5,by-4,H],[bx+6,by-4,B],[bx+5,by-5,A]);

  // Feet
  const footY = by+7;
  pixels.push(
    [bx+3,footY,O],[bx+4,footY,O],[bx+4,footY+1,O],
    [bx+5,footY,O],[bx+6,footY,O],[bx+6,footY+1,O],
  );

  return pixels;
}

// ─── ACCESSORY OVERLAYS ───────────────────────────────────────────────────────

function getAccessoryPixels(accessory: Accessory, baseX: number, baseY: number, pal: PaletteColors): Pixel[] {
  const { outline: O, accent: A, highlight: H } = pal;
  const px: Pixel[] = [];

  switch (accessory) {
    case 'hat':
      px.push(
        [baseX+2,baseY-2,O],[baseX+3,baseY-2,O],[baseX+4,baseY-2,O],[baseX+5,baseY-2,O],[baseX+6,baseY-2,O],[baseX+7,baseY-2,O],[baseX+8,baseY-2,O],
        [baseX+3,baseY-3,'#333'],[baseX+4,baseY-3,'#333'],[baseX+5,baseY-3,'#333'],[baseX+6,baseY-3,'#333'],[baseX+7,baseY-3,'#333'],
        [baseX+3,baseY-4,'#333'],[baseX+4,baseY-4,'#333'],[baseX+5,baseY-4,'#333'],[baseX+6,baseY-4,'#333'],[baseX+7,baseY-4,'#333'],
        [baseX+4,baseY-2,A],[baseX+5,baseY-2,A],[baseX+6,baseY-2,A],
      ); break;
    case 'bow':
      px.push(
        [baseX+3,baseY-1,A],[baseX+4,baseY-2,A],[baseX+5,baseY-1,'#fff'],[baseX+6,baseY-2,A],[baseX+7,baseY-1,A],
        [baseX+4,baseY-1,A],[baseX+6,baseY-1,A],
      ); break;
    case 'glasses':
      px.push(
        [baseX+2,baseY+3,O],[baseX+3,baseY+3,O],[baseX+4,baseY+3,O],[baseX+5,baseY+3,O],
        [baseX+7,baseY+3,O],[baseX+8,baseY+3,O],[baseX+9,baseY+3,O],[baseX+10,baseY+3,O],
        [baseX+6,baseY+3,'#888'],
        [baseX+2,baseY+4,O],[baseX+4,baseY+4,O],[baseX+7,baseY+4,O],[baseX+10,baseY+4,O],
      ); break;
    case 'crown':
      px.push(
        [baseX+2,baseY-2,'#FFD700'],[baseX+3,baseY-3,'#FFD700'],[baseX+4,baseY-2,'#FFD700'],
        [baseX+5,baseY-4,'#FFD700'],[baseX+6,baseY-2,'#FFD700'],[baseX+7,baseY-3,'#FFD700'],[baseX+8,baseY-2,'#FFD700'],
        [baseX+3,baseY-2,A],[baseX+5,baseY-2,H],[baseX+7,baseY-2,A],
      ); break;
    case 'scarf':
      for (let i = 2; i < 10; i++) px.push([baseX+i, baseY+7, A]);
      px.push([baseX+3,baseY+8,A],[baseX+4,baseY+8,A],[baseX+3,baseY+9,O],[baseX+4,baseY+9,O]);
      break;
  }
  return px;
}

// ─── MAIN DRAW FUNCTION ───────────────────────────────────────────────────────

export function drawPet(
  ctx: CanvasRenderingContext2D,
  petType: PetType,
  state: PetState,
  palette: ColorPalette,
  accessory: Accessory,
  frame: number,
  scale: number,
  facing: 'left' | 'right'
) {
  const pal = PALETTES[palette];
  const W = ctx.canvas.width;
  const H_c = ctx.canvas.height;

  ctx.clearRect(0, 0, W, H_c);

  if (facing === 'left') {
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }

  let pixels: Pixel[] = [];
  switch (petType) {
    case 'cat':  pixels = getCatPixels(frame, state, pal); break;
    case 'dog':  pixels = getDogPixels(frame, state, pal); break;
    case 'bird': pixels = getBirdPixels(frame, state, pal); break;
  }

  const accPixels = getAccessoryPixels(accessory, 2, 2, pal);
  pixels = [...pixels, ...accPixels];

  drawPixels(ctx, pixels, scale);

  if (facing === 'left') ctx.restore();

  // Thinking dots
  if (state === 'thinking') {
    const dotFrame = Math.floor(frame / 3) % 3;
    for (let i = 0; i <= dotFrame; i++) {
      ctx.fillStyle = pal.body;
      ctx.fillRect((13 + i * 3) * scale, 2 * scale, 2 * scale, 2 * scale);
    }
  }
}

export function getPetEyePosition(_petType: PetType, scale: number): { x: number; y: number } {
  return { x: 6 * scale, y: 4 * scale };
}
