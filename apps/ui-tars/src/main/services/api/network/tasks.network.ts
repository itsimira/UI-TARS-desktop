import { ApiConfig } from '../types';
import { Message, Task, TaskResponse } from '@ui-tars/shared/types';
import { TokenService } from '@main/services/token.service';
import { logger } from '@main/logger';

export class TasksNetwork {
  constructor(private readonly config: ApiConfig) {}

  async getList(): Promise<Task[]> {
    const response = await fetch(`${this.config.endpoint}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await TokenService.loadToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const result: Task[] = await response.json();

    return result;
  }

  async get(id: number): Promise<Task> {
    const response = await fetch(`${this.config.endpoint}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await TokenService.loadToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    return response.json();
  }

  async create(prompt: string): Promise<Task> {
    const response = await fetch(`${this.config.endpoint}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await TokenService.loadToken()}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    return response.json();
  }

  async update(
    task: Task,
    responses: Message[],
    store: Record<string, string | object> = {},
  ): Promise<Task> {
    logger.info(`Task ${task.id} update`);

    const response = await fetch(`${this.config.endpoint}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await TokenService.loadToken()}`,
      },
      body: JSON.stringify({
        status: task.status,
        logs: responses.map((response) => ({ message: response.value })),
        store: store,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return response.json();
  }

  async delete(id: number): Promise<void> {
    logger.info(`Task ${id} delete`);
    const response = await fetch(`${this.config.endpoint}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await TokenService.loadToken()}`,
      },
      body: JSON.stringify({}),
    });

    logger.info(`Task delete status ${response.status} `);

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  }

  async getTaskResponses(id: number): Promise<TaskResponse[]> {
    const response = await fetch(
      `${this.config.endpoint}/tasks/${id}/responses`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await TokenService.loadToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch task logs');
    }

    return response.json();
  }
}
