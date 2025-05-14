import { FunctionComponent } from 'react';
import { Button } from '@renderer/components/ui/button';
import { Download } from 'lucide-react';
import { useTask } from '@renderer/hooks/useTask';

export const ExportTaskDataButton: FunctionComponent = () => {
  const { currentTask, responses } = useTask();

  const handleExport = async () => {
    if (!currentTask) {
      return;
    }

    const taskData = {
      id: currentTask.id,
      prompt: currentTask.prompt,
      responses: responses,
      taskStore: currentTask.taskStore,
      status: currentTask.status,
      createdAt: currentTask.created_at,
    };

    const blob = new Blob([JSON.stringify(taskData)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task_${currentTask.id}_export_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Export"
      onClick={handleExport}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};
