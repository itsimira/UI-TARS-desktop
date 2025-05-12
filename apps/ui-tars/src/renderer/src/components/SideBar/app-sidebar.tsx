/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, type ComponentProps } from 'react';
import { Plus } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@renderer/components/ui/sidebar';
import { DragArea } from '@renderer/components/Common/drag';
import { Button } from '@renderer/components/ui/button';

// import { NavMain } from './nav-main';
import { NavHistory } from './nav-history';
import { UITarsHeader } from './nav-header';
import { NavSettings } from '@renderer/components/SideBar/nav-footer';
import { useTask } from '@renderer/hooks/useTask';
import { Task } from '@ui-tars/shared/types';

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { currentTask, tasks, setCurrentTask } = useTask();

  const onNewChat = useCallback(async () => {
    setCurrentTask(null);
  }, []);

  const onTaskDelete = useCallback(async (taskId: number) => {
    window.api.task.remove(taskId).then(() => {
      setCurrentTask(null);
    });
  }, []);

  const onTaskClick = useCallback(async (task: Task) => {
    setCurrentTask(task);
  }, []);

  return (
    <Sidebar collapsible="icon" className="select-none" {...props}>
      <DragArea></DragArea>
      <SidebarHeader>
        <UITarsHeader />
        <Button
          variant={'outline'}
          className="mx-2 my-1 group-data-[state=collapsed]:mx-0"
          onClick={onNewChat}
        >
          <Plus />
          <span className="group-data-[state=collapsed]:hidden transition-opacity duration-200 ease-in-out group-data-[state=expanded]:opacity-100">
            New Task
          </span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavHistory
          currentTask={currentTask}
          history={tasks}
          onTaskClick={onTaskClick}
          onTaskDelete={onTaskDelete}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavSettings />
      </SidebarFooter>
    </Sidebar>
  );
}
