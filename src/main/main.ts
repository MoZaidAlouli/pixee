import { app, BrowserWindow, ipcMain, screen, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { ActivityMonitor } from './activityMonitor';
import { PetStore, PetSettings } from './types';

const isDev = process.env.NODE_ENV === 'development';

// Persistent store
const store = new Store<PetStore>({
  defaults: {
    petType: 'cat',
    petName: 'Pixel',
    colorPalette: 'classic',
    accessory: 'none',
    position: { x: 100, y: 100 },
    mood: 'happy',
    windowBounds: { x: 100, y: 100, width: 160, height: 160 },
  },
});

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let activityMonitor: ActivityMonitor | null = null;

function createPetWindow() {
  const savedBounds = store.get('windowBounds');

  petWindow = new BrowserWindow({
    x: savedBounds.x,
    y: savedBounds.y,
    width: 160,
    height: 160,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Make window click-through except for the pet sprite area
  petWindow.setIgnoreMouseEvents(false);

  if (isDev) {
    petWindow.loadURL('http://localhost:5173/index.html');
  } else {
    petWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Save position when moved
  petWindow.on('moved', () => {
    if (petWindow) {
      const bounds = petWindow.getBounds();
      store.set('windowBounds', bounds);
      store.set('position', { x: bounds.x, y: bounds.y });
    }
  });

  petWindow.on('closed', () => {
    petWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 600,
    x: Math.floor((width - 520) / 2),
    y: Math.floor((height - 600) / 2),
    title: 'PixelPal Settings',
    resizable: false,
    minimizable: false,
    maximizable: false,
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173/settings.html');
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  // Create a simple 16x16 tray icon programmatically
  const trayIcon = nativeImage.createEmpty();
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'PixelPal 🐾', enabled: false },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => createSettingsWindow(),
    },
    {
      label: 'Show Pet',
      click: () => {
        if (petWindow) {
          petWindow.show();
        } else {
          createPetWindow();
        }
      },
    },
    {
      label: 'Hide Pet',
      click: () => petWindow?.hide(),
    },
    { type: 'separator' },
    {
      label: 'Quit PixelPal',
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip('PixelPal');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (petWindow) {
      petWindow.isVisible() ? petWindow.hide() : petWindow.show();
    }
  });
}

// IPC Handlers
ipcMain.handle('get-settings', () => {
  return {
    petType: store.get('petType'),
    petName: store.get('petName'),
    colorPalette: store.get('colorPalette'),
    accessory: store.get('accessory'),
    position: store.get('position'),
    mood: store.get('mood'),
  };
});

ipcMain.handle('save-settings', (_event, settings: Partial<PetSettings>) => {
  Object.entries(settings).forEach(([key, value]) => {
    store.set(key as keyof PetStore, value);
  });
  // Broadcast to pet window
  petWindow?.webContents.send('settings-updated', settings);
  return { success: true };
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
});

ipcMain.handle('get-activity', () => {
  return activityMonitor?.getActivity() ?? { isIdle: false, idleTime: 0 };
});

ipcMain.handle('move-window', (_event, x: number, y: number) => {
  if (petWindow) {
    petWindow.setPosition(Math.round(x), Math.round(y));
    store.set('windowBounds', petWindow.getBounds());
  }
});

ipcMain.handle('get-screen-bounds', () => {
  const display = screen.getPrimaryDisplay();
  return display.workAreaSize;
});

ipcMain.handle('set-ignore-mouse', (_event, ignore: boolean) => {
  petWindow?.setIgnoreMouseEvents(ignore, { forward: true });
});

// App lifecycle
app.whenReady().then(() => {
  createPetWindow();
  createTray();

  activityMonitor = new ActivityMonitor();
  activityMonitor.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit — tray app
  }
});

app.on('before-quit', () => {
  activityMonitor?.stop();
  if (petWindow) {
    const bounds = petWindow.getBounds();
    store.set('windowBounds', bounds);
  }
});

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (petWindow) {
      petWindow.show();
      petWindow.focus();
    }
  });
}
