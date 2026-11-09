// DEMO CATALOGUE: brands and products are fictional. Rim specs below are demo
// product data that WE define (they are not claims about real manufacturers).
// Compatibility with real vehicles is computed from the verified vehicle data.

const C = {
  black: { name: 'Gloss Black', hex: '#15151a' },
  gunmetal: { name: 'Gunmetal', hex: '#5a5d66' },
  silver: { name: 'Silver', hex: '#c9ccd2' },
  red: { name: 'Racing Red', hex: '#E31B23' },
  bronze: { name: 'Bronze', hex: '#9a6a3a' },
  white: { name: 'Ice White', hex: '#F0EFEC' },
  gold: { name: 'Gold', hex: '#c9a24a' },
  blue: { name: 'Midnight Blue', hex: '#1f3a7a' },
};

// Master size tables per bolt pattern: [diameter, width, offset ET]. Centre bore is
// the rim's own hub hole (larger than most hubs; hub-centric rings are noted by the engine).
const MASTER = {
  '4x100': { cb: 67.1, sizes: [[14, 5.5, 47], [15, 6, 47], [15, 6, 50], [16, 6.5, 45], [16, 6.5, 50], [17, 7, 50], [17, 7.5, 40]] },
  '5x100': { cb: 73.1, sizes: [[15, 6, 45], [16, 6.5, 46], [17, 7, 50], [17, 7.5, 50], [18, 7.5, 51]] },
  '5x112': { cb: 66.6, sizes: [[16, 6.5, 46], [17, 7, 49], [17, 7.5, 51], [17, 7.5, 43], [17, 7.5, 30], [18, 7.5, 51], [18, 8, 46], [18, 8.5, 40], [19, 8, 49], [19, 8.5, 40], [19, 8.5, 54], [20, 8.5, 40]] },
  '5x114.3': { cb: 73.1, sizes: [[15, 6, 46], [16, 6.5, 42], [16, 6.5, 50], [17, 7, 42], [17, 7, 45], [17, 7, 51], [17, 7.5, 55], [18, 7.5, 40], [18, 7.5, 53], [18, 8, 50], [19, 7.5, 52], [19, 8.5, 46]] },
  '5x120': { cb: 72.6, sizes: [[16, 7, 47], [17, 7.5, 37], [17, 8, 47], [18, 8, 37], [18, 8.5, 47], [19, 8, 40], [19, 8.5, 47], [20, 8.5, 47]] },
};

// range = [minDiameter, maxDiameter] per bolt pattern
function build(fits) {
  const out = [];
  for (const [pcd, [lo, hi]] of Object.entries(fits)) {
    const m = MASTER[pcd];
    for (const [d, w, et] of m.sizes) {
      if (d < lo || d > hi) continue;
      const i = out.length;
      out.push({
        diameter: d, width: w, pcd, offset: et, centerBore: m.cb,
        stock: 2 + ((d * 3 + w * 5 + et + i) % 10),
      });
    }
  }
  return out;
}

const explicit = (rows) =>
  rows.map(([diameter, width, pcd, offset, centerBore, stock]) => ({ diameter, width, pcd, offset, centerBore, stock }));

