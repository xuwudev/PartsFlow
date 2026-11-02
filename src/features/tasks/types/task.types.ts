export interface TaskUser {
  id: string;
  name: string;
  login: string;
}

export interface TaskType {
  id: number;
  name: string;
  created_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  author_name?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  status: "todo" | "in_progress" | "done" | string;
  priority: "low" | "medium" | "high" | "critical" | string;
  type_id?: number | null;
  type_name?: string;
  assignee_id?: string | null;
  creator_id?: string;
  fir_kod?: string | null;
  created_at?: string;
  updated_at?: string;
  assignee?: TaskUser | null;
  creator?: TaskUser | null;
  comments?: TaskComment[];
}
