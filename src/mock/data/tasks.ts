export interface MockComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user: {
    userId: string;
    name: string;
    email?: string;
  };
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: "new" | "in_progress" | "completed" | "cancelled" | "deleted";
  priority: "low" | "medium" | "high" | "urgent";
  type: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  assigned_to_id: string;
  fir_kod?: string | null;
  creator: {
    userId: string;
    name: string;
    email: string;
  };
  assignee: {
    userId: string;
    name: string;
    email: string;
  };
  task_type_dict?: {
    id: number;
    name: string;
    display_name: string;
    sort_order: number;
    fir_kod_required: boolean;
  };
  _count: {
    comments: number;
    attachments: number;
  };
  comments?: MockComment[];
}

export const INITIAL_TASKS: MockTask[] = [
  {
    id: "1",
    title: "Present new brake pads and ceramic discs",
    description: "Meet the Anderson service manager to introduce premium brake pads and discuss an 18% margin.",
    status: "in_progress",
    priority: "high",
    type: "visiting",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    creator_id: "1",
    assigned_to_id: "2",
    fir_kod: "K00101",
    creator: { userId: "1", name: "James Mitchell", email: "admin@partsflow.demo" },
    assignee: { userId: "2", name: "Michael Anderson", email: "m.anderson@partsflow.demo" },
    task_type_dict: { id: 1, name: "visiting", display_name: "Customer visit", sort_order: 1, fir_kod_required: true },
    _count: { comments: 2, attachments: 1 },
    comments: [
      {
        id: "c1",
        task_id: "1",
        user_id: "1",
        comment: "Please bring samples of the new drilled brake discs.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        user: { userId: "1", name: "James Mitchell" },
      },
      {
        id: "c2",
        task_id: "1",
        user_id: "2",
        comment: "Samples and catalogs are ready. The customer confirmed Thursday at 11:00.",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        user: { userId: "2", name: "Michael Anderson" },
      },
    ],
  },
  {
    id: "2",
    title: "Negotiate the annual bonus contract for 2026",
    description: "Review the USD 100,000 revenue threshold and agree on an extra 3% discount when the quarterly target is exceeded.",
    status: "new",
    priority: "urgent",
    type: "meeting",
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    creator_id: "1",
    assigned_to_id: "3",
    fir_kod: "K00103",
    creator: { userId: "1", name: "James Mitchell", email: "admin@partsflow.demo" },
    assignee: { userId: "3", name: "Emily Johnson", email: "e.johnson@partsflow.demo" },
    task_type_dict: { id: 6, name: "meeting", display_name: "Meeting", sort_order: 6, fir_kod_required: true },
    _count: { comments: 1, attachments: 0 },
    comments: [
      {
        id: "c3",
        task_id: "2",
        user_id: "3",
        comment: "A draft contract has been sent to the Pacific Coast Motors director.",
        created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        user: { userId: "3", name: "Emily Johnson" },
      },
    ],
  },
  {
    id: "3",
    title: "Investigate the decline in engine oil revenue",
    description: "Analyze the 25% decline in orders over the past two months and prepare a counteroffer.",
    status: "in_progress",
    priority: "high",
    type: "meeting_online",
    due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    creator_id: "1",
    assigned_to_id: "2",
    fir_kod: "K00104",
    creator: { userId: "1", name: "James Mitchell", email: "admin@partsflow.demo" },
    assignee: { userId: "2", name: "Michael Anderson", email: "m.anderson@partsflow.demo" },
    task_type_dict: { id: 2, name: "meeting_online", display_name: "Online meeting", sort_order: 2, fir_kod_required: true },
    _count: { comments: 1, attachments: 0 },
    comments: [
      {
        id: "c4",
        task_id: "3",
        user_id: "2",
        comment: "A competitor offered promotional pricing on 208L drums of 5W30 oil. Preparing a bundle with a free pump.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        user: { userId: "2", name: "Michael Anderson" },
      },
    ],
  },
  {
    id: "4",
    title: "Service visit and cabin filter demand review",
    description: "Review spring filter replacements and present a bundle offer for 50+ units.",
    status: "completed",
    priority: "medium",
    type: "visiting",
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    creator_id: "2",
    assigned_to_id: "2",
    fir_kod: "K00102",
    creator: { userId: "2", name: "Michael Anderson", email: "m.anderson@partsflow.demo" },
    assignee: { userId: "2", name: "Michael Anderson", email: "m.anderson@partsflow.demo" },
    task_type_dict: { id: 1, name: "visiting", display_name: "Customer visit", sort_order: 1, fir_kod_required: true },
    _count: { comments: 1, attachments: 0 },
    comments: [
      {
        id: "c5",
        task_id: "4",
        user_id: "2",
        comment: "The customer placed an order for USD 24,500 net. Task completed.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        user: { userId: "2", name: "Michael Anderson" },
      },
    ],
  },
  {
    id: "5",
    title: "Update credit limit and deferred payment terms",
    description: "The customer requests a credit limit increase from USD 50,000 to USD 80,000 to support a new taxi fleet.",
    status: "new",
    priority: "medium",
    type: "other",
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    creator_id: "4",
    assigned_to_id: "1",
    fir_kod: "K00107",
    creator: { userId: "4", name: "David Thompson", email: "d.thompson@partsflow.demo" },
    assignee: { userId: "1", name: "James Mitchell", email: "admin@partsflow.demo" },
    task_type_dict: { id: 7, name: "other", display_name: "Other", sort_order: 7, fir_kod_required: false },
    _count: { comments: 0, attachments: 0 },
  },
  {
    id: "6",
    title: "Technical training on dual-mass flywheel installation",
    description: "Organize on-site training for Liberty Auto Care service technicians.",
    status: "new",
    priority: "low",
    type: "meeting",
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    creator_id: "4",
    assigned_to_id: "4",
    fir_kod: "K00113",
    creator: { userId: "4", name: "David Thompson", email: "d.thompson@partsflow.demo" },
    assignee: { userId: "4", name: "David Thompson", email: "d.thompson@partsflow.demo" },
    task_type_dict: { id: 6, name: "meeting", display_name: "Meeting", sort_order: 6, fir_kod_required: true },
    _count: { comments: 0, attachments: 0 },
  },
];
