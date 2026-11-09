// Fitment engine: decides whether a rim size is TECHNICALLY compatible with a
// vehicle, using only stored vehicle fitment data and the rim's own specs.
// Style suggestions are computed separately and never affect the technical result.

export const RULES = {
  widthTolerance: 0.5, // inches, vs a wheel size listed for the vehicle
  offsetTolerance: 3, // mm ET, vs a wheel size listed for the vehicle
  hubTolerance: 0.05, // mm
};

export const normPcd = (p) => String(p || '').toLowerCase().replace(/\s+/g, '').replace(',', '.');

export function rulesText(r = RULES) {
  return (
    `A rim size counts as technically compatible when its bolt pattern equals the vehicle's, ` +
    `its centre bore is not smaller than the vehicle's hub, and its diameter equals a wheel diameter listed for the vehicle ` +
    `with width within ±${r.widthTolerance}" and offset within ±${r.offsetTolerance} mm of that listed size.`
  );
}

// Evaluate ONE rim size against one vehicle trim.
export function evaluateSize(size, fitment, trim, rules = RULES) {
  if (normPcd(size.pcd) !== normPcd(fitment.pcd)) {
    return { ok: false, reason: `bolt pattern ${size.pcd} does not match ${fitment.pcd}` };
  }
  if (size.centerBore < fitment.hubBore - rules.hubTolerance) {
    return { ok: false, reason: `centre bore ${size.centerBore} mm is smaller than the ${fitment.hubBore} mm hub` };
  }

  let best = null;
  for (const wheel of trim.wheels) {
    if (wheel.diameter !== size.diameter) continue;
    const widthDiff = Math.abs(wheel.width - size.width);
    const offsetDiff = Math.abs(wheel.offset - size.offset);
    if (widthDiff > rules.widthTolerance + 1e-9 || offsetDiff > rules.offsetTolerance + 1e-9) continue;
    const score = offsetDiff + widthDiff * 4 - (wheel.oem ? 0.5 : 0);
    if (!best || score < best.score) best = { wheel, widthDiff, offsetDiff, score };
  }
  if (!best) {
    const sameDia = trim.wheels.some((w) => w.diameter === size.diameter);
    return {
      ok: false,
      reason: sameDia
        ? `${size.diameter}" is listed for this vehicle but width/offset (${size.width}J ET${size.offset}) is outside tolerance`
        : `${size.diameter}" is not a listed wheel diameter for this vehicle`,
    };
  }

  const hubRingNeeded = size.centerBore - fitment.hubBore > rules.hubTolerance;
  const notes = [];
  if (hubRingNeeded) notes.push(`Needs hub-centric rings (${size.centerBore} → ${fitment.hubBore} mm)`);
  if (best.wheel.axle) notes.push(`Source lists this size for the ${best.wheel.axle} axle only`);
  if (best.wheel.oem) notes.push('Matches a factory (OEM) size listed by the source');
  if (best.widthDiff || best.offsetDiff) {
    notes.push(
      `Closest listed size ${best.wheel.diameter}x${best.wheel.width} ET${best.wheel.offset} (Δ width ${best.widthDiff}", Δ offset ${best.offsetDiff} mm)`
    );
  }

  return {
    ok: true,
    matchedWheel: best.wheel,
    widthDiff: best.widthDiff,
    offsetDiff: best.offsetDiff,
    exact: best.widthDiff === 0 && best.offsetDiff === 0,
    hubRingNeeded,
    axle: best.wheel.axle || null,
    notes,
  };
}

// Evaluate every size of a product. Returns compatibility + why-not summary.
export function evaluateProduct(product, fitment, trim, rules = RULES) {
  const matches = [];
  const reasons = new Map();
  product.sizes.forEach((size, sizeIndex) => {
    const r = evaluateSize(size, fitment, trim, rules);
    if (r.ok) matches.push({ sizeIndex, size, ...r });
    else reasons.set(r.reason, (reasons.get(r.reason) || 0) + 1);
  });
  matches.sort(
    (a, b) =>
      Number(a.hubRingNeeded) - Number(b.hubRingNeeded) ||
      a.offsetDiff - b.offsetDiff ||
      a.widthDiff - b.widthDiff
  );

  let whyNot = null;
  if (!matches.length) {
    const pcds = [...new Set(product.sizes.map((s) => s.pcd))];
    if (!pcds.some((p) => normPcd(p) === normPcd(fitment.pcd))) {
      whyNot = `Not offered in this vehicle's ${fitment.pcd} bolt pattern (offered: ${pcds.join(', ')})`;
    } else {
      // pick the most common reason among sizes that DO share the bolt pattern
      const samePcd = product.sizes.filter((s) => normPcd(s.pcd) === normPcd(fitment.pcd));
      const first = evaluateSize(samePcd[0], fitment, trim, rules);
      whyNot = `${fitment.pcd} sizes exist, but none match a listed diameter/width/offset for this vehicle` +
        (first.reason ? ` (e.g. ${first.reason})` : '');
    }
  }
  return { compatible: matches.length > 0, matches, whyNot };
}

