import { useEffect, useState, useRef } from "react";

/* -------------------------
 * TYPES
 * ------------------------- */

type MonthObrot = { miesiac: string; obrot: number };
type DayObrot = { dzien: string; obrot: number };
type FirmaSpadki = {
  fir_kod_gr: string;
  NAZ_SKR: string;
  miesiac: number;
  do_sredniej: number;
};
type Task = {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  priority: string;
  assignee?: { name: string } | null;
};

type KsoPlat = { fir_kod: string; naz_skr: string; dnin: number; naleznosci_spoz: number };

type Ustalenie = {
  id: number;
  nazwa: string;
  okres_od: string;
  okres_do: string;
  grupa_kod: string | null;
  grupa_nazwa: string | null;
  towar_kod: string | null;
  target_typ: "suma" | "ilosc";
  target_wartosc: number;
  status: string;
  progress: {
    current: number;
    target: number;
    percent: number;
  };
  umowa?: {
    fir_kod: string;
  } | null;
};

/* -------------------------
 * HELPERS
 * ------------------------- */

const fmt = (n: number) =>
  Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);


const PRIORITY_COLOR: Record<string, string> = {
  critical: "red-50 text-red-700 border-red-200",
  high: "orange-50 text-orange-700 border-orange-200",
  medium: "violet-50 text-violet-700 border-violet-200",
  low: "gray-50 text-gray-700 border-gray-200",
};


/* -------------------------
 * Top5Card
 * ------------------------- */

type Row = { label: string; value: number; sub?: string };

