/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  ErrorStatusEnum,
  GUIAgentData,
  GUIAgentError,
  PyExecutableOutput,
  StatusEnum,
} from '@ui-tars/shared/types';
import { setContext } from './context/useContext';
import { GUIAgentConfig, Operator } from './types';
import { BaseGUIAgent } from './base';
import { InternalServerError } from 'openai';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { join } from 'path';

export class GUIAgent<T extends Operator> extends BaseGUIAgent<
  GUIAgentConfig<T>
> {
  private readonly executablePath: string;
  private readonly operator: T;
  private readonly logger: NonNullable<GUIAgentConfig<T>['logger']>;
  private execProcess: any;

  private isPaused = false;
  private resumePromise: Promise<void> | null = null;
  private resolveResume: (() => void) | null = null;
  private isStopped = false;

  constructor(config: GUIAgentConfig<T>) {
    super(config);
    this.executablePath = config.executablePath;
    this.operator = config.operator;
    this.logger = config.logger || console;
  }

  async run(instruction: string) {
    const { logger } = this;
    const { signal, onData, onError } = this.config;

    const currentTime = Date.now();

    const data: GUIAgentData = {
      instruction,
      status: StatusEnum.INIT,
      logTime: currentTime,
      conversations: [
        {
          from: 'human',
          value: instruction,
          timing: {
            start: currentTime,
            end: currentTime,
            cost: 0,
          },
        },
      ],
    };

    // inject guiAgent config for operator to get
    setContext(
      Object.assign(this.config, {
        logger: this.logger,
      }),
    );

    // start running agent
    data.status = StatusEnum.RUNNING;
    onData?.({ data: { ...data, conversations: [] } });

    const execDir = join(this.executablePath, '..');
    const env = { ...process.env };

    const processOptions = {
      cwd: execDir,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    };

    const args = [
      '--prompt',
      instruction,
      '--task-id',
      '1000',
      '--token-count',
      '1000000000',
    ];

    // @ts-ignore
    this.execProcess = spawn(this.executablePath, args, processOptions);

    const rl = createInterface({
      input: this.execProcess.stdout,
      terminal: false,
    });

    rl.on('line', (line) => {
      this.logger.info('[PyExecutable] Output:', line);
      const dataPrefix = 'data: ';

      if (!line.startsWith(dataPrefix)) {
        return;
      }

      data.status = StatusEnum.RUNNING;
      onData?.({ data: { ...data, conversations: [] } });

      const jsonStr = line.substring(dataPrefix.length);

      try {
        const output = JSON.parse(jsonStr);
        this.handleExecutableOutput(data, output);
      } catch (err) {
        this.logger.error('[PyExecutable] Failed to parse JSON:', err);
      }
    });

    this.execProcess.stderr.on('data', (data: any) => {
      this.logger.error('[PyExecutable] Error:', data.toString());

      /*if (onError) {
        onError({
          data: {
            status: StatusEnum.ERROR,
            instruction,
            logTime: currentTime,
            conversations: [],
          },
          error: {
            status: ErrorStatusEnum.EXECUTE_RETRY_ERROR,
            message: data.toString(),
            name: 'PyExecutableError',
          },
        });
      }*/
    });

    return new Promise((resolve, reject) => {
      this.execProcess.on('close', (code: number) => {
        this.logger.info(`[PyExecutable] Process exited with code ${code}`);

        // If process was stopped by a signal or error, don't update status
        if (!this.isStopped && code !== 0) {
          onData?.({
            data: {
              instruction,
              status: StatusEnum.ERROR,
              logTime: currentTime,
              conversations: [],
            },
          });
        }

        resolve(true);
      });

      this.execProcess.on('error', (err: string) => {
        this.logger.error('[PyExecutable] Failed to start process:', err);

        if (onError) {
          onError({
            data: {
              status: StatusEnum.ERROR,
              instruction,
              logTime: currentTime,
              conversations: [],
            },
            error: {
              status: ErrorStatusEnum.EXECUTE_RETRY_ERROR,
              message: err.toString(),
              name: 'PyExecutableError',
            },
          });
        }

        reject(err);
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          this.stop();
          onData?.({
            data: {
              status: StatusEnum.USER_STOPPED,
              instruction,
              logTime: currentTime,
              conversations: [],
            },
          });
        });
      }
    });
  }

  private handleExecutableOutput(
    data: GUIAgentData,
    output: PyExecutableOutput,
  ) {
    const { onData } = this.config;

    const currentTime = Date.now();

    if (!output.type) {
      return;
    }

    switch (output.type) {
      case 'finished':
        // Handle task finished
        if (onData && output.message) {
          onData({
            data: {
              status: StatusEnum.END,
              instruction: output.message,
              conversations: [
                {
                  from: 'gpt',
                  value: output.message,
                  timing: {
                    start: currentTime,
                    end: Date.now(),
                    cost: Date.now() - currentTime,
                  },
                },
              ],
              logTime: currentTime,
            },
          });
        }
        break;

      case 'subtask_done':
        // Handle subtask completion
        if (onData && output.message) {
          onData({
            data: {
              status: StatusEnum.RUNNING,
              instruction: output.message,
              logTime: currentTime,
              conversations: [
                {
                  from: 'gpt',
                  value: output.message,
                  timing: {
                    start: currentTime,
                    end: Date.now(),
                    cost: Date.now() - currentTime,
                  },
                },
              ],
            },
          });
        }
        break;

      case 'done':
        // Handle overall completion
        if (onData) {
          onData({
            data: {
              status: StatusEnum.END,
              instruction: 'Task completed successfully',
              logTime: currentTime,
              conversations: [
                {
                  from: 'gpt',
                  value: 'Task completed successfully',
                  timing: {
                    start: currentTime,
                    end: Date.now(),
                    cost: Date.now() - currentTime,
                  },
                },
              ],
            },
          });
        }
        break;

      default:
        this.logger.info(`[PyExecutable] Handling output type: ${output.type}`);
        // Pass through any other data types to onData
        if (onData) {
          onData({
            data: {
              status: StatusEnum.RUNNING,
              logTime: currentTime,
              instruction: output.message || 'Processing',
              conversations: [
                {
                  from: 'gpt',
                  value: output.message || 'Processing',
                  timing: {
                    start: currentTime,
                    end: Date.now(),
                    cost: Date.now() - currentTime,
                  },
                },
              ],
            },
          });
        }
    }
  }

  public pause() {
    this.isPaused = true;
    this.resumePromise = new Promise((resolve) => {
      this.resolveResume = resolve;
    });
  }

  public resume() {
    if (this.resolveResume) {
      this.resolveResume();
      this.resumePromise = null;
      this.resolveResume = null;
    }
    this.isPaused = false;
  }

  public stop() {
    this.isStopped = true;
  }

  private guiAgentErrorParser(
    type: ErrorStatusEnum,
    error?: Error,
  ): GUIAgentError {
    this.logger.error('[GUIAgent] guiAgentErrorParser:', error);

    let parseError = null;

    if (error instanceof InternalServerError) {
      this.logger.error(
        '[GUIAgent] guiAgentErrorParser instanceof InternalServerError.',
      );
      parseError = new GUIAgentError(
        ErrorStatusEnum.MODEL_SERVICE_ERROR,
        error.message,
        error.stack,
      );
    }

    if (!parseError && type === ErrorStatusEnum.REACH_MAXLOOP_ERROR) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.REACH_MAXLOOP_ERROR,
        `Has reached max loop count: ${error?.message || ''}`,
        error?.stack,
      );
    }

    if (!parseError && type === ErrorStatusEnum.SCREENSHOT_RETRY_ERROR) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.SCREENSHOT_RETRY_ERROR,
        `Too many screenshot failures: ${error?.message || ''}`,
        error?.stack,
      );
    }

    if (!parseError && type === ErrorStatusEnum.INVOKE_RETRY_ERROR) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.INVOKE_RETRY_ERROR,
        `Too many model invoke failures: ${error?.message || ''}`,
        error?.stack,
      );
    }

    if (!parseError && type === ErrorStatusEnum.EXECUTE_RETRY_ERROR) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.EXECUTE_RETRY_ERROR,
        `Too many action execute failures: ${error?.message || ''}`,
        error?.stack,
      );
    }

    if (!parseError && type === ErrorStatusEnum.ENVIRONMENT_ERROR) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.ENVIRONMENT_ERROR,
        `The environment error occurred when parsing the action: ${error?.message || ''}`,
        error?.stack,
      );
    }

    if (!parseError) {
      parseError = new GUIAgentError(
        ErrorStatusEnum.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred',
        error instanceof Error ? error.stack || 'null' : 'null',
      );
    }

    if (!parseError.stack) {
      // Avoid guiAgentErrorParser it self in stack trace
      Error.captureStackTrace(parseError, this.guiAgentErrorParser);
    }

    return parseError;
  }
}
