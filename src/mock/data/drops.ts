export interface MockSpadek {
  oper_kod: string;
  NAZ_SKR: string;
  miesiac_4: number;
  miesiac_3: number;
  miesiac_2: number;
  miesiac_1: number;
  miesiac_0: number;
  miesiac: number;
  podsumowanie: number;
  srednia: number;
  do_sredniej: number;
  minimum: number;
  do_minimum: number;
  fir_kod_gr: string;
}

export interface MockFirmaDetail {
  oper_kod: string;
  fir_kod_gr: string;
  NAZ_SKR: string;
  grupa_kod: string;
  GRUPA_NAZ: string;
  miesiac_4: number;
  miesiac_3: number;
  miesiac_2: number;
  miesiac_1: number;
  miesiac: number;
  podsumowanie: number;
  srednia: number;
  do_sredniej: number;
  minimum: number;
  do_minimum: number;
}

export const MOCK_SPADKI_OPER: MockSpadek[] = [
  {
    oper_kod: "OP1",
    NAZ_SKR: "MILE HIGH AUTO PARTS",
    fir_kod_gr: "K00104",
    miesiac_4: 36200,
    miesiac_3: 34200,
    miesiac_2: 31000,
    miesiac_1: 28500,
    miesiac_0: 24100,
    miesiac: 24100,
    podsumowanie: 154000,
    srednia: 32475,
    do_sredniej: -25.8,
    minimum: 28500,
    do_minimum: -15.4,
  },
  {
    oper_kod: "OP2",
    NAZ_SKR: "MUSIC CITY MOTOR PARTS",
    fir_kod_gr: "K00110",
    miesiac_4: 25100,
    miesiac_3: 22400,
    miesiac_2: 19800,
    miesiac_1: 18500,
    miesiac_0: 16200,
    miesiac: 16200,
    podsumowanie: 102000,
    srednia: 21450,
    do_sredniej: -24.5,
    minimum: 18500,
    do_minimum: -12.4,
  },
  {
    oper_kod: "OP3",
    NAZ_SKR: "PEACHTREE AUTO SUPPLY",
    fir_kod_gr: "K00108",
    miesiac_4: 33400,
    miesiac_3: 29500,
    miesiac_2: 31200,
    miesiac_1: 27800,
    miesiac_0: 26400,
    miesiac: 26400,
    podsumowanie: 148300,
    srednia: 30475,
    do_sredniej: -13.4,
    minimum: 27800,
    do_minimum: -5.0,
  },
  {
    oper_kod: "OP1",
    NAZ_SKR: "DESERT RIDGE AUTO REPAIR",
    fir_kod_gr: "K00105",
    miesiac_4: 58000,
    miesiac_3: 54000,
    miesiac_2: 51200,
    miesiac_1: 48900,
    miesiac_0: 52300,
    miesiac: 52300,
    podsumowanie: 264400,
    srednia: 53025,
    do_sredniej: -1.4,
    minimum: 48900,
    do_minimum: 7.0,
  },
];

export const MOCK_FIRMA_DETAILS: Record<string, MockFirmaDetail[]> = {
  K00104: [
    {
      oper_kod: "OP1",
      fir_kod_gr: "K00104",
      NAZ_SKR: "MILE HIGH AUTO PARTS",
      grupa_kod: "HAM",
      GRUPA_NAZ: "Brake systems",
      miesiac_4: 12500,
      miesiac_3: 11200,
      miesiac_2: 9800,
      miesiac_1: 8900,
      miesiac: 7100,
      podsumowanie: 49500,
      srednia: 10600,
      do_sredniej: -33.0,
      minimum: 8900,
      do_minimum: -20.2,
    },
    {
      oper_kod: "OP1",
      fir_kod_gr: "K00104",
      NAZ_SKR: "MILE HIGH AUTO PARTS",
      grupa_kod: "OLE",
      GRUPA_NAZ: "Engine oils and fluids",
      miesiac_4: 14100,
      miesiac_3: 13500,
      miesiac_2: 12400,
      miesiac_1: 11800,
      miesiac: 10200,
      podsumowanie: 62000,
      srednia: 12950,
      do_sredniej: -21.2,
      minimum: 11800,
      do_minimum: -13.5,
    },
    {
      oper_kod: "OP1",
      fir_kod_gr: "K00104",
      NAZ_SKR: "MILE HIGH AUTO PARTS",
      grupa_kod: "FIL",
      GRUPA_NAZ: "Automotive filters",
      miesiac_4: 9600,
      miesiac_3: 9500,
      miesiac_2: 8800,
      miesiac_1: 7800,
      miesiac: 6800,
      podsumowanie: 42500,
      srednia: 8925,
      do_sredniej: -23.8,
      minimum: 7800,
      do_minimum: -12.8,
    },
  ],
};
