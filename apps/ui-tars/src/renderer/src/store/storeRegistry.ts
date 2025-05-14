import { useTaskStore } from '@renderer/store/task';
import { useUserStore } from '@renderer/store/user';

const initial = {
  user: useUserStore.getState(),
  task: useTaskStore.getState(),
};

export function resetAllStores() {
  useUserStore.setState(initial.user, true);
  useTaskStore.setState(initial.task, true);
}
