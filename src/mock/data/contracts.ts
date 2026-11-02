export interface MockProg {
  id: number;
  umowa_id?: number;
  kwota: number;
  procent: number;
}

export interface MockDetale {
  id: number;
  umowa_id?: number;
  okres_od: string;
  okres_do: string;
  koszt_czastkowy: number;
}

export interface MockUmowa {
  id: number;
  fir_kod: string;
  typ_umowy: number;
  od: string;
  do: string;
  kto_stworzyl: string;
  czestotliwosc_id: number;
  data_stworzenia: string;
  type_dict: { id: number; name: string; display_name: string };
  czestotliwosc: { id: number; name: string; display_name: string; months_count: number };
  creator: { userId: string; name: string };
  progi: MockProg[];
  detale: MockDetale[];
}

export const INITIAL_UMOWY: MockUmowa[] = [
  {
    id: 1,
    fir_kod: "K00101",
    typ_umowy: 1,
    od: "2026-01-01T00:00:00.000Z",
    do: "2026-12-31T23:59:59.000Z",
    kto_stworzyl: "1",
    czestotliwosc_id: 2,
    data_stworzenia: "2026-01-05T10:00:00.000Z",
    type_dict: { id: 1, name: "bonus", display_name: "Bonus" },
    czestotliwosc: { id: 2, name: "quarterly", display_name: "Quarterly", months_count: 3 },
    creator: { userId: "1", name: "James Mitchell" },
    progi: [
      { id: 1, kwota: 50000, procent: 3.0 },
      { id: 2, kwota: 100000, procent: 5.0 },
      { id: 3, kwota: 150000, procent: 7.5 },
    ],
    detale: [
      { id: 1, okres_od: "2026-01-01T00:00:00.000Z", okres_do: "2026-03-31T23:59:59.000Z", koszt_czastkowy: 2740 },
      { id: 2, okres_od: "2026-04-01T00:00:00.000Z", okres_do: "2026-06-30T23:59:59.000Z", koszt_czastkowy: 0 },
      { id: 3, okres_od: "2026-07-01T00:00:00.000Z", okres_do: "2026-09-30T23:59:59.000Z", koszt_czastkowy: 0 },
      { id: 4, okres_od: "2026-10-01T00:00:00.000Z", okres_do: "2026-12-31T23:59:59.000Z", koszt_czastkowy: 0 },
    ],
  },
  {
    id: 2,
    fir_kod: "K00103",
    typ_umowy: 1,
    od: "2026-01-01T00:00:00.000Z",
    do: "2026-12-31T23:59:59.000Z",
    kto_stworzyl: "1",
    czestotliwosc_id: 3,
    data_stworzenia: "2026-01-10T12:00:00.000Z",
    type_dict: { id: 1, name: "bonus", display_name: "Bonus" },
    czestotliwosc: { id: 3, name: "half_yearly", display_name: "Half-yearly", months_count: 6 },
    creator: { userId: "1", name: "James Mitchell" },
    progi: [
      { id: 4, kwota: 150000, procent: 4.0 },
      { id: 5, kwota: 250000, procent: 6.5 },
    ],
    detale: [
      { id: 5, okres_od: "2026-01-01T00:00:00.000Z", okres_do: "2026-06-30T23:59:59.000Z", koszt_czastkowy: 4200 },
      { id: 6, okres_od: "2026-07-01T00:00:00.000Z", okres_do: "2026-12-31T23:59:59.000Z", koszt_czastkowy: 0 },
    ],
  },
  {
    id: 3,
    fir_kod: "K00102",
    typ_umowy: 2,
    od: "2025-06-01T00:00:00.000Z",
    do: "2027-05-31T23:59:59.000Z",
    kto_stworzyl: "2",
    czestotliwosc_id: 4,
    data_stworzenia: "2025-05-20T14:30:00.000Z",
    type_dict: { id: 2, name: "equipment", display_name: "Equipment" },
    czestotliwosc: { id: 4, name: "yearly", display_name: "Yearly", months_count: 12 },
    creator: { userId: "2", name: "Michael Anderson" },
    progi: [
      { id: 6, kwota: 80000, procent: 0 },
    ],
    detale: [
      { id: 7, okres_od: "2025-06-01T00:00:00.000Z", okres_do: "2026-05-31T23:59:59.000Z", koszt_czastkowy: 0 },
      { id: 8, okres_od: "2026-06-01T00:00:00.000Z", okres_do: "2027-05-31T23:59:59.000Z", koszt_czastkowy: 0 },
    ],
  },
];
