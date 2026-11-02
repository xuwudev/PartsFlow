import { INITIAL_USERS, type MockUser } from "./data/users";
import { translateLegacyDemo } from "./englishSeedMigration";
import { localizeAmericanDemo } from "./americanSeedMigration";
import { INITIAL_CLIENTS, type MockClient } from "./data/clients";
import { INITIAL_TASKS, type MockTask, type MockComment } from "./data/tasks";
import { INITIAL_UMOWY, type MockUmowa } from "./data/contracts";
import { INITIAL_USTALENIA, type MockUstalenie } from "./data/agreements";
import {
  MOCK_TASK_STATUSES,
  MOCK_TASK_PRIORITIES,
  MOCK_TASK_TYPES,
  MOCK_UMOWY_TYPES,
  MOCK_UMOWY_FREQUENCIES,
} from "./data/dictionaries";
import {
  MOCK_PRODUCT_GROUPS,
  MOCK_MONTH_LIST,
  MOCK_DAY_LIST,
  MOCK_TOP_FIRMS_MONTH,
} from "./data/turnover";
import { MOCK_SPADKI_OPER, MOCK_FIRMA_DETAILS } from "./data/drops";
import { MOCK_RETURNS_DATA } from "./data/returns";
import { MOCK_KSO_PLAT_ROWS, MOCK_KSO_CUSTOMER_DETAILS } from "./data/ksoplat";
import { MOCK_USER_LOGS, MOCK_TASK_HISTORY, MOCK_ADDRESS_LOGS } from "./data/logs";

const STORAGE_KEY = "partsflow_demo_db_v1";

interface StoreState {
  users: MockUser[];
  clients: MockClient[];
  tasks: MockTask[];
  umowy: MockUmowa[];
  ustalenia: MockUstalenie[];
  logs: typeof MOCK_USER_LOGS;
  taskHistory: typeof MOCK_TASK_HISTORY;
  currentUser: MockUser;
  isImpersonated: boolean;
  impersonatorName: string | null;
}

function getDefaultState(): StoreState {
  return {
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    clients: JSON.parse(JSON.stringify(INITIAL_CLIENTS)),
    tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
    umowy: JSON.parse(JSON.stringify(INITIAL_UMOWY)),
    ustalenia: JSON.parse(JSON.stringify(INITIAL_USTALENIA)),
    logs: JSON.parse(JSON.stringify(MOCK_USER_LOGS)),
    taskHistory: JSON.parse(JSON.stringify(MOCK_TASK_HISTORY)),
    currentUser: JSON.parse(JSON.stringify(INITIAL_USERS[0])),
    isImpersonated: false,
    impersonatorName: null,
  };
}

