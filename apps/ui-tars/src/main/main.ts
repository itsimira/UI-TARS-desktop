/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { electronApp, optimizer } from '@electron-toolkit/utils';
import {
  app,
  BrowserView,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  session,
  WebContentsView,
  screen,
} from 'electron';
import squirrelStartup from 'electron-squirrel-startup';
import ElectronStore from 'electron-store';

import * as env from '@main/env';
import { logger } from '@main/logger';
import {
  LauncherWindow,
  createMainWindow,
  createLoginWindow,
  initializeAuthFlow,
  logoutUser,
  isUserAuthenticated,
  setupLoginSuccessHandler,
} from '@main/window';
import { registerIpcMain } from '@ui-tars/electron-ipc/main';
import { ipcRoutes } from './ipcRoutes';

import { store } from './store/create';
import { SettingStore } from './store/setting';
import { createTray } from './tray';
import { registerSettingsHandlers } from './services/settings';
import { sanitizeState } from './utils/sanitizeState';
import { windowManager } from './services/windowManager';
import { registerAuthIPC } from '@main/services/auth';
import { registerTaskIPC } from '@main/services/tasks/task.ipc';

const { isProd } = env;

app.commandLine.appendSwitch('force-renderer-accessibility');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

logger.debug('[env]', env);

ElectronStore.initRenderer();

if (isProd) {
  import('source-map-support').then(({ default: sourceMapSupport }) => {
    sourceMapSupport.install();
  });
}

const loadDevDebugTools = async () => {
  import('electron-debug').then(({ default: electronDebug }) => {
    electronDebug({ showDevTools: false });
  });

  import('electron-devtools-installer')
    .then(({ default: installExtensionDefault, REACT_DEVELOPER_TOOLS }) => {
      // @ts-ignore
      const installExtension = installExtensionDefault?.default;
      const extensions = [installExtension(REACT_DEVELOPER_TOOLS)];

      return Promise.all(extensions)
        .then((names) => logger.info('Added Extensions:', names.join(', ')))
        .catch((err) =>
          logger.error('An error occurred adding extension:', err),
        );
    })
    .catch(logger.error);
};

const initializeApp = async () => {
  const isAccessibilityEnabled = app.isAccessibilitySupportEnabled();
  logger.info('isAccessibilityEnabled', isAccessibilityEnabled);
  if (env.isMacOS) {
    app.setAccessibilitySupportEnabled(true);
    const { ensurePermissions } = await import('@main/utils/systemPermissions');

    const ensureScreenCapturePermission = ensurePermissions();
    logger.info('ensureScreenCapturePermission', ensureScreenCapturePermission);
  }

  if (env.isDev) {
    await loadDevDebugTools();
  }

  logger.info('createTray');
  // Tray
  await createTray();

  // Send app launched event
  // await UTIOService.getInstance().appLaunched();

  const launcherWindowIns = LauncherWindow.getInstance();

  globalShortcut.register('Alt+T', () => {
    launcherWindowIns.show();
  });

  const activeWindow = await initializeAuthFlow();

  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
        const primaryDisplay = screen.getPrimaryDisplay();
        const primarySource = sources.find(
          (source) => source.display_id === primaryDisplay.id.toString(),
        );

        callback({ video: primarySource!, audio: 'loopback' });
      });
    },
    { useSystemPicker: false },
  );

  logger.info('mainZustandBridge');

  const windowsToRegister = [
    activeWindow,
    ...(launcherWindowIns.getWindow() ? [launcherWindowIns.getWindow()!] : []),
  ];

  const { unsubscribe } = registerIPCHandlers(windowsToRegister);

  ipcMain.handle('auth:logout', () => {
    logoutUser();
  });

  app.on('window-all-closed', () => {
    logger.info('window-all-closed');
    if (!env.isMacOS) {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    logger.info('before-quit');
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => window.destroy());
  });

  app.on('quit', () => {
    logger.info('app quit');
    unsubscribe();
  });

  app.on('activate', async () => {
    logger.info('app activate');

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // We can simply call our existing window functions which handle
    // the logic of checking if windows exist internally

    // Get all browser windows
    const allWindows = BrowserWindow.getAllWindows();

    // If we have any window, find the appropriate one to focus
    if (allWindows.length > 0) {
      // Try to find a visible window
      const visibleWindow = allWindows.find((win) => win.isVisible());
      if (visibleWindow) {
        visibleWindow.focus();
        return;
      }

      // If no visible window, show the first one
      allWindows[0].show();
      allWindows[0].focus();
      return;
    }

    // If no windows exist, we need to check auth and create appropriate window
    isUserAuthenticated()
      .then((isAuthenticated) => {
        if (isAuthenticated) {
          // User is authenticated, create main window
          createMainWindow();
        } else {
          // User is not authenticated, create login window
          createLoginWindow();
          // Set up login success handler
          setupLoginSuccessHandler();
        }
      })
      .catch((error) => {
        logger.error('Error checking authentication on activate:', error);
        // Fall back to login window on error
        createLoginWindow();
      });
  });

  logger.info('initializeApp end');

  // Check and update remote presets
  const settings = SettingStore.getStore();
  if (
    settings.presetSource?.type === 'remote' &&
    settings.presetSource.autoUpdate
  ) {
    try {
      await SettingStore.importPresetFromUrl(settings.presetSource.url!, true);
    } catch (error) {
      logger.error('Failed to update preset:', error);
    }
  }
};

/**
 * Register IPC handlers
 */
const registerIPCHandlers = (
  wrappers: (BrowserWindow | WebContentsView | BrowserView)[],
) => {
  ipcMain.handle('getState', () => {
    const state = store.getState();
    return sanitizeState(state);
  });

  wrappers.forEach((wrapper) => {
    if (wrapper instanceof BrowserWindow) {
      windowManager.registerWindow(wrapper);
    }
  });

  // only send state to the wrappers that are not destroyed
  ipcMain.on('subscribe', (state: unknown) => {
    const sanitizedState = sanitizeState(state as Record<string, unknown>);
    windowManager.broadcast('subscribe', sanitizedState);
  });

  const unsubscribe = store.subscribe((state: unknown) =>
    ipcMain.emit('subscribe', state),
  );

  registerAuthIPC();
  registerTaskIPC();
  registerSettingsHandlers();
  // register ipc services routes
  registerIpcMain(ipcRoutes);

  return { unsubscribe };
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    electronApp.setAppUserModelId('com.awesomic.pretendic');

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    await initializeApp();

    logger.info('app.whenReady end');
  })

  .catch((error) => {
    console.log(error);
  });
