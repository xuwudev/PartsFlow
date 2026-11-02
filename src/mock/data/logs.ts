export const MOCK_USER_LOGS = [
  {
    id: 1,
    user_id: "1",
    user_name: "James Mitchell",
    event_time: new Date(Date.now() - 3600000 * 1).toISOString(),
    event_name: "Signed in to system",
    ip_address: "192.168.1.45",
  },
  {
    id: 2,
    user_id: "2",
    user_name: "Michael Anderson",
    event_time: new Date(Date.now() - 3600000 * 3).toISOString(),
    event_name: "Aktualizacja zadania #1 (Status: In progress)",
    ip_address: "192.168.1.88",
  },
  {
    id: 3,
    user_id: "3",
    user_name: "Emily Johnson",
    event_time: new Date(Date.now() - 3600000 * 5).toISOString(),
    event_name: "Creation umowy bonusowej #2",
    ip_address: "192.168.1.92",
  },
  {
    id: 4,
    user_id: "1",
    user_name: "James Mitchell",
    event_time: new Date(Date.now() - 3600000 * 24).toISOString(),
    event_name: "Exported monthly revenue report to CSV",
    ip_address: "192.168.1.45",
  },
  {
    id: 5,
    user_id: "4",
    user_name: "David Thompson",
    event_time: new Date(Date.now() - 3600000 * 48).toISOString(),
    event_name: "Updated GPS location for customer K00107",
    ip_address: "192.168.1.114",
  },
];

export const MOCK_TASK_HISTORY = [
  {
    id: 1,
    task_id: "1",
    action: "status_changed",
    changed_by: "Michael Anderson",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    details: "Changed status from New to In progress",
  },
  {
    id: 2,
    task_id: "1",
    action: "comment_added",
    changed_by: "Michael Anderson",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    details: "Added comment: Samples and catalogs prepared.",
  },
  {
    id: 3,
    task_id: "2",
    action: "created",
    changed_by: "James Mitchell",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    details: "Created an urgent task",
  },
  {
    id: 4,
    task_id: "4",
    action: "completed",
    changed_by: "Michael Anderson",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    details: "Task completed successfully",
  },
];

export const MOCK_ADDRESS_LOGS = [
  {
    id: 1,
    fir_kod: "K00101",
    old_address: "300 Congress Avenue",
    new_address: "420 Congress Avenue",
    changed_by: "James Mitchell",
    changed_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];