class MockStore {
  private state: StoreState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): StoreState {
    if (typeof window === "undefined") {
      return getDefaultState();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return localizeAmericanDemo(translateLegacyDemo(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn("Failed to load mock store from localStorage:", e);
    }
    const defaultState = getDefaultState();
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state?: StoreState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state || this.state));
    } catch (e) {
      console.warn("Failed to save mock store to localStorage:", e);
    }
  }

  public resetDemoData() {
    this.state = getDefaultState();
    this.saveState();
  }

  // --- Auth & Users ---
  public getCurrentUser(): MockUser {
    return this.state.currentUser;
  }

  public getUsers(): MockUser[] {
    return this.state.users;
  }

  public getSuperAdminStatus() {
    return {
      superadmin: this.state.currentUser.superadmin,
      isImpersonated: this.state.isImpersonated,
      impersonatorName: this.state.impersonatorName,
    };
  }

  public login(email: string) {
    const user = this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || this.state.users[0];
    this.state.currentUser = user;
    this.state.isImpersonated = false;
    this.state.impersonatorName = null;
    this.saveState();
    return user;
  }

  public impersonate(targetUserId: string) {
    const target = this.state.users.find((u) => u.userId === targetUserId);
    if (!target) return null;
    const admin = this.state.currentUser;
    this.state.isImpersonated = true;
    this.state.impersonatorName = admin.name;
    this.state.currentUser = target;
    this.saveState();
    return target;
  }

  public exitImpersonation() {
    const admin = this.state.users.find((u) => u.superadmin) || this.state.users[0];
    this.state.isImpersonated = false;
    this.state.impersonatorName = null;
    this.state.currentUser = admin;
    this.saveState();
    return admin;
  }

  // --- Dictionaries ---
  public getDictionaries() {
    return {
      statuses: MOCK_TASK_STATUSES,
      priorities: MOCK_TASK_PRIORITIES,
      types: MOCK_TASK_TYPES,
      umowyTypes: MOCK_UMOWY_TYPES,
      umowyFrequencies: MOCK_UMOWY_FREQUENCIES,
    };
  }

  // --- Clients ---
  public getClients(operKods?: string[]) {
    if (!operKods || operKods.length === 0 || operKods.includes("all")) {
      return this.state.clients;
    }
    return this.state.clients.filter((c) => operKods.includes(c.oper_kod));
  }

  public getClientByFirKod(firKod: string) {
    return this.state.clients.find((c) => c.FIR_KOD === firKod) || null;
  }

  public getFirKodList() {
    return this.state.clients.map((c) => ({
      fir_kod: c.FIR_KOD,
      naz_skr: c.NAZ_SKR,
      label: `${c.FIR_KOD} - ${c.NAZ_SKR}`,
    }));
  }

  public updateClientMapData(firKod: string, data: { lat: number; lng: number; miasto?: string; adres?: string }) {
    const client = this.state.clients.find((c) => c.FIR_KOD === firKod);
    if (client) {
      client.GPS_SZER = data.lat;
      client.GPS_DLUG = data.lng;
      if (data.miasto) client.MIASTO = data.miasto;
      if (data.adres) client.ADRES = data.adres;
      client.is_overridden = true;
      this.saveState();
      return client;
    }
    return null;
  }

  // --- Tasks ---
  public getTasks(filters: {
    status?: string;
    priority?: string;
    type?: string;
    userId?: string;
    fir_kod?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
  }) {
    let list = this.state.tasks.filter((t) => t.status !== "deleted");

    if (filters.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters.type) {
      list = list.filter((t) => t.type === filters.type);
    }
    if (filters.userId) {
      list = list.filter((t) => t.creator_id === filters.userId || t.assigned_to_id === filters.userId);
    }
    if (filters.fir_kod) {
      list = list.filter((t) => t.fir_kod === filters.fir_kod);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      list = list.filter((t) => new Date(t.due_date).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      list = list.filter((t) => new Date(t.due_date).getTime() <= to);
    }

    const total = list.length;
    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);

    const pages = Math.max(1, Math.ceil(total / limit));
    return { tasks: paginated, total, page, totalPages: pages, pagination: { total, page, limit, pages } };
  }

  public getTaskById(id: string) {
    return this.state.tasks.find((t) => t.id === id) || null;
  }

  public getTaskStats() {
    const active = this.state.tasks.filter((t) => t.status !== "deleted");
    return {
      total: active.length,
      new: active.filter((t) => t.status === "new").length,
      in_progress: active.filter((t) => t.status === "in_progress").length,
      completed: active.filter((t) => t.status === "completed").length,
      cancelled: active.filter((t) => t.status === "cancelled").length,
    };
  }

  public createTask(data: Partial<MockTask>): MockTask {
    const creator = this.state.currentUser;
    const assignee = this.state.users.find((u) => u.userId === String(data.assigned_to_id)) || creator;
    const typeDict = MOCK_TASK_TYPES.find((td) => td.name === data.type) || MOCK_TASK_TYPES[0];

    const newTask: MockTask = {
      id: String(Date.now()),
      title: data.title || "Untitled",
      description: data.description || "",
      status: (data.status as any) || "new",
      priority: (data.priority as any) || "medium",
      type: data.type || "visiting",
      due_date: data.due_date || new Date(Date.now() + 86400000 * 2).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: creator.userId,
      assigned_to_id: assignee.userId,
      fir_kod: data.fir_kod || null,
      creator: { userId: creator.userId, name: creator.name, email: creator.email },
      assignee: { userId: assignee.userId, name: assignee.name, email: assignee.email },
      task_type_dict: typeDict,
      _count: { comments: 0, attachments: 0 },
      comments: [],
    };

    this.state.tasks.unshift(newTask);
    this.state.taskHistory.unshift({
      id: Date.now(),
      task_id: newTask.id,
      action: "created",
      changed_by: creator.name,
      created_at: new Date().toISOString(),
      details: `Created task "${newTask.title}"`,
    });
    this.saveState();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<MockTask>) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return null;

    Object.assign(task, updates);
    task.updated_at = new Date().toISOString();

    if (updates.assigned_to_id) {
      const assignee = this.state.users.find((u) => u.userId === String(updates.assigned_to_id));
      if (assignee) {
        task.assignee = { userId: assignee.userId, name: assignee.name, email: assignee.email };
      }
    }
    if (updates.type) {
      task.task_type_dict = MOCK_TASK_TYPES.find((td) => td.name === updates.type);
    }

    this.saveState();
    return task;
  }

  public changeTaskStatus(id: string, status: MockTask["status"]) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return null;
    const oldStatus = task.status;
    task.status = status;
    task.updated_at = new Date().toISOString();
    this.state.taskHistory.unshift({
      id: Date.now(),
      task_id: task.id,
      action: "status_changed",
      changed_by: this.state.currentUser.name,
      created_at: new Date().toISOString(),
      details: `Changed status from ${oldStatus} to ${status}`,
    });
    this.saveState();
    return task;
  }

  public deleteTask(id: string) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (task) {
      task.status = "deleted";
      this.saveState();
      return true;
    }
    return false;
  }

  public addTaskComment(taskId: string, commentText: string): MockComment | null {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const user = this.state.currentUser;
    const newComment: MockComment = {
      id: "c_" + Date.now(),
      task_id: taskId,
      user_id: user.userId,
      comment: commentText,
      created_at: new Date().toISOString(),
      user: { userId: user.userId, name: user.name, email: user.email },
    };
    if (!task.comments) task.comments = [];
    task.comments.push(newComment);
    task._count.comments = task.comments.length;
    this.saveState();
    return newComment;
  }

  public deleteTaskComment(taskId: string, commentId: string) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task || !task.comments) return false;
    task.comments = task.comments.filter((c) => c.id !== commentId);
    task._count.comments = task.comments.length;
    this.saveState();
    return true;
  }

  // --- Umowy ---
  public getUmowy(firKod?: string) {
    let list = this.state.umowy;
    if (firKod) {
      list = list.filter((u) => u.fir_kod === firKod);
    }
    return list;
  }

  public createUmowa(data: any): MockUmowa {
    const newId = this.state.umowy.length + 1;
    const typDict = MOCK_UMOWY_TYPES.find((t) => t.id === Number(data.typ_umowy)) || MOCK_UMOWY_TYPES[0];
    const freqDict = MOCK_UMOWY_FREQUENCIES.find((f) => f.id === Number(data.czestotliwosc_id)) || MOCK_UMOWY_FREQUENCIES[1];

    const newUmowa: MockUmowa = {
      id: newId,
      fir_kod: data.fir_kod,
      typ_umowy: Number(data.typ_umowy),
      od: data.od || new Date().toISOString(),
      do: data.do || new Date(Date.now() + 86400000 * 365).toISOString(),
      kto_stworzyl: this.state.currentUser.userId,
      czestotliwosc_id: Number(data.czestotliwosc_id),
      data_stworzenia: new Date().toISOString(),
      type_dict: typDict,
      czestotliwosc: freqDict,
      creator: { userId: this.state.currentUser.userId, name: this.state.currentUser.name },
      progi: (data.progi || []).map((p: any, idx: number) => ({
        id: idx + 1,
        kwota: parseFloat(p.kwota || 0),
        procent: parseFloat(p.procent || 0),
      })),
      detale: [
        { id: 1, okres_od: data.od || new Date().toISOString(), okres_do: data.do || new Date().toISOString(), koszt_czastkowy: 0 },
      ],
    };

    this.state.umowy.unshift(newUmowa);
    this.saveState();
    return newUmowa;
  }

  public updateUmowa(id: number, data: any) {
    const umowa = this.state.umowy.find((u) => u.id === Number(id));
    if (!umowa) return null;
    Object.assign(umowa, data);
    this.saveState();
    return umowa;
  }

  public deleteUmowa(id: number) {
    this.state.umowy = this.state.umowy.filter((u) => u.id !== Number(id));
    this.saveState();
    return true;
  }

  // --- Ustalenia ---
  public getUstalenia() {
    return this.state.ustalenia.map((item) => ({
      ...item,
      nazwa: item.opis,
      okres_od: item.data_od,
      okres_do: item.data_do,
      grupa_kod: item.grupy[0]?.grupa_kod ?? null,
      grupa_nazwa: item.grupy[0]?.grupa_naz ?? null,
      towar_kod: null,
      target_typ: "suma",
      target_wartosc: 0,
      creator_name: item.creator.name,
      oper_kod: item.users[0]?.user.oper_kod ?? item.creator.oper_kod,
      assigned_users: item.users.map(({ user }) => user),
      progress: { current: 0, target: 0, percent: 0 },
      umowa: { fir_kod: item.fir_kod },
    }));
  }

  public createUstalenie(data: any): MockUstalenie {
    const newId = this.state.ustalenia.length + 1;
    const newUstalenie: MockUstalenie = {
      id: newId,
      fir_kod: data.fir_kod,
      status: "active",
      opis: data.opis || "",
      data_od: data.data_od || new Date().toISOString().split("T")[0],
      data_do: data.data_do || new Date(Date.now() + 86400000 * 180).toISOString().split("T")[0],
      rabat: data.rabat ? parseFloat(data.rabat) : undefined,
      creator: { name: this.state.currentUser.name, oper_kod: this.state.currentUser.oper_kod.split(",")[0] },
      users: [{ user: { userId: this.state.currentUser.userId, oper_kod: this.state.currentUser.oper_kod, name: this.state.currentUser.name } }],
      grupy: (data.grupa_kody || []).map((k: string) => ({
        grupa_kod: k,
        grupa_naz: MOCK_PRODUCT_GROUPS.find((g) => g.GRUPA_KOD === k)?.GRUPA_NAZ || k,
      })),
      towary: [],
    };
    this.state.ustalenia.unshift(newUstalenie);
    this.saveState();
    return newUstalenie;
  }

  public updateUstalenie(id: number, data: any) {
    const u = this.state.ustalenia.find((item) => item.id === Number(id));
    if (!u) return null;
    Object.assign(u, data);
    this.saveState();
    return u;
  }

  public deleteUstalenie(id: number) {
    this.state.ustalenia = this.state.ustalenia.filter((item) => item.id !== Number(id));
    this.saveState();
    return true;
  }

  // --- Turnover / Obroty queries ---
  public getMonthList() {
    return MOCK_MONTH_LIST;
  }

  public getDayList() {
    return MOCK_DAY_LIST;
  }

  public getProductGroups() {
    return MOCK_PRODUCT_GROUPS;
  }

  public getTopFirmsMonth() {
    return MOCK_TOP_FIRMS_MONTH;
  }

  public getSpadkiOper() {
    return MOCK_SPADKI_OPER;
  }

  public getFirmaDetails(firKod: string) {
    return MOCK_FIRMA_DETAILS[firKod] || [
      {
        oper_kod: "OP1",
        fir_kod_gr: firKod,
        NAZ_SKR: this.getClientByFirKod(firKod)?.NAZ_SKR || firKod,
        grupa_kod: "HAM",
        GRUPA_NAZ: "Brake systems",
        miesiac_4: 15400,
        miesiac_3: 14200,
        miesiac_2: 12800,
        miesiac_1: 11500,
        miesiac: 9800,
        podsumowanie: 63700,
        srednia: 13475,
        do_sredniej: -27.2,
        minimum: 11500,
        do_minimum: -14.7,
      },
    ];
  }

  public getZwrotyData() {
    return MOCK_RETURNS_DATA;
  }

  public getKsoPlatRows(page = 1, limit = 50, search = "") {
    let rows = MOCK_KSO_PLAT_ROWS;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) => r.fir_kod.toLowerCase().includes(s) || r.naz_skr.toLowerCase().includes(s));
    }
    const total = rows.length;
    const paginated = rows.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public getKsoCustomerDetails(firKod: string) {
    return MOCK_KSO_CUSTOMER_DETAILS[firKod] || [
      {
        DOK_NR: `FS/2026/03/${firKod.slice(1)}`,
        DOK_DATA: "2026-03-10",
        DATAT: "2026-03-30",
        DOK_TYP: "FS",
        WAL_KOD: "USD",
        WAR_WN: 12500.0,
        WAR_MA: 0.0,
        DOK_DOST: "Courier delivery",
      },
    ];
  }

  public getLogsInfo() {
    return this.state.logs;
  }

  public getTaskHistory() {
    return this.state.taskHistory;
  }

  public getAddressLogs() {
    return MOCK_ADDRESS_LOGS;
  }
}

export const mockStore = new MockStore();
