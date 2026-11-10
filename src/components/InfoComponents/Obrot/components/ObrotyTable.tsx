import React, { Fragment } from "react";

type SubItem = {
    id: string;
    code: string;
    label?: string;
    obrot: number | string | null;
};

type ObrotyTableRowProps = {
    code: string;
    label?: string;
    obrot: number;
    isExpanded: boolean;
    isClickable: boolean;
    accentColor?: "blue" | "green";
    onToggle: () => void;
    subItems: SubItem[];
    isLoadingSubItems?: boolean;
    onCloseSubItems: (e: React.MouseEvent) => void;
    subLabel?: string;
    safeNumber: (v: any) => number;
    formatCurrency: (v: number) => string;
};

export const ObrotyTableRow = ({
    code,
    label,
    obrot,
    isExpanded,
    isClickable,
    accentColor = "blue",
    onToggle,
    subItems,
    isLoadingSubItems,
    onCloseSubItems,
    subLabel = "Details:",
    safeNumber,
    formatCurrency,
}: ObrotyTableRowProps) => {
    const accent =
        accentColor === "green"
            ? {
                row: "hover:bg-green-50/30",
                expanded: "bg-green-50/50",
                badge: "group-hover:bg-green-100 group-hover:text-green-700",
                chevron: isExpanded
                    ? "rotate-180 text-green-600"
                    : "text-gray-400 group-hover:text-green-400",
                label: "group-hover:text-green-900",
                sum: "text-green-700",
                btnText: "text-green-600 hover:text-green-800 bg-green-50",
                hint: "hover:bg-green-50/20",
            }
            : {
                row: "hover:bg-violet-50/30",
                expanded: "bg-violet-50/50",
                badge: "group-hover:bg-violet-100 group-hover:text-violet-700",
                chevron: isExpanded
                    ? "rotate-180 text-violet-600"
                    : "text-gray-400 group-hover:text-violet-400",
                label: "group-hover:text-violet-900",
                sum: "text-violet-700",
                btnText: "text-violet-600 hover:text-violet-800 bg-violet-50",
                hint: "hover:bg-violet-50/20",
            };

    return (
        <Fragment>
            <tr
                onClick={isClickable ? onToggle : undefined}
                className={`group transition-all duration-200 ${isClickable ? `cursor-pointer ${accent.row}` : ""} ${isExpanded ? accent.expanded : ""
                    }`}
            >
                <td className="p-4 text-center">
                    <div
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold transition-colors shadow-sm ${accent.badge}`}
                    >
                        {code}
                        {isClickable && (
                            <span
                                className={`ml-2 transition-transform duration-300 ${accent.chevron}`}
                            >
                                ▼
                            </span>
                        )}
                    </div>
                </td>
                <td className={`p-4 text-sm font-bold text-gray-800 transition-colors ${accent.label}`}>
                    {label ?? code}
                </td>
                <td className="p-4 text-right">
                    <div className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(obrot)}
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan={3} className="p-0 bg-gray-50/30">
                        <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                        {subLabel} {code}
                                    </div>
                                    <button
                                        onClick={onCloseSubItems}
                                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${accent.btnText}`}
                                    >
                                        Close
                                    </button>
                                </div>

                                {isLoadingSubItems ? (
                                    <div className="py-12 flex flex-col items-center gap-4">
                                        <div className="spinner-3d scale-75"></div>
                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide animate-pulse">
                                            Loading...
                                        </div>
                                    </div>
                                ) : subItems.length > 0 ? (
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="p-3 text-center text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Code
                                                </th>
                                                <th className="p-3 text-left text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Name / Description
                                                </th>
                                                <th className="p-3 text-right text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {subItems.map((sub) => (
                                                <tr
                                                    key={sub.id}
                                                    className={`transition-colors ${accent.hint}`}
                                                >
                                                    <td className="p-3 text-center text-xs font-bold text-gray-600">
                                                        {sub.code}
                                                    </td>
                                                    <td className="p-3 text-left text-xs font-bold text-gray-700">
                                                        {sub.label ?? sub.code}
                                                    </td>
                                                    <td className="p-3 text-right text-xs font-semibold text-gray-900 tabular-nums">
                                                        {formatCurrency(safeNumber(sub.obrot))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50/80 border-t border-gray-100">
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="p-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wide"
                                                >
                                                    Total:
                                                </td>
                                                <td
                                                    className={`p-3 text-right text-sm font-semibold underline decoration-2 underline-offset-4 tabular-nums ${accent.sum}`}
                                                >
                                                    {formatCurrency(
                                                        subItems.reduce(
                                                            (s, sub) => s + safeNumber(sub.obrot),
                                                            0
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="text-2xl mb-2 opacity-20">📄</div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                            No detailed data
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </Fragment>
    );
};

type ObrotyTableProps = {
    title: string;
    subtitle?: string;
    headerIcon?: React.ReactNode;
    accentColor?: "blue" | "green";
    rows: Array<{
        id: string;
        code: string;
        label?: string;
        obrot: number | string | null;
    }>;
    expandedCode: string | null;
    subItems: SubItem[];
    isLoadingSubItems?: boolean;
    onToggleRow: (code: string) => void;
    isClickable?: boolean;
    safeNumber: (v: any) => number;
    formatCurrency: (v: number) => string;
    totalLabel?: string;
};

export const ObrotyTable = ({
    title,
    subtitle,
    headerIcon,
    accentColor = "blue",
    rows,
    expandedCode,
    subItems,
    isLoadingSubItems,
    onToggleRow,
    isClickable = true,
    safeNumber,
    formatCurrency,
    totalLabel = "Total revenue:",
}: ObrotyTableProps) => {
    const total = rows.reduce((s, r) => s + safeNumber(r.obrot), 0);

    return (
        <div className="w-full max-w-6xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-violet-50 from-white to-gray-50/50">
                    <div className="flex items-center gap-3">
                        {headerIcon && (
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${accentColor === "green"
                                        ? "bg-green-50 text-green-600"
                                        : "bg-violet-50 text-violet-600"
                                    }`}
                            >
                                {headerIcon}
                            </div>
                        )}
                        <div>
                            {subtitle && (
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">
                                    {subtitle}
                                </div>
                            )}
                            <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                                {title}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto relative">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="sticky top-0 bg-gray-50/90 backdrop-blur-md z-20 shadow-sm border-b border-gray-200">
                                <th className="p-4 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                    Code
                                </th>
                                <th className="p-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                    Name
                                </th>
                                <th className="p-4 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                    Net revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rows.map((row) => (
                                <ObrotyTableRow
                                    key={row.id}
                                    code={row.code}
                                    label={row.label}
                                    obrot={safeNumber(row.obrot)}
                                    isExpanded={expandedCode === row.code}
                                    isClickable={isClickable}
                                    accentColor={accentColor}
                                    onToggle={() => onToggleRow(row.code)}
                                    subItems={expandedCode === row.code ? subItems : []}
                                    isLoadingSubItems={
                                        expandedCode === row.code ? isLoadingSubItems : false
                                    }
                                    onCloseSubItems={(e) => {
                                        e.stopPropagation();
                                        onToggleRow(row.code);
                                    }}
                                    subLabel="Subcategories for:"
                                    safeNumber={safeNumber}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-100 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <tr>
                                <td
                                    colSpan={2}
                                    className="p-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide"
                                >
                                    {totalLabel}
                                </td>
                                <td className="p-5 text-right text-xl font-semibold text-gray-900 tabular-nums">
                                    {formatCurrency(total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
