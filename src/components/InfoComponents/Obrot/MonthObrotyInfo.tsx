import { useEffect, useMemo, useRef, useState } from "react";
import { ObrotySimpleTable, LoadingState } from "./components/ObrotySimpleTable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* -----------------------------
 * TYPES
 * ----------------------------- */

type Props = {
  initialFirKod: string | null;
  initialMonth?: string | null;
};

type Group = {
  GRUPA_KOD: string;
  GRUPA_NAZ: string;
  PARENT_KOD: string;
};

type Obrot = {
  miesiac: string;
  obrot: number;
};

type FirKodItem = {
  fir_kod: string;
  naz_skr: string;
  label: string;
};



/* -----------------------------
 * COMPONENT
 * ----------------------------- */

export const MonthObrotyInfo = ({ initialFirKod, initialMonth }: Props) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [firKods, setFirKods] = useState<FirKodItem[]>([]);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedFirKods, setSelectedFirKods] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const [selectedObrots, setSelectedObrots] = useState<Obrot[]>([]);
  const [obrots, setObrots] = useState<Obrot[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [groupSearch, setGroupSearch] = useState("");
  const [firSearch, setFirSearch] = useState("");
  const [monthSearch, setMonthSearch] = useState("");


  // const [openObrot, setOpenObrot] = useState(false)

  const ref = useRef<HTMLDivElement>(null);

  /* -----------------------------
   * FETCH FILTER DATA
   * ----------------------------- */

  useEffect(() => {
    fetch("/api/groupList", { credentials: "include" })
      .then(r => r.json())
      .then(setGroups);

    fetch("/api/obrotByMonthList", { credentials: "include" })
      .then(r => r.json())
      .then(setSelectedObrots);

    fetch("/api/firKodList", { credentials: "include" })
      .then(r => r.json())
      .then(setFirKods);
  }, []);

  /* -----------------------------
   * FETCH OBROTY (groups / fir_kod)
   * ----------------------------- */

  useEffect(() => {
    if (selectedGroups.length === 0 && selectedFirKods.length === 0) {
      setObrots([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();

    if (selectedGroups.length > 0) {
      params.set("groups", selectedGroups.join(","));
    }

    if (selectedFirKods.length > 0) {
      params.set("fir_kod", selectedFirKods.join(","));
    }

    fetch(`/api/obrotMonthData?${params.toString()}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(setObrots)
      .finally(() => setLoading(false));
  }, [selectedGroups, selectedFirKods]);

  useEffect(() => {
    if (initialFirKod) {
      setSelectedFirKods([initialFirKod]);
      setOpen(true);
    }
  }, [initialFirKod]);

  useEffect(() => {
    if (initialMonth) {
      setSelectedMonths([initialMonth]);
      setOpen(true);
    }
  }, [initialMonth]);

  /* -----------------------------
   * HELPERS
   * ----------------------------- */

  const toggle = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -----------------------------
   * FILTERED LISTS
   * ----------------------------- */

  const filteredGroups = useMemo(() => {
    const s = groupSearch.toLowerCase();
    return groups.filter(g =>
      g.GRUPA_KOD.toLowerCase().includes(s) ||
      g.GRUPA_NAZ.toLowerCase().includes(s)
    );
  }, [groups, groupSearch]);

  const filteredFirKods = useMemo(() => {
    const s = firSearch.toLowerCase();
    return firKods.filter(f =>
      f.fir_kod.toLowerCase().includes(s) ||
      f.naz_skr.toLowerCase().includes(s)
    );
  }, [firKods, firSearch]);

  const allMonths = useMemo(() => {
    const src =
      selectedGroups.length || selectedFirKods.length
        ? obrots
        : selectedObrots;

    return Array.from(new Set(src.map(o => o.miesiac))).sort();
  }, [obrots, selectedObrots, selectedGroups, selectedFirKods]);

  const filteredMonths = useMemo(() => {
    const s = monthSearch.toLowerCase();
    return allMonths.filter(m => m.toLowerCase().includes(s));
  }, [allMonths, monthSearch]);

  const sortedMonths = [...filteredMonths].sort((a, b) =>
    b.localeCompare(a)
  );



  /* -----------------------------
   * FINAL DATA
   * ----------------------------- */

  const hasFilters =
    selectedGroups.length > 0 ||
    selectedFirKods.length > 0 ||
    selectedMonths.length > 0;

  const baseData =
    selectedGroups.length || selectedFirKods.length
      ? obrots
      : selectedObrots;

  const tableData: Obrot[] =
    selectedMonths.length === 0
      ? baseData
      : baseData.filter(o => selectedMonths.includes(o.miesiac));

  const isFilteredEmpty =
    hasFilters && !loading && tableData.length === 0;



  /* -----------------------------
   * CHART DATA
   * ----------------------------- */

  const chartData = {
    labels: tableData.map(o => o.miesiac),
    datasets: [
      {
        label: "Revenue",
        data: tableData.map(o => o.obrot),
        backgroundColor: tableData.map(() => "rgba(59,130,246,0.5)"), // массив!
      },
    ],
  }

  const chartRef = useRef(null)

  /* -----------------------------
   * RENDER
   * ----------------------------- */

  return (
    <section className="w-full p-4">
      <div className="flex w-full justify-center items-center" ref={ref}>
        <div className="flex flex-col w-full items-center">
          <button
            onClick={() => setOpen(o => !o)}
            className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 border uppercase tracking-[0.2em] shadow-lg active:scale-95 ${open
              ? 'bg-violet-700 text-white border-violet-400'
              : 'bg-gray-100 text-violet-600 border-gray-300 hover:border-violet-300'
              }`}
          >
            {open ? 'Close filters' : 'Open filters'}
          </button>
          {open && (
            <div className="w-full max-w-6xl mx-auto mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 flex flex-col md:flex-row gap-8 border border-gray-200">

                {/* MIESIĄCE */}
                <div className="w-full md:w-1/3 space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Months</div>

                  <div className="relative border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-inner flex flex-wrap gap-2 min-h-[42px] transition-all focus-within:ring-2 focus-within:ring-violet-100 focus-within:border-violet-300">
                    {selectedMonths.map(m => (
                      <div key={m} className="bg-violet-50 border border-violet-100 text-violet-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        {m}
                        <button
                          className="ml-1 text-red-500"
                          onClick={() => toggle(m, setSelectedMonths)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <input
                      value={monthSearch}
                      onChange={e => setMonthSearch(e.target.value)}
                      placeholder="Search months..."
                      className="flex-1 outline-none min-w-[120px] text-sm placeholder-gray-300"
                    />

                    {(monthSearch || selectedMonths.length > 0) && (
                      <button
                        onClick={() => {
                          setMonthSearch("");
                          setSelectedMonths([]);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    <div className="space-y-1">
                      {sortedMonths.map(m => (
                        <label key={m} className="flex gap-3 items-center py-2 px-3 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            checked={selectedMonths.includes(m)}
                            onChange={() => toggle(m, setSelectedMonths)}
                          />
                          <span className="text-sm text-gray-700 group-hover:text-violet-900 font-medium">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GROUPS */}
                <div className="w-full md:w-1/3 space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Categories</div>

                  {/* INPUT + TAGS */}
                  <div className="relative border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-inner flex flex-wrap gap-2 min-h-[42px] transition-all focus-within:ring-2 focus-within:ring-violet-100 focus-within:border-violet-300">
                    {/* TAGS */}
                    {selectedGroups.map(code => (
                      <div key={code} className="bg-violet-50 border border-violet-100 text-violet-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        {code}
                        <button
                          className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => toggle(code, setSelectedGroups)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <input
                      placeholder="Search categories..."
                      value={groupSearch}
                      onChange={e => setGroupSearch(e.target.value)}
                      className="flex-1 min-w-[120px] outline-none text-sm placeholder-gray-300"
                    />

                    {(groupSearch || selectedGroups.length > 0) && (
                      <button
                        onClick={() => {
                          setGroupSearch("");
                          setSelectedGroups([]);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* LIST */}
                  <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    <div className="space-y-1">
                      {filteredGroups.map(g => (
                        <label key={g.GRUPA_KOD} className="flex gap-3 items-center py-2 px-3 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            checked={selectedGroups.includes(g.GRUPA_KOD)}
                            onChange={() => toggle(g.GRUPA_KOD, setSelectedGroups)}
                          />
                          <span className="text-sm text-gray-700 group-hover:text-violet-900 font-medium">
                            {g.GRUPA_NAZ} <span className="text-[10px] text-gray-400 font-bold ml-1">({g.GRUPA_KOD})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* FIR KOD */}
                <div className="w-full md:w-1/3 space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Customers</div>

                  {/* INPUT + TAGS */}
                  <div className="relative border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-inner flex flex-wrap gap-2 min-h-[42px] transition-all focus-within:ring-2 focus-within:ring-violet-100 focus-within:border-violet-300">
                    {/* TAGS */}
                    {selectedFirKods.map(code => (
                      <div key={code} className="bg-violet-50 border border-violet-100 text-violet-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        {code}
                        <button
                          className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => toggle(code, setSelectedFirKods)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <input
                      placeholder="Search companies..."
                      value={firSearch}
                      onChange={e => setFirSearch(e.target.value)}
                      className="flex-1 min-w-[120px] outline-none text-sm placeholder-gray-300"
                    />

                    {(firSearch || selectedFirKods.length > 0) && (
                      <button
                        onClick={() => {
                          setFirSearch("");
                          setSelectedFirKods([]);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* LIST */}
                  <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
                    <div className="space-y-1">
                      {filteredFirKods.map(item => (
                        <label key={item.fir_kod} className="flex gap-3 items-center py-2 px-3 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            checked={selectedFirKods.includes(item.fir_kod)}
                            onChange={() => toggle(item.fir_kod, setSelectedFirKods)}
                          />
                          <span className="text-sm text-gray-700 group-hover:text-violet-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* CONTENT SECTION (CHART & TABLE) */}
          <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto mt-8 items-center">
            {/* CHART */}
            <div className="w-full">              {!loading && tableData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[500px] flex flex-col">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 ml-1">Monthly chart</div>
                <div className="flex-1 min-h-0">
                  <Bar
                    ref={chartRef}
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(31, 41, 55, 0.9)',
                          padding: 12,
                          titleFont: { size: 14, weight: 'bold' },
                          bodyFont: { size: 13 },
                          cornerRadius: 8,
                          displayColors: false
                        }
                      },
                      layout: { padding: { top: 20, bottom: 20, left: 10, right: 10 } },
                      scales: {
                        x: {
                          reverse: true,
                          grid: { display: false },
                          ticks: { font: { weight: 'bold', size: 10 } }
                        },
                        y: {
                          grid: { color: '#f3f4f6' },
                          ticks: {
                            font: { weight: 'bold', size: 10 },
                            callback: (val) => Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(val))
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            )}
            </div>

            {/* TABLE */}
            <div className="w-full max-w-2xl flex flex-col items-center">
              <LoadingState loading={loading} isEmpty={!loading && isFilteredEmpty} />
              {!loading && tableData.length > 0 && (
                <div className="w-full">
                  <ObrotySimpleTable
                    periodLabel="Month"
                    title={hasFilters ? "Selected revenue" : "Revenue overview"}
                    headerClass="bg-violet-700"
                    accentClass="text-violet-700"
                    rows={tableData.map(r => ({ period: r.miesiac, obrot: r.obrot }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


