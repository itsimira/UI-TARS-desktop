/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ApiHandler, ElectronHandler } from '@/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    platform: NodeJS.Platform;
    // @ts-ignore
    zustandBridge: any;
    api: ApiHandler;
  }
}

export {};
