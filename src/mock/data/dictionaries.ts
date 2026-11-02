export const MOCK_TASK_STATUSES = [
  { id: 1, name: "new", display_name: "New", sort_order: 1 },
  { id: 2, name: "in_progress", display_name: "In progress", sort_order: 2 },
  { id: 3, name: "completed", display_name: "Completed", sort_order: 3 },
  { id: 4, name: "cancelled", display_name: "Cancelled", sort_order: 4 },
];

export const MOCK_TASK_PRIORITIES = [
  { id: 1, name: "low", display_name: "Low", sort_order: 1 },
  { id: 2, name: "medium", display_name: "Medium", sort_order: 2 },
  { id: 3, name: "high", display_name: "High", sort_order: 3 },
  { id: 4, name: "urgent", display_name: "Urgent", sort_order: 4 },
];

export const MOCK_TASK_TYPES = [
  { id: 1, name: "visiting", display_name: "Customer visit", sort_order: 1, fir_kod_required: true },
  { id: 2, name: "meeting_online", display_name: "Online meeting", sort_order: 2, fir_kod_required: true },
  { id: 3, name: "remote_work", display_name: "Remote work", sort_order: 3, fir_kod_required: false },
  { id: 4, name: "vacation", display_name: "Vacation", sort_order: 4, fir_kod_required: false },
  { id: 5, name: "sick_leave", display_name: "Sick leave", sort_order: 5, fir_kod_required: false },
  { id: 6, name: "meeting", display_name: "Meeting", sort_order: 6, fir_kod_required: true },
  { id: 7, name: "other", display_name: "Other", sort_order: 7, fir_kod_required: false },
];

export const MOCK_UMOWY_TYPES = [
  { id: 1, name: "bonus", display_name: "Bonus", sort_order: 1 },
  { id: 2, name: "equipment", display_name: "Equipment", sort_order: 2 },
];

export const MOCK_UMOWY_FREQUENCIES = [
  { id: 1, name: "monthly", display_name: "Monthly", months_count: 1 },
  { id: 2, name: "quarterly", display_name: "Quarterly", months_count: 3 },
  { id: 3, name: "half_yearly", display_name: "Half-yearly", months_count: 6 },
  { id: 4, name: "yearly", display_name: "Yearly", months_count: 12 },
];
