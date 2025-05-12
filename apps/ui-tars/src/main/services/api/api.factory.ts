import { apiEndpoint } from '@main/env';
import { AuthNetwork } from '@main/services/api/network';
import { TasksNetwork } from '@main/services/api/network/tasks.network';

const endpoint = apiEndpoint || 'https://localhost:3000';

const authService = new AuthNetwork({
  endpoint: endpoint,
});

const tasksService = new TasksNetwork({
  endpoint: endpoint,
});

export { authService, tasksService };
