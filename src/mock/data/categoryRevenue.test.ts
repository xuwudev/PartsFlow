import { describe, expect, it } from "vitest";
import { INITIAL_CLIENTS } from "./clients";
import { MOCK_MONTH_LIST } from "./turnover";
import { getCategoryRevenue } from "./categoryRevenue";

const request = (path: string, params: Record<string, string>) => getCategoryRevenue(`/api/${path}`, new URLSearchParams(params), INITIAL_CLIENTS);
const totalCents = (rows: ReturnType<typeof request>) => rows.reduce((sum, row) => sum + Math.round(row.obrot * 100), 0);

describe("category revenue demo", () => {
  it("reconciles all six categories to the monthly dashboard revenue", () => {
    const rows = request("obrotOverallMonth", { month: "March 2026" });
    expect(rows).toHaveLength(6);
    expect(totalCents(rows)).toBe(Math.round(MOCK_MONTH_LIST[0].obrot * 100));
  });

  it("reconciles category, subcategories and customer drill-downs", () => {
    const categories = request("obrotOverallMonth", { month: "March 2026" });
    for (const category of categories) {
      const children = request("obrotMonthParentGroups", { month: "March 2026", parent_kod: category.parent_kod });
      expect(totalCents(children)).toBe(Math.round(category.obrot * 100));
      for (const child of children) {
        const customers = request("subgroupClientsMultipleMonths", { months: "March 2026", grupa_kod: child.grupa_kod });
        expect(totalCents(customers)).toBe(Math.round(child.obrot * 100));
        expect(customers.every(row => row.fir_naz.length > 0)).toBe(true);
      }
    }
  });

  it("honors numbered and comma-separated customer filters across months", () => {
    const march = request("obrotMonthGroup", { month: "March 2026", fir_kod0: "K00101" });
    const february = request("obrotMonthGroup", { month: "February 2026", fir_kod0: "K00101" });
    const customers = request("subgroupClientsMultipleMonths", { months: "March 2026,February 2026", fir_kod: "K00101" });
    expect(customers).toHaveLength(1);
    expect(customers[0].fir_kod).toBe("K00101");
    expect(totalCents(customers)).toBe(totalCents(march) + totalCents(february));
    expect(Object.keys(customers[0].monthlyData)).toHaveLength(2);
  });

  it("returns an empty result for unknown periods, categories and customers", () => {
    expect(request("obrotOverallMonth", { month: "Unknown month" })).toEqual([]);
    expect(request("subgroupClientsMultipleMonths", { grupa_kod: "UNKNOWN" })).toEqual([]);
    expect(request("obrotMonthGroup", { fir_kod0: "UNKNOWN" })).toEqual([]);
  });
});
