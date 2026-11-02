import type { MockClient } from "./clients";
import { MOCK_MONTH_LIST, MOCK_PRODUCT_GROUPS } from "./turnover";

// One deterministic sales ledger backs summaries, drill-downs and client filters.
// Allocating integer cents keeps every level of the demo reconciled.
const categoryWeights = [28, 17, 20, 16, 11, 8];
const allocate = (cents: number, weights: number[]) => {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let remaining = cents;
  return weights.map((weight, index) => {
    const amount = index === weights.length - 1 ? remaining : Math.floor(cents * weight / total);
    remaining -= amount;
    return amount;
  });
};

function monthlyLedger(month: string, clients: MockClient[]) {
  const period = MOCK_MONTH_LIST.find(item => item.miesiac === month);
  if (!period || !clients.length) return [];
  const monthIndex = MOCK_MONTH_LIST.indexOf(period);
  const parents = MOCK_PRODUCT_GROUPS.filter(group => group.PARENT_KOD === "ROOT");
  const customerTotals = allocate(Math.round(period.obrot * 100), clients.map(client => Math.max(1, client.obrot)));
  return clients.flatMap((client, clientIndex) => {
    const parentTotals = allocate(customerTotals[clientIndex], parents.map((_, index) => categoryWeights[index] + (clientIndex + monthIndex + index) % 5));
    return parents.flatMap((parent, parentIndex) => {
      const children = MOCK_PRODUCT_GROUPS.filter(group => group.PARENT_KOD === parent.GRUPA_KOD);
      const amounts = allocate(parentTotals[parentIndex], children.map((_, index) => 7 - index + (clientIndex + monthIndex) % 3));
      return children.map((group, index) => ({ month, client, parent, group, cents: amounts[index] }));
    });
  });
}

export function getCategoryRevenue(path: string, params: URLSearchParams, clients: MockClient[]) {
  const customerCodes = [...params.entries()].filter(([key]) => /^fir_kod\d*$/.test(key)).flatMap(([, value]) => value.split(","));
  const months = (params.get("months") || params.get("month") || MOCK_MONTH_LIST[0].miesiac).split(",");
  const groupCodes = (params.get("grupa_kod") || "").split(",").filter(Boolean);
  const parentCode = params.get("parent_kod");
  const rows = months.flatMap(month => monthlyLedger(month, clients)).filter(row =>
    (!customerCodes.length || customerCodes.includes(row.client.FIR_KOD)) &&
    (!parentCode || row.parent.GRUPA_KOD === parentCode) &&
    (!groupCodes.length || groupCodes.includes(row.group.GRUPA_KOD) || groupCodes.includes(row.parent.GRUPA_KOD))
  );
  const aggregate = new Map<string, { parent_kod: string; grupa_kod: string; grupa_naz: string; fir_kod: string; fir_naz: string; naz_skr: string; cents: number; monthlyCents: Record<string, number> }>();
  const byCustomer = path.includes("subgroupClients");
  const byParent = path === "/api/obrotOverallMonth" || path === "/api/obrotMonthGroup";
  for (const row of rows) {
    const code = byCustomer ? row.client.FIR_KOD : byParent ? row.parent.GRUPA_KOD : row.group.GRUPA_KOD;
    const entry = aggregate.get(code) ?? { parent_kod: row.parent.GRUPA_KOD, grupa_kod: row.group.GRUPA_KOD, grupa_naz: row.group.GRUPA_NAZ, fir_kod: row.client.FIR_KOD, fir_naz: row.client.NAZ_SKR, naz_skr: row.client.NAZ_SKR, cents: 0, monthlyCents: {} };
    entry.cents += row.cents;
    entry.monthlyCents[row.month] = (entry.monthlyCents[row.month] || 0) + row.cents;
    aggregate.set(code, entry);
  }
  return [...aggregate.values()].map(({ cents, monthlyCents, ...entry }) => ({ ...entry, obrot: cents / 100, monthlyData: Object.fromEntries(Object.entries(monthlyCents).map(([month, amount]) => [month, amount / 100])) })).sort((a, b) => b.obrot - a.obrot);
}
