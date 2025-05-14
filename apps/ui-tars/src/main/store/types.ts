import { GUIAgentData, Message } from '@ui-tars/shared/types';

import { LocalStore, PresetSource } from './validate';

export type AppState = {
  theme: 'dark' | 'light';
  ensurePermissions: { screenCapture?: boolean; accessibility?: boolean };
  instructions: string | null;
  restUserData: Omit<GUIAgentData, 'status' | 'conversations' | 'store'> | null;
  status: GUIAgentData['status'];
  errorMsg: string | null;
  messages: Message[];
  abortController: AbortController | null;
  thinking: boolean;
  browserAvailable: boolean;
  store: Record<string, string | object>;
};

export enum VLMProviderV2 {
  ui_tars_1_0 = 'Hugging Face for UI-TARS-1.0',
  ui_tars_1_5 = 'Hugging Face for UI-TARS-1.5',
  doubao_1_5 = 'VolcEngine Ark for Doubao-1.5-UI-TARS',
}

export enum SearchEngineForSettings {
  GOOGLE = 'google',
  BAIDU = 'baidu',
  BING = 'bing',
}

export type { PresetSource, LocalStore };
