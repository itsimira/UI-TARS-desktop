import { FunctionComponent, JSX } from 'react';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { Separator } from '@renderer/components/ui/separator';
import { useStore } from '@renderer/hooks/useStore';
import { cn } from '@renderer/utils';

type StoreValue = string | object;

interface AgentStoreState {
  taskStore: Record<string, StoreValue>;
}

export const AgentStore: FunctionComponent<AgentStoreState> = ({
  taskStore,
}) => {
  const { store } = useStore();

  const dataToRender =
    taskStore && Object.keys(taskStore).length > 0 ? taskStore : store;

  const formatValue = (value: StoreValue): JSX.Element => {
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <div className="pl-4 border-l-2 border-gray-200">
            {value.map((item, i) => (
              <div key={i} className="mb-1">
                {formatValue(item)}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="pl-4 border-l-2 border-gray-200">
            {Object.entries(dataToRender).map(([nestedKey, nestedValue]) => (
              <div key={nestedKey} className="mb-2">
                <span className="font-medium text-gray-600">{nestedKey}:</span>{' '}
                {formatValue(nestedValue)}
              </div>
            ))}
          </div>
        );
      }
    }

    return <span>{value.toString()}</span>;
  };

  return (
    <div className={cn('w-1/3 py-4 bg-gray-50 border-l px-4')}>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-xl">Stored Data</span>
        <div className="flex gap-2"></div>
      </div>
      <ScrollArea className="max-h-screen mt-4">
        {Object.entries(dataToRender).map(([key, value], index, array) => (
          <div key={key}>
            <div className="flex flex-col">
              <div className="font-medium text-sm text-gray-500 mb-1">
                {key}
              </div>
              <div className="">{formatValue(value)}</div>
            </div>
            {index < array.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
