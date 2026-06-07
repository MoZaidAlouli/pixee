import { PetState } from '../types';

export interface BehaviorTransition {
  to: PetState;
  probability: number;
  minDuration: number; // ms
  maxDuration: number; // ms
}

// FSM: define possible transitions from each state
export const BEHAVIOR_TRANSITIONS: Record<PetState, BehaviorTransition[]> = {
  idle: [
    { to: 'walking',  probability: 0.30, minDuration: 3000,  maxDuration: 7000  },
    { to: 'sleeping', probability: 0.10, minDuration: 8000,  maxDuration: 15000 },
    { to: 'curious',  probability: 0.20, minDuration: 2000,  maxDuration: 5000  },
    { to: 'thinking', probability: 0.15, minDuration: 2000,  maxDuration: 4000  },
    { to: 'idle',     probability: 0.25, minDuration: 3000,  maxDuration: 6000  },
  ],
  walking: [
    { to: 'idle',     probability: 0.50, minDuration: 2000,  maxDuration: 5000  },
    { to: 'happy',    probability: 0.20, minDuration: 1500,  maxDuration: 3000  },
    { to: 'curious',  probability: 0.20, minDuration: 1500,  maxDuration: 3000  },
    { to: 'walking',  probability: 0.10, minDuration: 3000,  maxDuration: 8000  },
  ],
  sleeping: [
    { to: 'idle',     probability: 0.90, minDuration: 8000,  maxDuration: 20000 },
    { to: 'sleeping', probability: 0.10, minDuration: 10000, maxDuration: 30000 },
  ],
  happy: [
    { to: 'idle',     probability: 0.60, minDuration: 2000,  maxDuration: 4000  },
    { to: 'walking',  probability: 0.20, minDuration: 1000,  maxDuration: 3000  },
    { to: 'jumping',  probability: 0.20, minDuration: 1000,  maxDuration: 2000  },
  ],
  focused: [
    { to: 'idle',     probability: 0.70, minDuration: 5000,  maxDuration: 12000 },
    { to: 'thinking', probability: 0.30, minDuration: 3000,  maxDuration: 7000  },
  ],
  curious: [
    { to: 'idle',     probability: 0.50, minDuration: 2000,  maxDuration: 4000  },
    { to: 'walking',  probability: 0.30, minDuration: 1000,  maxDuration: 3000  },
    { to: 'thinking', probability: 0.20, minDuration: 2000,  maxDuration: 5000  },
  ],
  jumping: [
    { to: 'happy',    probability: 0.50, minDuration: 500,   maxDuration: 1500  },
    { to: 'idle',     probability: 0.50, minDuration: 500,   maxDuration: 1000  },
  ],
  thinking: [
    { to: 'idle',     probability: 0.60, minDuration: 3000,  maxDuration: 6000  },
    { to: 'curious',  probability: 0.40, minDuration: 2000,  maxDuration: 4000  },
  ],
  petting: [
    { to: 'happy',    probability: 1.00, minDuration: 1000,  maxDuration: 2000  },
  ],
  stretching: [
    { to: 'idle',     probability: 1.00, minDuration: 2000,  maxDuration: 3000  },
  ],
};

export function getNextState(
  currentState: PetState,
  isUserIdle: boolean,
  userIdleTime: number,
): { state: PetState; duration: number } {
  // User idle > 60s → sleep
  if (isUserIdle && userIdleTime > 60 && currentState !== 'sleeping') {
    return { state: 'sleeping', duration: rand(10000, 30000) };
  }

  // User just came back (not idle, was sleeping)
  if (!isUserIdle && currentState === 'sleeping') {
    return { state: 'happy', duration: rand(2000, 4000) };
  }

  // User active → more energetic behavior
  if (!isUserIdle && (currentState === 'idle' || currentState === 'walking')) {
    const r = Math.random();
    if (r < 0.15) return { state: 'happy',   duration: rand(2000, 4000) };
    if (r < 0.25) return { state: 'curious', duration: rand(2000, 4000) };
  }

  // Normal FSM transitions
  const transitions = BEHAVIOR_TRANSITIONS[currentState] ?? BEHAVIOR_TRANSITIONS.idle;
  const roll = Math.random();
  let cumulative = 0;

  for (const t of transitions) {
    cumulative += t.probability;
    if (roll <= cumulative) {
      return { state: t.to, duration: rand(t.minDuration, t.maxDuration) };
    }
  }

  return { state: 'idle', duration: rand(3000, 6000) };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomWalkTarget(
  currentX: number,
  currentY: number,
  screenW: number,
  screenH: number
): { x: number; y: number } {
  const petW = 160;
  const petH = 160;
  const margin = 20;

  const maxX = screenW - petW - margin;
  const maxY = screenH - petH - margin;

  // Don't walk too far in one go
  const stepX = (Math.random() - 0.5) * 400;
  const stepY = (Math.random() - 0.5) * 200;

  return {
    x: Math.max(margin, Math.min(maxX, currentX + stepX)),
    y: Math.max(margin, Math.min(maxY, currentY + stepY)),
  };
}
