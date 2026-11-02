import { useEffect, useState } from "react";
import { SideNavigation, navigationLabel } from "./SideNavigation";
import { localizeAmericanDemo } from "../mock/americanSeedMigration";
import { releasedTabs } from "../features/releaseTabs";

import toast from "react-hot-toast";
import { useRouter } from "@tanstack/react-router";

export default function HomePage() {
  const router = useRouter();

  /* ================== helpers ================== */

  function getDate() {
    const today = new Date();

    const date = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");

    return `${month}/${date}/${year} ${hours}:${minutes}`;
  }

  const getDayOfWeek = () =>
    new Date().toLocaleDateString("en-US", { weekday: "long" });

  /* ================== state ================== */
  const [currentDate, setCurrentDate] = useState(getDate());
  const [currentWeekDay, setCurrentWeekDay] = useState(getDayOfWeek());

  const [activeTab, setActiveTab] = useState<
    | "general"
    | "customers"
    | "monthObroty"
    | "dayObroty"
    | "groupObroty"
    | "spadki"
    | "zwroty"
    | "umowy"
    | "tasks"
    | "adminLogs"
    | "adminTasks"
    | "ksoplat"
    | "map"
    | "ustalenia"
  >("general");
  const [, setInitialFirKod] = useState<string | null>(null);
  const [, setInitialMonth] = useState<string | null>(null);
  const [, setInitialDay] = useState<string | null>(null);
  const [, setInitialTaskId] = useState<string | null>(null);

  const [user, setUser] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isImpersonated, setIsImpersonated] = useState(false);
  const [, setImpersonatorName] = useState<string | null>(null);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  const [toggleNav, setToggleNav] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  /* ================== effects ================== */

  // user
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      try {
        const parsed = localizeAmericanDemo(JSON.parse(data));
        setUser(parsed.name || parsed.email);
        if (parsed.isImpersonated) {
          setIsImpersonated(true);
          setImpersonatorName(parsed.impersonatorName || null);
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  // superadmin check
  useEffect(() => {
    async function checkSuperAdmin() {
      try {
        const res = await fetch("/api/user/superadmin", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.superadmin || false);
          if (data.isImpersonated) {
            setIsImpersonated(true);
            setImpersonatorName(data.impersonatorName || null);
          } else {
            setIsImpersonated(false);
            setImpersonatorName(null);
          }
        }
      } catch (error) {
        console.error("Failed to check superadmin status:", error);
        setIsSuperAdmin(false);
      }
    }

    checkSuperAdmin();
  }, []);

  const fetchUsersForImpersonation = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.users || [];
        setAvailableUsers(list);
      } else {
        toast.error("Unable to load users");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Unable to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStartImpersonation = async (targetUserId: string) => {
    setImpersonatingUserId(targetUserId);
    try {
      const res = await fetch(`/api/impersonate/${targetUserId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(`Switched to user: ${data.user.name || data.user.email}`);
        setShowImpersonateModal(false);
        // Перезагрузка страницы для полной инициализации всех компонентов под новым пользователем
        window.location.reload();
      } else {
        toast.error(data.message || "Unable to switch user");
      }
    } catch (err) {
      console.error("Error impersonating:", err);
      toast.error("Server error while switching user");
    } finally {
      setImpersonatingUserId(null);
    }
  };

  const handleExitImpersonation = async () => {
    try {
      const res = await fetch("/api/impersonate/exit", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Administrator profile restored");
        // Перезагрузка страницы для возврата админского интерфейса
        window.location.reload();
      } else {
        toast.error(data.message || "Unable to restore profile");
      }
    } catch (err) {
      console.error("Error exiting impersonation:", err);
      toast.error("Server error while restoring profile");
    }
  };

  // clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getDate());
      setCurrentWeekDay(getDayOfWeek());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // screen / orientation
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // close navbar on orientation change
  useEffect(() => {
    setToggleNav(false);
  }, [isPortrait]);

  // auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/homepage", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          localStorage.removeItem("user");
          router.navigate({ to: "/login", replace: true });
        }
      } catch {
        localStorage.removeItem("user");
        router.navigate({ to: "/login", replace: true });
      }
    }

    checkAuth();
  }, []);

  /* ================== handlers ================== */

  const selectTab = (tab: typeof activeTab) => {
    if (!releasedTabs.includes(tab)) {
      toast("This section is not available yet.");
      return;
    }
    setActiveTab(tab);
  };

  const handleTabChange = (
    tab:
      | "general"
      | "customers"
      | "monthObroty"
      | "dayObroty"
      | "groupObroty"
      | "spadki"
      | "zwroty"
      | "umowy"
      | "tasks"
      | "adminLogs"
      | "adminTasks"
      | "ksoplat"
      | "map"
      | "ustalenia",
  ) => {
    selectTab(tab);

    if (tab !== "monthObroty" && tab !== "customers" && tab !== "spadki") {
      setInitialFirKod(null);
    }
    if (tab !== "monthObroty") {
      setInitialMonth(null);
    }
    if (tab !== "dayObroty") {
      setInitialDay(null);
    }
    setInitialTaskId(null);

    if (isMobile) setToggleNav(false);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      toast.success(data.message);
      router.navigate({ to: "/login" });
    } catch {
      toast.error("Server error");
    }
  };

  /* ================== render ================== */

  return (
    <section className="app-shell flex h-screen bg-violet-50 from-white to-zinc-300 overflow-hidden">
      <SideNavigation
        activeTab={activeTab}
        onNavigate={handleTabChange}
        mobile={isMobile}
        hidden={isMobile ? !toggleNav : toggleNav}
        onClose={() => setToggleNav(false)}
        user={user}
        admin={isSuperAdmin}
        impersonated={isImpersonated}
        onSwitchUser={() => {
          setShowImpersonateModal(true);
          if (availableUsers.length === 0) fetchUsersForImpersonation();
          if (isMobile) setToggleNav(false);
        }}
        onExitPreview={handleExitImpersonation}
        onLogout={handleLogout}
      />
      {/* overlay */}
      {isMobile && toggleNav && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setToggleNav(false)}
        />
      )}

      {/* ================== CONTENT ================== */}
      <main
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${isMobile ? "w-full" : toggleNav ? "w-full" : "min-w-0"}
        `}
      >
        {/* top bar */}
        <div className="app-topbar relative flex items-center gap-3 px-5 h-18 shrink-0 border-b border-gray-200 bg-white">
          <button
            onClick={() => setToggleNav((prev) => !prev)}
            className="navigation-icon-button" aria-label="Toggle navigation" aria-controls="workspace-navigation" aria-expanded={isMobile ? toggleNav : !toggleNav}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <h1 className="workspace-page-title">{navigationLabel(activeTab)}</h1><p className="workspace-clock">
            {currentDate} · {currentWeekDay}
          </p>

          
        </div>

        <div className="flex-1 overflow-auto">
          {releasedTabs.length === 0 && (
            <section className="p-8">
              <p className="eyebrow">PARTSFLOW CRM</p>
              <h1 className="text-2xl font-semibold text-violet-950">Welcome to your workspace</h1>
              <p className="text-sm text-gray-500 mt-3">Your account and workspace are ready.</p>
            </section>
          )}
          

          

          

          

          
          

          

          

          

          

          

          {/* Admin tools - tylko dla superadmin */}
          
          

          

          {/* Komunikaty o braku uprawnień */}
          
          
        </div>
      </main>

      {/* ========== MODAL: WYBÓR PRACOWNIKA DO PODGLĄDU ========== */}
      {showImpersonateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowImpersonateModal(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-sm w-full max-w-xl overflow-hidden border border-gray-200 z-10 flex flex-col max-h-[85vh]">
            {/* Header: PartsFlow CRM gradient */}
            <div className="px-6 py-4 bg-violet-600 from-violet-700 via-violet-800 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-violet-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide">Employee account preview</h3>
                  <p className="text-xs text-violet-100 opacity-90">
                    Select an employee account to explore the CRM from their perspective.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImpersonateModal(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 bg-gray-50/80 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email or operator code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-xs"
                  autoFocus
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-100 bg-white">
              {usersLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm font-medium">Loading employees...</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-sm">No users available</p>
                </div>
              ) : (
                (() => {
                  const filtered = availableUsers.filter((u: any) => {
                    const q = searchQuery.toLowerCase();
                    const name = (u.name || "").toLowerCase();
                    const email = (u.email || "").toLowerCase();
                    const oper = (u.oper_kod || "").toLowerCase();
                    return name.includes(q) || email.includes(q) || oper.includes(q);
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-10 text-center text-gray-400">
                        <p className="text-sm">No employee found for &quot;{searchQuery}&quot;</p>
                      </div>
                    );
                  }

                  return filtered.map((u: any) => {
                    const isCurrent = (u.name || u.email) === user;
                    return (
                      <div
                        key={u.userId}
                        className={`pt-2.5 first:pt-0 flex items-center justify-between p-3 rounded-xl transition-all border ${isCurrent
                            ? "bg-gray-50 border-gray-200 opacity-60 cursor-default"
                            : "bg-white border-transparent hover:border-violet-200 hover:bg-violet-50/50 cursor-pointer shadow-xs"
                          }`}
                        onClick={() => {
                          if (!isCurrent && !impersonatingUserId) {
                            handleStartImpersonation(u.userId);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-violet-600 from-violet-600 to-slate-800 text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs">
                            {(u.name || u.email || "?").charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-900">
                                {u.name || u.email}
                              </p>
                              {u.superadmin && (
                                <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-300">
                                  ADMIN
                                </span>
                              )}
                              {isCurrent && (
                                <span className="bg-violet-100 text-violet-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-violet-200">
                                  Current profile
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span>{u.email}</span>
                              {u.oper_kod && (
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-semibold text-[11px] border border-gray-200">
                                  CODE: {u.oper_kod}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            disabled={impersonatingUserId === u.userId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartImpersonation(u.userId);
                            }}
                            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {impersonatingUserId === u.userId ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                <span>Switching...</span>
                              </>
                            ) : (
                              <>
                                <span>Sign in</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  className="w-3.5 h-3.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Select an employee or close this window</span>
              <button
                onClick={() => setShowImpersonateModal(false)}
                className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
