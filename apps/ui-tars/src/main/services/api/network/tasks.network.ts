import { ApiConfig } from '../types';
import { Task, TaskResponse } from '@ui-tars/shared/types';
import { TokenService } from '@main/services/token.service';

export class TasksNetwork {
  private accessToken: string | null = null;

  constructor(private readonly config: ApiConfig) {
    TokenService.loadToken().then((token: string | null) => {
      if (!token) {
        throw new Error('Token not found');
      }

      this.accessToken = token;
    });
  }

  async getList(): Promise<Task[]> {
    const response = await fetch(`${this.config.endpoint}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return (await response.json()) as Task[];
  }

  async get(id: number): Promise<Task> {
    const response = await fetch(`${this.config.endpoint}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
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
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    return response.json();
  }

  async update(task: Task): Promise<Task> {
    const response = await fetch(`${this.config.endpoint}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        status: task.status,
        logs: task.logs,
        store: task.storeVariables,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

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
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch task logs');
    }

    return response.json();
  }
}
