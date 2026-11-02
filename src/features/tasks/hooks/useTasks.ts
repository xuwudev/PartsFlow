import { useState, useEffect, useCallback } from "react";
import { Task, TaskType, TaskUser } from "../types/task.types";
import { fetchTasks, fetchTaskTypes, fetchTaskUsers } from "../api/tasks.api";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [types, setTypes] = useState<TaskType[]>([]);
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, typesData, usersData] = await Promise.all([
        fetchTasks().catch(() => []),
        fetchTaskTypes().catch(() => []),
        fetchTaskUsers().catch(() => []),
      ]);
      setTasks(tasksData);
      setTypes(typesData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    tasks,
    setTasks,
    types,
    users,
    loading,
    error,
    refreshTasks: loadAll,
  };
}
