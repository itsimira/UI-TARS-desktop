import { useStore } from '@renderer/hooks/useStore';
import { Square } from 'lucide-react';

import logo from '@resources/logo-full.png?url';
import { Button } from '@renderer/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@renderer/api';
import { Message } from '@ui-tars/shared/types';

import './widget.css';
import { StatusEnum } from '@ui-tars/sdk';

const Widget = () => {
  const { errorMsg, status, instructions } = useStore();
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // subscribe to the whole store
    const unsubscribe = useStore.subscribe((state, prev) => {
      const newMsgs = state.messages;
      const oldMsgs = prev.messages;

      // only when the array identity or length changes
      if (newMsgs !== oldMsgs) {
        setLastMessage(newMsgs.length > 0 ? newMsgs[newMsgs.length - 1] : null);
      }
    });

    // on mount, you might also initialize lastMessage
    const initial = useStore.getState().messages;
    setLastMessage(initial.length > 0 ? initial[initial.length - 1] : null);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (status === StatusEnum.PAUSE && isLoading) {
      setIsLoading(false);
    }
  }, [status, isLoading]);

  const handleStop = useCallback(async () => {
    await api.stopRun();
    await api.clearHistory();
  }, []);

  return (
    <div className="flex flex-col w-100 h-100 overflow-hidden p-4 bg-white/90 dark:bg-gray-800/90">
      <div className="flex items-center gap-4 draggable-area">
        {/* Logo */}
        <img src={logo} alt="logo" className="h-10" />
        <span className="line-clamp-2">{instructions}</span>
      </div>

      <div className="flex mt-6">
        <span className="line-clamp-3">
          {lastMessage ? lastMessage.value : ''}
        </span>
      </div>

      {!!errorMsg && <div>{errorMsg}</div>}

      <div className="absolute bottom-4 right-4 flex">
        <Button
          variant="destructive"
          onClick={handleStop}
          className="h-8 text-red-400 border-red-400 bg-red-50/80 hover:bg-red-100 hover:text-red-500 cursor-pointer hover:cursor-pointer"
        >
          <Square className="h-4 w-4 text-red-500" />
          <span>Stop</span>
        </Button>
      </div>
    </div>
  );
};

export default Widget;
