/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { VlmModeEnum } from '../constants';
import { Message, PredictionParsed, GUIAgentError, StatusEnum } from './index';
import { ShareVersion } from './share';

export interface Conversation extends Message {
  timing?: {
    start: number;
    end: number;
    cost: number;
  };
  /** exists when <image> exists */
  screenshotBase64?: string;
  screenshotContext?: {
    size: {
      /** physical device width */
      width: number;
      /** physical device height */
      height: number;
    };
    mime?: string;
    /** screenshot scale factor(DPR) */
    scaleFactor?: number;
  };
  predictionParsed?: PredictionParsed[];
}

/**
 * @deprecated use {@link GUIAgentData} instead
 * Computer Use data structure, can be used for recording and sharing
 */
export interface ComputerUseUserData extends GUIAgentData {}

export interface GUIAgentData {
  /** Share operation instructions */
  instruction: string;
  mode?: VlmModeEnum;
  logTime: number;
  status: StatusEnum;
  errMsg?: string;
  error?: GUIAgentError;
  conversations: Conversation[];
}

export interface PyExecutableOutput {
  type: string;
  task_index: number | null;
  total_tasks: number | null;
  message: string | null;
  agent_id: string;
  last_token_count: number;
  token_used: number | null;
  store_variables: {
    store: Record<string, string>;
  } | null;
}