// ------------------------------------------------------------------ style --
// STYLE SUGGESTIONS ONLY - a heuristic for ordering, not a compatibility check.

const COLOR_PAIRS = {
  red: ['Gloss Black', 'Gunmetal', 'Silver', 'Ice White'],
  black: ['Racing Red', 'Gold', 'Bronze', 'Silver', 'Ice White'],
  white: ['Gloss Black', 'Gunmetal', 'Racing Red', 'Bronze'],
  green: ['Bronze', 'Gloss Black', 'Gold', 'Gunmetal'],
  silver: ['Gloss Black', 'Racing Red', 'Gunmetal', 'Midnight Blue'],
  blue: ['Silver', 'Ice White', 'Gold', 'Gunmetal'],
  grey: ['Racing Red', 'Gold', 'Ice White', 'Gloss Black'],
  yellow: ['Gloss Black', 'Gunmetal', 'Midnight Blue'],
  orange: ['Gloss Black', 'Gunmetal', 'Bronze'],
};

const BODY_STYLES = {
  hatchback: ['Sport', 'Mesh', 'Multi-Spoke', 'Split-Spoke', 'Deep Dish'],
  sedan: ['Split-Spoke', 'Multi-Spoke', 'Sport', 'Mesh', 'Deep Dish'],
  suv: ['Split-Spoke', 'Sport', 'Multi-Spoke', 'Mesh', 'Deep Dish'],
  coupe: ['Sport', 'Deep Dish', 'Mesh', 'Split-Spoke', 'Multi-Spoke'],
};

const VEHICLE_STYLE_PROFILES = {
  'kia|picanto': { styles: ['Mesh', 'Multi-Spoke', 'Sport', 'Split-Spoke', 'Deep Dish'], products: ['nightline-spiral-12', 'kuro-grid-mesh', 'voltra-fork-y'], reason: 'compact patterns keep the wheel visually balanced on a small hatchback' },
  'bmw|x1': { styles: ['Split-Spoke', 'Multi-Spoke', 'Sport', 'Mesh', 'Deep Dish'], products: ['voltra-split-five', 'voltra-fork-y', 'apex-vortex-10'], reason: 'the clean spoke layout complements a compact premium SUV' },
  'bmw|x3': { styles: ['Split-Spoke', 'Sport', 'Multi-Spoke', 'Mesh', 'Deep Dish'], products: ['voltra-split-five', 'voltra-fork-y', 'apex-vortex-10'], reason: 'the athletic spoke profile suits the X3’s compact-SUV design' },
  'bmw|x5': { styles: ['Multi-Spoke', 'Split-Spoke', 'Sport', 'Mesh', 'Deep Dish'], products: ['kuro-grid-mesh', 'kuro-hex-mesh', 'apex-vortex-10'], reason: 'the fuller spoke pattern suits the X5’s larger SUV proportions' },
  'bmw|x6': { styles: ['Sport', 'Split-Spoke', 'Deep Dish', 'Multi-Spoke', 'Mesh'], products: ['stratos-deep-six', 'stratos-circuit-s', 'apex-razor-5'], reason: 'the sharper, more assertive face complements the X6’s coupe-like SUV styling' },
  'ferrari|488': { styles: ['Sport', 'Split-Spoke', 'Multi-Spoke', 'Deep Dish', 'Mesh'], products: ['apex-razor-5', 'stratos-circuit-s', 'voltra-split-five'], reason: 'the performance-led spoke design suits a low sports-coupe silhouette' },
  'porsche|911': { styles: ['Multi-Spoke', 'Sport', 'Split-Spoke', 'Mesh', 'Deep Dish'], products: ['nightline-spiral-12', 'apex-vortex-10', 'kuro-hex-mesh'], reason: 'the focused, finely divided spoke pattern complements a sports-car profile' },
  'mercedes-benz|c-class': { styles: ['Split-Spoke', 'Multi-Spoke', 'Mesh', 'Sport', 'Deep Dish'], products: ['voltra-fork-y', 'voltra-split-five', 'apex-vortex-10'], reason: 'the refined spoke layout suits a premium sedan profile' },
  'mercedes-benz|g-class': { styles: ['Split-Spoke', 'Multi-Spoke', 'Sport', 'Deep Dish', 'Mesh'], products: ['voltra-fork-y', 'nightline-lip-eight', 'kuro-grid-mesh'], reason: 'the substantial spoke design complements the G-Class’s upright, rugged styling' },
};

