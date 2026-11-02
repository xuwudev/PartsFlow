type LoadingStateProps = {
    loading: boolean;
    isEmpty: boolean;
    emptyMessage?: string;
};

// Shows a spinner while loading, or an empty-state message when !loading && isEmpty
export const LoadingState = ({
    loading,
    isEmpty,
    emptyMessage = "No data for the selected filters",
}: LoadingStateProps) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <div className="spinner-3d"></div>
                <p className="text-gray-400 font-bold text-sm tracking-wide uppercase animate-pulse">
                    Loading data...
                </p>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <p className="text-center p-6 text-gray-500 font-semibold">
                {emptyMessage}
            </p>
        );
    }

    return null;
};

type ObrotySimpleTableProps = {
    /** Column header label for the period column */
    periodLabel: string;
    /** Accent color class for monetary values */
    accentClass?: string;
    /** Header gradient color class */
    headerClass?: string;
    /** Title shown in the table header bar */
    title: string;
    rows: Array<{ period: string; obrot: number }>;
};

// A compact table with a colored header bar, sticky thead and scrollable body.
// Used by both MonthObrotyInfo and DayObrotyInfo.
export const ObrotySimpleTable = ({
    periodLabel,
    accentClass = "text-violet-700",
    headerClass = "bg-violet-700",
    title,
    rows,
}: ObrotySimpleTableProps) => {
    return (
        <div className="flex flex-col h-[500px] w-full max-w-lg mx-auto">
            {/* Colored header bar */}
            <div
                className={`${headerClass} px-4 py-2 border-b border-black/20 rounded-t-xl shadow-md relative overflow-hidden`}
            >
                <div className="absolute inset-0 border-t border-white/10 pointer-events-none" />
                <p className="text-white font-semibold text-xs lg:text-sm tracking-wider uppercase drop-shadow-sm relative z-10 truncate">
                    {title}
                </p>
            </div>

            {/* Scrollable table body */}
            <div className="flex-1 overflow-y-auto no-scrollbar border-x border-b border-gray-300 rounded-b-xl shadow-sm bg-white">
                <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="bg-violet-50 from-gray-50 to-gray-100 text-gray-500 border-b border-gray-200 font-semibold uppercase text-[10px] tracking-wide">
                            <th className="px-4 py-3 text-left border-r border-gray-200/50">
                                {periodLabel}
                            </th>
                            <th className="px-4 py-3 text-right">Revenue (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((r, idx) => (
                            <tr
                                key={`${r.period}-${idx}`}
                                className="hover:bg-violet-50/50 transition-colors group"
                            >
                                <td className="px-4 py-2.5 text-gray-700 font-bold group-hover:text-violet-900 border-r border-gray-100/50">
                                    {r.period}
                                </td>
                                <td className={`px-4 py-2.5 text-right font-semibold ${accentClass}`}>
                                    {Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(r.obrot)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-10 bg-white border-t-2 border-gray-300">
                        <tr className="bg-gray-50 uppercase text-[10px] tracking-wide text-gray-500 font-semibold">
                            <td className="px-4 py-3 text-right border-r border-gray-200/50">
                                TOTAL
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold ${accentClass}`}>
                                {Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(rows.reduce((sum, r) => sum + (Number(r.obrot) || 0), 0))}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
