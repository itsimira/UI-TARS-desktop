import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@renderer/utils';

import Prompts from '../Prompts';
import { api } from '@renderer/api';

import ChatInput from '@renderer/components/ChatInput';

import { DeleteTaskButton } from '@renderer/components/RunMessages/DeleteTaskButton';
import { useStore } from '@renderer/hooks/useStore';
import { Message, StatusEnum } from '@ui-tars/shared/types';

import {
  ErrorMessage,
  HumanTextMessage,
  LoadingText,
  AssistantTextMessage,
} from './Messages';
import { WelcomePage } from './Welcome';
import { useTask } from '@renderer/hooks/useTask';
import { AgentStore } from '@renderer/components/AgentStore';
import { ExportTaskDataButton } from '@renderer/components/RunMessages/ExportTaskDataButton';

const suggestions: string[] = [];

const RunMessages = () => {
  const { messages = [], thinking, errorMsg, status, store } = useStore();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { currentTask, responses, loading, updateTask } = useTask();
  const isWelcome = currentTask === null;

  const hasStore = useCallback(() => {
    return (
      currentTask?.status === 'done' &&
      Object.entries(currentTask?.taskStore ?? {}).length
    );
  }, [currentTask?.status, currentTask?.taskStore]);

  useEffect(() => {
    if (currentTask) {
      console.log('update responses');

      setLocalMessages(
        currentTask.status === 'done'
          ? responses.map((message) => ({
              value: message.response,
              from: 'gpt',
            }))
          : [],
      );
    }
    return () => {
      setLocalMessages([]);
    };
  }, [currentTask?.id, responses.length, setLocalMessages]);

  useEffect(() => {
    if (currentTask && messages.length) {
      const existingMessagesSet = new Set(
        localMessages.map((msg) => `${msg.value}-${msg.from}`),
      );

      const newMessages = messages.filter(
        (msg) => !existingMessagesSet.has(`${msg.value}-${msg.from}`),
      );

      setLocalMessages((prevMessages) => [...prevMessages, ...newMessages]);
    }
  }, [currentTask, messages.length, setLocalMessages]);

  useEffect(() => {
    if (currentTask && status === StatusEnum.END) {
      const task = { ...currentTask, status: 'done', taskStore: store };
      updateTask(task);
      window.api.task.update(task, localMessages, store ?? {});
    }
  }, [status]);

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
            localMessages?.map((message, idx) => {
              return (
                <AssistantTextMessage
                  key={`message-${idx}`}
                  text={message?.value}
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
    <div
      className={cn(
        'flex-1 min-h-0 flex h-full',
        hasStore() ? 'justify-start' : 'justify-center',
      )}
    >
      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          hasStore() ? 'w-2/3' : 'w-3/4',
        )}
      >
        {currentTask && (
          <div className="flex w-full items-center justify-between py-2 px-4 mb-1">
            <div className="ml-2 mr-auto">
              <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
            </div>
            <div className="flex gap-2">
              <ExportTaskDataButton />
              <DeleteTaskButton />
            </div>
          </div>
        )}
        {isWelcome ? <WelcomePage /> : renderChatList()}
        {currentTask?.status !== 'done' ? <ChatInput /> : ''}
      </div>

      {hasStore() ? (
        <AgentStore taskStore={currentTask?.taskStore ?? {}} />
      ) : (
        ''
      )}
    </div>
  );
};

export default RunMessages;
