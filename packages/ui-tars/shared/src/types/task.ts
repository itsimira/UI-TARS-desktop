export interface Task {
  id: number;
  user_id: number;
  agent_id?: number;
  prompt: string;
  status: string;
  created_at: Date;
}

export interface TaskResponse {
  id: number;
  task_id: number;
  response: string;
  created_at: Date;
}

export interface TaskStore {
  id: number;
  task_id: number;
  store: string;
  created_at: Date;
}
