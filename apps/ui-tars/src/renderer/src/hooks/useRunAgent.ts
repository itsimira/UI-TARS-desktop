import { useToast } from '@chakra-ui/react';

import { Conversation } from '@ui-tars/shared/types';

import { getState } from '@renderer/hooks/useStore';

import { usePermissions } from './usePermissions';
import { api } from '@renderer/api';

export const useRunAgent = () => {
  // const dispatch = useDispatch();
  const toast = useToast();
  const { ensurePermissions } = usePermissions();

  const run = async (value: string, callback: () => void = () => {}) => {
    if (
      !ensurePermissions?.accessibility ||
      !ensurePermissions?.screenCapture
    ) {
      const permissionsText = [
        !ensurePermissions?.screenCapture ? 'screenCapture' : '',
        !ensurePermissions?.accessibility ? 'Accessibility' : '',
      ]
        .filter(Boolean)
        .join(' and ');
      toast({
        title: `Please grant the required permissions(${permissionsText})`,
        position: 'top',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const initialMessages: Conversation[] = [
      {
        from: 'human',
        value,
        timing: { start: Date.now(), end: Date.now(), cost: 0 },
      },
    ];
    const currentMessages = getState().messages;

    await Promise.all([
      api.setInstructions({ instructions: value }),
      api.setMessages({ messages: [...currentMessages, ...initialMessages] }),
    ]);

    await api.runAgent();

    callback();
  };

  return { run };
};
