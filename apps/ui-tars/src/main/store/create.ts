import { createStore } from 'zustand/vanilla';

import { StatusEnum } from '@ui-tars/shared/types';

import type { AppState } from './types';

export const store = createStore<AppState>(
  () =>
    ({
      theme: 'light',
      restUserData: null,
      instructions: '',
      status: StatusEnum.INIT,
      messages: [],
      errorMsg: null,
      ensurePermissions: {},
      abortController: null,
      thinking: false,
      browserAvailable: false, // Defaults to false until the detection is complete
      store: {},
    }) satisfies AppState,
);
