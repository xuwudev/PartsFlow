import { useState, useEffect, useMemo, useCallback } from "react";
const generateColors = (count: number) => Array.from({ length: count }, (_, index) => ["#7959ab", "#aa90d4", "#c4b3e4", "#786b95", "#b2aac5", "#ddd3ef"][index % 6]);

export type FirKod = {
    fir_kod: string;
    naz_skr: string;
    label: string;
};

export type GroupItem = {
    GRUPA_KOD: string;
    GRUPA_NAZ: string;
    PARENT_KOD?: string;
};

export type DisplayData = {
    id: string;
    code: string;
    type: 'parent' | 'grupa' | 'client';
    obrot: number;
    monthlyData: Record<string, number>;
    label?: string;
};

// Helper for safe number conversion
export const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

export const useGroupObrotyData = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [monthSearch, setMonthSearch] = useState("");
    const [firSearch, setFirSearch] = useState("");
    const [groupSearch, setGroupSearch] = useState("");
    const [months, setMonths] = useState<string[]>([]);
    const [firKods, setFirKods] = useState<FirKod[]>([]);
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedFirKods, setSelectedFirKods] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isClientsLoading, setIsClientsLoading] = useState(false);

    // Data states
    const [parentData, setParentData] = useState<DisplayData[]>([]);
    const [clientsData, setClientsData] = useState<DisplayData[]>([]);

    const [overallData, setOverallData] = useState<DisplayData[]>([]);
    const [overallGrupaData, setOverallGrupaData] = useState<DisplayData[]>([]);
    const [overallActiveParent, setOverallActiveParent] = useState<string | null>(null);
    const [selectedSubgroup, setSelectedSubgroup] = useState<string | null>(null);

    const [filteredGrupaData, setFilteredGrupaData] = useState<DisplayData[]>([]);
    const [filteredClientsData, setFilteredClientsData] = useState<DisplayData[]>([]);
    const [filteredActiveParent, setFilteredActiveParent] = useState<string | null>(null);
    const [filteredSelectedSubgroup, setFilteredSelectedSubgroup] = useState<string | null>(null);

    // Derived states
    const hasSelectedMonths = selectedMonths.length > 0;
    const hasSelectedFirKods = selectedFirKods.length > 0;
    const showOverallChart = hasSelectedMonths && !hasSelectedFirKods;
    const showOverallTable = hasSelectedMonths && !hasSelectedFirKods && overallData.length > 0;
    const showFilteredTable = hasSelectedMonths && hasSelectedFirKods && parentData.length > 0;

    // Filters logic
    const filteredMonths = useMemo(() => {
        const searchLower = monthSearch.toLowerCase();
        return months.filter(month => month.toLowerCase().includes(searchLower));
    }, [months, monthSearch]);

    const filteredFirKods = useMemo(() => {
        const searchLower = firSearch.toLowerCase();
        return firKods.filter(fir =>
            fir.fir_kod.toLowerCase().includes(searchLower) ||
            fir.naz_skr.toLowerCase().includes(searchLower) ||
            fir.label.toLowerCase().includes(searchLower)
        );
    }, [firKods, firSearch]);

    const filteredGroups = useMemo(() => {
        const searchLower = groupSearch.toLowerCase();
        return groups.filter(g =>
            g.GRUPA_KOD.toLowerCase().includes(searchLower) ||
            (g.GRUPA_NAZ && g.GRUPA_NAZ.toLowerCase().includes(searchLower))
        );
    }, [groups, groupSearch]);

    // Data Loaders
    const loadData = useCallback(async (url: string, params?: Record<string, string>) => {
        try {
            setIsLoading(true);
            const query = params ? `?${new URLSearchParams(params).toString()}` : '';
            const response = await fetch(`/api/${url}${query}`, { credentials: "include" });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        Promise.all([
            loadData("obrotByMonthList").then((data: Array<{ miesiac: string }>) => {
                const uniqMonths = Array.from(new Set(data.map(o => o.miesiac)))
                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                setMonths(uniqMonths);
                if (uniqMonths.length > 0) {
                    setSelectedMonths(prev => prev.length === 0 ? [uniqMonths[0]] : prev);
                }
            }),
            loadData("firkodList").then(setFirKods as any),
            loadData("groupList").then(setGroups as any),
        ]);
    }, [loadData]);

    // Overall data Effect
    useEffect(() => {
        if (!hasSelectedMonths) {
            setOverallData([]);
            return;
        }

        const loadAllMonthsData = async () => {
            setIsLoading(true);
            try {
                const allDataPromises = selectedMonths.map(month =>
                    loadData("obrotOverallMonth", { month })
                );

                const allDataResults = await Promise.all(allDataPromises);
                const summedData = new Map<string, {
                    obrot: number,
                    monthlyData: Record<string, number>,
                    parent_naz?: string
                }>();

                const allParentKody = new Set<string>();

                allDataResults.forEach((monthData, monthIndex) => {
                    if (Array.isArray(monthData)) {
                        const month = selectedMonths[monthIndex];
                        monthData.forEach((item: any) => {
                            if (item?.parent_kod) {
                                allParentKody.add(item.parent_kod);
                                const current = summedData.get(item.parent_kod) || {
                                    obrot: 0,
                                    monthlyData: Object.create(null) as Record<string, number>
                                };
                                const itemObrot = safeNumber(item.obrot);
                                current.obrot += itemObrot;
                                current.monthlyData[month] = itemObrot;
                                summedData.set(item.parent_kod, current);
                            }
                        });
                    }
                });

                if (allParentKody.size > 0) {
                    try {
                        const groupNamesResponse = await loadData("groupList");
                        const groupNameMap: Record<string, string> = {};

                        if (Array.isArray(groupNamesResponse)) {
                            groupNamesResponse.forEach((group: any) => {
                                if (group?.GRUPA_KOD) {
                                    groupNameMap[group.GRUPA_KOD] = group.GRUPA_NAZ || group.GRUPA_KOD;
                                }
                            });
                        }

                        Array.from(summedData.entries()).forEach(([code, data]) => {
                            data.parent_naz = groupNameMap[code] || code;
                        });
                    } catch (error) {
                        console.error("Error loading group names:", error);
                        Array.from(summedData.entries()).forEach(([code, data]) => {
                            data.parent_naz = code;
                        });
                    }
                }

                const result: DisplayData[] = Array.from(summedData.entries())
                    .map(([code, { obrot, monthlyData, parent_naz }]) => ({
                        id: code,
                        code,
                        label: parent_naz,
                        type: 'parent' as const,
                        obrot: safeNumber(obrot),
                        monthlyData
                    }))
                    .sort((a, b) => b.obrot - a.obrot);

                setOverallData(result);
            } catch (error) {
                console.error("Error loading overall data:", error);
                setOverallData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllMonthsData();
    }, [hasSelectedMonths, selectedMonths, loadData]);

    // Subgroup data (Overall) Effect
    useEffect(() => {
        if (!hasSelectedMonths || !overallActiveParent) {
            setOverallGrupaData([]);
            return;
        }

        const loadOverallSubgroupData = async () => {
            setIsLoading(true);
            try {
                const allDataPromises = selectedMonths.map(month => {
                    if (!overallActiveParent) return Promise.resolve([]);
                    return loadData("obrotMonthParentGroups", { month, parent_kod: overallActiveParent });
                });

                const allDataResults = await Promise.all(allDataPromises);
                const summedData = new Map<string, {
                    obrot: number,
                    monthlyData: Record<string, number>,
                    grupa_naz: string
                }>();

                allDataResults.forEach((monthData, monthIndex) => {
                    if (Array.isArray(monthData)) {
                        const month = selectedMonths[monthIndex];
                        monthData.forEach((item: any) => {
                            if (item?.grupa_kod) {
                                const current = summedData.get(item.grupa_kod) || {
                                    obrot: 0,
                                    monthlyData: {} as Record<string, number>,
                                    grupa_naz: item.grupa_naz || item.grupa_kod
                                };
                                const itemObrot = safeNumber(item.obrot);
                                current.obrot += itemObrot;
                                if (current.monthlyData && typeof current.monthlyData === 'object') {
                                    current.monthlyData[month] = itemObrot;
                                } else {
                                    current.monthlyData = { [month]: itemObrot };
                                }
                                summedData.set(item.grupa_kod, current);
                            }
                        });
                    }
                });

                const result: DisplayData[] = Array.from(summedData.entries())
                    .map(([code, { obrot, monthlyData, grupa_naz }]) => ({
                        id: code,
                        code,
                        label: grupa_naz,
                        type: 'grupa' as const,
                        obrot: safeNumber(obrot),
                        monthlyData
                    }))
                    .filter(item => item.obrot > 0)
                    .sort((a, b) => b.obrot - a.obrot);

                setOverallGrupaData(result);
            } catch (error) {
                console.error("Error loading overall subgroup data:", error);
                setOverallGrupaData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadOverallSubgroupData();
    }, [hasSelectedMonths, overallActiveParent, selectedMonths, loadData]);

    // ... continue implementing other effects similarly ...
    // NOTE: For brevity, I'll combine the rest of the logic here while ensuring it's robust

    // Clients for selected group(s) or subgroup Effect
    useEffect(() => {
        const targetGroup = selectedGroups.length > 0 ? selectedGroups.join(',') : selectedSubgroup;

        if (!hasSelectedMonths || !targetGroup) {
            setClientsData([]);
            return;
        }

        const loadClientsForGroup = async () => {
            setIsClientsLoading(true);
            try {
                const params: Record<string, string> = {
                    grupa_kod: targetGroup,
                    months: selectedMonths.join(','),
                };
                if (hasSelectedFirKods) {
                    params.fir_kod = selectedFirKods.join(',');
                }

                const data = await loadData("subgroupClientsMultipleMonths", params);

                if (Array.isArray(data)) {
                    const result: DisplayData[] = data.map((item: any) => ({
                        id: item?.fir_kod || '',
                        code: item?.fir_kod || '',
                        label: item?.fir_naz || item?.fir_kod || '',
                        type: 'client' as const,
                        obrot: safeNumber(item?.obrot),
                        monthlyData: item?.monthlyData || (selectedMonths[0] ? { [selectedMonths[0]]: safeNumber(item?.obrot) } : {})
                    }));
                    setClientsData(result);
                } else {
                    setClientsData([]);
                }
            } catch (error) {
                console.error("Error loading group clients data:", error);
                setClientsData([]);
            } finally {
                setIsClientsLoading(false);
            }
        };

        loadClientsForGroup();
    }, [hasSelectedMonths, selectedGroups, selectedSubgroup, selectedMonths, hasSelectedFirKods, selectedFirKods, loadData]);

    // Filtered data by firms Effect
    useEffect(() => {
        if (!hasSelectedMonths || !hasSelectedFirKods) {
            setParentData([]);
            return;
        }

        const loadFilteredData = async () => {
            setIsLoading(true);
            try {
                const allDataPromises = selectedMonths.map(month => {
                    const params: Record<string, string> = { month };
                    selectedFirKods.forEach((firKod, index) => {
                        params[`fir_kod${index}`] = firKod;
                    });
                    return loadData("obrotMonthGroup", params);
                });

                const allDataResults = await Promise.all(allDataPromises);
                const summedData = new Map<string, {
                    obrot: number,
                    monthlyData: Record<string, number>,
                    parent_naz?: string
                }>();

                const allParentKody = new Set<string>();

                allDataResults.forEach((monthData, monthIndex) => {
                    if (Array.isArray(monthData)) {
                        const month = selectedMonths[monthIndex];
                        monthData.forEach((item: any) => {
                            if (item?.parent_kod) {
                                allParentKody.add(item.parent_kod);
                                const current = summedData.get(item.parent_kod) || {
                                    obrot: 0,
                                    monthlyData: {}
                                };
                                const itemObrot = safeNumber(item.obrot);
                                current.obrot += itemObrot;
                                current.monthlyData[month] = itemObrot;
                                summedData.set(item.parent_kod, current);
                            }
                        });
                    }
                });

                if (allParentKody.size > 0) {
                    try {
                        const groupNamesResponse = await loadData("groupList");
                        const groupNameMap: Record<string, string> = {};
                        if (Array.isArray(groupNamesResponse)) {
                            groupNamesResponse.forEach((group: any) => {
                                if (group?.GRUPA_KOD) {
                                    groupNameMap[group.GRUPA_KOD] = group.GRUPA_NAZ || group.GRUPA_KOD;
                                }
                            });
                        }
                        Array.from(summedData.entries()).forEach(([code, data]) => {
                            data.parent_naz = groupNameMap[code] || code;
                        });
                    } catch (error) {
                        Array.from(summedData.entries()).forEach(([code, data]) => {
                            data.parent_naz = code;
                        });
                    }
                }

                const result: DisplayData[] = Array.from(summedData.entries())
                    .map(([code, { obrot, monthlyData, parent_naz }]) => ({
                        id: code,
                        code,
                        label: parent_naz,
                        type: 'parent' as const,
                        obrot: safeNumber(obrot),
                        monthlyData
                    }))
                    .sort((a, b) => b.obrot - a.obrot);
                setParentData(result);
            } catch (error) {
                setParentData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFilteredData();
    }, [hasSelectedMonths, hasSelectedFirKods, selectedMonths, selectedFirKods, loadData]);

    // Subgroups for filtered firms Effect
    useEffect(() => {
        if (!hasSelectedMonths || !hasSelectedFirKods || !filteredActiveParent) {
            setFilteredGrupaData([]);
            return;
        }

        const loadFilteredSubgroupData = async () => {
            setIsLoading(true);
            try {
                const allDataPromises = selectedMonths.map(month => {
                    const params: Record<string, string> = { month, parent_kod: filteredActiveParent! };
                    selectedFirKods.forEach((firKod, index) => {
                        params[`fir_kod${index}`] = firKod;
                    });
                    return loadData("obrotMonthParentGroupsWithFirms", params);
                });

                const allDataResults = await Promise.all(allDataPromises);
                const summedData = new Map<string, {
                    obrot: number,
                    monthlyData: Record<string, number>,
                    grupa_naz: string
                }>();

                allDataResults.forEach((monthData, monthIndex) => {
                    if (Array.isArray(monthData)) {
                        const month = selectedMonths[monthIndex];
                        monthData.forEach((item: any) => {
                            if (item?.grupa_kod) {
                                const current = summedData.get(item.grupa_kod) || {
                                    obrot: 0,
                                    monthlyData: {} as Record<string, number>,
                                    grupa_naz: item.grupa_naz || item.grupa_kod
                                };
                                const itemObrot = safeNumber(item.obrot);
                                current.obrot += itemObrot;
                                if (current.monthlyData && typeof current.monthlyData === 'object') {
                                    current.monthlyData[month] = itemObrot;
                                } else {
                                    current.monthlyData = { [month]: itemObrot };
                                }
                                summedData.set(item.grupa_kod, current);
                            }
                        });
                    }
                });

                const result: DisplayData[] = Array.from(summedData.entries())
                    .map(([code, { obrot, monthlyData, grupa_naz }]) => ({
                        id: code,
                        code,
                        label: grupa_naz,
                        type: 'grupa' as const,
                        obrot: safeNumber(obrot),
                        monthlyData
                    }))
                    .filter(item => item.obrot > 0)
                    .sort((a, b) => b.obrot - a.obrot);

                setFilteredGrupaData(result);
            } catch (error) {
                setFilteredGrupaData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFilteredSubgroupData();
    }, [hasSelectedMonths, hasSelectedFirKods, filteredActiveParent, selectedMonths, selectedFirKods, loadData]);


    useEffect(() => {
        setOverallActiveParent(null);
        setFilteredActiveParent(null);
        setSelectedSubgroup(null);
        setFilteredSelectedSubgroup(null);
        setOverallGrupaData([]);
        setFilteredGrupaData([]);
        setClientsData([]);
        setFilteredClientsData([]);
    }, [selectedFirKods]);

    useEffect(() => {
        setOverallActiveParent(null);
        setFilteredActiveParent(null);
        setSelectedSubgroup(null);
        setFilteredSelectedSubgroup(null);
        setOverallGrupaData([]);
        setFilteredGrupaData([]);
        setClientsData([]);
        setFilteredClientsData([]);
    }, [selectedMonths]);

    useEffect(() => {
        setSelectedSubgroup(null);
        setFilteredSelectedSubgroup(null);
    }, [selectedGroups]);

    const toggleSelection = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    }, []);

    const clearSelection = useCallback((
        searchSetter: React.Dispatch<React.SetStateAction<string>>,
        valueSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        searchSetter("");
        valueSetter([]);
    }, []);

    const toggleParent = useCallback((code: string, context: 'main' | 'filtered' = 'filtered') => {
        if (context === 'main') {
            if (overallActiveParent === code) {
                setOverallActiveParent(null);
                setOverallGrupaData([]);
            } else {
                setOverallActiveParent(code);
                setOverallGrupaData([]);
            }
            setSelectedSubgroup(null);
            setClientsData([]);
        } else {
            if (filteredActiveParent === code) {
                setFilteredActiveParent(null);
                setFilteredGrupaData([]);
            } else {
                setFilteredActiveParent(code);
                setFilteredGrupaData([]);
            }
        }
    }, [overallActiveParent, filteredActiveParent]);

    const displayedOverallData = useMemo(() => {
        if (selectedGroups.length === 0) return overallData;
        const groupToParent = new Map<string, string>();
        groups.forEach(g => {
            if (g.PARENT_KOD && g.PARENT_KOD.trim()) {
                groupToParent.set(g.GRUPA_KOD, g.PARENT_KOD.trim());
            }
        });
        const targetParentCodes = new Set<string>();
        selectedGroups.forEach(grp => {
            targetParentCodes.add(grp);
            const parent = groupToParent.get(grp);
            if (parent) targetParentCodes.add(parent);
        });
        const filtered = overallData.filter(item => targetParentCodes.has(item.code));
        return filtered.length > 0 ? filtered : overallData;
    }, [overallData, selectedGroups, groups]);

    const displayedParentData = useMemo(() => {
        if (selectedGroups.length === 0) return parentData;
        const groupToParent = new Map<string, string>();
        groups.forEach(g => {
            if (g.PARENT_KOD && g.PARENT_KOD.trim()) {
                groupToParent.set(g.GRUPA_KOD, g.PARENT_KOD.trim());
            }
        });
        const targetParentCodes = new Set<string>();
        selectedGroups.forEach(grp => {
            targetParentCodes.add(grp);
            const parent = groupToParent.get(grp);
            if (parent) targetParentCodes.add(parent);
        });
        const filtered = parentData.filter(item => targetParentCodes.has(item.code));
        return filtered.length > 0 ? filtered : parentData;
    }, [parentData, selectedGroups, groups]);

    // Chart data memos
    const overallPieChartData = useMemo(() => {
        if (!showOverallChart) return null;
        let dataSource = (overallActiveParent && overallGrupaData.length > 0) ? overallGrupaData : displayedOverallData;
        if (selectedSubgroup || dataSource.length === 0) return null;

        const data = dataSource.map(item => safeNumber(item.obrot));
        if (!data.some(v => v > 0)) return null;

        return {
            labels: dataSource.map(item => item.label || item.code),
            datasets: [{
                data,
                backgroundColor: generateColors(dataSource.length),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        };
    }, [displayedOverallData, overallGrupaData, showOverallChart, overallActiveParent, selectedSubgroup]);

    const overallBarChartData = useMemo(() => {
        if (!showOverallChart || !selectedSubgroup || clientsData.length === 0) return null;
        const data = clientsData.map(item => safeNumber(item.obrot));
        if (!data.some(v => v > 0)) return null;

        return {
            labels: clientsData.map(item => item.label || item.code),
            datasets: [{
                label: 'Revenue',
                data,
                backgroundColor: generateColors(clientsData.length),
                borderColor: generateColors(clientsData.length).map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        };
    }, [clientsData, showOverallChart, selectedSubgroup]);

    const filteredPieChartData = useMemo(() => {
        if (!hasSelectedMonths || !hasSelectedFirKods || filteredSelectedSubgroup) return null;
        let dataSource = filteredActiveParent ? filteredGrupaData : displayedParentData;
        if (dataSource.length === 0) return null;

        const data = dataSource.map(item => safeNumber(item.obrot));
        if (!data.some(v => v > 0)) return null;

        return {
            labels: dataSource.map(item => item.label || item.code),
            datasets: [{
                data,
                backgroundColor: generateColors(dataSource.length),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        };
    }, [displayedParentData, filteredGrupaData, filteredActiveParent, hasSelectedMonths, hasSelectedFirKods, filteredSelectedSubgroup]);

    const currentData = useMemo(() => {
        if (selectedSubgroup || selectedGroups.length > 0) return clientsData;
        if (showOverallChart) return (overallActiveParent && overallGrupaData.length > 0) ? overallGrupaData : displayedOverallData;
        if (hasSelectedFirKods) return filteredActiveParent ? filteredGrupaData : displayedParentData;
        return [];
    }, [displayedOverallData, displayedParentData, clientsData, overallGrupaData, filteredGrupaData, showOverallChart, hasSelectedFirKods, filteredActiveParent, overallActiveParent, selectedSubgroup, selectedGroups]);

    const totalObrot = useMemo(() => currentData.reduce((sum, item) => sum + safeNumber(item.obrot), 0), [currentData]);

    return {
        isFilterOpen, setIsFilterOpen,
        monthSearch, setMonthSearch,
        firSearch, setFirSearch,
        groupSearch, setGroupSearch,
        months, selectedMonths, setSelectedMonths,
        firKods, selectedFirKods, setSelectedFirKods,
        groups, selectedGroups, setSelectedGroups,
        filteredMonths, filteredFirKods, filteredGroups,
        isLoading, isClientsLoading,
        parentData, displayedParentData,
        overallData, displayedOverallData,
        overallGrupaData, clientsData,
        filteredGrupaData, filteredClientsData,
        overallActiveParent, filteredActiveParent,
        selectedSubgroup, setSelectedSubgroup,
        filteredSelectedSubgroup, setFilteredSelectedSubgroup,
        totalObrot,
        showOverallChart, showOverallTable, showFilteredTable,
        hasSelectedMonths, hasSelectedFirKods,
        overallPieChartData, overallBarChartData, filteredPieChartData,
        toggleSelection, clearSelection, toggleParent,
        currentData
    };
};
