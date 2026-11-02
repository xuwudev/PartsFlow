import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc";

export interface UseTableDataOptions<T> {
  initialSortKey?: keyof T | null;
  initialSortDir?: SortOrder;
  searchFields?: (keyof T)[];
}

export function useTableData<T extends Record<string, any>>(
  data: T[],
  options: UseTableDataOptions<T> = {}
) {
  const { initialSortKey = null, initialSortDir = "asc", searchFields } = options;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey);
  const [sortDir, setSortDir] = useState<SortOrder>(initialSortDir);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((row) => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((field) => {
            const val = row[field];
            return val != null && String(val).toLowerCase().includes(query);
          });
        }
        return Object.values(row).some(
          (val) => val != null && String(val).toLowerCase().includes(query)
        );
      });
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = String(a[sortKey] ?? "").toLowerCase();
        const bVal = String(b[sortKey] ?? "").toLowerCase();
        const cmp = aVal.localeCompare(bVal, "en", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, searchFields, sortKey, sortDir]);

  return {
    search,
    setSearch,
    sortKey,
    sortDir,
    handleSort,
    filteredAndSortedData,
  };
}
