import { BrowserWindow, ipcMain } from 'electron';

import { logger } from '@main/logger';
import * as env from '@main/env';

import { createWindow } from './createWindow';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;

export async function isUserAuthenticated(): Promise<boolean> {
  return false;
}

/**
 * Handle authentication flow on app start
 */
export async function initializeAuthFlow(): Promise<BrowserWindow> {
  // Check if user is authenticated
  const isAuthenticated = false;

  if (isAuthenticated) {
    logger.info('User authenticated, creating main window');
    return createMainWindow();
  } else {
    logger.info('User not authenticated, creating login window');
    const login = createLoginWindow();

    // Listen for successful login
    setupLoginSuccessHandler();

    return login;
  }
}

/**
 * Set up handler for login success event
 */
export function setupLoginSuccessHandler() {
  // Remove existing handlers if any
  ipcMain.removeAllListeners('login:success');

  // Setup new handler
  ipcMain.once('login:success', (_, userData) => {
    logger.info('Login successful, creating main window');

    // Close login window
    if (loginWindow && !loginWindow.isDestroyed()) {
      loginWindow.close();
    }

    // Create main window if it doesn't exist
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    // Send user data to the main window if needed
    if (mainWindow) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.send('user:data', userData);
      });
    }
  });
}

export function showInactive() {
  if (mainWindow) {
    // eslint-disable-next-line no-unused-expressions
    mainWindow.showInactive();
  }
}

export function show() {
  if (mainWindow) {
    mainWindow.show();
  }
}

export function createLoginWindow() {
  // If login window already exists, just show it
  if (loginWindow && !loginWindow.isDestroyed()) {
    loginWindow.show();
    loginWindow.focus();
    return loginWindow;
  }

  loginWindow = createWindow({
    routerPath: '#login',
    width: 1200,
    height: 700,
    resizable: false,
    movable: true,
    alwaysOnTop: false,
    backgroundColor: '#ffffff',
  });

  loginWindow.on('close', (event) => {
    logger.info('loginWindow closed');
    if (env.isMacOS) {
      event.preventDefault();
      loginWindow?.hide();
    } else {
      loginWindow = null;
    }
  });

  return loginWindow;
}

export function createMainWindow() {
  // If main window already exists, just show it
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = createWindow({
    routerPath: '/',
    width: 1200,
    height: 700,
    alwaysOnTop: false,
  });

  mainWindow.on('close', (event) => {
    logger.info('mainWindow closed');
    if (env.isMacOS) {
      event.preventDefault();
      mainWindow?.hide();
    } else {
      mainWindow = null;
    }
  });

  return mainWindow;
}

export function createSettingsWindow(
  config: { childPath?: string; showInBackground?: boolean } = {
    childPath: '',
    showInBackground: false,
  },
) {
  const { childPath = '', showInBackground = false } = config;
  if (settingsWindow) {
    settingsWindow.show();
    return settingsWindow;
  }

  const mainWindowBounds = mainWindow?.getBounds();
  console.log('mainWindowBounds', mainWindowBounds);

  const width = 600;
  const height = 600;

  let x, y;
  if (mainWindowBounds) {
    x = Math.round(mainWindowBounds.x + (mainWindowBounds.width - width) / 2);
    y = Math.round(mainWindowBounds.y + (mainWindowBounds.height - height) / 2);
  }

  settingsWindow = createWindow({
    routerPath: `#settings/${childPath}`,
    ...(x && y ? { x, y } : {}),
    width,
    height,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    showInBackground,
  });

  settingsWindow.on('close', (event) => {
    if (env.isMacOS) {
      event.preventDefault();
      settingsWindow?.hide();
    } else {
      settingsWindow = null;
    }

    // if mainWindow is not visible, show it
    if (mainWindow?.isMinimized()) {
      mainWindow?.restore();
    }
    mainWindow?.setAlwaysOnTop(true);
    mainWindow?.show();
    mainWindow?.focus();
    setTimeout(() => {
      mainWindow?.setAlwaysOnTop(false);
    }, 100);
  });

  return settingsWindow;
}

export async function closeSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.close();
  }
}

export function setContentProtection(enable: boolean) {
  mainWindow?.setContentProtection(enable);
}

export async function showWindow() {
  mainWindow?.setContentProtection(false);
  mainWindow?.setIgnoreMouseEvents(false);
  mainWindow?.show();
  mainWindow?.restore();
}

export async function hideWindowBlock<T>(
  operation: () => Promise<T> | T,
): Promise<T> {
  let originalBounds: Electron.Rectangle | undefined;

  try {
    mainWindow?.setContentProtection(true);
    mainWindow?.setAlwaysOnTop(true);
    mainWindow?.setFocusable(false);
    try {
      mainWindow?.hide();
    } catch (e) {
      logger.error(e);
    }

    const result = await Promise.resolve(operation());
    return result;
  } finally {
    mainWindow?.setContentProtection(false);
    setTimeout(() => {
      mainWindow?.setAlwaysOnTop(false);
    }, 100);
    // restore mainWindow
    if (mainWindow && originalBounds) {
      mainWindow?.setBounds(originalBounds);
    }
    mainWindow?.setFocusable(true);
    mainWindow?.show();
  }
}

export function logoutUser() {
  // Clear auth data from store - implement according to your auth strategy
  try {
    // Example: update your auth store
    // store.setState({ auth: { token: null, user: null } });

    // Close main window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }

    // Show login window
    createLoginWindow();

    // Set up login success handler
    setupLoginSuccessHandler();

    logger.info('User logged out, showing login window');
  } catch (error) {
    logger.error('Error during logout:', error);
  }
}

export { LauncherWindow } from './LauncherWindow';
