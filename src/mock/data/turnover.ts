export interface MockProductGroup {
  GRUPA_KOD: string;
  GRUPA_NAZ: string;
  PARENT_KOD: string;
}

export const MOCK_PRODUCT_GROUPS: MockProductGroup[] = [
  { GRUPA_KOD: "HAM", GRUPA_NAZ: "Brake systems (pads, discs, calipers)", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "HAM_KLO", GRUPA_NAZ: "Brake pads", PARENT_KOD: "HAM" },
  { GRUPA_KOD: "HAM_TAR", GRUPA_NAZ: "Brake discs", PARENT_KOD: "HAM" },
  { GRUPA_KOD: "HAM_HYD", GRUPA_NAZ: "Brake hydraulics and DOT fluids", PARENT_KOD: "HAM" },
  
  { GRUPA_KOD: "FIL", GRUPA_NAZ: "Automotive filters", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "FIL_OLE", GRUPA_NAZ: "Engine oil filters", PARENT_KOD: "FIL" },
  { GRUPA_KOD: "FIL_POW", GRUPA_NAZ: "Air filters", PARENT_KOD: "FIL" },
  { GRUPA_KOD: "FIL_PAL", GRUPA_NAZ: "Fuel filters (diesel / gasoline)", PARENT_KOD: "FIL" },
  { GRUPA_KOD: "FIL_KAB", GRUPA_NAZ: "Cabin and allergen filters", PARENT_KOD: "FIL" },

  { GRUPA_KOD: "OLE", GRUPA_NAZ: "Engine oils and automotive fluids", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "OLE_SYN", GRUPA_NAZ: "Fully synthetic oils (0W, 5W)", PARENT_KOD: "OLE" },
  { GRUPA_KOD: "OLE_PRZ", GRUPA_NAZ: "Gear oils and ATF", PARENT_KOD: "OLE" },
  { GRUPA_KOD: "USY_CHL", GRUPA_NAZ: "Coolants (G12/G13)", PARENT_KOD: "OLE" },

  { GRUPA_KOD: "ZAW", GRUPA_NAZ: "Suspension and steering", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "ZAW_AMO", GRUPA_NAZ: "Shock absorbers and springs", PARENT_KOD: "ZAW" },
  { GRUPA_KOD: "ZAW_WAH", GRUPA_NAZ: "Control arms and ball joints", PARENT_KOD: "ZAW" },
  { GRUPA_KOD: "ZAW_DRA", GRUPA_NAZ: "Tie rods and ends", PARENT_KOD: "ZAW" },

  { GRUPA_KOD: "ELE", GRUPA_NAZ: "Electrical systems and batteries", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "ELE_AKU", GRUPA_NAZ: "AGM, EFB and lead-acid batteries", PARENT_KOD: "ELE" },
  { GRUPA_KOD: "ELE_OSW", GRUPA_NAZ: "Bulbs and LED/Xenon lighting", PARENT_KOD: "ELE" },
  { GRUPA_KOD: "ELE_ALT", GRUPA_NAZ: "Alternators and starters", PARENT_KOD: "ELE" },

  { GRUPA_KOD: "NAP", GRUPA_NAZ: "Drivetrain and clutches", PARENT_KOD: "ROOT" },
  { GRUPA_KOD: "NAP_SPR", GRUPA_NAZ: "Clutch kits and dual-mass flywheels", PARENT_KOD: "NAP" },
  { GRUPA_KOD: "NAP_PRZ", GRUPA_NAZ: "CV joints and drive shafts", PARENT_KOD: "NAP" },
];

export const MOCK_MONTH_LIST = [
  { miesiac: "March 2026", obrot: 842100.5 },
  { miesiac: "February 2026", obrot: 795400.0 },
  { miesiac: "January 2026", obrot: 728900.2 },
  { miesiac: "December 2025", obrot: 810300.0 },
  { miesiac: "November 2025", obrot: 765200.8 },
  { miesiac: "October 2025", obrot: 830100.0 },
  { miesiac: "September 2025", obrot: 792400.0 },
  { miesiac: "August 2025", obrot: 740100.5 },
  { miesiac: "July 2025", obrot: 755900.0 },
  { miesiac: "June 2025", obrot: 780400.0 },
  { miesiac: "May 2025", obrot: 812000.0 },
  { miesiac: "April 2025", obrot: 845600.0 },
  { miesiac: "March 2025", obrot: 790200.0 },
  { miesiac: "February 2025", obrot: 710400.0 },
  { miesiac: "January 2025", obrot: 685100.0 },
  { miesiac: "December 2024", obrot: 760000.0 },
  { miesiac: "November 2024", obrot: 715000.0 },
  { miesiac: "October 2024", obrot: 775000.0 },
];

// Generate 45 daily entries for March & February 2026
export const MOCK_DAY_LIST = [
  { dzien: "2026-03-21", obrot: 32450.0 },
  { dzien: "2026-03-20", obrot: 41800.5 },
  { dzien: "2026-03-19", obrot: 39120.0 },
  { dzien: "2026-03-18", obrot: 37400.0 },
  { dzien: "2026-03-17", obrot: 36200.0 },
  { dzien: "2026-03-16", obrot: 42100.0 },
  { dzien: "2026-03-15", obrot: 18200.0 },
  { dzien: "2026-03-14", obrot: 28400.0 },
  { dzien: "2026-03-13", obrot: 44900.0 },
  { dzien: "2026-03-12", obrot: 39800.0 },
  { dzien: "2026-03-11", obrot: 38500.0 },
  { dzien: "2026-03-10", obrot: 41200.0 },
  { dzien: "2026-03-09", obrot: 43500.0 },
  { dzien: "2026-03-08", obrot: 15400.0 },
  { dzien: "2026-03-07", obrot: 29800.0 },
  { dzien: "2026-03-06", obrot: 46200.0 },
  { dzien: "2026-03-05", obrot: 42300.0 },
  { dzien: "2026-03-04", obrot: 39900.0 },
  { dzien: "2026-03-03", obrot: 38100.0 },
  { dzien: "2026-03-02", obrot: 44200.0 },
  { dzien: "2026-03-01", obrot: 16800.0 },
  { dzien: "2026-02-28", obrot: 31200.0 },
  { dzien: "2026-02-27", obrot: 43500.0 },
  { dzien: "2026-02-26", obrot: 38900.0 },
  { dzien: "2026-02-25", obrot: 37400.0 },
];

export const MOCK_TOP_FIRMS_MONTH = [
  { fir_kod: "K00103", nazwa: "PACIFIC COAST MOTORS", obrot: 104200.0 },
  { fir_kod: "K00107", nazwa: "ATLANTIC FLEET SERVICES", obrot: 93500.0 },
  { fir_kod: "K00113", nazwa: "LIBERTY AUTO CARE", obrot: 81500.0 },
  { fir_kod: "K00102", nazwa: "LONE STAR PARTS SUPPLY", obrot: 78400.0 },
  { fir_kod: "K00112", nazwa: "ROSE CITY TRANSMISSIONS", obrot: 67400.0 },
  { fir_kod: "K00114", nazwa: "MOTOR CITY WHOLESALE", obrot: 59400.0 },
  { fir_kod: "K00101", nazwa: "ANDERSON AUTO SERVICE", obrot: 54900.0 },
  { fir_kod: "K00105", nazwa: "DESERT RIDGE AUTO REPAIR", obrot: 52300.0 },
  { fir_kod: "K00109", nazwa: "QUEEN CITY COLLISION", obrot: 49800.0 },
  { fir_kod: "K00111", nazwa: "EMERALD CITY BRAKE & TIRE", obrot: 45300.0 },
];
