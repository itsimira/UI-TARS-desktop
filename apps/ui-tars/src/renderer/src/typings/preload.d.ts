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
