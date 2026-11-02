export interface MockUstalenie {
  id: number;
  fir_kod: string;
  status: "active" | "inactive";
  opis: string;
  grupa_kody?: string;
  data_od: string;
  data_do: string;
  rabat?: number;
  umowa_id?: number | null;
  creator: {
    name: string;
    oper_kod: string;
  };
  users: Array<{
    user: {
      userId: string;
      oper_kod: string;
      name: string;
    };
  }>;
  grupy: Array<{
    id?: number;
    grupa_kod: string;
    grupa_naz?: string;
  }>;
  towary: any[];
}

export const INITIAL_USTALENIA: MockUstalenie[] = [
  {
    id: 1,
    fir_kod: "K00101",
    status: "active",
    opis: "An additional 12% discount on brake pads and discs for orders over USD 2,000.",
    data_od: "2026-01-01",
    data_do: "2026-12-31",
    rabat: 12.0,
    creator: { name: "James Mitchell", oper_kod: "OP1" },
    users: [{ user: { userId: "2", oper_kod: "OP1", name: "Michael Anderson" } }],
    grupy: [
      { grupa_kod: "HAM_KLO", grupa_naz: "Brake pads" },
      { grupa_kod: "HAM_TAR", grupa_naz: "Brake discs" },
    ],
    towary: [],
  },
  {
    id: 2,
    fir_kod: "K00103",
    status: "active",
    opis: "Special pricing on 5W30 engine oil drums (USD 520 net per unit) with 30-day payment terms.",
    data_od: "2026-02-01",
    data_do: "2026-08-31",
    rabat: 15.0,
    creator: { name: "Emily Johnson", oper_kod: "OP2" },
    users: [{ user: { userId: "3", oper_kod: "OP2", name: "Emily Johnson" } }],
    grupy: [{ grupa_kod: "OLE_SYN", grupa_naz: "Synthetic oils" }],
    towary: [],
  },
  {
    id: 3,
    fir_kod: "K00107",
    status: "active",
    opis: "Fleet package: free express delivery twice daily and 8% off shock absorbers and control arms.",
    data_od: "2026-01-15",
    data_do: "2026-12-31",
    rabat: 8.0,
    creator: { name: "David Thompson", oper_kod: "OP3" },
    users: [{ user: { userId: "4", oper_kod: "OP3", name: "David Thompson" } }],
    grupy: [
      { grupa_kod: "ZAW_AMO", grupa_naz: "Shock absorbers and springs" },
      { grupa_kod: "ZAW_WAH", grupa_naz: "Control arms and ball joints" },
    ],
    towary: [],
  },
];
