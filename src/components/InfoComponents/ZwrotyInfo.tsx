import { useEffect, useState, useMemo } from "react";
import { SearchInput } from "../ui/SearchInput";
import { Badge } from "../ui/Badge";
import { apiClient } from "../../lib/api-client";

type ZwrotyType = {
  oper_kod: string;
  miesiac: number;
  fir_kod: string;
  naz_skr: string;
  wart_zwrot: number | string;
  wart_sprzedaz: number | string;
  procent_zwrot: number | string;
  ilosc_zwrotow: number | string;
  ilosc_zwrotow_oper: number | string;
  procent_zwrotow_oper: number | string;
  miesiac_obrot?: number;
};

type MonthlySummaryType = {
  miesiac: number;
  wart_zwrot: number;
  wart_sprzedaz: number;
  ilosc_zwrotow: number;
  ilosc_zwrotow_oper: number;
  procent: number;
  procent_oper: number;
};

type SortConfig = {
  key: keyof ZwrotyType;
  direction: "asc" | "desc";
};

export const ZwrotyInfo = () => {
  const [data, setData] = useState<ZwrotyType[]>([]);
  const [summary, setSummary] = useState<MonthlySummaryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minObrot, setMinObrot] = useState("");
  const [maxObrot, setMaxObrot] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "procent_zwrot",
    direction: "desc",
  });

  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiClient<any>("/api/zwroty");
        setData(result.details || []);
        setSummary(result.monthlySummary || []);

        if (result.monthlySummary?.length > 0) {
          setSelectedMonth(result.monthlySummary[0].miesiac);
        }
      } catch (error) {
        console.error("Error fetching zwroty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Get current user from localStorage or fetch from API if missing
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.oper_kod) {
          setCurrentUser(parsed.oper_kod);
        } else {
          // Fallback for old sessions: fetch profile to get oper_kod from allowedusers
          fetch("/api/user/profile", { credentials: "include" })
            .then(res => res.json())
            .then(resData => {
              if (resData.success) {
                const operKod = resData.user.oper_kod;
                setCurrentUser(operKod);
                // Update localStorage to include oper_kod for future use
                localStorage.setItem("user", JSON.stringify({ ...parsed, oper_kod: operKod }));
              }
            })
            .catch(err => console.error("Error fetching user profile:", err));
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);


  const formatNumber = (val: any, decimals: number = 2) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  const formatMonth = (miesiac: number) => {
    const s = String(miesiac);
    if (s.length !== 6) return s;
    const year = s.substring(0, 4);
    const month = s.substring(4, 6);
    return `${month}-${year}`;
  };

  const handleSort = (key: keyof ZwrotyType) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const getSortIcon = (key: keyof ZwrotyType) => {
    if (sortConfig.key !== key) return <span className="ml-1 text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-violet-600 font-bold">↑</span>
    ) : (
      <span className="ml-1 text-violet-600 font-bold">↓</span>
    );
  };

  const filteredAndSortedDetails = useMemo(() => {
    let filtered = data.filter(item => {
      const matchSearch = item.fir_kod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.naz_skr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.oper_kod.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = selectedMonth ? item.miesiac === selectedMonth : true;

      const miesiacObrot = typeof item.miesiac_obrot === "number" ? item.miesiac_obrot : 0;
      
      let matchMinObrot = true;
      if (minObrot !== "") {
        matchMinObrot = miesiacObrot >= parseFloat(minObrot);
      }
      
      let matchMaxObrot = true;
      if (maxObrot !== "") {
        matchMaxObrot = miesiacObrot <= parseFloat(maxObrot);
      }

      return matchSearch && matchMonth && matchMinObrot && matchMaxObrot;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortConfig.key] ?? 0;
      let bVal = b[sortConfig.key] ?? 0;
      if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) aVal = parseFloat(aVal);
      if (typeof bVal === "string" && !isNaN(parseFloat(bVal))) bVal = parseFloat(bVal);
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, minObrot, maxObrot, selectedMonth, sortConfig]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="spinner-3d"></div>
        <p className="text-gray-400 font-bold text-lg tracking-wide uppercase animate-pulse">Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with User Badge */}
      <div className="bg-black/80 p-4 border border-black rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tighter text-white uppercase italic">
          Returns <span className="text-violet-400">Percentage</span>
        </h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col items-end gap-1">
            <label className="text-[10px] text-gray-500 uppercase font-semibold ml-1">Signed in as</label>
            <Badge variant="info" className="px-3 py-1 text-sm font-bold">
              {currentUser || "..."}
            </Badge>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-32">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Min. revenue (USD)</label>
            <input
              type="number"
              placeholder="From..."
              value={minObrot}
              onChange={(e) => setMinObrot(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all hover:bg-white/20 placeholder-white/30"
            />
          </div>

          <div className="flex flex-col gap-1 w-full md:w-32">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Max. revenue (USD)</label>
            <input
              type="number"
              placeholder="To..."
              value={maxObrot}
              onChange={(e) => setMaxObrot(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all hover:bg-white/20 placeholder-white/30"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Search companies</label>
            <SearchInput
            className="flex"
              placeholder="Code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
            />
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Table 1: Monthly Aggregated Stats */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-3 border border-black rounded-t-2xl">
            <h2 className="text-sm font-bold tracking-wide text-white text-center uppercase">
              Monthly history
            </h2>
          </div>
          <div className="border border-black rounded-b-2xl shadow-lg bg-white overflow-hidden h-150 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] font-semibold italic">
                  <th className="p-1 border-b border-r border-black font-bold">Month</th>
                  <th className="p-1 border-b border-r border-black text-right">Return %</th>
                  <th className="p-1 border-b border-black text-right">Operator %</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s) => (
                  <tr
                    key={s.miesiac}
                    className={`cursor-pointer transition-all duration-200 group ${selectedMonth === s.miesiac ? 'bg-violet-600 text-white shadow-inner scale-[1.02]' : 'hover:bg-violet-50'}`}
                    onClick={() => setSelectedMonth(s.miesiac)}
                  >
                    <td className="p-2 border-r border-black text-center font-bold text-xs">
                      {formatMonth(s.miesiac)}
                    </td>
                    <td className={`p-2 border-r border-black text-right font-semibold ${selectedMonth === s.miesiac ? 'text-white' : s.procent > 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumber(s.procent)}%
                    </td>
                    <td className="p-2 text-right font-semibold text-[10px] opacity-70">
                      {formatNumber(s.procent_oper)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Firms Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-violet-900 p-3 border border-black rounded-t-2xl flex justify-between items-center">
            <h2 className="text-sm font-bold tracking-wide text-white uppercase">
              Details: <span className="bg-white text-violet-900 px-2 py-0.5 rounded ml-1 italic">{selectedMonth ? formatMonth(selectedMonth) : "Select month"}</span>
            </h2>
          </div>

          <div className="overflow-x-auto border border-black rounded-b-2xl shadow-lg bg-white overflow-hidden h-150 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 text-gray-700 uppercase text-[9px] font-semibold italic">
                  <th className="p-3 border-b border-r border-black cursor-pointer hover:bg-gray-200" onClick={() => handleSort("fir_kod")}>
                    Company {getSortIcon("fir_kod")}
                  </th>
                  <th className="p-3 border-b border-r border-black text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort("naz_skr")}>
                    Name {getSortIcon("naz_skr")}
                  </th>
                  <th className="p-3 border-b border-r border-black text-right cursor-pointer hover:bg-gray-200 font-bold" onClick={() => handleSort("procent_zwrot")}>
                    Return % {getSortIcon("procent_zwrot")}
                  </th>
                  <th className="p-3 border-b border-black text-right cursor-pointer hover:bg-gray-200 font-bold" onClick={() => handleSort("procent_zwrotow_oper")}>
                    Operator % {getSortIcon("procent_zwrotow_oper")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {filteredAndSortedDetails.length > 0 ? (
                  filteredAndSortedDetails.map((row, idx) => (
                    <tr key={`${row.fir_kod}-${row.miesiac}-${idx}`} className="hover:bg-violet-50 transition-colors group">
                      <td className="p-3 border-r border-black text-left">
                        <div className="font-bold text-violet-900">{row.fir_kod}</div>
                        <div className="text-[8px] text-gray-400 group-hover:text-gray-700 font-bold">User: {row.oper_kod}</div>
                      </td>
                      <td className="p-3 border-r border-black text-left font-bold text-gray-700 text-xs">
                        {row.naz_skr}
                      </td>
                      <td className={`p-3 border-r border-black text-right font-semibold ${parseFloat(String(row.procent_zwrot)) > 10 ? 'bg-red-50 text-red-600' : 'text-green-600'}`}>
                        {formatNumber(row.procent_zwrot)}%
                      </td>
                      <td className="p-3 text-right font-bold text-violet-800">
                        {formatNumber(row.procent_zwrotow_oper)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500 italic">
                      No data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
