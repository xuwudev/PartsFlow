import { useEffect, useState, useMemo } from "react";
import { SearchInput } from "../ui/SearchInput";
import { apiClient } from "../../lib/api-client";

type SpadkiTypes = {
  oper_kod: string;
  NAZ_SKR: string;
  miesiac_4: number;
  miesiac_3: number;
  miesiac_2: number;
  miesiac_1: number;
  miesiac_0: number;
  miesiac: number;
  podsumowanie: number;
  srednia: number;
  do_sredniej: number;
  minimum: number;
  do_minimum: number;
  fir_kod_gr: string;
};

// Тип для детальной информации о фирме
type FirmaDetailsType = {
  oper_kod: string;
  fir_kod_gr: string;
  NAZ_SKR: string;
  grupa_kod: string;
  GRUPA_NAZ: string;
  miesiac_4: number;
  miesiac_3: number;
  miesiac_2: number;
  miesiac_1: number;
  miesiac: number;
  podsumowanie: number;
  srednia: number;
  do_sredniej: number;
  minimum: number;
  do_minimum: number;
};

type SortConfig = {
  key: keyof SpadkiTypes;
  direction: "asc" | "desc";
};

export const SpadkiInfo = ({ initialFirKod }: { initialFirKod?: string | null }) => {
  const [spadki, setSpadki] = useState<SpadkiTypes[]>([]);
  const [spadkiOper, setSpadkiOper] = useState<SpadkiTypes[]>([]);
  const [sortedSpadkiOper, setSortedSpadkiOper] = useState<SpadkiTypes[]>([]);
  const [selectedFirma, setSelectedFirma] = useState<FirmaDetailsType | null>(
    null,
  );
  const [firmaDetails, setFirmaDetails] = useState<FirmaDetailsType[]>([]);
  const [sortedFirmaDetails, setSortedFirmaDetails] = useState<
    FirmaDetailsType[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [user, setUser] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "do_sredniej",
    direction: "asc",
  });
  const [detailsSortConfig, setDetailsSortConfig] = useState<{
    key: keyof FirmaDetailsType;
    direction: "asc" | "desc";
  }>({
    key: "do_sredniej",
    direction: "asc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [detailsSearchTerm, setDetailsSearchTerm] = useState("");

  // Функция для получения названия месяца на польском с годом
  const getMonthName = (offset: number = 0): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Функция для получения полного названия месяца с годом (для подсказок)
  const getMonthDisplayName = (offset: number = 0): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Маппинг ключей к отображаемым названиям месяцев
  const monthLabels = {
    miesiac: getMonthDisplayName(0), // Прогнозируемый месяц
    miesiac_0: getMonthDisplayName(0), // Текущий месяц
    miesiac_1: getMonthDisplayName(1), // -1 месяц
    miesiac_2: getMonthDisplayName(2), // -2 месяца
    miesiac_3: getMonthDisplayName(3), // -3 месяца
    miesiac_4: getMonthDisplayName(4), // -4 месяца
  };

  const handleFirmaClick = async (firKodGr: string, nazSkr: string) => {
    setDetailsLoading(true);
    try {
      const data = await apiClient<FirmaDetailsType[]>(
        `/api/spadkiCompanyDetails?firKodGr=${encodeURIComponent(firKodGr)}`
      );
      setFirmaDetails(data);
      if (data.length > 0) {
        setSelectedFirma({
          ...data[0],
          NAZ_SKR: nazSkr,
        });
      } else {
        setSelectedFirma({
          fir_kod_gr: firKodGr,
          NAZ_SKR: nazSkr,
        } as FirmaDetailsType);
      }
    } catch (error) {
      console.error("Error fetching firma details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await apiClient<SpadkiTypes[]>("/api/spadkiGlobal");
        setSpadki(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiClient<SpadkiTypes[]>("/api/spadkiOper");
        setSpadkiOper(data);

        if (data.length > 0) {
          const targetFirKod = initialFirKod || data[0].fir_kod_gr;
          const targetFirma = data.find((f: SpadkiTypes) => f.fir_kod_gr === targetFirKod) || data[0];
          handleFirmaClick(targetFirma.fir_kod_gr, targetFirma.NAZ_SKR);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [initialFirKod]);

  // Filtrowanie firm na podstawie wyszukiwania
  const filteredSpadkiOper = useMemo(() => {
    return sortedSpadkiOper.filter(r =>
      r.NAZ_SKR.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fir_kod_gr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedSpadkiOper, searchTerm]);

  // Сортировка основной таблицы
  useEffect(() => {
    if (spadkiOper.length > 0) {
      const sorted = [...spadkiOper].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        const numericKeys = [
          "miesiac_4",
          "miesiac_3",
          "miesiac_2",
          "miesiac_1",
          "miesiac_0",
          "miesiac",
          "podsumowanie",
          "srednia",
          "do_sredniej",
          "minimum",
          "do_minimum",
        ];

        if (numericKeys.includes(sortConfig.key as string)) {
          const parseNumber = (val: any): number => {
            if (val === null || val === undefined) return 0;
            if (typeof val === "number") return val;
            if (typeof val === "string") {
              const cleaned = val.replace(/\s/g, "").replace(",", ".");
              const parsed = parseFloat(cleaned);
              return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          };

          aValue = parseNumber(aValue);
          bValue = parseNumber(bValue);
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        } else {
          const strA =
            aValue === null || aValue === undefined ? "" : String(aValue);
          const strB =
            bValue === null || bValue === undefined ? "" : String(bValue);
          return sortConfig.direction === "asc"
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA);
        }
      });

      setSortedSpadkiOper(sorted);
    }
  }, [spadkiOper, sortConfig]);

  // Сортировка деталей фирмы
  useEffect(() => {
    if (firmaDetails.length > 0) {
      const sorted = [...firmaDetails].sort((a, b) => {
        let aValue = a[detailsSortConfig.key];
        let bValue = b[detailsSortConfig.key];

        const numericKeys = [
          "miesiac_4",
          "miesiac_3",
          "miesiac_2",
          "miesiac_1",
          "miesiac_0",
          "miesiac",
          "podsumowanie",
          "srednia",
          "do_sredniej",
          "minimum",
          "do_minimum",
        ];

        if (numericKeys.includes(detailsSortConfig.key as string)) {
          const numA =
            aValue === null || aValue === undefined ? 0 : Number(aValue);
          const numB =
            bValue === null || bValue === undefined ? 0 : Number(bValue);
          return detailsSortConfig.direction === "asc"
            ? numA - numB
            : numB - numA;
        } else {
          const strA =
            aValue === null || aValue === undefined ? "" : String(aValue);
          const strB =
            bValue === null || bValue === undefined ? "" : String(bValue);
          return detailsSortConfig.direction === "asc"
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA);
        }
      });

      setSortedFirmaDetails(sorted);
    } else {
      setSortedFirmaDetails([]);
    }
  }, [firmaDetails, detailsSortConfig]);

  // user
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data).name);
  }, []);

  // Функция для обработки сортировки основной таблицы
  const handleSort = (key: keyof SpadkiTypes) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Функция для обработки сортировки деталей
  const handleDetailsSort = (key: keyof FirmaDetailsType) => {
    setDetailsSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Функция для отображения иконки сортировки основной таблицы
  const getSortIcon = (key: keyof SpadkiTypes) => {
    if (sortConfig.key !== key) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-violet-600 font-bold">↑</span>
    ) : (
      <span className="ml-1 text-violet-600 font-bold">↓</span>
    );
  };

  // Obsługa kliknięcia Enter в polu wyszukiwania
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSpadkiOper.length > 0) {
      const firstResult = filteredSpadkiOper[0];
      handleFirmaClick(firstResult.fir_kod_gr, firstResult.NAZ_SKR);
    }
  };

  // Функция для отображения иконки сортировки деталей
  const getDetailsSortIcon = (key: keyof FirmaDetailsType) => {
    if (detailsSortConfig.key !== key) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return detailsSortConfig.direction === "asc" ? (
      <span className="ml-1 text-violet-600 font-bold">↑</span>
    ) : (
      <span className="ml-1 text-violet-600 font-bold">↓</span>
    );
  };

  // Функция для форматирования чисел
  const formatNumber = (value: number, decimals: number = 0) => {
    return Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Функция для форматирования денежных значений
  const formatCurrency = (value: number) => {
    return Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="spinner-3d"></div>
          <p className="text-gray-400 font-bold text-sm tracking-wide uppercase animate-pulse">Loading overview...</p>
        </div>
      )}
      {!loading && (
        <div className="space-y-4">
          {/* Первая таблица - без скролла */}
          <div>
            <p className="bg-black/60 p-2 text-2xl font-bold text-center border border-b-0 border-gray-400 rounded-t-2xl leading-relaxed tracking-wide text-white">
              Revenue decline
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-400">
                    <th className="border-r border-gray-400 p-3 text-right font-bold text-gray-700">
                      Operator code
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac_4}
                    >
                      {getMonthName(4)}
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac_3}
                    >
                      {getMonthName(3)}
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac_2}
                    >
                      {getMonthName(2)}
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac_1}
                    >
                      {getMonthName(1)}
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac_0}
                    >
                      {getMonthName(0)}
                    </th>
                    <th
                      className="border-r border-gray-400 p-3 text-right font-bold text-gray-700"
                      title={monthLabels.miesiac}
                    >
                      {getMonthName(0)} (forecast)
                    </th>
                    <th className="border-r border-gray-400 p-3 text-right font-bold text-gray-700">
                      Summary
                    </th>
                    <th className="border-r border-gray-400 p-3 text-right font-bold text-gray-700">
                      Average
                    </th>
                    <th className="border-r border-gray-400 p-3 text-right font-bold text-gray-700">
                      Change vs. average
                    </th>
                    <th className="border-r border-gray-400 p-3 text-right font-bold text-gray-700">
                      Minimum
                    </th>
                    <th className="p-3 text-right font-bold text-gray-700">
                      Change vs. minimum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {spadki.map((r, idx) => (
                    <tr key={r.oper_kod} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50 transition-colors" : "bg-gray-50 hover:bg-gray-100 transition-colors"}>
                      <td className="border-r border-gray-300 p-3 text-right font-medium">
                        {r.oper_kod}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac_4)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac_3)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac_2)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac_1)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac_0)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.miesiac)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.podsumowanie)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right text-violet-600 font-semibold">
                        {formatNumber(r.srednia)}
                      </td>
                      <td className={`border-r border-gray-300 p-3 text-right font-bold ${r.do_sredniej < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatNumber(r.do_sredniej, 2)}
                      </td>
                      <td className="border-r border-gray-300 p-3 text-right">
                        {formatNumber(r.minimum)}
                      </td>
                      <td className={`p-3 text-right font-bold ${r.do_minimum < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatNumber(r.do_minimum, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Вторая таблица со скроллом, кликабельными строками и сортировкой */}
          <div>
            <div className="bg-black/60 p-2 px-10 border border-gray-400 rounded-t-2xl flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-2xl font-bold text-center leading-relaxed tracking-wide text-white">
                Customers: {user}
              </p>
              <div className="w-full md:w-80">
                <SearchInput
                  placeholder="Search companies by code or name..."
                  onKeyDown={handleSearchKeyDown}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-b">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                    <tr className="bg-gray-200">
                      <th
                        className="border-r border-gray-300 p-3 cursor-pointer hover:bg-gray-300 transition-colors text-left"
                        onClick={() => handleSort("NAZ_SKR")}
                      >
                        <div className="flex items-center justify-between">
                          Name {getSortIcon("NAZ_SKR")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("miesiac_4")}
                        title={monthLabels.miesiac_4}
                      >
                        <div className="flex items-center justify-end">
                          {getMonthName(4)} {getSortIcon("miesiac_4")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("miesiac_3")}
                        title={monthLabels.miesiac_3}
                      >
                        <div className="flex items-center justify-end">
                          {getMonthName(3)} {getSortIcon("miesiac_3")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("miesiac_2")}
                        title={monthLabels.miesiac_2}
                      >
                        <div className="flex items-center justify-end">
                          {getMonthName(2)} {getSortIcon("miesiac_2")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("miesiac_1")}
                        title={monthLabels.miesiac_1}
                      >
                        <div className="flex items-center justify-end">
                          {getMonthName(1)} {getSortIcon("miesiac_1")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("miesiac")}
                        title={monthLabels.miesiac}
                      >
                        <div className="flex items-center justify-end">
                          {getMonthName(0)} {getSortIcon("miesiac")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors font-bold"
                        onClick={() => handleSort("podsumowanie")}
                      >
                        <div className="flex items-center justify-end">
                          Total {getSortIcon("podsumowanie")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors font-bold"
                        onClick={() => handleSort("srednia")}
                      >
                        <div className="flex items-center justify-end">
                          Average {getSortIcon("srednia")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors font-bold"
                        onClick={() => handleSort("do_sredniej")}
                      >
                        <div className="flex items-center justify-end">
                          +/- Avg. {getSortIcon("do_sredniej")}
                        </div>
                      </th>
                      <th
                        className="border-r border-gray-300 p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => handleSort("minimum")}
                      >
                        <div className="flex items-center justify-end">
                          Min {getSortIcon("minimum")}
                        </div>
                      </th>
                      <th
                        className="p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors font-bold"
                        onClick={() => handleSort("do_minimum")}
                      >
                        <div className="flex items-center justify-end">
                          +/- Min {getSortIcon("do_minimum")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSpadkiOper.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-gray-500 bg-gray-50 italic">
                          No companies match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredSpadkiOper.map((r, index) => (
                        <tr
                          key={`${r.fir_kod_gr}-${index}`}
                          className={`cursor-pointer transition-all duration-200 ${selectedFirma?.fir_kod_gr === r.fir_kod_gr
                            ? "bg-violet-600 text-white shadow-inner"
                            : index % 2 === 0 ? "bg-white hover:bg-violet-50" : "bg-gray-50 hover:bg-violet-50"
                            }`}
                          onClick={() =>
                            handleFirmaClick(r.fir_kod_gr, r.NAZ_SKR)
                          }
                        >
                          <td className="border-r border-gray-300/50 p-3 text-left">
                            <div className="font-bold uppercase tracking-tight">{r.NAZ_SKR}</div>
                            <div className={`text-[10px] ${selectedFirma?.fir_kod_gr === r.fir_kod_gr ? 'text-violet-100' : 'text-gray-500'}`}>{r.fir_kod_gr}</div>
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right">
                            {formatNumber(r.miesiac_4)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right">
                            {formatNumber(r.miesiac_3)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right">
                            {formatNumber(r.miesiac_2)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right">
                            {formatNumber(r.miesiac_1)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right italic opacity-80">
                            {formatNumber(r.miesiac)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right font-semibold">
                            {formatNumber(r.podsumowanie)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right font-semibold">
                            {formatNumber(r.srednia)}
                          </td>
                          <td className={`border-r border-gray-300/50 p-3 text-right font-bold ${selectedFirma?.fir_kod_gr === r.fir_kod_gr ? 'text-white' : r.do_sredniej < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {formatNumber(r.do_sredniej, 2)}
                          </td>
                          <td className="border-r border-gray-300/50 p-3 text-right">
                            {formatNumber(r.minimum)}
                          </td>
                          <td className={`p-3 text-right font-bold ${selectedFirma?.fir_kod_gr === r.fir_kod_gr ? 'text-white' : r.do_minimum < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {formatNumber(r.do_minimum, 2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Карточка с деталями выбранной фирмы */}
          {detailsLoading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="spinner-3d scale-75"></div>
              <p className="text-violet-400 font-bold text-xs tracking-wide uppercase animate-pulse">Loading company details...</p>
            </div>
          )}

          {selectedFirma && !detailsLoading && (
            <div className="mt-8 border-2 border-violet-300 rounded-lg p-6 bg-violet-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-xl font-bold">
                  Company details: {selectedFirma.NAZ_SKR} (
                  {selectedFirma.fir_kod_gr})
                </h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <input
                      type="text"
                      placeholder="Search categories by code or name..."
                      value={detailsSearchTerm}
                      onChange={(e) => setDetailsSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-500 bg-white placeholder-violet-300 shadow-sm"
                    />
                    {detailsSearchTerm && (
                      <button
                        onClick={() => setDetailsSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedFirma(null)}
                    className="p-2.5 text-violet-400 hover:text-red-500 hover:rotate-90 transition-all font-bold text-xl"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Таблица с деталями по группам с сортировкой */}
              {firmaDetails.length > 0 && (
                <div className="overflow-clip rounded border border-gray-400">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 shadow-sm">
                      <tr className="bg-violet-100 text-violet-900">
                        <th
                          className="border-r border-violet-200 p-3 cursor-pointer hover:bg-violet-200 transition-colors text-left"
                          onClick={() => handleDetailsSort("grupa_kod")}
                        >
                          <div className="flex items-center justify-between">
                            Code {getDetailsSortIcon("grupa_kod")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 cursor-pointer hover:bg-violet-200 transition-colors text-left"
                          onClick={() => handleDetailsSort("GRUPA_NAZ")}
                        >
                          <div className="flex items-center justify-between">
                            Category {getDetailsSortIcon("GRUPA_NAZ")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors"
                          onClick={() => handleDetailsSort("miesiac_4")}
                          title={monthLabels.miesiac_4}
                        >
                          <div className="flex items-center justify-end">
                            {getMonthName(4)} {getDetailsSortIcon("miesiac_4")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors"
                          onClick={() => handleDetailsSort("miesiac_3")}
                          title={monthLabels.miesiac_3}
                        >
                          <div className="flex items-center justify-end">
                            {getMonthName(3)} {getDetailsSortIcon("miesiac_3")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors"
                          onClick={() => handleDetailsSort("miesiac_2")}
                          title={monthLabels.miesiac_2}
                        >
                          <div className="flex items-center justify-end">
                            {getMonthName(2)} {getDetailsSortIcon("miesiac_2")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors"
                          onClick={() => handleDetailsSort("miesiac_1")}
                          title={monthLabels.miesiac_1}
                        >
                          <div className="flex items-center justify-end">
                            {getMonthName(1)} {getDetailsSortIcon("miesiac_1")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors font-bold"
                          onClick={() => handleDetailsSort("miesiac")}
                          title={monthLabels.miesiac}
                        >
                          <div className="flex items-center justify-end">
                            {getMonthName(0)} {getDetailsSortIcon("miesiac")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors font-bold"
                          onClick={() => handleDetailsSort("podsumowanie")}
                        >
                          <div className="flex items-center justify-end">
                            Total {getDetailsSortIcon("podsumowanie")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors font-bold"
                          onClick={() => handleDetailsSort("srednia")}
                        >
                          <div className="flex items-center justify-end">
                            Average {getDetailsSortIcon("srednia")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors font-bold"
                          onClick={() => handleDetailsSort("do_sredniej")}
                        >
                          <div className="flex items-center justify-end">
                            +/- Avg. {getDetailsSortIcon("do_sredniej")}
                          </div>
                        </th>
                        <th
                          className="border-r border-violet-200 p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors"
                          onClick={() => handleDetailsSort("minimum")}
                        >
                          <div className="flex items-center justify-end">
                            Min {getDetailsSortIcon("minimum")}
                          </div>
                        </th>
                        <th
                          className="p-3 text-right cursor-pointer hover:bg-violet-200 transition-colors font-bold"
                          onClick={() => handleDetailsSort("do_minimum")}
                        >
                          <div className="flex items-center justify-end">
                            +/- Min {getDetailsSortIcon("do_minimum")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-100">
                      {sortedFirmaDetails
                        .filter(detail =>
                          detail.grupa_kod.toLowerCase().includes(detailsSearchTerm.toLowerCase()) ||
                          detail.GRUPA_NAZ.toLowerCase().includes(detailsSearchTerm.toLowerCase())
                        )
                        .length === 0 ? (
                        <tr>
                          <td colSpan={12} className="p-8 text-center text-violet-400 bg-white italic">
                            No categories match your search.
                          </td>
                        </tr>
                      ) : (
                        sortedFirmaDetails
                          .filter(detail =>
                            detail.grupa_kod.toLowerCase().includes(detailsSearchTerm.toLowerCase()) ||
                            detail.GRUPA_NAZ.toLowerCase().includes(detailsSearchTerm.toLowerCase())
                          )
                          .map((detail, idx) => (
                            <tr
                              key={`${detail.grupa_kod}-${idx}`}
                              className={`transition-colors duration-150 ${idx % 2 === 0 ? "bg-white hover:bg-violet-50/50" : "bg-violet-50/30 hover:bg-violet-50"}`}
                            >
                              <td className="border-r border-violet-100 p-3 text-left font-medium">
                                {detail.grupa_kod}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-left">
                                {detail.GRUPA_NAZ}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right">
                                {formatNumber(detail.miesiac_4 ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right">
                                {formatNumber(detail.miesiac_3 ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right">
                                {formatNumber(detail.miesiac_2 ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right">
                                {formatNumber(detail.miesiac_1 ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right italic opacity-80">
                                {formatNumber(detail.miesiac ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right font-semibold">
                                {formatNumber(detail.podsumowanie ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right font-semibold">
                                {formatNumber(detail.srednia ?? 0)}
                              </td>
                              <td className={`border-r border-violet-100 p-3 text-right font-bold ${(detail.do_sredniej ?? 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {formatCurrency(detail.do_sredniej ?? 0)}
                              </td>
                              <td className="border-r border-violet-100 p-3 text-right">
                                {formatNumber(detail.minimum ?? 0)}
                              </td>
                              <td className={`p-3 text-right font-bold ${(detail.do_minimum ?? 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {formatCurrency(detail.do_minimum ?? 0)}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