const profileFor = ({ make, model, bodyType }) => {
  const key = `${String(make || '').toLowerCase()}|${String(model || '').toLowerCase()}`;
  return VEHICLE_STYLE_PROFILES[key] || {
    styles: BODY_STYLES[bodyType] || [],
    reason: `${bodyType || 'vehicle'} proportions pair well with this spoke design`,
  };
};

export const CAR_COLORS = Object.keys(COLOR_PAIRS);

export function styleSuggestion(product, { color, bodyType, make, model }) {
  const pairs = COLOR_PAIRS[color] || [];
  let colorScore = 0;
  let bestColorIndex = 0;
  product.colors.forEach((c, i) => {
    const rank = pairs.indexOf(c.name);
    const s = rank === -1 ? 0 : pairs.length - rank;
    if (s > colorScore) {
      colorScore = s;
      bestColorIndex = i;
    }
  });
  const profile = profileFor({ make, model, bodyType });
  const styles = profile.styles;
  const styleRank = styles.indexOf(product.style);
  const styleScore = styleRank === -1 ? 0 : styles.length - styleRank;
  const productRank = profile.products?.indexOf(product.slug) ?? -1;
  const modelScore = productRank >= 0 ? profile.products.length - productRank : styleScore / 10;

  const notes = [];
  if (colorScore) notes.push(`${product.colors[bestColorIndex].name} contrasts well with ${color} paint`);
  const designReason = styleRank >= 0 ? profile.reason : `${product.style} is a considered alternative design for this vehicle`;
  notes.push(designReason);

  return { score: modelScore * 100 + styleScore * 10 + colorScore, bestColorIndex, notes, designReason };
}

function technicalReason(match) {
  const { size, matchedWheel, exact, hubRingNeeded } = match;
  const sizeText = `${size.diameter}x${size.width} ET${size.offset}`;
  const listedText = `${matchedWheel.diameter}x${matchedWheel.width} ET${matchedWheel.offset}`;
  const reason = exact
    ? `${sizeText} exactly matches a wheel size listed for this trim`
    : `${sizeText} is within the compatibility tolerance of the listed ${listedText} size`;
  return hubRingNeeded ? `${reason}; hub-centric rings are required` : reason;
}

// Full recommendation for one vehicle trim.
// Top picks = best style matches among the technically compatible rims. The split keeps
// "More rims" populated when only a few rims fit (e.g. 4 fit -> 2 top + 2 more).
export const topCountFor = (n) => (n <= 1 ? n : Math.min(4, Math.ceil(n / 2)));

export function recommend({ products, fitment, trim, color, bodyType, make, model, rules = RULES, topCount }) {
  const compatible = [];
  const others = [];

  for (const product of products) {
    const evalResult = evaluateProduct(product, fitment, trim, rules);
    const style = styleSuggestion(product, { color, bodyType, make, model });
    const match = evalResult.matches[0];
    const row = {
      ...product,
      fit: { compatible: evalResult.compatible, matches: evalResult.matches, whyNot: evalResult.whyNot },
      styleMatch: style,
      recommendationReason: match
        ? `${technicalReason(match)}. ${style.designReason}.`
        : null,
    };
    (evalResult.compatible ? compatible : others).push(row);
  }

  compatible.sort(
    (a, b) =>
      Number(a.fit.matches[0].hubRingNeeded) - Number(b.fit.matches[0].hubRingNeeded) ||
      Number(!a.fit.matches[0].exact) - Number(!b.fit.matches[0].exact) ||
      a.fit.matches[0].offsetDiff - b.fit.matches[0].offsetDiff ||
      a.fit.matches[0].widthDiff - b.fit.matches[0].widthDiff ||
      b.styleMatch.score - a.styleMatch.score ||
      a.name.localeCompare(b.name)
  );

  const n = topCount ?? topCountFor(compatible.length);
  const topPicks = compatible.slice(0, n);
  topPicks.forEach((product, index) => { product.bestMatch = index === 0; });
  return {
    topPicks,
    moreRims: compatible.slice(n),
    others,
  };
}

export function recommendUnverified({ products, color, make, model, bodyType, topCount = 3 }) {
  const suggestions = products.map((product) => ({
    ...product,
    fit: { compatible: false, matches: [], whyNot: 'Vehicle fitment data is not verified' },
    styleMatch: styleSuggestion(product, { color, bodyType, make, model }),
    recommendationReason: null,
    bestMatch: false,
  }));
  suggestions.sort((a, b) =>
    b.styleMatch.score - a.styleMatch.score ||
    a.name.localeCompare(b.name)
  );
  const topPicks = suggestions.slice(0, topCount);
  topPicks.forEach((product, index) => {
    product.bestMatch = index === 0;
    product.recommendationReason =
      `Design suggestion only: ${product.styleMatch.designReason}. Rim size and compatibility are unverified for this vehicle.`;
  });
  return { topPicks, moreRims: suggestions.slice(topCount, topCount + 3), others: suggestions.slice(topCount + 3) };
}
