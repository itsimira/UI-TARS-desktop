import assert from 'assert';

import { logger } from '@main/logger';
import { hideWindowBlock } from '@main/window';
import { StatusEnum } from '@ui-tars/shared/types';
import { GUIAgent, type GUIAgentConfig } from '@ui-tars/sdk';
import { UTIOService } from '@main/services/utio';
import { NutJSElectronOperator } from '../agent/operator';
import {
  closeScreenMarker,
  hideWidgetWindow,
  hideScreenWaterFlow,
  showWidgetWindow,
  showScreenWaterFlow,
} from '@main/window/ScreenMarker';
import { SettingStore } from '@main/store/setting';
import { AppState } from '@main/store/types';
import { GUIAgentManager } from '../ipcRoutes/agent';
import { join } from 'path';
import { app } from 'electron';

export const runAgent = async (
  setState: (state: AppState) => void,
  getState: () => AppState,
) => {
  logger.info('runAgent');
  const settings = SettingStore.getStore();
  const { instructions, abortController } = getState();
  assert(instructions, 'instructions is required');

  showWidgetWindow();
  showScreenWaterFlow();

  const handleData: GUIAgentConfig<NutJSElectronOperator>['onData'] = async ({
    data,
  }) => {
    const { status, conversations, ...restUserData } = data;
    logger.info('[onGUIAgentData] status', status, conversations.length);

    logger.info(conversations);

    setState({
      ...getState(),
      status,
      restUserData,
      messages: [...(getState().messages || []), ...conversations],
    });
  };

  const operator = new NutJSElectronOperator();
  const executablePath = getElectronResourcePath('main');

  const guiAgent = new GUIAgent({
    executablePath: executablePath,
    signal: abortController?.signal,
    operator: operator,
    onData: handleData,
    onError: (params) => {
      const { error } = params;
      setState({
        ...getState(),
        status: StatusEnum.ERROR,
        errorMsg: JSON.stringify({
          status: error?.status,
          message: error?.message,
          stack: error?.stack,
        }),
      });
    },
  });

  GUIAgentManager.getInstance().setAgent(guiAgent);

  await hideWindowBlock(async () => {
    await UTIOService.getInstance().sendInstruction(instructions);

    await guiAgent
      .run(instructions)
      .catch((e) => {
        logger.error('[runAgentLoop error]', e);
        setState({
          ...getState(),
          status: StatusEnum.ERROR,
          errorMsg: e.message,
        });
      })
      .finally(() => {
        hideWidgetWindow();
        if (settings.operator === 'nutjs') {
          closeScreenMarker();
          hideScreenWaterFlow();
        }
      });
  }).catch((e) => {
    logger.error('[runAgent error hideWindowBlock]', settings, e);
  });
};

const getElectronResourcePath = (executableName: string): string => {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', executableName);
  }
  return join(process.cwd(), 'resources', 'bin', executableName);
};