function Top5Card({
  title,
  rows,
  loading,
  headerClass,
  valueLabel = "Revenue (USD)",
  negativeRed = false,
  onRowClick,
  formatValue,
}: {
  title: string;
  rows: Row[];
  loading: boolean;
  headerClass: string;
  valueLabel?: string;
  negativeRed?: boolean;
  onRowClick?: (row: Row) => void;
  formatValue?: (n: number) => string;
}) {
  const displayFmt = formatValue || fmt;

  return (
    <div className="dashboard-top-card flex flex-col rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white transition-all duration-300 hover:shadow-sm">
      <div className={`${headerClass} px-4 py-1 border-b border-black/20 shrink-0 relative shadow-md`}>
        <div className="absolute inset-x-0 top-0 h-px bg-white/20"></div>
        <p className="text-white font-semibold text-sm lg:text-base tracking-wider  truncate relative z-10 uppercase">{title}</p>
      </div>
      <div className="bg-white flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
            <div className="spinner-3d scale-75"></div>
            <p className="text-gray-300 text-[10px] font-bold uppercase tracking-wide animate-pulse">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-400 text-sm">No data</p>
          </div>
        ) : (
          <div className="dashboard-top-scroll flex-1 min-h-0 overflow-y-auto" tabIndex={0} role="region" aria-label={`${title} rankings`}>
            <table className="w-full border-collapse text-xs lg:text-sm table-fixed">
              <thead className="sticky top-0 z-10 shadow-sm shrink-0">
                <tr className="flex w-full bg-violet-50 from-gray-100 to-gray-200 text-gray-600 border-b border-gray-300 font-semibold uppercase text-[10px] tracking-wide">
                  <th className="px-3 py-1.5 text-center w-10 border-r border-gray-300/50">#</th>
                  <th className="px-3 py-1.5 text-left flex-1 border-r border-gray-300/50">Name</th>
                  <th className="px-3 py-1.5 text-right w-32 truncate">{valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick?.(r)}
                    className={`flex items-center w-full border-b border-gray-50 hover:bg-violet-50 hover:from-violet-50/50 hover:to-violet-100/50 transition-all cursor-pointer group active:scale-[0.99] ${i === 0 ? "bg-violet-50 from-violet-50/30 to-violet-100/30 font-bold" : ""
                      }`}
                  >
                    <td className="px-3 py-2 text-center w-10 text-gray-400 group-hover:text-violet-500 font-semibold">{i + 1}</td>
                    <td className="px-3 py-2 flex-1 min-w-0">
                      <p className="font-bold text-gray-900 leading-tight group-hover:text-violet-900 truncate">{r.label}</p>
                      {r.sub && <p className="text-gray-400 text-[10px] lg:text-xs font-medium truncate">{r.sub}</p>}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold w-32 ${negativeRed
                        ? r.value < 0 ? "text-red-600" : "text-gray-700"
                        : "text-violet-700"
                        }`}
                    >
                      {displayFmt(r.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


function TasksCard({ tasks, loading, onTaskClick }: { tasks: Task[]; loading: boolean; onTaskClick: (taskId: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Range: 7 days back, 22 days forward (total 30 days)
  const totalDays = 30;
  const startOffset = -7;

  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + startOffset + i);
    return d;
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === day.getTime();
    });
  };

  // Find index of Today
  const todayIdx = days.findIndex(d => d.getTime() === now.getTime());

  // Center today on mount/loading finish
  useEffect(() => {
    if (!loading && todayRef.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center"
        });
      }, 100);
    }
  }, [loading]);

  return (
    <div className="flex flex-col min-h-[180px] h-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white transition-all duration-300 hover:shadow-sm">
      <div className="dashboard-card-header px-4 py-3 flex justify-between items-center shrink-0 border-white relative shadow-md">
        <div className="absolute inset-0 border-t border-white/10 pointer-events-none"></div>
        <p className="text-white font-semibold text-sm lg:text-base tracking-wider  relative z-10 uppercase">Task calendar</p>
        <p className="text-slate-300 text-[10px] font-bold relative z-10 opacity-80 backdrop-blur-sm bg-black/10 px-2 py-0.5 rounded">All tasks</p>
      </div>
      <div
        ref={scrollRef}
        className="bg-white overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {loading ? (
          <div className="flex items-center justify-center p-8 gap-3 w-full">
            <div className="spinner-3d scale-90"></div>
            <p className="text-gray-400 font-bold text-xs tracking-wide uppercase animate-pulse">Syncing tasks...</p>
          </div>
        ) : (
          <div className="flex gap-2 p-1 min-w-max">
            {days.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isToday = idx === todayIdx;

              return (
                <div
                  key={idx}
                  ref={isToday ? todayRef : null}
                  className={`flex flex-col w-40 min-h-35 rounded-lg border shrink-0 transition-all ${isToday
                    ? "border-violet-300 bg-violet-100 shadow-lg ring-1 ring-violet-200"
                    : "border-gray-200 bg-violet-50 from-gray-50 to-gray-100 shadow-sm"
                    }`}
                >
                  <div className={`px-2 py-2 text-center border-b ${isToday
                    ? "bg-violet-200 border-violet-300 text-violet-800"
                    : "bggray-200 border-gray-300 text-gray-600"
                    } rounded-t-lg`}>
                    <p className="text-base font-semibold leading-none">{day.getDate()}</p>
                    <p className="text-[11px] uppercase tracking-wider font-bold opacity-70 mt-1">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                  </div>
                  <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-35">
                    {dayTasks.length === 0 ? (
                      <p className="text-[11px] text-gray-300 text-center mt-8">—</p>
                    ) : (
                      dayTasks.map((t) => {
                        const isCompletedOrCancelled = t.status === "completed" || t.status === "cancelled";

                        return (
                          <div
                            key={t.id}
                            title={t.title}
                            onClick={() => onTaskClick(t.id)}
                            className={`
                              p-2.5 rounded-md text-[11px] leading-snug border shadow-sm bg-violet-50 font-bold
                              cursor-pointer hover:shadow-md transition-all active:scale-95
                              ${isCompletedOrCancelled
                                ? 'opacity-60 line-through from-gray-100 to-gray-200 text-gray-500 border-gray-300'
                                : PRIORITY_COLOR[t.priority] || "bg-white text-gray-700"
                              }
                            `}
                          >
                            <p className="font-bold line-clamp-2">{t.title}</p>
                            {t.assignee && (
                              <p className="text-[10px] mt-1 opacity-70 font-medium italic truncate">
                                {t.assignee.name}
                              </p>
                            )}
                            {t.status === "completed" && (
                              <p className="text-[9px] text-green-600 font-bold mt-1">✓ Completed</p>
                            )}
                            {t.status === "cancelled" && (
                              <p className="text-[9px] text-red-600 font-bold mt-1">✗ Cancelled</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function UstaleniaDashboardCard({
  ustalenia,
  loading,
  onNavigate,
}: {
  ustalenia: Ustalenie[];
  loading: boolean;
  onNavigate: (tab: any) => void;
}) {
  return (
    <div className="flex flex-col min-h-[230px] h-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white transition-all duration-300 hover:shadow-sm">
      <div className="dashboard-card-header px-4 py-3 flex justify-between items-center shrink-0 border-b border-emerald-950 relative shadow-md">
        <div className="absolute inset-0 border-t border-white/10 pointer-events-none"></div>
        <p className="text-white font-semibold text-sm lg:text-base tracking-wider  relative z-10 uppercase">
          Sales target progress
        </p>
        <button
          onClick={() => onNavigate("ustalenia")}
          className="text-emerald-100 text-[10px] font-bold relative z-10 bg-black/20 hover:bg-black/45 px-2.5 py-1 rounded transition-colors"
        >
          View details →
        </button>
      </div>
      <div className="p-4 bg-white overflow-y-auto max-h-75">
        {loading ? (
          <div className="flex items-center justify-center p-8 gap-3">
            <div className="spinner-3d scale-90 border-t-emerald-500"></div>
            <p className="text-gray-400 font-bold text-xs tracking-wide uppercase animate-pulse">Loading...</p>
          </div>
        ) : ustalenia.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No active sales targets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ustalenia.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.nazwa}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.grupa_nazwa ? (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                        {item.grupa_nazwa}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
                        Product: {item.towar_kod}
                      </span>
                    )}
                    {item.umowa && (
                      <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                        {item.umowa.fir_kod}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Progress</span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {item.progress.percent}% ({item.progress.current.toLocaleString()} / {item.progress.target.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden border border-gray-300">
                    <div
                      className="bg-violet-600 from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.progress.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------
 * MAIN COMPONENT
 * ------------------------- */

export const GeneralInfo = ({
  onNavigate,
}: {
  onNavigate: (
    tab:
      | "general"
      | "customers"
      | "monthObroty"
      | "dayObroty"
      | "groupObroty"
      | "spadki"
      | "tasks"
      | "ksoplat"
      | "ustalenia",
    filters?: { firKod?: string; month?: string; day?: string; taskId?: string }
  ) => void;
}) => {
  const [monthData, setMonthData] = useState<MonthObrot[]>([]);
  const [dayData, setDayData] = useState<DayObrot[]>([]);
  const [firmaData, setFirmaData] = useState<FirmaSpadki[]>([]);
  const [topFirmsData, setTopFirmsData] = useState<{ fir_kod: string; fir_naz: string; obrot: number }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ksoPlatData, setKsoPlatData] = useState<KsoPlat[]>([]);
  const [ustalenieData, setUstalenieData] = useState<Ustalenie[]>([]);

  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDay, setLoadingDay] = useState(true);
  const [loadingFirma, setLoadingFirma] = useState(true);
  const [loadingTopFirms, setLoadingTopFirms] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingKsoPlat, setLoadingKsoPlat] = useState(true);
  const [loadingUstalenia, setLoadingUstalenia] = useState(true);
  useEffect(() => {
    fetch("/api/obrotByMonthList", { credentials: "include" })
      .then((r) => r.json()).then(setMonthData).finally(() => setLoadingMonth(false));

    fetch("/api/obrotByDayList", { credentials: "include" })
      .then((r) => r.json()).then(setDayData).finally(() => setLoadingDay(false));

    fetch("/api/spadkiOper", { credentials: "include" })
      .then((r) => r.json()).then(setFirmaData).finally(() => setLoadingFirma(false));

    fetch("/api/topFirmsMonth", { credentials: "include" })
      .then((r) => r.json()).then(setTopFirmsData).finally(() => setLoadingTopFirms(false));

    fetch("/api/tasks/assigned?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .finally(() => setLoadingTasks(false));

    fetch("/api/kso-plat?sort_by=dnin&sort_desc=true&limit=10", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((d) => setKsoPlatData(d.data || []))
      .catch(() => setKsoPlatData([]))
      .finally(() => setLoadingKsoPlat(false));

    fetch("/api/ustalenia", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setUstalenieData(Array.isArray(d) ? d.filter((u: Ustalenie) => u.status === "active") : []))
      .catch(() => setUstalenieData([]))
      .finally(() => setLoadingUstalenia(false));
  }, []);

  /* --- Derive specific lists --- */

  const monthIndexes: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  const parseMonthStr = (s: string) => {
    const parts = s.split(" ");
    if (parts.length !== 2) return new Date(0);
    const [name, year] = parts;
    return new Date(parseInt(year), monthIndexes[name.toLowerCase()] || 0);
  };

  // Last 5 months, sorted from newest to oldest
  const last10Months: Row[] = [...monthData]
    .sort((a, b) => parseMonthStr(b.miesiac).getTime() - parseMonthStr(a.miesiac).getTime())
    .slice(0, 10)
    .map((r) => ({ label: r.miesiac, value: r.obrot }));

  // Top 5 days only for the most recent month present in data
  const latestDay = dayData.length > 0
    ? [...dayData].sort((a, b) => b.dzien.localeCompare(a.dzien))[0].dzien
    : "";
  const latestMonthPrefix = latestDay.substring(0, 7); // "YYYY-MM"

  const top10DaysLastMonth: Row[] = dayData
    .filter((r) => r.dzien.startsWith(latestMonthPrefix))
    .sort((a, b) => b.obrot - a.obrot)
    .slice(0, 10)
    .map((r) => ({ label: r.dzien, value: r.obrot }));

  const top10FirmaMonth: Row[] = topFirmsData
    .map((r) => ({ label: r.fir_naz || r.fir_kod, sub: r.fir_kod, value: r.obrot }));

  const top10FirmaSpadki: Row[] = [...firmaData]
    .sort((a, b) => a.do_sredniej - b.do_sredniej).slice(0, 10)
    .map((r) => ({ label: r.NAZ_SKR || r.fir_kod_gr, sub: r.fir_kod_gr, value: r.do_sredniej }));

  const top10KsoPlat: Row[] = ksoPlatData
    .map((r) => ({
      label: r.naz_skr || r.fir_kod,
      sub: `${r.fir_kod} | Overdue: ${fmt(r.naleznosci_spoz)}`,
      value: Number(r.dnin || 0)
    }));

  return (
    <section className="dashboard-overview p-4 md:p-6 w-full min-h-full flex flex-col bg-gray-50/50">
      <header className="mb-5 shrink-0"><p className="eyebrow">WORKSPACE OVERVIEW</p><h1 className="text-2xl font-semibold tracking-tight text-violet-950">A clear view of your day.</h1><p className="text-sm text-gray-500 mt-1">Your tasks, sales and customer activity, all together.</p></header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="md:col-span-2 lg:col-span-3 min-h-0">
          <TasksCard
            tasks={tasks}
            loading={loadingTasks}
            onTaskClick={(taskId) => onNavigate("tasks", { taskId })}
          />
        </div>

        {(loadingUstalenia || ustalenieData.length > 0) && (
          <div className="md:col-span-2 lg:col-span-3 min-h-0">
            <UstaleniaDashboardCard
              ustalenia={ustalenieData}
              loading={loadingUstalenia}
              onNavigate={onNavigate}
            />
          </div>
        )}

        <div className="min-h-0">
          <Top5Card
            title="Revenue · Last 10 months"
            rows={last10Months}
            loading={loadingMonth}
            headerClass="dashboard-card-header"
            valueLabel="Revenue (USD)"
            onRowClick={(r) => onNavigate("monthObroty", { month: r.label })}
          />
        </div>

        <div className="min-h-0">
          <Top5Card
            title="Top 10 · Revenue days"
            rows={top10DaysLastMonth}
            loading={loadingDay}
            headerClass="dashboard-card-header"
            valueLabel="Revenue (USD)"
            onRowClick={(r) => onNavigate("dayObroty", { day: r.label })}
          />
        </div>

        <div className="min-h-0">
          <Top5Card
            title="Top 10 · Customers this month"
            rows={top10FirmaMonth}
            loading={loadingTopFirms}
            headerClass="dashboard-card-header"
            valueLabel="Revenue (USD)"
            onRowClick={(r) => onNavigate("monthObroty", { firKod: r.sub })}
          />
        </div>

        <div className="min-h-0">
          <Top5Card
            title="Top 10 · Revenue decline"
            rows={top10FirmaSpadki}
            loading={loadingFirma}
            headerClass="dashboard-card-header"
            valueLabel="Change vs. average (USD)"
            negativeRed
            onRowClick={(r) => onNavigate("spadki", { firKod: r.sub })}
          />
        </div>

        {top10KsoPlat.length > 0 && (
          <div className="min-h-0">
            <Top5Card
              title="Top 10 · Overdue payments"
              rows={top10KsoPlat}
              loading={loadingKsoPlat}
              headerClass="dashboard-card-header"
              valueLabel="Days"
              formatValue={(n) => `${n}`}
              onRowClick={(r) => onNavigate("ksoplat", { firKod: r.sub?.split(" | ")[0] })}
            />
          </div>
        )}
      </div>
    </section>
  );
};
