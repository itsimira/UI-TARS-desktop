/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { cn } from '@renderer/utils';

import Prompts from '../Prompts';
import { api } from '@renderer/api';

import ChatInput from '@renderer/components/ChatInput';

import { ClearHistory } from '@/renderer/src/components/RunMessages/ClearHistory';
import { useStore } from '@renderer/hooks/useStore';
import { useSession } from '@renderer/hooks/useSession';

import {
  ErrorMessage,
  HumanTextMessage,
  LoadingText,
  AssistantTextMessage,
} from './Messages';
import { WelcomePage } from './Welcome';
import { useTask } from '@renderer/hooks/useTask';

const RunMessages = () => {
  const { messages = [], thinking, errorMsg } = useStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const suggestions: string[] = [];
  const { currentSessionId, chatMessages, updateMessages } = useSession();
  const { currentTask, responses, loading } = useTask();

  const isWelcome = currentTask === null;

  useEffect(() => {
    if (currentTask && messages.length) {
      const existingMessagesSet = new Set(
        chatMessages.map(
          (msg) => `${msg.value}-${msg.from}-${msg.timing?.start}`,
        ),
      );
      const newMessages = messages.filter(
        (msg) =>
          !existingMessagesSet.has(
            `${msg.value}-${msg.from}-${msg.timing?.start}`,
          ),
      );
      const allMessages = [...chatMessages, ...newMessages];

      updateMessages(currentSessionId, allMessages);
    }
  }, [currentSessionId, chatMessages.length, messages.length]);

  useEffect(() => {
    setTimeout(() => {
      containerRef.current?.scrollIntoView(false);
    }, 100);
  }, [messages, thinking, errorMsg]);

  const handleSelect = async (suggestion: string) => {
    await api.setInstructions({ instructions: suggestion });
  };

  const renderChatList = () => {
    return (
      <div className="flex-1 w-full px-4 py-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <div ref={containerRef}>
          {!responses?.length && suggestions?.length > 0 && (
            <Prompts suggestions={suggestions} onSelect={handleSelect} />
          )}

          <HumanTextMessage
            key={`message-human`}
            text={currentTask?.prompt ?? ''}
          />

          {loading ? (
            <LoadingText text={'Loading...'} />
          ) : (
            responses?.map((message, idx) => {
              return (
                <AssistantTextMessage
                  key={`message-${idx}`}
                  text={message?.response}
                />
              );
            })
          )}

          {thinking && <LoadingText text={'Thinking...'} />}
          {errorMsg && <ErrorMessage text={errorMsg} />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex h-full justify-center">
      {/* Left Panel */}
      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out w-3/4',
        )}
      >
        <div className="flex w-full items-center mb-1">
          <div className="ml-2 mr-auto" />
          <ClearHistory />
        </div>
        {isWelcome ? <WelcomePage /> : renderChatList()}
        <ChatInput />
      </div>
    </div>
  );
};

export default RunMessages;
