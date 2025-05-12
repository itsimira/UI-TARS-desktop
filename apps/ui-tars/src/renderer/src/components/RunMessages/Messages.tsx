/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { AlertCircle, Loader2 } from 'lucide-react';
import { GUIAgentError, ErrorStatusEnum } from '@ui-tars/shared/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSetting } from '../../hooks/useSetting';

export const HumanTextMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex gap-2 mb-4 mt-8 items-center">
      <div className="ml-auto p-3 rounded-md bg-secondary">{text}</div>
    </div>
  );
};

export const AssistantTextMessage = ({ text }: { text: string }) => {
  const formattedText = useCallback(() => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\n/g, '<br/>')
      .replace(/\r?\n/g, '<br/>');
  }, [text]);

  return (
    <div className="flex w-full gap-2 mb-4 mt-8 items-center">
      <div
        className="p-3 rounded-md bg-primary text-accent"
        dangerouslySetInnerHTML={{
          __html: formattedText(),
        }}
      />
    </div>
  );
};

export const ErrorMessage = ({ text }: { text: string }) => {
  const { settings } = useSetting();
  const language = settings.language ?? 'en';
  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const [isStackOverflow, setIsStackOverflow] = useState(false);
  let parsedError: GUIAgentError | null = null;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && 'status' in parsed) {
      parsedError = parsed as GUIAgentError;
    }
  } catch {
    // ignore
  }

  useEffect(() => {
    if (stackRef.current) {
      const element = stackRef.current;
      // Check if the element's content overflows its container
      setIsStackOverflow(element.scrollHeight > element.clientHeight);
    }
  }, [parsedError?.stack]);

  return (
    <div className="flex flex-col gap-2 my-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <span className="font-medium text-red-500">
          {parsedError
            ? ErrorStatusEnum[parsedError.status] || 'UNKNOWN_ERROR'
            : 'Error'}
        </span>
      </div>
      {parsedError ? (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-red-500/90 font-medium">
            {parsedError.message}
          </div>
          {parsedError.stack && (
            <div className="flex flex-col gap-1">
              {isStackOverflow && (
                <button
                  onClick={() => setIsStackExpanded(!isStackExpanded)}
                  className="text-xs text-red-500/70 hover:text-red-500/90 cursor-pointer text-right underline underline-offset-2"
                >
                  {isStackExpanded
                    ? language === 'en'
                      ? 'Collapse'
                      : '收起'
                    : language === 'en'
                      ? 'Expand'
                      : '展开'}
                </button>
              )}
              <div
                ref={stackRef}
                className={`text-xs text-red-500/70 font-mono mt-2 transition-all duration-200 ${
                  isStackExpanded ? 'max-h-[500px]' : 'max-h-[3em]'
                } overflow-hidden`}
              >
                {parsedError.stack}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-red-500/90 break-all">{text}</div>
      )}
    </div>
  );
};

export const LoadingText = ({ text }: { text: string }) => {
  return (
    <div className="mt-4">
      <div className="inline-flex items-center gap-2 text-muted-foreground animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        {text}
      </div>
    </div>
  );
};
