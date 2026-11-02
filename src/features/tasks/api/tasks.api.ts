import { apiClient } from "../../../lib/api-client";
import { Task, TaskType, TaskUser } from "../types/task.types";

export async function fetchTasks(): Promise<Task[]> {
  return apiClient<Task[]>("/api/tasks");
}

export async function fetchTaskTypes(): Promise<TaskType[]> {
  return apiClient<TaskType[]>("/api/tasks/types");
}

export async function fetchTaskUsers(): Promise<TaskUser[]> {
  return apiClient<TaskUser[]>("/api/users");
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  return apiClient<Task>("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  return apiClient<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return apiClient<void>(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}