export const products = [
  {
    slug: 'apex-vortex-10', name: 'Vortex 10', brand: 'Apex Forge', style: 'Multi-Spoke',
    description: 'Ten slim spokes with a concave face for a clean, aggressive stance. Flow-formed for low weight.',
    price: 289, colors: [C.black, C.gunmetal, C.silver],
    sizes: build({ '5x114.3': [16, 19], '5x112': [17, 19], '4x100': [15, 16] }),
    material: 'Flow-formed aluminium alloy', isBestSeller: true, releasedAt: '2026-03-10',
  },
  {
    slug: 'kuro-grid-mesh', name: 'Grid Mesh R', brand: 'Kuro Works', style: 'Mesh',
    description: 'Fine cross-hatched mesh face inspired by classic rally and touring wheels.',
    price: 349, colors: [C.silver, C.black, C.gold],
    sizes: build({ '5x100': [15, 18], '5x112': [16, 19], '5x120': [16, 19], '4x100': [15, 17] }),
    material: 'Cast aluminium alloy', isBestSeller: true, releasedAt: '2026-01-22',
  },
  {
    slug: 'voltra-split-five', name: 'Split Five', brand: 'Voltra', style: 'Split-Spoke',
    description: 'Five twin-spoke pairs that split near the rim edge. Strong, light and unmistakable.',
    price: 319, colors: [C.gunmetal, C.white, C.bronze, C.black],
    sizes: build({ '5x112': [17, 20], '5x114.3': [17, 19], '5x120': [17, 20] }),
    material: 'Forged-spun aluminium alloy', isNewArrival: true, releasedAt: '2026-10-18',
  },
  {
    slug: 'stratos-deep-six', name: 'Deep Six', brand: 'Stratos', style: 'Deep Dish',
    description: 'Wide stepped lip and six broad spokes. Built for a low, wide show-car look.',
    price: 429, colors: [C.gold, C.silver, C.black],
    sizes: explicit([[18, 9.5, '5x114.3', 22, 73.1, 4], [19, 10, '5x114.3', 20, 73.1, 3], [20, 10.5, '5x120', 20, 72.6, 2]]),
    material: 'Two-piece forged alloy', isNewArrival: true, releasedAt: '2026-10-30',
  },
  {
    slug: 'apex-razor-5', name: 'Razor 5', brand: 'Apex Forge', style: 'Sport',
    description: 'Five wide, tapered spokes with a drilled face. Track-minded and light.',
    price: 389, colors: [C.red, C.black, C.gunmetal],
    sizes: build({ '5x114.3': [17, 19], '5x112': [17, 20], '5x120': [17, 19] }),
    material: 'Forged aluminium alloy', isBestSeller: true, releasedAt: '2026-05-02',
  },
  {
    slug: 'nightline-spiral-12', name: 'Spiral 12', brand: 'Nightline', style: 'Multi-Spoke',
    description: 'Twelve swept spokes for a turbine-like look in a compact city-car size range.',
    price: 249, colors: [C.silver, C.black, C.blue],
    sizes: build({ '4x100': [14, 17], '5x100': [15, 17] }),
    material: 'Cast aluminium alloy', releasedAt: '2026-02-14',
  },
  {
    slug: 'kuro-hex-mesh', name: 'Hex Mesh', brand: 'Kuro Works', style: 'Mesh',
    description: 'Open honeycomb face for a modern take on the mesh wheel, with a slim machined lip.',
    price: 369, colors: [C.black, C.white, C.red],
    sizes: build({ '5x112': [17, 20], '5x114.3': [17, 19] }),
    material: 'Flow-formed aluminium alloy', isNewArrival: true, releasedAt: '2026-09-25',
  },
  {
    slug: 'voltra-fork-y', name: 'Fork Y', brand: 'Voltra', style: 'Split-Spoke',
    description: 'Y-shaped spokes that split into a fork at the rim. Sharp lines, easy to clean.',
    price: 299, colors: [C.silver, C.gunmetal, C.bronze],
    sizes: build({ '4x100': [15, 17], '5x114.3': [16, 18] }),
    material: 'Cast aluminium alloy', releasedAt: '2026-04-08',
  },
  {
    slug: 'stratos-circuit-s', name: 'Circuit S', brand: 'Stratos', style: 'Sport',
    description: 'Seven-spoke performance wheel with a flat face and a bold stepped outer edge.',
    price: 339, colors: [C.white, C.black, C.gold, C.red],
    sizes: build({ '5x114.3': [17, 19], '5x120': [17, 19], '5x100': [16, 18] }),
    material: 'Flow-formed aluminium alloy', isBestSeller: true, releasedAt: '2026-06-17',
  },
  {
    slug: 'nightline-lip-eight', name: 'Lip Eight', brand: 'Nightline', style: 'Deep Dish',
    description: 'Eight classic spokes behind a deep polished lip. Retro look, modern construction.',
    price: 459, colors: [C.silver, C.bronze, C.black],
    sizes: explicit([[17, 9, '5x120', 25, 72.6, 3], [18, 9.5, '5x120', 22, 72.6, 3], [19, 10, '5x112', 20, 66.6, 2]]),
    material: 'Two-piece forged alloy', releasedAt: '2026-07-04',
  },
];
