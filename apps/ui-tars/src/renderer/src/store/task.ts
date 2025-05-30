import { Task, TaskResponse } from '@ui-tars/shared/types';
import { create } from 'zustand';

interface TaskState {
  loading: boolean;
  error: Error | null;
  tasks: Task[];
  currentTask: Task | null;
  responses: TaskResponse[];

  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setCurrentTask: (task: Task | null) => void;

  fetchTasks: () => Promise<void>;
  fetchTaskResponses: (taskId: number) => Promise<void>;

  create: (prompt: string) => Promise<Task>;
  update: (task: Task) => Promise<void>;
  delete: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  loading: true,
  error: null,
  tasks: [],
  currentTask: null,
  responses: [],

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentTask: (task) => set({ currentTask: task }),

  fetchTasks: async () => {
    return window.api.task.list().then((tasks) => {
      set({ tasks });
    });
  },

  fetchTaskResponses: async (taskId: number) => {
    set({ loading: true });
    return window.api.task
      .getResponses(taskId)
      .then((responses) => {
        set({ responses });
      })
      .finally(() => set({ loading: false }));
  },

  create: async (prompt: string) => {
    return window.api.task.add(prompt).then((task) => {
      set((state) => ({
        tasks: [task, ...state.tasks],
        currentTask: task,
      }));
      return task;
    });
  },

  update: async (task: Task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
      currentTask: task,
    }));
  },

  delete: async (taskId: number) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      currentTask: null,
    }));
    return window.api.task.remove(taskId);
  },
}));
