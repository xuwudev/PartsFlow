export interface MockKsoPlatRow {
  fir_kod: string;
  naz_skr: string;
  oper_kod: string;
  dnin: number;
  srednia_dnin: number;
  naleznosci: number;
  zobowiazania: number;
  saldo: number;
  naleznosci_spoz: number;
  zobowiazania_spoz: number;
  dniz: number;
  limit_dni: number;
}

export const MOCK_KSO_PLAT_ROWS: MockKsoPlatRow[] = [
  {
    fir_kod: "K00104",
    naz_skr: "MILE HIGH AUTO PARTS",
    oper_kod: "OP1",
    dnin: 28,
    srednia_dnin: 21,
    naleznosci: 42150.0,
    zobowiazania: 0.0,
    saldo: 42150.0,
    naleznosci_spoz: 18400.0,
    zobowiazania_spoz: 0.0,
    dniz: 14,
    limit_dni: 30,
  },
  {
    fir_kod: "K00110",
    naz_skr: "MUSIC CITY MOTOR PARTS",
    oper_kod: "OP2",
    dnin: 35,
    srednia_dnin: 24,
    naleznosci: 29800.0,
    zobowiazania: 0.0,
    saldo: 29800.0,
    naleznosci_spoz: 12500.0,
    zobowiazania_spoz: 0.0,
    dniz: 21,
    limit_dni: 21,
  },
  {
    fir_kod: "K00101",
    naz_skr: "ANDERSON AUTO SERVICE",
    oper_kod: "OP1",
    dnin: 14,
    srednia_dnin: 12,
    naleznosci: 38900.0,
    zobowiazania: 1200.0,
    saldo: 37700.0,
    naleznosci_spoz: 0.0,
    zobowiazania_spoz: 0.0,
    dniz: 0,
    limit_dni: 30,
  },
  {
    fir_kod: "K00102",
    naz_skr: "LONE STAR PARTS SUPPLY",
    oper_kod: "OP1",
    dnin: 19,
    srednia_dnin: 15,
    naleznosci: 61400.0,
    zobowiazania: 0.0,
    saldo: 61400.0,
    naleznosci_spoz: 0.0,
    zobowiazania_spoz: 0.0,
    dniz: 0,
    limit_dni: 30,
  },
  {
    fir_kod: "K00103",
    naz_skr: "PACIFIC COAST MOTORS",
    oper_kod: "OP2",
    dnin: 22,
    srednia_dnin: 18,
    naleznosci: 89500.0,
    zobowiazania: 0.0,
    saldo: 89500.0,
    naleznosci_spoz: 0.0,
    zobowiazania_spoz: 0.0,
    dniz: 0,
    limit_dni: 45,
  },
  {
    fir_kod: "K00107",
    naz_skr: "ATLANTIC FLEET SERVICES",
    oper_kod: "OP3",
    dnin: 16,
    srednia_dnin: 14,
    naleznosci: 74200.0,
    zobowiazania: 0.0,
    saldo: 74200.0,
    naleznosci_spoz: 0.0,
    zobowiazania_spoz: 0.0,
    dniz: 0,
    limit_dni: 30,
  },
];

export const MOCK_KSO_CUSTOMER_DETAILS: Record<string, any[]> = {
  K00104: [
    {
      DOK_NR: "FS/2026/02/0842",
      DOK_DATA: "2026-02-14",
      DATAT: "2026-03-01",
      DOK_TYP: "FS",
      WAL_KOD: "USD",
      WAR_WN: 18400.0,
      WAR_MA: 0.0,
      DOK_DOST: "Afternoon courier delivery",
    },
    {
      DOK_NR: "FS/2026/03/0112",
      DOK_DATA: "2026-03-05",
      DATAT: "2026-03-25",
      DOK_TYP: "FS",
      WAL_KOD: "USD",
      WAR_WN: 23750.0,
      WAR_MA: 0.0,
      DOK_DOST: "Branch delivery",
    },
  ],
};
