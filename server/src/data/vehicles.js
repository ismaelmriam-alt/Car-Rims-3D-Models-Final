// VERIFIED VEHICLE FITMENT DATA
// -----------------------------------------------------------------------------
// Every record below was transcribed from a fitment page that was actually
// fetched (source URL stored on each record). Nothing is filled from memory.
//
// Wheel token format:  <diameter>x<width>@<offset ET>[F|R][*]
//   F / R = source lists the size for the front / rear axle only
//   *     = the source page marks this wheel as OEM / factory
// A wheel without "*" is simply "listed by the source" (optional or the source
// does not say). The source's OEM flag is never guessed.
//
// Rows the source lists that look inconsistent were deliberately LEFT OUT:
//   - Kia Picanto TA 1.0 MPi: "15x5 ET59" (every other row says ET49)
//   - Kia Picanto JA facelift 1.2 MPi: "4.5Jx15 ET41" (13" in all other pages)
// Models with no source page yet are listed in UNVERIFIED_MODELS and are shown
// as "needs verification" - no specs are stored for them.

const KOLESO = (p) => ({ name: 'koleso.ee', url: `https://koleso.ee/en/valuveljed/${p}` });
const TWG = (p) => ({ name: 'tirewheelguide.com', url: `https://tirewheelguide.com/sizes/${p}/` });
const RETRIEVED = '2026-11';

// body type is used ONLY to pick a stylised 3D body shape and style hints.
export const MODELS = [
  ['Kia', 'Picanto', 'hatchback'],
  ['Honda', 'Accord', 'sedan'],
  ['Honda', 'CR-V', 'suv'],
  ['Honda', 'Civic', 'sedan'],
  ['BMW', 'X1', 'suv'],
  ['BMW', '3 Series', 'sedan'],
  ['Toyota', 'Yaris', 'hatchback'],
  ['Toyota', 'Corolla', 'sedan'],
  ['Toyota', 'Camry', 'sedan'],
  ['Hyundai', 'Elantra', 'sedan'],
  ['Hyundai', 'Tucson', 'suv'],
  ['Mercedes-Benz', 'C-Class', 'sedan'],
  ['Audi', 'A3', 'hatchback'],
  ['Volkswagen', 'Golf', 'hatchback'],
  ['Volkswagen', 'Polo', 'hatchback'],
  ['Nissan', 'Qashqai', 'suv'],
].map(([make, model, bodyType]) => ({ make, model, bodyType }));

// Real models with NO verified fitment data yet. No specs, no years, no trims.
export const UNVERIFIED_MODELS = [
  ['Kia', 'Rio', 'sedan'],
  ['Hyundai', 'i10', 'hatchback'],
  ['BMW', '5 Series', 'sedan'],
  ['Mercedes-Benz', 'E-Class', 'sedan'],
  ['Audi', 'A4', 'sedan'],
  ['Nissan', 'Sentra', 'sedan'],
  ['Toyota', 'RAV4', 'suv'],
  ['Ford', 'Focus', 'hatchback'],
  // Additional showcase vehicles. They are selectable, but have no verified wheel-fitment records yet.
  ['BMW', 'X3', 'suv'],
  ['BMW', 'X5', 'suv'],
  ['BMW', 'X6', 'suv'],
  ['Ferrari', '488', 'coupe'],
  ['Porsche', '911', 'coupe'],
  ['Mercedes-Benz', 'G-Class', 'suv'],
  ['Lamborghini', 'Huracan', 'coupe'],
  ['Land Rover', 'Range Rover Sport', 'suv'],
].map(([make, model, bodyType]) => ({ make, model, bodyType }));

