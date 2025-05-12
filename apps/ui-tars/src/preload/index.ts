/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
// import { preloadZustandBridge } from 'zutron/preload';

import type { AppState, LocalStore } from '@main/store/types';
import { LoginData, SignUpData } from '@main/services/api/dto';
import { Task } from '@ui-tars/shared/types';

export type Channels = 'auth:changed';

const electronHandler = {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  setting: {
    getSetting: () => ipcRenderer.invoke('setting:get'),
    clearSetting: () => ipcRenderer.invoke('setting:clear'),
    updateSetting: (setting: Partial<LocalStore>) =>
      ipcRenderer.invoke('setting:update', setting),
    importPresetFromText: (yamlContent: string) =>
      ipcRenderer.invoke('setting:importPresetFromText', yamlContent),
    importPresetFromUrl: (url: string, autoUpdate: boolean) =>
      ipcRenderer.invoke('setting:importPresetFromUrl', url, autoUpdate),
    updatePresetFromRemote: () =>
      ipcRenderer.invoke('setting:updatePresetFromRemote'),
    resetPreset: () => ipcRenderer.invoke('setting:resetPreset'),
    onUpdate: (callback: (setting: LocalStore) => void) => {
      ipcRenderer.on('setting-updated', (_, state) => callback(state));
    },
  },
};

const apiHandler = {
  auth: {
    login: (loginData: LoginData) => ipcRenderer.invoke('login', loginData),
    signup: (signupData: SignUpData) =>
      ipcRenderer.invoke('signup', signupData),
    logout: () => ipcRenderer.invoke('logout'),
    validate: () => ipcRenderer.invoke('validate'),
    storeToken: (token: string) => ipcRenderer.invoke('store-token', token),
    loadToken: () => ipcRenderer.invoke('load-token'),
    clearToken: () => ipcRenderer.invoke('clear-token'),
  },
  task: {
    list: () => ipcRenderer.invoke('task:list'),
    add: (prompt: string) => ipcRenderer.invoke('task:add', prompt),
    remove: (taskId: number) => ipcRenderer.invoke('task:remove', taskId),
    update: (task: Task) => ipcRenderer.invoke('task:update', task),
    getResponses: (taskId: number) =>
      ipcRenderer.invoke('task:responses', taskId),
  },
};

// Initialize zustand bridge
const zustandBridge = {
  getState: () => ipcRenderer.invoke('getState'),
  subscribe: (callback) => {
    const subscription = (_: unknown, state: AppState) => callback(state);
    ipcRenderer.on('subscribe', subscription);

    return () => ipcRenderer.off('subscribe', subscription);
  },
};

// Expose both electron and zutron handlers
contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('api', apiHandler);
contextBridge.exposeInMainWorld('zustandBridge', zustandBridge);
contextBridge.exposeInMainWorld('platform', process.platform);

export type ElectronHandler = typeof electronHandler;

export type ApiHandler = typeof apiHandler;
