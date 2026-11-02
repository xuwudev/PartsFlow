import { useState, useMemo } from "react";
import { DisplayData } from "../hooks/useGroupObrotyData";

type GroupItem = {
    GRUPA_KOD: string;
    GRUPA_NAZ: string;
    PARENT_KOD?: string;
};

type GroupClientsTableProps = {
    clients: DisplayData[];
    selectedMonths: string[];
    selectedGroups: string[];
    groups: GroupItem[];
    isLoading: boolean;
    formatCurrency: (v: number) => string;
};

export const GroupClientsTable = ({
    clients,
    selectedMonths,
    selectedGroups,
    groups,
    isLoading,
    formatCurrency,
}: GroupClientsTableProps) => {
    const [search, setSearch] = useState("");

    // Resolve group labels for display in the header
    const groupLabels = useMemo(() => {
        if (selectedGroups.length === 0) return "All categories";
        return selectedGroups
            .map((code) => {
                const g = groups.find((x) => x.GRUPA_KOD === code);
                return g?.GRUPA_NAZ ? `${code} (${g.GRUPA_NAZ})` : code;
            })
            .join(", ");
    }, [selectedGroups, groups]);

    // Calculate total turnover across all clients for percentage calculation
    const totalGroupObrot = useMemo(() => {
        return clients.reduce((sum, c) => sum + (Number(c.obrot) || 0), 0);
    }, [clients]);

    // Sorted and filtered clients
    const filteredClients = useMemo(() => {
        const s = search.toLowerCase().trim();
        let list = clients;
        if (s) {
            list = list.filter(
                (c) =>
                    c.code.toLowerCase().includes(s) ||
                    (c.label && c.label.toLowerCase().includes(s))
            );
        }
        // Always ensure sorted from highest to lowest
        return [...list].sort((a, b) => (Number(b.obrot) || 0) - (Number(a.obrot) || 0));
    }, [clients, search]);

    const topClient = useMemo(() => {
        return clients.length > 0 ? clients[0] : null;
    }, [clients]);

    const sortedMonths = useMemo(() => {
        return [...selectedMonths].sort((a, b) => b.localeCompare(a));
    }, [selectedMonths]);

    const isMultiMonth = sortedMonths.length > 1;

    // Monthly sums for the footer
    const monthlySums = useMemo(() => {
        const sums: Record<string, number> = {};
        sortedMonths.forEach((m) => {
            sums[m] = filteredClients.reduce((acc, c) => {
                const val = c.monthlyData?.[m] || 0;
                return acc + (Number(val) || 0);
            }, 0);
        });
        return sums;
    }, [sortedMonths, filteredClients]);

    const filteredTotalObrot = useMemo(() => {
        return filteredClients.reduce((sum, c) => sum + (Number(c.obrot) || 0), 0);
    }, [filteredClients]);

    return (
        <section className="w-full max-w-6xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-violet-50 from-white to-gray-50/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                                <span className="text-xl">👥</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide leading-none mb-1">
                                    Account manager customer revenue
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                                    {groupLabels}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500 font-semibold">
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-bold">
                                        Period: {sortedMonths.join(", ")}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500 font-bold">
                                        {clients.length} {clients.length === 1 ? "customer" : "customers"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search input */}
                        <div className="w-full lg:w-72">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filter customers by code or name..."
                                    className="w-full px-3.5 py-2 pl-9 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all shadow-inner"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs pointer-events-none">
                                    🔍
                                </span>
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KPI mini-cards */}
                    {!isLoading && clients.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                                    Total category revenue
                                </span>
                                <span className="text-lg font-semibold text-emerald-900 tabular-nums mt-0.5">
                                    {formatCurrency(totalGroupObrot)}
                                </span>
                            </div>

                            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">
                                    Customer count
                                </span>
                                <span className="text-lg font-semibold text-violet-900 tabular-nums mt-0.5">
                                    {clients.length}
                                </span>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                                    Highest revenue (Top 1)
                                </span>
                                <span className="text-sm font-semibold text-amber-900 truncate mt-0.5">
                                    {topClient ? `${topClient.code} - ${topClient.label || topClient.code}` : "-"}
                                </span>
                                <span className="text-xs font-bold text-amber-700 tabular-nums">
                                    {topClient ? formatCurrency(Number(topClient.obrot) || 0) : "-"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-600 rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-semibold text-xs tracking-wide uppercase animate-pulse">
                            Loading customer revenue...
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredClients.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="text-3xl mb-2 opacity-30">👥</div>
                        <p className="text-sm font-bold text-gray-500">
                            {search
                                ? "No customers match your search"
                                : "No customer revenue for this category and period"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            None of your customers have revenue in this product category.
                        </p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && filteredClients.length > 0 && (
                    <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto relative">
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr className="sticky top-0 bg-gray-50/95 backdrop-blur-md z-20 shadow-xs border-b border-gray-200">
                                    <th className="p-3 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 w-12">
                                        No.
                                    </th>
                                    <th className="p-3 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 w-28">
                                        Customer code
                                    </th>
                                    <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">
                                        Customer name / Company
                                    </th>
                                    {isMultiMonth &&
                                        sortedMonths.map((m) => (
                                            <th
                                                key={m}
                                                className="p-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 tabular-nums"
                                            >
                                                {m}
                                            </th>
                                        ))}
                                    <th className="p-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">
                                        Total revenue
                                    </th>
                                    <th className="p-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 w-28">
                                        Share %
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredClients.map((client, idx) => {
                                    const clientObrot = Number(client.obrot) || 0;
                                    const sharePercent =
                                        totalGroupObrot > 0
                                            ? ((clientObrot / totalGroupObrot) * 100).toFixed(1)
                                            : "0.0";

                                    // Top 3 badges
                                    const isTop1 = idx === 0 && !search;
                                    const isTop2 = idx === 1 && !search;
                                    const isTop3 = idx === 2 && !search;

                                    return (
                                        <tr
                                            key={client.id || `${client.code}-${idx}`}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            {/* Lp */}
                                            <td className="p-3 text-center text-xs font-semibold text-gray-400 tabular-nums">
                                                {isTop1 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold shadow-xs">
                                                        1
                                                    </span>
                                                ) : isTop2 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold shadow-xs">
                                                        2
                                                    </span>
                                                ) : isTop3 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200/60 text-amber-900 text-[11px] font-semibold shadow-xs">
                                                        3
                                                    </span>
                                                ) : (
                                                    idx + 1
                                                )}
                                            </td>

                                            {/* Kod */}
                                            <td className="p-3 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors shadow-2xs">
                                                    {client.code}
                                                </span>
                                            </td>

                                            {/* Nazwa */}
                                            <td className="p-3 text-left">
                                                <div className="text-xs font-bold text-gray-800 group-hover:text-emerald-900 transition-colors">
                                                    {client.label || client.code}
                                                </div>
                                            </td>

                                            {/* Monthly columns */}
                                            {isMultiMonth &&
                                                sortedMonths.map((m) => {
                                                    const mObrot = client.monthlyData?.[m] || 0;
                                                    return (
                                                        <td
                                                            key={m}
                                                            className="p-3 text-right text-xs font-semibold text-gray-600 tabular-nums"
                                                        >
                                                            {mObrot > 0 ? (
                                                                formatCurrency(mObrot)
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                            {/* Obrót łączny */}
                                            <td className="p-3 text-right">
                                                <div className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors tabular-nums">
                                                    {formatCurrency(clientObrot)}
                                                </div>
                                            </td>

                                            {/* % udziału */}
                                            <td className="p-3 text-right">
                                                <div className="inline-flex items-center gap-1.5 justify-end">
                                                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{
                                                                width: `${Math.min(100, Math.max(2, Number(sharePercent)))}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-500 tabular-nums">
                                                        {sharePercent}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer */}
                            <tfoot className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                    >
                                        Total:
                                    </td>
                                    {isMultiMonth &&
                                        sortedMonths.map((m) => (
                                            <td
                                                key={m}
                                                className="p-4 text-right text-xs font-semibold text-gray-700 tabular-nums"
                                            >
                                                {formatCurrency(monthlySums[m] || 0)}
                                            </td>
                                        ))}
                                    <td className="p-4 text-right text-sm font-semibold text-emerald-700 tabular-nums">
                                        {formatCurrency(filteredTotalObrot)}
                                    </td>
                                    <td className="p-4 text-right text-xs font-semibold text-gray-400 tabular-nums">
                                        100%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};