export const FITMENTS = [
  // ---------------------------------------------------------------- Kia Picanto
  {
    make: 'Kia', model: 'Picanto', generation: 'I (SA)', market: null,
    yearFrom: 2004, yearTo: 2007, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/sa-2004-2007/5235'),
    trims: [
      { name: '1.0i (60 hp)', wheels: '14x5@46* 13x4@46 13x4.5@46 15x5.5@46' },
      { name: '1.1 CRDi (74 hp)', wheels: '14x5@46* 13x4@46 13x4.5@46 15x5.5@46' },
      { name: '1.1i (64 hp)', wheels: '14x5@46* 13x4@46 13x4.5@46 15x5.5@46' },
    ],
  },
  {
    make: 'Kia', model: 'Picanto', generation: 'I (SA) Facelift', market: null,
    yearFrom: 2007, yearTo: 2011, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/sa-2007-2011/5236'),
    trims: [
      { name: '1.0i (61 hp)', wheels: '13x4@46* 14x5@46* 13x4.5@46 15x5.5@46' },
      { name: '1.1 CRDi (74 hp)', wheels: '14x5@46* 13x4@46 13x4.5@46 15x5.5@46' },
      { name: '1.1i (64 hp)', wheels: '13x4@46* 14x5@46* 13x4.5@46 15x5.5@46' },
    ],
  },
  {
    make: 'Kia', model: 'Picanto', generation: 'II (TA)', market: null,
    yearFrom: 2011, yearTo: 2017, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/ta-2011-2017/5237'),
    trims: [
      { name: '1.0 LPi (80 hp)', wheels: '13x4@46* 13x4.5@46* 14x5@49 15x5@49 15x5.5@52' },
      { name: '1.0 MPi (68 hp)', wheels: '13x4@46* 13x4.5@46* 14x5@49 15x5.5@52' },
      { name: '1.0 MPi (65 hp)', wheels: '13x4@46* 13x4.5@46* 14x5@49 15x5.5@52' },
      { name: '1.0 TCi (98 hp)', wheels: '14x5@49* 15x5@49 15x5.5@52 15x6@48' },
      { name: '1.2 MPi (84 hp)', wheels: '14x5@49* 15x5@49 15x5.5@52 15x6@48' },
    ],
  },
  {
    make: 'Kia', model: 'Picanto', generation: 'III (JA)', market: null,
    yearFrom: 2017, yearTo: 2022, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/ja-2017-2022/5238'),
    trims: [
      {
        name: '1.0 MPi (66 hp)',
        trimLevels: ['Classic', 'Comfort', 'Attract', 'Edition 7', 'Dream-Team', 'Spirit', 'Neon', 'Titan', 'Silber', 'Emotion'],
        wheels: '13x4.5@41* 14x5.5@45* 15x6@51 16x6@51 16x6.5@51',
      },
      { name: '1.0 T-GDi (99 hp)', trimLevels: ['GT Line', 'X-Line'], wheels: '14x5.5@45* 15x6@51* 16x6.5@51' },
      { name: '1.2 MPi (83 hp)', wheels: '13x4.5@41* 14x5.5@45* 15x6@51 16x6.5@51' },
    ],
  },
  {
    make: 'Kia', model: 'Picanto', generation: 'III (JA) Facelift', market: null,
    yearFrom: 2020, yearTo: 2024, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/ja-2020-2024/5239'),
    trims: [
      { name: '1.0 MPi (66 hp)', wheels: '13x4.5@41* 14x5.5@45* 15x6@51 16x6@51 16x6.5@51' },
      { name: '1.0 T-GDi (99 hp)', trimLevels: ['GT'], wheels: '15x6@51* 16x6.5@51* 14x5.5@45 16x6@51' },
      { name: '1.2 MPi (83 hp)', trimLevels: ['GT-Line', 'X-Line'], wheels: '14x5.5@45* 15x6@51* 16x6@51 16x6.5@51' },
    ],
  },
  {
    make: 'Kia', model: 'Picanto', generation: 'III (JA) Facelift', market: null,
    yearFrom: 2024, yearTo: 2026, pcd: '4x100', hubBore: 54.1,
    source: KOLESO('kia/picanto/2608/ja-2024-now/5240'),
    trims: [
      { name: '1.0 DPi (62 hp)', wheels: '14x5.5@45* 13x4.5@41 15x6@51 16x6.5@51' },
      { name: '1.2 DPi (78 hp)', wheels: '14x5.5@45* 15x6@51 16x6@51 16x6.5@51' },
    ],
  },

  // --------------------------------------------------------------------- Honda
  {
    make: 'Honda', model: 'Accord', generation: 'VIII (CU/CW) Facelift', market: null,
    yearFrom: 2011, yearTo: 2015, pcd: '5x114.3', hubBore: 64.1,
    source: KOLESO('honda/accord/1914/cu-cw-2011-2015/3711'),
    trims: [
      { name: '2.0i (154 hp)', wheels: '16x6.5@55* 17x7.5@55* 17x6.5@55 18x7@50 18x7.5@55 19x7.5@50' },
      { name: '2.2 i-DTEC (177 hp)', wheels: '17x7.5@55* 18x8@55* 18x7.5@55 19x8.5@50 20x9@45' },
      { name: '2.2 i-DTEC (148 hp)', wheels: '16x6.5@55* 17x7.5@55* 18x7.5@55 19x8@45' },
      { name: '2.4i (198 hp)', wheels: '17x7.5@55* 18x8@55* 18x7.5@55 19x8.5@45' },
    ],
  },
  {
    make: 'Honda', model: 'CR-V', generation: 'VI (RS)', market: null,
    yearFrom: 2022, yearTo: 2026, pcd: '5x120', hubBore: 64.1,
    source: KOLESO('honda/cr-v/1924/rs-2022-now/3775'),
    trims: [
      { name: '2.0 e:HEV (204 hp)', trimLevels: ['Sport Hybrid', 'Sport Touring Hybrid'], wheels: '18x7.5@40* 19x7.5@40*' },
    ],
  },
  {
    make: 'Honda', model: 'Civic', generation: 'FC Facelift', market: 'Europe',
    yearFrom: 2019, yearTo: 2023, pcd: '5x114.3', hubBore: 64.1,
    source: TWG('honda/civic/2019'),
    trims: [
      { name: '1.0 VTEC (126 hp)', wheels: '17x7@45 16x7@45 18x8@50' },
      { name: '1.5 VTEC (180 hp)', wheels: '17x7@45 18x8@50' },
    ],
  },
  {
    make: 'Honda', model: 'Civic', generation: 'FC Facelift', market: 'Middle East',
    yearFrom: 2019, yearTo: 2023, pcd: '5x114.3', hubBore: 64.1,
    source: TWG('honda/civic/2019'),
    trims: [{ name: '1.6 i-VTEC (123 hp)', wheels: '16x7@45 17x7@45' }],
  },
  {
    make: 'Honda', model: 'Civic', generation: 'FC Facelift', market: 'USA',
    yearFrom: 2019, yearTo: 2023, pcd: '5x114.3', hubBore: 64.1,
    source: TWG('honda/civic/2019'),
    trims: [
      { name: '1.5 VTEC (174 hp)', wheels: '17x7@45 18x8@50 16x7@45' },
      { name: '1.5 VTEC (205 hp)', wheels: '18x8@50' },
    ],
  },
  {
    make: 'Honda', model: 'Civic', generation: 'FA/FG', market: 'USA',
    yearFrom: 2006, yearTo: 2011, pcd: '5x114.3', hubBore: 64.1,
    source: TWG('honda/civic/2008'),
    trims: [
      { name: '1.3 Hybrid (110 hp)', wheels: '15x6@45 16x6.5@45 17x6.5@45 17x7@45' },
      { name: '1.8 CNG (113 hp)', wheels: '15x6@45 16x6.5@45 17x7@45' },
      { name: '2.0i (197 hp)', wheels: '15x6@45 16x6.5@45 17x6.5@45 17x7@45' },
    ],
  },

  // ----------------------------------------------------------------------- BMW
  {
    make: 'BMW', model: 'X1', generation: 'II (F48) LCI', market: null,
    yearFrom: 2019, yearTo: 2022, pcd: '5x112', hubBore: 66.6,
    source: KOLESO('bmw/x1/267/f48-2019-2022/567'),
    trims: [
      {
        name: 'sDrive18d (148 hp)', trimLevels: ['Advantage', 'Sport Line', 'xLine', 'M Sport'],
        wheels: '17x7.5@52* 17x6.5@39 18x6.5@41 18x7.5@51 19x8@47 20x8@50',
      },
      {
        name: 'sDrive20i (189 hp)', trimLevels: ['Advantage', 'Sport Line', 'xLine', 'M Sport'],
        wheels: '17x7.5@52* 17x6.5@39 18x7.5@51 19x8@47 20x8@50',
      },
      {
        name: 'xDrive25e (217 hp)', trimLevels: ['Advantage', 'Sport Line', 'xLine', 'M Sport'],
        wheels: '17x7.5@52* 17x6.5@39 18x6.5@41 18x7.5@51 19x8@47 20x8@50',
      },
    ],
  },
  {
    make: 'BMW', model: '3 Series', generation: 'VII (G20/G21/G28)', market: 'Europe',
    yearFrom: 2018, yearTo: 2023, pcd: '5x112', hubBore: 66.6,
    source: TWG('bmw/3-series/2019'),
    trims: [
      { name: '318d (148 hp)', wheels: '16x6.5@22 17x7.5@30 18x7.5@25 18x8.5@40 19x8.5@40 20x8.5@40' },
      { name: '320d (188 hp)', wheels: '16x6.5@22 17x7.5@30 18x7.5@25 18x8.5@40 19x8.5@40 20x8.5@40' },
      { name: '330e (288 hp)', wheels: '17x7.5@30 18x7.5@25 18x8.5@40 19x8.5@40 20x8.5@40' },
      { name: 'M340i xDrive (382 hp)', wheels: '17x7.5@30 18x7.5@25 18x8.5@40 19x8.5@40 20x8.5@40' },
    ],
  },
  {
    make: 'BMW', model: '3 Series', generation: 'VII (G20/G21/G28)', market: 'USA',
    yearFrom: 2018, yearTo: 2023, pcd: '5x112', hubBore: 66.6,
    source: TWG('bmw/3-series/2019'),
    trims: [
      { name: '330i (255 hp)', wheels: '18x7.5@25F 19x8@27F 20x8@27F 18x8.5@40R 19x8.5@40R 20x8.5@40R 17x7.5@30' },
      { name: 'M340i (382 hp)', wheels: '18x8.5@40 17x7.5@30 18x7.5@25 19x8.5@40 20x8.5@40' },
    ],
  },
  {
    make: 'BMW', model: '3 Series', generation: 'VI (F30/F31/F34) LCI', market: 'Europe',
    yearFrom: 2015, yearTo: 2019, pcd: '5x120', hubBore: 72.6,
    source: TWG('bmw/3-series/2019'),
    trims: [
      { name: '318i (134 hp)', wheels: '16x7@31 16x7.5@37 17x7.5@37 18x8@34 18x8.5@47 19x8.5@47 20x8.5@47' },
      { name: '320d (188 hp)', wheels: '16x7@31 16x7.5@37 17x7.5@37 18x8@34 18x8.5@47 19x8.5@47 20x8.5@47' },
      { name: '335d xDrive (308 hp)', wheels: '17x7.5@37 18x8@34 18x8.5@47 19x8.5@47 20x8.5@47' },
    ],
  },
  {
    make: 'BMW', model: '3 Series', generation: 'IV (E46) Facelift', market: 'Europe',
    yearFrom: 2001, yearTo: 2007, pcd: '5x120', hubBore: 72.6,
    source: TWG('bmw/3-series/2004'),
    trims: [
      { name: '316i (114 hp)', wheels: '17x7.5@41F 17x8.5@50R 18x8@47F 18x8.5@50R 15x6.5@42 16x7@47 16x7@46 17x7@47 17x8@47' },
      { name: '320d (148 hp)', wheels: '15x6.5@42 16x7@46 16x7@47 17x7@47 17x8.5@50 17x8@47 18x8.5@50' },
      { name: '330Ci (228 hp)', wheels: '17x7@47 17x8.5@50 17x8@47 18x8.5@50' },
    ],
  },
  {
    make: 'BMW', model: '3 Series', generation: 'IV (E46) Facelift', market: 'USA',
    yearFrom: 2001, yearTo: 2007, pcd: '5x120', hubBore: 72.6,
    source: TWG('bmw/3-series/2004'),
    trims: [
      { name: '325xi (184 hp)', wheels: '16x7@47 17x7@47 17x8.5@50 17x8@47 18x8.5@50' },
      { name: '330i (225 hp)', wheels: '17x7@47 17x8@47 16x7@47 17x8.5@50 18x8.5@50' },
    ],
  },

  // -------------------------------------------------------------------- Toyota
  {
    make: 'Toyota', model: 'Yaris', generation: 'XP130 Facelift', market: 'Europe',
    yearFrom: 2014, yearTo: 2023, pcd: '4x100', hubBore: 54.1,
    source: TWG('toyota/yaris/2019'),
    trims: [
      { name: '1.0 VVT-i (71 hp)', wheels: '14x5@39 15x5@39 15x5.5@45' },
      { name: '1.5 Hybrid (99 hp)', wheels: '15x5@39 15x5.5@45 16x6@51' },
      { name: '1.5 Hybrid GR Sport (99 hp)', wheels: '17x7@50' },
    ],
  },
  {
    make: 'Toyota', model: 'Yaris', generation: 'XP150 Facelift', market: 'Middle East',
    yearFrom: 2017, yearTo: 2023, pcd: '4x100', hubBore: 54.1,
    source: TWG('toyota/yaris/2019'),
    trims: [{ name: '1.3 VVT-i (86 hp)', wheels: '15x5.5@45 16x6@39' }],
  },
  {
    make: 'Toyota', model: 'Corolla', generation: 'E120/E130 Facelift', market: 'Europe',
    yearFrom: 2004, yearTo: 2007, pcd: '4x100', hubBore: 54.1,
    source: TWG('toyota/corolla/2005'),
    trims: [
      { name: '1.4 D (89 hp)', wheels: '14x5.5@45 15x6@45 16x6@45 17x7.5@40' },
      { name: '1.8 VVTL-i TS (221 hp)', wheels: '14x5.5@45 15x6@45 16x6@45 17x7.5@40' },
    ],
  },
  {
    make: 'Toyota', model: 'Corolla', generation: 'E120/E130 Facelift', market: 'Middle East',
    yearFrom: 2004, yearTo: 2007, pcd: '4x100', hubBore: 54.1,
    source: TWG('toyota/corolla/2005'),
    trims: [{ name: '1.3 VVT-i (86 hp)', wheels: '14x5.5@39' }],
  },
  {
    make: 'Toyota', model: 'Corolla', generation: 'E120', market: 'USA',
    yearFrom: 2003, yearTo: 2008, pcd: '5x100', hubBore: 54.1,
    source: TWG('toyota/corolla/2005'),
    trims: [
      { name: '1.8 VVTi (130 hp)', wheels: '15x6@45 16x6@45' },
      { name: '1.8 VVTLi (170 hp)', wheels: '15x6@45 16x6@45' },
    ],
  },
  {
    // The source page is for the 2019 model year and does not state a generation.
    make: 'Toyota', model: 'Corolla', generation: '2019 model year', market: 'Europe',
    yearFrom: 2019, yearTo: 2019, pcd: '5x114.3', hubBore: 60.1,
    source: TWG('toyota/corolla/2019'),
    trims: [
      { name: '1.2 VVT-i (114 hp)', wheels: '15x6.5@40 16x7@40 17x7@40 17x7.5@40 18x8@40' },
      { name: '1.8 (121 hp)', wheels: '16x7@40 17x7@40 17x7.5@40 18x7.5@40 18x8@40' },
      { name: '2.0 (177 hp)', wheels: '16x7@40 17x7.5@40 18x8@40' },
    ],
  },
  {
    make: 'Toyota', model: 'Corolla', generation: '2019 model year', market: 'USA',
    yearFrom: 2019, yearTo: 2019, pcd: '5x100', hubBore: 54.1,
    source: TWG('toyota/corolla/2019'),
    trims: [{ name: '1.8i (132 hp)', wheels: '15x6@33 16x6.5@39 17x7@39' }],
  },
  {
    make: 'Toyota', model: 'Camry', generation: 'IX (XV70)', market: 'Europe',
    yearFrom: 2017, yearTo: 2023, pcd: '5x114.3', hubBore: 60.1,
    source: TWG('toyota/camry/2019'),
    trims: [
      { name: '2.0 VVT-i (148 hp)', wheels: '16x6.5@40 17x7.5@45 18x8@50 19x8@50' },
      { name: '2.5 Hybrid (215 hp)', wheels: '17x7.5@45 18x8@50 19x8@50 19x8.5@45' },
      { name: '3.5 VVT-i V6 (245 hp)', wheels: '18x8@50 19x8@50 19x8.5@50' },
    ],
  },
  {
    make: 'Toyota', model: 'Camry', generation: 'IX (XV70)', market: 'Middle East',
    yearFrom: 2017, yearTo: 2023, pcd: '5x114.3', hubBore: 60.1,
    source: TWG('toyota/camry/2019'),
    trims: [{ name: '3.5 VVT-i V6 (298 hp)', wheels: '18x8@50 19x8@50 19x8.5@45' }],
  },
  {
    make: 'Toyota', model: 'Camry', generation: 'IX (XV70)', market: 'USA',
    yearFrom: 2017, yearTo: 2023, pcd: '5x114.3', hubBore: 60.1,
    source: TWG('toyota/camry/2019'),
    trims: [{ name: '3.5 VVT-i V6 (301 hp)', wheels: '18x8@50 19x8@50 19x8.5@45' }],
  },

  // ------------------------------------------------------------------- Hyundai
  {
    make: 'Hyundai', model: 'Elantra', generation: 'VI (AD) Facelift', market: 'Europe',
    yearFrom: 2019, yearTo: 2022, pcd: '5x114.3', hubBore: 67.1,
    source: TWG('hyundai/elantra/2019'),
    trims: [
      { name: '1.6 MPi (126 hp)', wheels: '15x6@46 16x6@50 16x6.5@50 17x6.5@50 17x7@53' },
      { name: '2.0 MPi (148 hp)', wheels: '16x6@50 16x6.5@50 17x7@53 17x6.5@50 18x7.5@55' },
    ],
  },
  {
    make: 'Hyundai', model: 'Elantra', generation: 'VI (AD) Facelift', market: 'USA',
    yearFrom: 2019, yearTo: 2022, pcd: '5x114.3', hubBore: 67.1,
    source: TWG('hyundai/elantra/2019'),
    trims: [
      { name: '1.4 T-GDi (128 hp)', wheels: '15x6@46 16x6@50 16x6.5@50 17x6.5@50 17x7@53' },
      { name: '1.6 T-GDi (201 hp)', wheels: '18x7.5@55 19x7.5@55 19x8@50' },
    ],
  },
  {
    make: 'Hyundai', model: 'Tucson', generation: 'TL Facelift', market: 'Europe',
    yearFrom: 2018, yearTo: 2025, pcd: '5x114.3', hubBore: 67.1,
    source: TWG('hyundai/tucson/2019'),
    trims: [
      { name: '1.6 GDi (130 hp)', wheels: '16x6.5@45 17x7@51 17x7@42 18x7@42 18x7.5@53 19x7@51 19x7.5@54' },
      { name: '1.6 T-GDi (174 hp)', wheels: '16x6.5@45 17x7@51 18x7@51 17x7@42 18x7@42 18x7.5@53 19x7.5@54' },
      { name: '2.0 CRDi (182 hp)', wheels: '17x7@51 18x7@51 19x7.5@54 17x7@42 18x7@42 18x7.5@53 20x8@48' },
    ],
  },
  {
    make: 'Hyundai', model: 'Tucson', generation: 'TL Facelift', market: 'Middle East',
    yearFrom: 2018, yearTo: 2025, pcd: '5x114.3', hubBore: 67.1,
    source: TWG('hyundai/tucson/2019'),
    trims: [{ name: '2.4 GDi (176 hp)', wheels: '18x7@51 19x7.5@53 18x7.5@53 20x8@48' }],
  },
  {
    make: 'Hyundai', model: 'Tucson', generation: 'TL Facelift', market: 'USA',
    yearFrom: 2018, yearTo: 2025, pcd: '5x114.3', hubBore: 67.1,
    source: TWG('hyundai/tucson/2019'),
    trims: [
      { name: '2.0 GDi (161 hp)', wheels: '17x7@51 18x7@51 19x7@51 19x7.5@53' },
      { name: '2.4 GDi (181 hp)', wheels: '18x7@51 19x7.5@53 18x7.5@53 20x8@48' },
    ],
  },

  // ------------------------------------------------------------- Mercedes-Benz
  {
    make: 'Mercedes-Benz', model: 'C-Class', generation: 'Br205', market: 'Europe',
    yearFrom: 2015, yearTo: 2022, pcd: '5x112', hubBore: 66.6,
    source: TWG('mercedes/c-class/2020'),
    trims: [
      { name: 'C 180 d (121 hp)', wheels: '16x6@36 16x6.5@38 16x7@48 17x7@48.5 17x8@54 18x7.5@44 18x8.5@56 19x8.5@56.5 19x8.5@52' },
      { name: 'C 200 (181 hp)', wheels: '16x6@36 16x6.5@38 16x7@48 17x7@48.5 17x8@54 18x7.5@44 18x8.5@49 18x8.5@56 19x8.5@56.5 19x8.5@52' },
      { name: 'C 300 (255 hp)', wheels: '17x7@48.5 17x8@54 18x7.5@44 18x8.5@49 18x8.5@56 19x8.5@56.5 19x8.5@52 20x8.5@50' },
    ],
  },

  // ---------------------------------------------------------------------- Audi
  {
    make: 'Audi', model: 'A3', generation: '8L', market: 'Europe',
    yearFrom: 1996, yearTo: 2003, pcd: '5x100', hubBore: 57.1,
    source: TWG('audi/a3/2000'),
    trims: [
      { name: '1.6i (99 hp)', wheels: '15x6@38 16x6@31 16x6.5@42 16x7@44.5 16x7@31 17x7@38 17x7.5@32' },
      { name: '1.8T (148 hp)', wheels: '15x6@38 16x6@31 16x6.5@42 16x7@31 16x7@44.5 17x7@38 17x7.5@32' },
      { name: '1.8T (177 hp)', wheels: '16x7@44.5 15x6@38 16x6@31 16x6.5@42 16x7@31 17x7@38 17x7.5@32' },
    ],
  },
  {
    make: 'Audi', model: 'A3', generation: '8P Facelift', market: 'Europe',
    yearFrom: 2004, yearTo: 2008, pcd: '5x112', hubBore: 57.1,
    source: TWG('audi/a3/2010'),
    trims: [
      { name: '1.6i (101 hp)', wheels: '16x6.5@50 17x7.5@56 15x6@47 16x6@50 16x7@53 17x6@48 18x7.5@54' },
      { name: '2.0 TDI (138 hp)', wheels: '16x6.5@50 17x7.5@56 15x6@47 16x6@50 16x7@53 17x6@48 18x7.5@54' },
      { name: '2.0 TFSI (197 hp)', wheels: '16x6.5@50 17x7.5@56 16x6@50 16x7@53 17x6@48 18x7.5@54' },
    ],
  },
  {
    make: 'Audi', model: 'A3', generation: '8V Facelift', market: 'Europe',
    yearFrom: 2016, yearTo: 2020, pcd: '5x112', hubBore: 57.1,
    source: TWG('audi/a3/2019'),
    trims: [
      { name: '30 TFSI (1.0L, 3-cyl)', wheels: '16x7@40 17x7.5@43 16x6.5@43 17x6.5@43 18x8@46' },
      {
        name: '35 TFSI (1.4L)',
        wheels: '16x6.5@46 17x7.5@51 16x6@48 16x7@48 17x6@48 18x7.5@51 19x8@49 16x7@40 17x7.5@43 16x6.5@43 17x6.5@43 18x8@46',
      },
      { name: '40 TFSI quattro (2.0L)', wheels: '17x7.5@51 16x6@48 16x6.5@46 16x7@48 17x6@48 18x7.5@51 19x8@49' },
    ],
  },
  {
    make: 'Audi', model: 'A3', generation: '8V Facelift', market: 'Middle East',
    yearFrom: 2016, yearTo: 2020, pcd: '5x112', hubBore: 57.1,
    source: TWG('audi/a3/2019'),
    trims: [{ name: '1.4 TFSI (121 hp)', wheels: '16x6.5@46 17x7.5@51 16x6@48 16x7@48 17x6@48 18x7.5@51' }],
  },
  {
    make: 'Audi', model: 'A3', generation: '8V Facelift', market: 'USA',
    yearFrom: 2016, yearTo: 2020, pcd: '5x112', hubBore: 57.1,
    source: TWG('audi/a3/2019'),
    trims: [{ name: '40 TFSI (2.0L)', wheels: '17x7.5@43 18x8@46 19x8@49 16x6.5@43 16x7@40 17x6.5@43' }],
  },

  // ---------------------------------------------------------------- Volkswagen
  {
    make: 'Volkswagen', model: 'Golf', generation: 'Mk7 (5G) Facelift', market: 'Europe',
    yearFrom: 2017, yearTo: 2020, pcd: '5x112', hubBore: 57.1,
    source: TWG('volkswagen/golf/2018'),
    trims: [
      { name: '1.0 TSI (109 hp)', wheels: '15x6@43 16x6@48 16x6.5@46 16x6.5@47' },
      { name: '1.4 TSI / 1.5 TSI / 1.4 TGI (109 hp)', wheels: '15x6@43 16x6@48 16x6.5@46 16x6.5@47 17x6@48 17x7@49 18x7.5@51 19x7.5@51' },
      { name: '2.0 TDI (148 hp)', wheels: '16x6@48 16x6.5@46 16x6.5@47 17x6@48 17x7@49 18x7.5@51 19x7.5@51' },
      { name: '2.0 TSI (306 hp)', wheels: '18x7.5@51 19x7.5@49 19x8@50' },
    ],
  },
  {
    make: 'Volkswagen', model: 'Golf', generation: 'Mk7 (5G) Facelift', market: 'USA',
    yearFrom: 2017, yearTo: 2020, pcd: '5x112', hubBore: 57.1,
    source: TWG('volkswagen/golf/2018'),
    trims: [{ name: '1.8 TSI (170 hp)', wheels: '15x6@43 16x6.5@46 16x7@51 17x7@49 18x7.5@51' }],
  },
  {
    make: 'Volkswagen', model: 'Polo', generation: 'Mk6 (AW/BZ)', market: 'Europe',
    yearFrom: 2017, yearTo: 2023, pcd: '5x100', hubBore: 57.1,
    source: TWG('volkswagen/polo/2019'),
    trims: [
      { name: '1.0 MPI (64 hp)', wheels: '14x5@38 15x5.5@40 16x6@45 16x6.5@47 17x7@51' },
      { name: '1.5 TSI (148 hp)', wheels: '15x5.5@40 14x5@38 16x6@45 16x6.5@47 17x7@51' },
      { name: '2.0 TSI (197 hp)', wheels: '17x7.5@51 16x6@45 18x7.5@51' },
    ],
  },

  // -------------------------------------------------------------------- Nissan
  {
    make: 'Nissan', model: 'Qashqai', generation: 'J11', market: 'Europe',
    yearFrom: 2013, yearTo: 2019, pcd: '5x114.3', hubBore: 66.1,
    source: TWG('nissan/qashqai/2019'),
    trims: [{ name: '1.2 DIG-T (114 hp)', wheels: '16x6.5@40 17x7@40 18x7@40 19x7@40' }],
  },
  {
    make: 'Nissan', model: 'Qashqai', generation: 'J11 Facelift', market: 'Europe',
    yearFrom: 2017, yearTo: 2023, pcd: '5x114.3', hubBore: 66.1,
    source: TWG('nissan/qashqai/2019'),
    trims: [
      { name: '1.2 DIG-T (114 hp)', wheels: '16x6.5@40 17x7@40 18x7@40 19x7@40' },
      { name: '1.6 DIG-T (161 hp)', wheels: '18x7@40 19x7@40' },
    ],
  },
].map((f) => ({ ...f, source: { ...f.source, retrieved: RETRIEVED } }));
