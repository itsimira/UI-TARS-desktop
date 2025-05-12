import { ipcMain } from 'electron';
import { tasksService } from '@main/services/api/api.factory';
import { Task } from '@ui-tars/shared/types';

export function registerTaskIPC() {
  ipcMain.handle('task:list', async () => {
    return tasksService.getList();
  });

  ipcMain.handle('task:add', async (_, prompt: string) => {
    return tasksService.create(prompt);
  });

  ipcMain.handle('task:remove', async (_, taskId: number) => {
    return tasksService.delete(taskId);
  });

  ipcMain.handle('task:update', async (_, task: Task) => {
    return tasksService.update(task);
  });

  ipcMain.handle('task:responses', async (_, taskId: number) => {
    return tasksService.getTaskResponses(taskId);
  });
}
