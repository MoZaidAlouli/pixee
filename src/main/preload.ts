import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pixelpal', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('save-settings', settings),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  getActivity: () => ipcRenderer.invoke('get-activity'),
  moveWindow: (x: number, y: number) => ipcRenderer.invoke('move-window', x, y),
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.invoke('set-ignore-mouse', ignore),
  onSettingsUpdated: (callback: (settings: Record<string, unknown>) => void) => {
    ipcRenderer.on('settings-updated', (_event, settings) => callback(settings));
    return () => ipcRenderer.removeAllListeners('settings-updated');
  },
});
