import { mockStore } from "./store";
import { getCategoryRevenue } from "./data/categoryRevenue";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "x-access-token": "demo-jwt-token-partsflow",
    },
  });
}

function parseUrl(input: RequestInfo | URL): { pathname: string; searchParams: URLSearchParams } {
  let urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (urlStr.startsWith("/")) {
    urlStr = `http://localhost:5000${urlStr}`;
  }
  const u = new URL(urlStr);
  return { pathname: u.pathname, searchParams: u.searchParams };
}

async function parseBody(init?: RequestInit): Promise<any> {
  if (!init?.body) return {};
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  return {};
}

export function initMockEngine() {
  if (typeof window === "undefined") return;
  if ((window as any).__MOCK_ENGINE_INITIALIZED__) return;
  (window as any).__MOCK_ENGINE_INITIALIZED__ = true;

  console.log("🚀 [PartsFlow CRM] Autonomous Client Mock Engine active");

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const { pathname, searchParams } = parseUrl(input);

    if (!pathname.startsWith("/api")) {
      return originalFetch(input, init);
    }

    const method = (init?.method || "GET").toUpperCase();

    if (pathname === "/api/rates") {
      return jsonResponse({ EUR: "1.08", USD: "1.00" });
    }

    // Small delay to simulate realistic network latency
    await new Promise((r) => setTimeout(r, 40));

    // ------------------------------------
    // AUTH & USERS
    // ------------------------------------
    if (pathname === "/api/check-auth") {
      return jsonResponse({ authenticated: true });
    }

    if (pathname === "/api/homepage") {
      return jsonResponse({ message: "OK" });
    }

    if (pathname === "/api/login") {
      const body = await parseBody(init);
      const user = mockStore.login(body.email || "admin@partsflow.demo");
      return jsonResponse({
        success: true,
        redirectTo: "/homepage",
        accessToken: "demo-jwt-token-partsflow",
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          oper_kod: user.oper_kod,
          superadmin: user.superadmin,
        },
      });
    }

    if (pathname === "/api/register") {
      return jsonResponse({ success: true, message: "Registration successful" });
    }

    if (pathname === "/api/logout") {
      return jsonResponse({ success: true });
    }

    if (pathname === "/api/refresh") {
      return jsonResponse({
        accessToken: "demo-jwt-token-partsflow-refreshed",
      });
    }

    if (pathname === "/api/user/superadmin") {
      return jsonResponse(mockStore.getSuperAdminStatus());
    }

    if (pathname === "/api/user/profile") {
      return jsonResponse(mockStore.getCurrentUser());
    }

    if (pathname === "/api/users") {
      return jsonResponse(mockStore.getUsers());
    }

    if (pathname.startsWith("/api/impersonate/")) {
      if (pathname === "/api/impersonate/exit") {
        const admin = mockStore.exitImpersonation();
        return jsonResponse({
          success: true,
          accessToken: "demo-jwt-token-admin",
          user: admin,
        });
      }
      const targetUserId = pathname.replace("/api/impersonate/", "");
      const switched = mockStore.impersonate(targetUserId);
      if (switched) {
        return jsonResponse({
          success: true,
          accessToken: "demo-jwt-token-impersonated",
          user: switched,
        });
      }
      return jsonResponse({ success: false, message: "User not found" }, 404);
    }

    // ------------------------------------
    // DICTIONARIES
    // ------------------------------------
    if (pathname === "/api/dictionaries") {
      return jsonResponse(mockStore.getDictionaries());
    }

    // ------------------------------------
    // CLIENTS / KONTRAHENCI
    // ------------------------------------
    if (pathname === "/api/kontrahentData") {
      return jsonResponse(mockStore.getClients());
    }

    if (pathname === "/api/firKodList" || pathname === "/api/firkodList") {
      return jsonResponse(mockStore.getFirKodList());
    }

    if (pathname === "/api/groupList") {
      return jsonResponse(mockStore.getProductGroups());
    }

    // ------------------------------------
    // TURNOVER / OBROTY
    // ------------------------------------
    if (pathname === "/api/obrotByMonthList") {
      return jsonResponse(mockStore.getMonthList());
    }

    if (pathname === "/api/obrotByDayList") {
      return jsonResponse(mockStore.getDayList());
    }

    if (pathname === "/api/obrotMonthData") {
      // Returns turnover for selected groups and clients
      const groups = searchParams.get("groups")?.split(",") || [];
      const firKods = searchParams.get("fir_kod")?.split(",") || [];
      const baseMonths = mockStore.getMonthList();
      const multiplier = (groups.length || 1) * (firKods.length || 1) * 0.15 + 0.1;
      const data = baseMonths.map((m) => ({
        miesiac: m.miesiac,
        obrot: Math.round(m.obrot * multiplier),
      }));
      return jsonResponse(data);
    }

    if (pathname === "/api/obrotDayData") {
      const baseDays = mockStore.getDayList();
      const data = baseDays.map((d) => ({
        dzien: d.dzien,
        obrot: Math.round(d.obrot * 0.35),
      }));
      return jsonResponse(data);
    }

    if (
      pathname === "/api/obrotMonthGroup" ||
      pathname === "/api/obrotMonthParentGroups" ||
      pathname === "/api/obrotOverallMonth" ||
      pathname === "/api/obrotMonthWithGroupNames" ||
      pathname === "/api/obrotMonthParentGroupsWithFirms"
    ) {
      return jsonResponse(getCategoryRevenue(pathname, searchParams, mockStore.getClients()));
    }

    if (pathname === "/api/subgroupClients" || pathname === "/api/subgroupClientsMultipleMonths") {
      return jsonResponse(getCategoryRevenue(pathname, searchParams, mockStore.getClients()));
    }
    if (pathname === "/api/topFirmsMonth") {
      return jsonResponse(mockStore.getTopFirmsMonth());
    }

    // ------------------------------------
    // SPADKI (DROPS)
    // ------------------------------------
    if (pathname === "/api/spadkiGlobal" || pathname === "/api/spadkiOper") {
      return jsonResponse(mockStore.getSpadkiOper());
    }

    if (pathname === "/api/spadkiCompanyDetails") {
      const firKod = searchParams.get("fir_kod") || "K00104";
      return jsonResponse(mockStore.getFirmaDetails(firKod));
    }

    // ------------------------------------
    // ZWROTY (RETURNS)
    // ------------------------------------
    if (pathname === "/api/zwroty") {
      return jsonResponse(mockStore.getZwrotyData());
    }

    // ------------------------------------
    // TASKS
    // ------------------------------------
    if (pathname === "/api/tasks/stats") {
      return jsonResponse(mockStore.getTaskStats());
    }

    if (pathname === "/api/tasks/assigned") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const user = mockStore.getCurrentUser();
      const res = mockStore.getTasks({ userId: user.userId, limit });
      return jsonResponse(res);
    }

    if (pathname === "/api/tasks/created") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const user = mockStore.getCurrentUser();
      const res = mockStore.getTasks({ userId: user.userId, limit });
      return jsonResponse(res);
    }

    if (pathname === "/api/tasks/all" || pathname === "/api/tasks") {
      if (method === "GET") {
        const res = mockStore.getTasks({
          status: searchParams.get("status") || undefined,
          priority: searchParams.get("priority") || undefined,
          type: searchParams.get("type") || undefined,
          userId: searchParams.get("user_id") || undefined,
          fir_kod: searchParams.get("fir_kod") || undefined,
          search: searchParams.get("search") || undefined,
          dateFrom: searchParams.get("dateFrom") || searchParams.get("startDate") || undefined,
          dateTo: searchParams.get("dateTo") || searchParams.get("endDate") || undefined,
          limit: parseInt(searchParams.get("limit") || "50"),
          page: parseInt(searchParams.get("page") || "1"),
        });
        return jsonResponse(res);
      }

      if (method === "POST") {
        const body = await parseBody(init);
        const newTask = mockStore.createTask(body);
        return jsonResponse(newTask, 201);
      }
    }

    // Match /api/tasks/:id/comments/:commentId
    const deleteCommentMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/comments\/([^/]+)$/);
    if (deleteCommentMatch && method === "DELETE") {
      const [, taskId, commentId] = deleteCommentMatch;
      mockStore.deleteTaskComment(taskId, commentId);
      return jsonResponse({ success: true });
    }

    // Match /api/tasks/:id/comments
    const commentsMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/comments$/);
    if (commentsMatch) {
      const taskId = commentsMatch[1];
      if (method === "GET") {
        const task = mockStore.getTaskById(taskId);
        return jsonResponse(task?.comments || []);
      }
      if (method === "POST") {
        const body = await parseBody(init);
        const comment = mockStore.addTaskComment(taskId, body.comment || "");
        return jsonResponse(comment, 201);
      }
    }

    // Match /api/tasks/:id/status
    const statusMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/status$/);
    if (statusMatch && method === "PATCH") {
      const taskId = statusMatch[1];
      const body = await parseBody(init);
      const updated = mockStore.changeTaskStatus(taskId, body.status);
      return jsonResponse(updated);
    }

    // Match /api/tasks/:id
    const taskByIdMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskByIdMatch) {
      const taskId = taskByIdMatch[1];
      if (method === "GET") {
        const task = mockStore.getTaskById(taskId);
        if (!task) return jsonResponse({ error: "Task not found" }, 404);
        return jsonResponse(task);
      }
      if (method === "PUT") {
        const body = await parseBody(init);
        const updated = mockStore.updateTask(taskId, body);
        return jsonResponse(updated);
      }
      if (method === "DELETE") {
        mockStore.deleteTask(taskId);
        return jsonResponse({ success: true });
      }
    }

    // ------------------------------------
    // UMOWY
    // ------------------------------------
    if (pathname === "/api/umowy/frequencies") {
      return jsonResponse(mockStore.getDictionaries().umowyFrequencies);
    }

    if (pathname === "/api/umowy/types") {
      return jsonResponse(mockStore.getDictionaries().umowyTypes);
    }

    if (pathname === "/api/umowy") {
      if (method === "GET") {
        const firKod = searchParams.get("fir_kod") || undefined;
        return jsonResponse(mockStore.getUmowy(firKod));
      }
      if (method === "POST") {
        const body = await parseBody(init);
        const newUmowa = mockStore.createUmowa(body);
        return jsonResponse(newUmowa, 201);
      }
    }

    const umowaMatch = pathname.match(/^\/api\/umowy\/([^/]+)$/);
    if (umowaMatch) {
      const id = Number(umowaMatch[1]);
      if (method === "PUT") {
        const body = await parseBody(init);
        const updated = mockStore.updateUmowa(id, body);
        return jsonResponse(updated);
      }
      if (method === "DELETE") {
        mockStore.deleteUmowa(id);
        return jsonResponse({ success: true });
      }
    }

    // ------------------------------------
    // USTALENIA
    // ------------------------------------
    if (pathname === "/api/ustalenia") {
      if (method === "GET") {
        return jsonResponse(mockStore.getUstalenia());
      }
      if (method === "POST") {
        const body = await parseBody(init);
        const created = mockStore.createUstalenie(body);
        return jsonResponse(created, 201);
      }
    }

    const ustaleniaMatch = pathname.match(/^\/api\/ustalenia\/([^/]+)$/);
    if (ustaleniaMatch) {
      const id = Number(ustaleniaMatch[1]);
      if (method === "PUT") {
        const body = await parseBody(init);
        const updated = mockStore.updateUstalenie(id, body);
        return jsonResponse(updated);
      }
      if (method === "DELETE") {
        mockStore.deleteUstalenie(id);
        return jsonResponse({ success: true });
      }
    }

    // ------------------------------------
    // KSO PLAT
    // ------------------------------------
    if (pathname === "/api/kso-plat/filters") {
      return jsonResponse({ opers: ["OP1", "OP2", "OP3"] });
    }

    if (pathname.startsWith("/api/kso-plat/details/")) {
      const firKod = pathname.replace("/api/kso-plat/details/", "");
      return jsonResponse(mockStore.getKsoCustomerDetails(firKod));
    }

    if (pathname === "/api/kso-plat") {
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const search = searchParams.get("search") || "";
      return jsonResponse(mockStore.getKsoPlatRows(page, limit, search));
    }

    // ------------------------------------
    // MAP CLIENTS
    // ------------------------------------
    if (pathname === "/api/map-clients") {
      const selectedOper = searchParams.get("selectedOper");
      const opers = selectedOper && selectedOper !== "none" && selectedOper !== "all" ? selectedOper.split(",") : undefined;
      return jsonResponse(mockStore.getClients(opers));
    }

    const mapClientMatch = pathname.match(/^\/api\/map-clients\/([^/]+)$/);
    if (mapClientMatch && method === "PUT") {
      const firKod = mapClientMatch[1];
      const body = await parseBody(init);
      const updated = mockStore.updateClientMapData(firKod, body);
      return jsonResponse(updated);
    }

    // ------------------------------------
    // LOGS & HISTORY
    // ------------------------------------
    if (pathname === "/api/logsInfo" || pathname === "/api/users/logs") {
      return jsonResponse(mockStore.getLogsInfo());
    }

    if (pathname === "/api/taskHistory") {
      return jsonResponse(mockStore.getTaskHistory());
    }

    if (pathname === "/api/address-logs") {
      return jsonResponse(mockStore.getAddressLogs());
    }

    // Fallback for any other API routes
    return jsonResponse({ message: "Mock endpoint not found", pathname }, 404);
  };
}
