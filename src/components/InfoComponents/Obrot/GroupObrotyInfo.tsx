import { Pie, Bar } from "react-chartjs-2";
import { ObrotyTable } from "./components/ObrotyTable";
import { FilterPanel, FilterColumn } from "./components/FilterPanel";
import { GroupClientsTable } from "./components/GroupClientsTable";
import { useGroupObrotyData, safeNumber } from "./hooks/useGroupObrotyData";
import { getPieChartOptions, getBarChartOptions } from "./components/chartConfigs";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const GroupObrotyInfo = () => {
    const {
        isFilterOpen, setIsFilterOpen,
        monthSearch, setMonthSearch,
        firSearch, setFirSearch,
        groupSearch, setGroupSearch,
        firKods, groups,
        selectedMonths, setSelectedMonths,
        selectedFirKods, setSelectedFirKods,
        selectedGroups, setSelectedGroups,
        filteredMonths, filteredFirKods, filteredGroups,
        isLoading, isClientsLoading,
        parentData, displayedParentData,
        overallData, displayedOverallData,
        overallGrupaData, clientsData,
        filteredGrupaData,
        overallActiveParent, filteredActiveParent,
        selectedSubgroup, setSelectedSubgroup,
        showOverallChart, showOverallTable, showFilteredTable,
        hasSelectedMonths, hasSelectedFirKods,
        overallPieChartData, overallBarChartData, filteredPieChartData,
        totalObrot,
        toggleSelection, clearSelection, toggleParent,
    } = useGroupObrotyData();

    // Chart click handler
    const handleChartClick = (_event: any, elements: any, chart: any) => {
        if (!elements.length) return;
        const clickedLabel = chart.data.labels?.[elements[0].index] as string;

        if (showOverallChart) {
            if (overallActiveParent) {
                const clickedSubgroup = overallGrupaData.find(item => item.code === clickedLabel || item.label === clickedLabel);
                if (clickedSubgroup) {
                    setSelectedSubgroup(clickedSubgroup.code);
                }
            } else {
                const clickedItem = overallData.find(item => item.code === clickedLabel || item.label === clickedLabel);
                if (clickedItem) {
                    toggleParent(clickedItem.code, 'main');
                }
            }
        } else if (hasSelectedFirKods) {
            if (!filteredActiveParent) {
                const clickedItem = parentData.find(item => item.code === clickedLabel || item.label === clickedLabel);
                if (clickedItem) {
                    toggleParent(clickedItem.code, 'filtered');
                }
            }
        }
    };

    const pieOptions = getPieChartOptions(handleChartClick);
    const barOptions = getBarChartOptions(handleChartClick);

    // Return to subgroups logic
    const handleBack = () => {
        if (selectedSubgroup) {
            setSelectedSubgroup(null);
        } else if (overallActiveParent) {
            toggleParent(overallActiveParent, 'main');
        } else if (filteredActiveParent) {
            toggleParent(filteredActiveParent, 'filtered');
        }
    };

    return (
        <section className="w-full p-4 md:p-6">
            <header className="mb-5">
                <p className="eyebrow">SALES ANALYTICS · DEMO DATA</p>
                <h1 className="text-2xl font-semibold tracking-tight text-violet-950">Revenue by category</h1>
                <p className="text-sm text-gray-500 mt-2">Explore your product mix, compare customers and drill into the details.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="rounded-xl border border-violet-100 bg-white p-5"><p className="text-xs text-gray-500 mb-2">Selected revenue</p><strong className="text-2xl font-semibold text-violet-800">{isLoading ? "…" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalObrot)}</strong></div>
                <div className="rounded-xl border border-violet-100 bg-white p-5"><p className="text-xs text-gray-500 mb-2">Reporting period</p><strong className="text-lg font-semibold text-violet-950">{selectedMonths.length === 1 ? selectedMonths[0] : `${selectedMonths.length} months selected`}</strong></div>
                <div className="rounded-xl border border-violet-100 bg-white p-5"><p className="text-xs text-gray-500 mb-2">Customer scope</p><strong className="text-lg font-semibold text-violet-950">{selectedFirKods.length ? `${selectedFirKods.length} selected ${selectedFirKods.length === 1 ? "customer" : "customers"}` : `All ${firKods.length} customers`}</strong></div>
            </div>
            <div className="flex flex-col w-full items-center mt-2">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 border uppercase tracking-[0.2em] shadow-lg active:scale-95 ${isFilterOpen
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50'
                        }`}
                >
                    {isFilterOpen ? 'Close filters' : 'Open filters'}
                </button>

                {isFilterOpen && (
                    <FilterPanel>
                        <FilterColumn
                            title="Months"
                            placeholder="Search months..."
                            searchValue={monthSearch}
                            onSearchChange={setMonthSearch}
                            onToggle={(val) => toggleSelection(val, setSelectedMonths)}
                            onClear={() => clearSelection(setMonthSearch, setSelectedMonths)}
                            tags={selectedMonths.map(m => ({ value: m, label: m }))}
                            items={filteredMonths.map(m => ({ value: m, label: m }))}
                        />
                        <FilterColumn
                            title="Companies"
                            placeholder="Search companies..."
                            searchValue={firSearch}
                            onSearchChange={setFirSearch}
                            onToggle={(val) => toggleSelection(val, setSelectedFirKods)}
                            onClear={() => clearSelection(setFirSearch, setSelectedFirKods)}
                            tags={selectedFirKods.map(code => {
                                const f = firKods.find(x => x.fir_kod === code);
                                return { value: code, label: f ? f.label : code };
                            })}
                            items={filteredFirKods.map(f => ({ value: f.fir_kod, label: f.label }))}
                        />
                        <FilterColumn
                            title="Categories"
                            placeholder="Search categories..."
                            searchValue={groupSearch}
                            onSearchChange={setGroupSearch}
                            onToggle={(val) => toggleSelection(val, setSelectedGroups)}
                            onClear={() => clearSelection(setGroupSearch, setSelectedGroups)}
                            tags={selectedGroups.map(code => {
                                const g = groups.find(x => x.GRUPA_KOD === code);
                                return { value: code, label: g ? (g.GRUPA_NAZ ? `${g.GRUPA_KOD} - ${g.GRUPA_NAZ}` : g.GRUPA_KOD) : code };
                            })}
                            items={filteredGroups.map(g => ({
                                value: g.GRUPA_KOD,
                                label: g.GRUPA_NAZ ? `${g.GRUPA_KOD} - ${g.GRUPA_NAZ}` : g.GRUPA_KOD
                            }))}
                        />
                    </FilterPanel>
                )}

                {/* CHARTS SECTION */}
                <div className="w-full grid grid-cols-1 gap-8 mt-8 mb-12 px-4 max-w-6xl mx-auto">
                    {/* OVERALL CHARTS */}
                    {showOverallChart && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="p-6 border-b border-gray-100 bg-violet-50 from-white to-gray-50/50 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">Category overview</h3>
                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Summary for all companies</div>
                                </div>
                                {(selectedSubgroup || overallActiveParent) && (
                                    <button
                                        onClick={handleBack}
                                        className="text-[10px] font-semibold text-green-600 hover:text-green-800 uppercase tracking-wide flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg transition-colors border border-green-100 shadow-sm"
                                    >
                                        ← Back
                                    </button>
                                )}
                            </div>
                            <div className="relative h-[360px] p-6 flex items-center justify-center">
                                {overallPieChartData && <Pie data={overallPieChartData as any} options={pieOptions as any} />}
                                {overallBarChartData && <Bar data={overallBarChartData as any} options={barOptions as any} />}
                                {!overallPieChartData && !overallBarChartData && (
                                    <div className="text-gray-300 text-center">
                                        <div className="text-4xl mb-4">📈</div>
                                        <p className="font-bold uppercase tracking-wide text-xs">No chart data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FILTERED CHARTS */}
                    {hasSelectedFirKods && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="p-6 border-b border-gray-100 bg-violet-50 from-white to-gray-50/50 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">Selected company analysis</h3>
                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Detailed analysis for selected filters</div>
                                </div>
                                {filteredActiveParent && (
                                    <button
                                        onClick={handleBack}
                                        className="text-[10px] font-semibold text-violet-600 hover:text-violet-800 uppercase tracking-wide flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg transition-colors border border-violet-100 shadow-sm"
                                    >
                                        ← Back
                                    </button>
                                )}
                            </div>
                            <div className="relative h-[360px] p-6 flex items-center justify-center">
                                {filteredPieChartData ? (
                                    <Pie data={filteredPieChartData as any} options={pieOptions as any} />
                                ) : (
                                    <div className="text-gray-300 text-center">
                                        <div className="text-4xl mb-4">📈</div>
                                        <p className="font-bold uppercase tracking-wide text-xs">No data for selected companies</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-green-600 rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-semibold text-xs tracking-wide uppercase animate-pulse">Loading data...</p>
                    </div>
                )}

                {!isLoading && showOverallTable && (
                    <ObrotyTable
                        rows={displayedOverallData}
                        subItems={overallGrupaData}
                        expandedCode={overallActiveParent}
                        onToggleRow={(code: string) => toggleParent(code, 'main')}
                        accentColor="green"
                        title="Revenue overview (all companies)"
                        totalLabel="Overall total:"
                        isClickable={!hasSelectedFirKods}
                        safeNumber={safeNumber}
                        formatCurrency={(n) => Intl.NumberFormat("en-US", {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(n)}
                    />
                )}

                {!isLoading && showFilteredTable && (
                    <ObrotyTable
                        rows={displayedParentData}
                        subItems={filteredGrupaData}
                        expandedCode={filteredActiveParent}
                        onToggleRow={(code: string) => toggleParent(code, 'filtered')}
                        accentColor="blue"
                        title="Selected company summary"
                        totalLabel="Selected total:"
                        isClickable={true}
                        safeNumber={safeNumber}
                        formatCurrency={(n) => Intl.NumberFormat("en-US", {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(n)}
                    />
                )}

                {/* CLIENTS TURNOVER ON SELECTED GROUP TABLE */}
                {(selectedGroups.length > 0 || selectedSubgroup) && (
                    <GroupClientsTable
                        clients={clientsData}
                        selectedMonths={selectedMonths}
                        selectedGroups={selectedGroups.length > 0 ? selectedGroups : (selectedSubgroup ? [selectedSubgroup] : [])}
                        groups={groups}
                        isLoading={isClientsLoading}
                        formatCurrency={(n) => Intl.NumberFormat("en-US", {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(n)}
                    />
                )}

                {/* EMPTY STATE */}
                {!isLoading && hasSelectedMonths && !showOverallTable && !showFilteredTable && (
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-4xl mb-4">📊</div>
                        <p className="text-lg">No data to display</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {hasSelectedFirKods
                                ? "No data for selected months and companies"
                                : "No data for selected months"}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};
