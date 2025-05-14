import { useTaskStore } from '@renderer/store/task';
import { useEffect } from 'react';

export const useTask = () => {
  const store = useTaskStore();

  useEffect(() => {
    store.fetchTasks();
  }, [store.fetchTasks]);

  useEffect(() => {
    if (store.currentTask) {
      store.fetchTaskResponses(store.currentTask.id);
    }
  }, [store.currentTask?.id, store.fetchTaskResponses]);

  return {
    loading: store.loading,
    error: store.error,
    tasks: store.tasks,
    currentTask: store.currentTask,
    responses: store.responses,

    setTasks: store.setTasks,
    setLoading: store.setLoading,
    setError: store.setError,
    setCurrentTask: store.setCurrentTask,

    createTask: store.create,
    updateTask: store.update,
    deleteTask: store.delete,
  };
};
