import { useState, useEffect, useCallback } from "react";
import { SearchInput } from "../ui/SearchInput";
import { Modal } from "../ui/Modal";
import { apiClient } from "../../lib/api-client";

interface KsoPlatRow {
    fir_kod: string;
    naz_skr: string;
    oper_kod: string;
    dnin: number | string;
    srednia_dnin?: number | string;
    naleznosci: number | string;
    zobowiazania: number | string;
    saldo: number | string;
    naleznosci_spoz?: number | string;
    zobowiazania_spoz?: number | string;
    dniz?: number | string;
    limit_dni?: number | string;
    DOK_NR?: string;
    DOK_DATA?: string;
    DOK_TYP?: string;
    DOK_ID?: string;
    WAL_KOD?: string;
    WAR_WN?: string;
    WAR_MA?: string;
    DATAT?: string;
    DOK_DOST?: string;
}

interface KsoPlatResponse {
    data: KsoPlatRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime()) || d.getFullYear() < 1900) return "—";
        return d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return "—";
    }
};

const fmt = (val: string | number) => {
    const n = parseFloat(String(val));
    if (isNaN(n) || n === 0) return null;
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const diffDays = (d1Val: string | Date, d2Val: string | Date) => {
    if (!d1Val || !d2Val) return null;
    const d1 = new Date(d1Val).getTime();
    const d2 = new Date(d2Val).getTime();
    if (isNaN(d1) || isNaN(d2)) return null;
    return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
};

const AmountCell = ({ value, color }: { value: string; color: "green" | "red" | "black" }) => {
    const formatted = fmt(value);
    if (!formatted) return <span className="text-gray-300 tabular-nums">—</span>;
    const colorClass = color === "green" ? "text-green-700" : color === "red" ? "text-red-600" : "text-slate-800";
    return (
        <span className={`tabular-nums font-semibold ${colorClass}`}>
            {formatted}
        </span>
    );
};

interface KsoPlatInfoProps {
    onNavigate?: (tab: string, filters?: { firKod?: string }) => void;
    initialFirKod?: string | null;
}

export const KsoPlatInfo = ({ initialFirKod }: KsoPlatInfoProps) => {
    const [data, setData] = useState<KsoPlatRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const LIMIT = 100;

    // Filters
    const [search, setSearch] = useState(initialFirKod || "");

    // Sorting
    const [sortBy, setSortBy] = useState("dnin");
    const [sortDesc, setSortDesc] = useState(true);

    // Details Modal State
    const [selectedFirKod, setSelectedFirKod] = useState<string | null>(null);
    const [details, setDetails] = useState<{ zobowiazania: KsoPlatRow[], naleznosci: KsoPlatRow[] } | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [modalActiveTab, setModalActiveTab] = useState<'zobowiazania' | 'naleznosci'>('zobowiazania');

    // Modal Sorting
    const [modalSortBy, setModalSortBy] = useState("DIFF_DAYS");
    const [modalSortDesc, setModalSortDesc] = useState(true);

    const fetchData = useCallback(async (currentPage: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(LIMIT),
                ...(search && { search }),
                sort_by: sortBy,
                sort_desc: String(sortDesc)
            });
            const json = await apiClient<KsoPlatResponse>(`/api/kso-plat?${params}`);
            setData(json.data);
            setTotal(json.total);
            setTotalPages(json.totalPages);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, sortBy, sortDesc]);

    const fetchCustomerDetails = async (code: string) => {
        setDetailsLoading(true);
        setSelectedFirKod(code);
        setModalSortBy("DIFF_DAYS");
        setModalSortDesc(true);
        setModalActiveTab('zobowiazania');
        try {
            const json = await apiClient<any>(`/api/kso-plat/details/${code}`);
            setDetails(json);
        } catch (e) {
            console.error(e);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchData(1); }, [search, sortBy, sortDesc]);
    useEffect(() => { fetchData(page); }, [page]);

    useEffect(() => {
        if (initialFirKod) {
            setSearch(initialFirKod);
            fetchCustomerDetails(initialFirKod);
        }
    }, [initialFirKod]);

    const clearFilters = () => {
        setSearch("");
        setSortBy("dnin"); setSortDesc(true);
    };
    const isAnyFilter = search || sortBy !== "dnin" || !sortDesc;

    // Sort helpers
    const handleSort = (colName: string) => {
        if (sortBy === colName) {
            setSortDesc(!sortDesc);
        } else {
            setSortBy(colName);
            setSortDesc(true); // Default to desc for summary columns (money/days)
        }
    };

    const SortIcon = ({ colName }: { colName: string }) => {
        if (sortBy !== colName) return <span className="text-violet-800 inline-block w-2 text-center opacity-0 group-hover:opacity-30 transition-opacity">↕</span>;
        return <span className="inline-block w-2 text-center text-violet-500 font-semibold">{sortDesc ? "↓" : "↑"}</span>;
    };

    const Th = ({ colName, label, className = "", rowSpan }: { colName: string, label: string, className?: string, rowSpan?: number }) => (
        <th rowSpan={rowSpan} onClick={() => handleSort(colName)}
            className={`px-3 py-3 text-left font-semibold text-[10px] text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group select-none ${className} ${sortBy === colName ? "bg-violet-50/50 text-violet-600" : ""}`}>
            <div className="flex items-center gap-1">
                {label} <SortIcon colName={colName} />
            </div>
        </th>
    );


    return (
        <section className="p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-violet-200 bg-violet-50 from-violet-50 to-violet-100 text-violet-700 shadow-sm">
                    Records: {total.toLocaleString("en-US")}
                </span>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-75">
                    <SearchInput
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onClear={() => setSearch("")}
                        placeholder="Search by company code or name..."
                    />
                </div>



                {isAnyFilter && (
                    <button onClick={clearFilters}
                        className="py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">No data matches your filters</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-violet-50 from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    {/* Document identifiers */}
                                    <Th colName="fir_kod" label="Company" />
                                    <Th colName="naz_skr" label="Name" />
                                    <Th colName="limit_dni" label="Limit (days)" className="text-center" />
                                    <Th colName="dnin" label="Days (receivable)" className="text-center" />
                                    <Th colName="srednia_dnin" label="Avg. receivable days" className="text-center" />
                                    <Th colName="naleznosci_spoz" label="Overdue receivables" className="text-right" />
                                    <Th colName="naleznosci" label="Receivables" className="text-right" />
                                    <Th colName="dniz" label="Days (payable)" className="text-center" />
                                    <Th colName="zobowiazania_spoz" label="Overdue payables" className="text-right" />
                                    <Th colName="zobowiazania" label="Payables" className="text-right" />
                                    <Th colName="saldo" label="Balance" className="text-right" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map((row, idx) => (
                                    <tr
                                        key={`${row.fir_kod}-${idx}`}
                                        className={`hover:bg-violet-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                                    >
                                        <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fetchCustomerDetails(row.fir_kod);
                                                }}
                                                className="text-violet-600 hover:text-violet-800 hover:underline cursor-pointer transition-colors"
                                            >
                                                {row.fir_kod}
                                            </button>
                                        </td>
                                        <td className="px-3 py-3 text-gray-700 font-medium truncate max-w-37.5" title={row.naz_skr}>{row.naz_skr}</td>
                                        <td className="px-3 py-3 text-center text-gray-400 tabular-nums">
                                            {row.limit_dni || 0}
                                        </td>
                                        <td className="px-3 py-3 text-center font-bold tabular-nums">
                                            <span className={Number(row.dnin || 0) > 0 ? "text-red-600" : "text-green-600"}>
                                                {row.dnin || 0}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center text-violet-600/70 tabular-nums font-medium">
                                            {row.srednia_dnin || 0}
                                        </td>
                                        <td className="px-3 py-3 text-right group-hover:bg-red-50/30 transition-colors">
                                            <AmountCell value={String(row.naleznosci_spoz)} color="red" />
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <AmountCell value={String(row.naleznosci)} color="green" />
                                        </td>
                                        <td className="px-3 py-3 text-center font-bold tabular-nums">
                                            <span className={Number(row.dniz || 0) > 0 ? "text-red-500" : "text-slate-400"}>
                                                {row.dniz || 0}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right group-hover:bg-red-50/30 transition-colors">
                                            <AmountCell value={String(row.zobowiazania_spoz)} color="red" />
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <AmountCell value={String(row.zobowiazania)} color="red" />
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-slate-900 tabular-nums bg-gray-50/30">
                                            {fmt(row.saldo) || "0,00"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong> &nbsp;·&nbsp; {total.toLocaleString("en-US")} categories
                    </span>
                    <div className="flex gap-1.5">
                        <button onClick={() => setPage(1)} disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-all">«</button>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-all">‹</button>

                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                            const p = start + i;
                            return p <= totalPages ? (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${p === page
                                        ? "bg-violet-600 text-white border-violet-600 shadow"
                                        : "border-gray-300 hover:bg-gray-100"}`}>{p}</button>
                            ) : null;
                        })}

                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-all">›</button>
                        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-all">»</button>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedFirKod}
                onClose={() => setSelectedFirKod(null)}
                title={`Company details: ${selectedFirKod || ''}`}
                maxWidth="5xl"
            >
                <div className="flex flex-col h-[70vh]">
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-4 self-start">
                        <button
                            onClick={() => setModalActiveTab('zobowiazania')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${modalActiveTab === 'zobowiazania' ? "bg-white text-red-600 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Payables
                        </button>
                        <button
                            onClick={() => setModalActiveTab('naleznosci')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${modalActiveTab === 'naleznosci' ? "bg-white text-green-600 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Receivables
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {detailsLoading ? (
                            <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" /></div>
                        ) : details ? (() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const activeRows = (modalActiveTab === 'zobowiazania' ? details.zobowiazania : details.naleznosci).map(r => ({
                                ...r,
                                DIFF_DAYS: diffDays(today, r.DATAT || "") || 0
                            }));

                            const handleModalSort = (colName: string) => {
                                if (modalSortBy === colName) {
                                    setModalSortDesc(!modalSortDesc);
                                } else {
                                    setModalSortBy(colName);
                                    setModalSortDesc(true);
                                }
                            };

                            const sortedRows = [...activeRows].sort((a: any, b: any) => {
                                let valA: any = a[modalSortBy] ?? "";
                                let valB: any = b[modalSortBy] ?? "";

                                if (modalSortBy === 'WAR_WN' || modalSortBy === 'WAR_MA' || modalSortBy === 'DIFF_DAYS') {
                                    valA = Number(valA);
                                    valB = Number(valB);
                                } else if (modalSortBy === 'DOK_DATA' || modalSortBy === 'DATAT') {
                                    valA = new Date(valA).getTime();
                                    valB = new Date(valB).getTime();
                                } else {
                                    valA = String(valA).toLowerCase();
                                    valB = String(valB).toLowerCase();
                                }

                                if (valA < valB) return modalSortDesc ? 1 : -1;
                                if (valA > valB) return modalSortDesc ? -1 : 1;
                                return 0;
                            });

                            return (
                                <>
                                    <div className="py-1 flex justify-end shrink-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Records: {sortedRows.length}
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <DetailTable
                                            rows={sortedRows}
                                            sortBy={modalSortBy}
                                            sortDesc={modalSortDesc}
                                            onSort={handleModalSort}
                                        />
                                    </div>
                                </>
                            );
                        })() : (
                            <p className="text-center text-gray-500 py-10">No data to display</p>
                        )}
                    </div>
                </div>
            </Modal>
        </section>
    );
};

// --- Helper Components ---

const DetailTable = ({ rows, sortBy, sortDesc, onSort }: { rows: KsoPlatRow[], sortBy: string, sortDesc: boolean, onSort: (col: string) => void }) => {
    if (rows.length === 0) {
        return <div className="p-4 bg-gray-50 rounded-lg text-gray-400 text-sm text-center">No records</div>;
    }

    const Th = ({ col, label, align = "left" }: { col: string, label: string, align?: "left" | "right" | "center" }) => {
        const isActive = sortBy === col;
        return (
            <th className={`px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors text-${align} group ${isActive ? 'text-violet-600 bg-violet-50/50' : ''}`} onClick={() => onSort(col)}>
                <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
                    {label}
                    <span className={`inline-block w-2 text-center text-[10px] ${isActive ? 'opacity-100 text-violet-500' : 'opacity-0 group-hover:opacity-30'}`}>
                        {isActive && !sortDesc ? "↑" : "↓"}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                        <Th col="DOK_NR" label="Document no." />
                        <Th col="DOK_DATA" label="Document date" />
                        <Th col="DIFF_DAYS" label="Days" align="center" />
                        <Th col="DOK_ID" label="ID" />
                        <Th col="WAL_KOD" label="Currency" />
                        <Th col="WAR_WN" label="Debit" align="right" />
                        <Th col="WAR_MA" label="Credit" align="right" />
                        <Th col="DATAT" label="Due date" />
                        <Th col="DOK_DOST" label="Supplier" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-violet-50/30 transition-colors group">
                            <td className="px-4 py-2.5 font-medium text-slate-700">{r.DOK_NR ?? ""}</td>
                            <td className="px-4 py-2.5 tabular-nums text-gray-600">{formatDate(r.DOK_DATA ?? "")}</td>
                            <td className="px-4 py-2.5 text-center font-bold tabular-nums">
                                <span className={(r as any).DIFF_DAYS > 0 ? "text-red-600" : "text-green-600"}>
                                    {(r as any).DIFF_DAYS || 0}
                                </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">{r.DOK_ID ?? ""}</td>
                            <td className="px-4 py-2.5 font-bold text-violet-600/70">{r.WAL_KOD ?? ""}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums"><AmountCell value={r.WAR_WN ?? "0"} color="black" /></td>
                            <td className="px-4 py-2.5 text-right tabular-nums"><AmountCell value={r.WAR_MA ?? "0"} color="black" /></td>
                            <td className="px-4 py-2.5 tabular-nums text-violet-700">{formatDate(r.DATAT ?? "")}</td>
                            <td className="px-4 py-2.5 max-w-50 truncate text-gray-500" title={r.DOK_DOST ?? ""}>{r.DOK_DOST ?? ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

