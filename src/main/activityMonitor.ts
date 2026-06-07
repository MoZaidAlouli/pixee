import { powerMonitor } from 'electron';
import { ActivityState } from './types';

export class ActivityMonitor {
  private idleThreshold = 60; // seconds
  private state: ActivityState = {
    isIdle: false,
    idleTime: 0,
    lastActivity: Date.now(),
  };
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start() {
    this.intervalId = setInterval(() => {
      try {
        const idleTime = powerMonitor.getSystemIdleTime();
        this.state = {
          isIdle: idleTime >= this.idleThreshold,
          idleTime,
          lastActivity: Date.now() - idleTime * 1000,
        };
      } catch {
        // powerMonitor may not be available in all contexts
        this.state = { isIdle: false, idleTime: 0, lastActivity: Date.now() };
      }
    }, 2000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getActivity(): ActivityState {
    return { ...this.state };
  }
}
