import { useEffect, useState, Fragment } from "react";
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
import { SearchInput } from "../ui/SearchInput";
import { Button } from "../ui/Button";
import { useTableData } from "../../hooks/useTableData";
import { apiClient } from "../../lib/api-client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type UserTypes = {
  FIR_KOD: string;
  NAZ_SKR: string;
  TELEFON1: string;
  ULICA: string;
  DOM: string;
  LOCAL: string;
  MIASTO_ADRES: string;
  MIASTO_ODB: string;
  ADRES: string;
  KOD_POCZ: string;
  TELEFON: string;
  E_MAIL: string;
  EMAIL_DODATKOWY: string;
  OBROT: number[];
  MIESIACE: string[];
  KOD_POCZ_ADR: string;
  LOKAL: string;
  NIP: string;
  NIP_CYFRY: string;
};

type Props = {
  showSearch: boolean;
  onShowObroty: (firKod: string) => void;
  initialFirKod?: string | null;
};

export const CustomerInfo = ({ showSearch, onShowObroty, initialFirKod }: Props) => {
  const [userData, setUserData] = useState<UserTypes[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    search,
    setSearch,
    sortKey,
    sortDir,
    handleSort,
    filteredAndSortedData,
  } = useTableData<UserTypes>(userData, { initialSortKey: "FIR_KOD" });

  // === FETCH DATA ===
  useEffect(() => {
    apiClient<any>("/api/kontrahentData")
      .then((data) => {
        setUserData(Array.isArray(data) ? data : (data.data ?? []));
      })
      .catch((err) => {
        console.error("fetch error", err);
        setUserData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // === HANDLE INITIAL FIR_KOD ===
  useEffect(() => {
    if (initialFirKod) {
      setSearch(initialFirKod);
      setExpandedRow(initialFirKod);
    }
  }, [initialFirKod, setSearch]);

  const toggleRow = (firKod: string) => {
    setExpandedRow((prev) => (prev === firKod ? null : firKod));
  };

  const chartConfig = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Customer revenue" },
    },
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }


  // === TABLE ROWS ===
  const tableRows = filteredAndSortedData.map((row, index) => {
    const chartData = {
      labels: row.MIESIACE,
      datasets: [
        {
          type: "bar" as const,
          label: "Customer revenue",
          data: row.OBROT,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };



    return (
      <Fragment key={row.FIR_KOD}>
        {/* MAIN ROW */}
        <tr
          className={
            index % 2 === 0
              ? "bg-violet-200 cursor-pointer"
              : "bg-white cursor-pointer"
          }
          onClick={() => toggleRow(row.FIR_KOD)}
        >
          <td>{row.FIR_KOD}</td>
          <td>{row.NAZ_SKR}</td>
          <td>{row.TELEFON1}</td>
          <td>{row.ADRES}</td>
          <td>{row.KOD_POCZ}</td>
          <td>{row.MIASTO_ODB}</td>
        </tr>

        {/* EXPANDED ROW */}
        {expandedRow === row.FIR_KOD && (
          <tr className={index % 2 === 0 ? "bg-violet-200" : "bg-white"}>
            <td colSpan={6}>
              <h1 className="font-bold italic text-center mb-2">
                Customer details
              </h1>
              <div className="flex flex-row gap-4 w-full justify-around">
                {/* LEFT INFO */}
                <div className="text-left p-2">
                  <p>
                    <strong>Delivery address:</strong>
                    <br />
                    {row.ULICA} {row.DOM} {row.LOKAL}
                    <br />
                    {row.KOD_POCZ_ADR} {row.MIASTO_ADRES}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {row.E_MAIL}
                  </p>
                  <p>
                    <strong>Other:</strong> {row.EMAIL_DODATKOWY}
                  </p>
                </div>

                {/* TABLE OF MONTHS */}
                <div className="align-middle p-2">
                  <table className="table-auto w-full bg-white border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Months
                        </th>
                        <th className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {row.MIESIACE.map((m, i) => ({
                        month: m,
                        obrot: row.OBROT[i],
                      }))
                        .reverse()
                        .map((item, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 p-2 text-xs text-gray-900">
                              {item.month}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-right text-gray-900">
                              {Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(item.obrot)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* CHART */}
                <div className="p-2">
                  <Bar data={chartData} options={chartConfig} />
                </div>
              </div>
              <Button
                variant="outline"
                className="m-2 w-1/2"
                onClick={() => onShowObroty(row.FIR_KOD)}
              >
                Revenue details
              </Button>
            </td>
          </tr>
        )}
      </Fragment>
    );
  });

  return (
    <div className="w-full p-2">
      {showSearch && (
        <div className="mb-3">
          <SearchInput
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
      )}

      <div className="rounded-2xl no-scrollbar max-h-[calc(100vh-120px)] overflow-y-auto">
        <table className="table-auto border-collapse text-center w-full">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {[
                ["FIR_KOD", "Customer code"],
                ["NAZ_SKR", "NAZ_SKR"],
                ["TELEFON", "Phone"],
                ["ULICA", "Street"],
                ["KOD_POCZ", "Postal code"],
                ["MIASTO_ODB", "City"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="bg-gray-200 p-2 cursor-pointer select-none"
                  onClick={() => handleSort(key as keyof UserTypes)}
                >
                  {label}
                  <span className="ml-1">
                    {sortKey === key && (sortDir === "asc" ? "▲" : "▼")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    </div>
  );
};
