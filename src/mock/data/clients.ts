export interface MockClient {
  FIR_KOD: string;
  NAZ_SKR: string;
  FIRMA?: string;
  ADRES: string;
  MIASTO: string;
  MIASTO_ODB: string;
  KOD_POCZ: string;
  TELEFON1: string;
  E_MAIL: string;
  NIP: string;
  NIP_CYFRY: string;
  ULICA: string;
  DOM: string;
  LOKAL: string;
  MIASTO_ADRES: string;
  EMAIL_ADRESOWY: string;
  KOD_POCZ_ADR: string;
  TELEFON: string;
  GPS_SZER: number;
  GPS_DLUG: number;
  KRAJ_KOD: string;
  oper_kod: string;
  OBROT: number[];
  MIESIACE: string[];
  obrot: number;
  is_overridden?: boolean;
}

export const INITIAL_CLIENTS: MockClient[] = [
  {
    "FIR_KOD": "K00101",
    "NAZ_SKR": "ANDERSON AUTO SERVICE",
    "FIRMA": "Anderson Auto Service LLC",
    "ADRES": "420 Congress Avenue",
    "MIASTO": "Austin, TX",
    "MIASTO_ODB": "Austin, TX",
    "KOD_POCZ": "78701",
    "TELEFON1": "+1 (512) 555-0100",
    "E_MAIL": "contact@andersonauto.example",
    "NIP": "10-1000000",
    "NIP_CYFRY": "101000000",
    "ULICA": "Congress Avenue",
    "DOM": "420",
    "LOKAL": "",
    "MIASTO_ADRES": "Austin, TX",
    "EMAIL_ADRESOWY": "billing@andersonauto.example",
    "KOD_POCZ_ADR": "78701",
    "TELEFON": "+1 (512) 555-0100",
    "GPS_SZER": 30.2672,
    "GPS_DLUG": -97.7431,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      42500,
      48200,
      51300,
      54900
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 54900
  },
  {
    "FIR_KOD": "K00102",
    "NAZ_SKR": "LONE STAR PARTS SUPPLY",
    "FIRMA": "Lone Star Parts Supply LLC",
    "ADRES": "188 Commerce Street",
    "MIASTO": "Dallas, TX",
    "MIASTO_ODB": "Dallas, TX",
    "KOD_POCZ": "75201",
    "TELEFON1": "+1 (214) 555-0101",
    "E_MAIL": "contact@lonestarparts.example",
    "NIP": "11-1000001",
    "NIP_CYFRY": "111000001",
    "ULICA": "Commerce Street",
    "DOM": "188",
    "LOKAL": "",
    "MIASTO_ADRES": "Dallas, TX",
    "EMAIL_ADRESOWY": "billing@lonestarparts.example",
    "KOD_POCZ_ADR": "75201",
    "TELEFON": "+1 (214) 555-0101",
    "GPS_SZER": 32.7767,
    "GPS_DLUG": -96.797,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      68900,
      62100,
      71500,
      78400
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 78400
  },
  {
    "FIR_KOD": "K00103",
    "NAZ_SKR": "PACIFIC COAST MOTORS",
    "FIRMA": "Pacific Coast Motors LLC",
    "ADRES": "210 Sunset Boulevard",
    "MIASTO": "Los Angeles, CA",
    "MIASTO_ODB": "Los Angeles, CA",
    "KOD_POCZ": "90028",
    "TELEFON1": "+1 (323) 555-0102",
    "E_MAIL": "contact@pacificcoastmotors.example",
    "NIP": "12-1000002",
    "NIP_CYFRY": "121000002",
    "ULICA": "Sunset Boulevard",
    "DOM": "210",
    "LOKAL": "",
    "MIASTO_ADRES": "Los Angeles, CA",
    "EMAIL_ADRESOWY": "billing@pacificcoastmotors.example",
    "KOD_POCZ_ADR": "90028",
    "TELEFON": "+1 (323) 555-0102",
    "GPS_SZER": 34.0983,
    "GPS_DLUG": -118.3267,
    "KRAJ_KOD": "US",
    "oper_kod": "OP2",
    "OBROT": [
      95000,
      89000,
      92400,
      104200
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 104200
  },
  {
    "FIR_KOD": "K00104",
    "NAZ_SKR": "MILE HIGH AUTO PARTS",
    "FIRMA": "Mile High Auto Parts LLC",
    "ADRES": "520 Broadway",
    "MIASTO": "Denver, CO",
    "MIASTO_ODB": "Denver, CO",
    "KOD_POCZ": "80203",
    "TELEFON1": "+1 (303) 555-0103",
    "E_MAIL": "contact@milehighparts.example",
    "NIP": "13-1000003",
    "NIP_CYFRY": "131000003",
    "ULICA": "Broadway",
    "DOM": "520",
    "LOKAL": "",
    "MIASTO_ADRES": "Denver, CO",
    "EMAIL_ADRESOWY": "billing@milehighparts.example",
    "KOD_POCZ_ADR": "80203",
    "TELEFON": "+1 (303) 555-0103",
    "GPS_SZER": 39.7392,
    "GPS_DLUG": -104.9903,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      34200,
      31000,
      28500,
      24100
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 24100
  },
  {
    "FIR_KOD": "K00105",
    "NAZ_SKR": "DESERT RIDGE AUTO REPAIR",
    "FIRMA": "Desert Ridge Auto Repair LLC",
    "ADRES": "130 Camelback Road",
    "MIASTO": "Phoenix, AZ",
    "MIASTO_ODB": "Phoenix, AZ",
    "KOD_POCZ": "85016",
    "TELEFON1": "+1 (602) 555-0104",
    "E_MAIL": "contact@desertridgeauto.example",
    "NIP": "14-1000004",
    "NIP_CYFRY": "141000004",
    "ULICA": "Camelback Road",
    "DOM": "130",
    "LOKAL": "",
    "MIASTO_ADRES": "Phoenix, AZ",
    "EMAIL_ADRESOWY": "billing@desertridgeauto.example",
    "KOD_POCZ_ADR": "85016",
    "TELEFON": "+1 (602) 555-0104",
    "GPS_SZER": 33.5092,
    "GPS_DLUG": -112.0251,
    "KRAJ_KOD": "US",
    "oper_kod": "OP2",
    "OBROT": [
      51200,
      48900,
      47100,
      52300
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 52300
  },
  {
    "FIR_KOD": "K00106",
    "NAZ_SKR": "GREAT LAKES DIESEL",
    "FIRMA": "Great Lakes Diesel LLC",
    "ADRES": "840 West Madison Street",
    "MIASTO": "Chicago, IL",
    "MIASTO_ODB": "Chicago, IL",
    "KOD_POCZ": "60607",
    "TELEFON1": "+1 (312) 555-0105",
    "E_MAIL": "contact@greatlakesdiesel.example",
    "NIP": "15-1000005",
    "NIP_CYFRY": "151000005",
    "ULICA": "West Madison Street",
    "DOM": "840",
    "LOKAL": "",
    "MIASTO_ADRES": "Chicago, IL",
    "EMAIL_ADRESOWY": "billing@greatlakesdiesel.example",
    "KOD_POCZ_ADR": "60607",
    "TELEFON": "+1 (312) 555-0105",
    "GPS_SZER": 41.8819,
    "GPS_DLUG": -87.6476,
    "KRAJ_KOD": "US",
    "oper_kod": "OP2",
    "OBROT": [
      39000,
      36500,
      38100,
      41200
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 41200
  },
  {
    "FIR_KOD": "K00107",
    "NAZ_SKR": "ATLANTIC FLEET SERVICES",
    "FIRMA": "Atlantic Fleet Services LLC",
    "ADRES": "301 Biscayne Boulevard",
    "MIASTO": "Miami, FL",
    "MIASTO_ODB": "Miami, FL",
    "KOD_POCZ": "33132",
    "TELEFON1": "+1 (305) 555-0106",
    "E_MAIL": "contact@atlanticfleet.example",
    "NIP": "16-1000006",
    "NIP_CYFRY": "161000006",
    "ULICA": "Biscayne Boulevard",
    "DOM": "301",
    "LOKAL": "",
    "MIASTO_ADRES": "Miami, FL",
    "EMAIL_ADRESOWY": "billing@atlanticfleet.example",
    "KOD_POCZ_ADR": "33132",
    "TELEFON": "+1 (305) 555-0106",
    "GPS_SZER": 25.7781,
    "GPS_DLUG": -80.1871,
    "KRAJ_KOD": "US",
    "oper_kod": "OP3",
    "OBROT": [
      84100,
      79200,
      88300,
      93500
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 93500
  },
  {
    "FIR_KOD": "K00108",
    "NAZ_SKR": "PEACHTREE AUTO SUPPLY",
    "FIRMA": "Peachtree Auto Supply LLC",
    "ADRES": "140 Peachtree Street",
    "MIASTO": "Atlanta, GA",
    "MIASTO_ODB": "Atlanta, GA",
    "KOD_POCZ": "30303",
    "TELEFON1": "+1 (404) 555-0107",
    "E_MAIL": "contact@peachtreeauto.example",
    "NIP": "17-1000007",
    "NIP_CYFRY": "171000007",
    "ULICA": "Peachtree Street",
    "DOM": "140",
    "LOKAL": "",
    "MIASTO_ADRES": "Atlanta, GA",
    "EMAIL_ADRESOWY": "billing@peachtreeauto.example",
    "KOD_POCZ_ADR": "30303",
    "TELEFON": "+1 (404) 555-0107",
    "GPS_SZER": 33.755,
    "GPS_DLUG": -84.388,
    "KRAJ_KOD": "US",
    "oper_kod": "OP3",
    "OBROT": [
      29500,
      31200,
      27800,
      26400
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 26400
  },
  {
    "FIR_KOD": "K00109",
    "NAZ_SKR": "QUEEN CITY COLLISION",
    "FIRMA": "Queen City Collision LLC",
    "ADRES": "180 South Tryon Street",
    "MIASTO": "Charlotte, NC",
    "MIASTO_ODB": "Charlotte, NC",
    "KOD_POCZ": "28202",
    "TELEFON1": "+1 (704) 555-0108",
    "E_MAIL": "contact@queencitycollision.example",
    "NIP": "18-1000008",
    "NIP_CYFRY": "181000008",
    "ULICA": "South Tryon Street",
    "DOM": "180",
    "LOKAL": "",
    "MIASTO_ADRES": "Charlotte, NC",
    "EMAIL_ADRESOWY": "billing@queencitycollision.example",
    "KOD_POCZ_ADR": "28202",
    "TELEFON": "+1 (704) 555-0108",
    "GPS_SZER": 35.2271,
    "GPS_DLUG": -80.8431,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      44800,
      42100,
      46500,
      49800
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 49800
  },
  {
    "FIR_KOD": "K00110",
    "NAZ_SKR": "MUSIC CITY MOTOR PARTS",
    "FIRMA": "Music City Motor Parts LLC",
    "ADRES": "105 Broadway",
    "MIASTO": "Nashville, TN",
    "MIASTO_ODB": "Nashville, TN",
    "KOD_POCZ": "37203",
    "TELEFON1": "+1 (615) 555-0109",
    "E_MAIL": "contact@musiccityparts.example",
    "NIP": "19-1000009",
    "NIP_CYFRY": "191000009",
    "ULICA": "Broadway",
    "DOM": "105",
    "LOKAL": "",
    "MIASTO_ADRES": "Nashville, TN",
    "EMAIL_ADRESOWY": "billing@musiccityparts.example",
    "KOD_POCZ_ADR": "37203",
    "TELEFON": "+1 (615) 555-0109",
    "GPS_SZER": 36.1627,
    "GPS_DLUG": -86.7816,
    "KRAJ_KOD": "US",
    "oper_kod": "OP2",
    "OBROT": [
      22400,
      19800,
      18500,
      16200
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 16200
  },
  {
    "FIR_KOD": "K00111",
    "NAZ_SKR": "EMERALD CITY BRAKE & TIRE",
    "FIRMA": "Emerald City Brake & Tire LLC",
    "ADRES": "240 Pine Street",
    "MIASTO": "Seattle, WA",
    "MIASTO_ODB": "Seattle, WA",
    "KOD_POCZ": "98101",
    "TELEFON1": "+1 (206) 555-0110",
    "E_MAIL": "contact@emeraldcitybrake.example",
    "NIP": "20-1000010",
    "NIP_CYFRY": "201000010",
    "ULICA": "Pine Street",
    "DOM": "240",
    "LOKAL": "",
    "MIASTO_ADRES": "Seattle, WA",
    "EMAIL_ADRESOWY": "billing@emeraldcitybrake.example",
    "KOD_POCZ_ADR": "98101",
    "TELEFON": "+1 (206) 555-0110",
    "GPS_SZER": 47.61,
    "GPS_DLUG": -122.334,
    "KRAJ_KOD": "US",
    "oper_kod": "OP3",
    "OBROT": [
      37500,
      39100,
      42000,
      45300
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 45300
  },
  {
    "FIR_KOD": "K00112",
    "NAZ_SKR": "ROSE CITY TRANSMISSIONS",
    "FIRMA": "Rose City Transmissions LLC",
    "ADRES": "610 Northwest Everett Street",
    "MIASTO": "Portland, OR",
    "MIASTO_ODB": "Portland, OR",
    "KOD_POCZ": "97209",
    "TELEFON1": "+1 (503) 555-0111",
    "E_MAIL": "contact@rosecitytransmissions.example",
    "NIP": "21-1000011",
    "NIP_CYFRY": "211000011",
    "ULICA": "Northwest Everett Street",
    "DOM": "610",
    "LOKAL": "",
    "MIASTO_ADRES": "Portland, OR",
    "EMAIL_ADRESOWY": "billing@rosecitytransmissions.example",
    "KOD_POCZ_ADR": "97209",
    "TELEFON": "+1 (503) 555-0111",
    "GPS_SZER": 45.525,
    "GPS_DLUG": -122.677,
    "KRAJ_KOD": "US",
    "oper_kod": "OP3",
    "OBROT": [
      58200,
      54900,
      61000,
      67400
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 67400
  },
  {
    "FIR_KOD": "K00113",
    "NAZ_SKR": "LIBERTY AUTO CARE",
    "FIRMA": "Liberty Auto Care LLC",
    "ADRES": "880 Market Street",
    "MIASTO": "Philadelphia, PA",
    "MIASTO_ODB": "Philadelphia, PA",
    "KOD_POCZ": "19107",
    "TELEFON1": "+1 (215) 555-0112",
    "E_MAIL": "contact@libertyautocare.example",
    "NIP": "22-1000012",
    "NIP_CYFRY": "221000012",
    "ULICA": "Market Street",
    "DOM": "880",
    "LOKAL": "",
    "MIASTO_ADRES": "Philadelphia, PA",
    "EMAIL_ADRESOWY": "billing@libertyautocare.example",
    "KOD_POCZ_ADR": "19107",
    "TELEFON": "+1 (215) 555-0112",
    "GPS_SZER": 39.9526,
    "GPS_DLUG": -75.1652,
    "KRAJ_KOD": "US",
    "oper_kod": "OP3",
    "OBROT": [
      71000,
      68400,
      74200,
      81500
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 81500
  },
  {
    "FIR_KOD": "K00114",
    "NAZ_SKR": "MOTOR CITY WHOLESALE",
    "FIRMA": "Motor City Wholesale LLC",
    "ADRES": "500 Woodward Avenue",
    "MIASTO": "Detroit, MI",
    "MIASTO_ODB": "Detroit, MI",
    "KOD_POCZ": "48226",
    "TELEFON1": "+1 (313) 555-0113",
    "E_MAIL": "contact@motorcitywholesale.example",
    "NIP": "23-1000013",
    "NIP_CYFRY": "231000013",
    "ULICA": "Woodward Avenue",
    "DOM": "500",
    "LOKAL": "",
    "MIASTO_ADRES": "Detroit, MI",
    "EMAIL_ADRESOWY": "billing@motorcitywholesale.example",
    "KOD_POCZ_ADR": "48226",
    "TELEFON": "+1 (313) 555-0113",
    "GPS_SZER": 42.3314,
    "GPS_DLUG": -83.0458,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      49800,
      52300,
      55100,
      59400
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 59400
  },
  {
    "FIR_KOD": "K00115",
    "NAZ_SKR": "BAY STATE TURBO WORKS",
    "FIRMA": "Bay State Turbo Works LLC",
    "ADRES": "920 Atlantic Avenue",
    "MIASTO": "Boston, MA",
    "MIASTO_ODB": "Boston, MA",
    "KOD_POCZ": "02110",
    "TELEFON1": "+1 (617) 555-0114",
    "E_MAIL": "contact@baystateturbo.example",
    "NIP": "24-1000014",
    "NIP_CYFRY": "241000014",
    "ULICA": "Atlantic Avenue",
    "DOM": "920",
    "LOKAL": "",
    "MIASTO_ADRES": "Boston, MA",
    "EMAIL_ADRESOWY": "billing@baystateturbo.example",
    "KOD_POCZ_ADR": "02110",
    "TELEFON": "+1 (617) 555-0114",
    "GPS_SZER": 42.3555,
    "GPS_DLUG": -71.0518,
    "KRAJ_KOD": "US",
    "oper_kod": "OP1",
    "OBROT": [
      31500,
      29800,
      33400,
      36200
    ],
    "MIESIACE": [
      "December",
      "January",
      "February",
      "March"
    ],
    "obrot": 36200
  }
];
