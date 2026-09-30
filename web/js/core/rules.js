/** @typedef {'impact' | 'data' | 'safeguard' | 'red-flag'} RuleType */

/**
 * All screening rules in one data file.
 * Each rule has id, plain-language reason, and sourceKey.
 */

export const SOURCE_KEYS = {
  'parallex-impact': 'ParalleX Labs, based on the SAFE AI v1.2 tier definitions',
  parallex: 'ParalleX Labs (own rule)',
  'iasc-2023': 'Informed by the IASC Operational Guidance on Data Responsibility in Humanitarian Action (2023)',
  'ocha-2025': 'Informed by the OCHA Data Responsibility Guidelines (2025)',
  'icrc-handbook-2024': 'Informed by the ICRC Handbook on Data Protection in Humanitarian Action, 3rd edition (2024)',
  'chs-2024': 'Informed by the Core Humanitarian Standard on Quality and Accountability (2024)',
  'un-ceb-2022': 'Informed by the Principles for the Ethical Use of Artificial Intelligence in the United Nations System (2022)',
  'safe-ai-tier2': 'Based on the SAFE AI v1.2 Tier 2 definition',
  'safe-ai-tier3': 'Based on the SAFE AI v1.2 Tier 3 definition'
};

export const TIER_DEFINITIONS = {
  1: {
    name: 'Tier 1 (Baseline)',
    quoteEn: 'Internal, advisory AI use. Light-touch governance.',
    attributionEn: 'SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0'
  },
  2: {
    name: 'Tier 2 (Enhanced)',
    quoteEn: 'AI shapes operational decisions, with human oversight. Full assessment and assurance required.',
    attributionEn: 'SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0'
  },
  3: {
    name: 'Tier 3 (High risk)',
    quoteEn: "AI directly affects people's access to assistance, protection, or information. Community co-design and ongoing monitoring are mandatory.",
    attributionEn: 'SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0'
  }
};

/** @type {Record<string, { id: string, type: RuleType, sourceKey: string, tier?: number, tiers?: number[], conditional?: string }>} */
export const RULES = {
  I1: { id: 'I1', type: 'impact', tier: 3, sourceKey: 'parallex-impact' },
  I2: { id: 'I2', type: 'impact', tier: 3, sourceKey: 'parallex-impact' },
  I3: { id: 'I3', type: 'impact', tier: 2, sourceKey: 'parallex-impact' },
  I4: { id: 'I4', type: 'impact', tier: 1, sourceKey: 'parallex-impact' },
  D1: { id: 'D1', type: 'data', sourceKey: 'iasc-2023' },
  D2: { id: 'D2', type: 'data', sourceKey: 'icrc-handbook-2024' },
  D3: { id: 'D3', type: 'data', sourceKey: 'icrc-handbook-2024' },
  D4: { id: 'D4', type: 'data', sourceKey: 'ocha-2025' },
  S_ACCOUNTABLE_ROLE: { id: 'S_ACCOUNTABLE_ROLE', type: 'safeguard', tiers: [1, 2, 3], sourceKey: 'un-ceb-2022' },
  S_OUTPUT_REVIEW: { id: 'S_OUTPUT_REVIEW', type: 'safeguard', tiers: [1, 2, 3], sourceKey: 'un-ceb-2022' },
  S_USER_TRAINING: { id: 'S_USER_TRAINING', type: 'safeguard', tiers: [1, 2, 3], sourceKey: 'parallex' },
  S_DATA_MINIMISATION: { id: 'S_DATA_MINIMISATION', type: 'safeguard', tiers: [1, 2, 3], sourceKey: 'iasc-2023' },
  S_RECORD_OF_USE: { id: 'S_RECORD_OF_USE', type: 'safeguard', tiers: [1, 2, 3], sourceKey: 'parallex' },
  S_RISK_ASSESSMENT: { id: 'S_RISK_ASSESSMENT', type: 'safeguard', tiers: [2, 3], sourceKey: 'safe-ai-tier2' },
  S_DPIA: { id: 'S_DPIA', type: 'safeguard', tiers: [2, 3], conditional: 'dataAny', sourceKey: 'icrc-handbook-2024' },
  S_LANGUAGE_TESTING: { id: 'S_LANGUAGE_TESTING', type: 'safeguard', tiers: [2, 3], sourceKey: 'parallex' },
  S_MONITORING_PLAN: { id: 'S_MONITORING_PLAN', type: 'safeguard', tiers: [2, 3], sourceKey: 'chs-2024' },
  S_MANUAL_FALLBACK: { id: 'S_MANUAL_FALLBACK', type: 'safeguard', tiers: [2, 3], sourceKey: 'parallex' },
  S_COMMUNITY_CODESIGN: { id: 'S_COMMUNITY_CODESIGN', type: 'safeguard', tiers: [3], sourceKey: 'safe-ai-tier3' },
  S_INFO_AFFECTED: { id: 'S_INFO_AFFECTED', type: 'safeguard', tiers: [3], sourceKey: 'chs-2024' },
  S_COMPLAINTS_CHANNEL: { id: 'S_COMPLAINTS_CHANNEL', type: 'safeguard', tiers: [3], sourceKey: 'chs-2024' },
  S_ERROR_MONITORING: { id: 'S_ERROR_MONITORING', type: 'safeguard', tiers: [3], sourceKey: 'safe-ai-tier3' },
  S_HUMAN_ALTERNATIVE: { id: 'S_HUMAN_ALTERNATIVE', type: 'safeguard', tiers: [3], sourceKey: 'chs-2024' },
  S_STOP_CRITERIA: { id: 'S_STOP_CRITERIA', type: 'safeguard', tiers: [3], sourceKey: 'parallex' },
  S_HUMAN_REVIEW_EACH_CASE: {
    id: 'S_HUMAN_REVIEW_EACH_CASE',
    type: 'safeguard',
    tiers: [1, 2, 3],
    conditional: 'impactI2',
    sourceKey: 'parallex'
  },
  R1: { id: 'R1', type: 'red-flag', sourceKey: 'parallex' },
  R2: { id: 'R2', type: 'red-flag', sourceKey: 'parallex' },
  R3: { id: 'R3', type: 'red-flag', sourceKey: 'parallex' },
  R4: { id: 'R4', type: 'red-flag', sourceKey: 'parallex' }
};

export function ruleReasonKey(id) {
  const rule = RULES[id];
  if (!rule) return id;
  if (rule.type === 'impact') return `impact.${id}`;
  if (rule.type === 'data') return `data.${id}`;
  if (rule.type === 'safeguard') return `safeguards.${id}`;
  return `rules.${id}`;
}

export const IMPACT_IDS = ['I1', 'I2', 'I3', 'I4'];
export const DATA_IDS = ['D1', 'D2', 'D3', 'D4'];
export const RED_FLAG_IDS = ['R1', 'R2', 'R3', 'R4'];

export function getSafeguardIds() {
  return Object.keys(RULES).filter((id) => RULES[id].type === 'safeguard');
}

export function hasAnyData(data) {
  return DATA_IDS.some((id) => data[id]);
}

export function isImpactAnswered(impact, id) {
  return impact[id] === true || impact[id] === false;
}

export function isImpactComplete(impact) {
  return IMPACT_IDS.every((id) => isImpactAnswered(impact, id));
}

export function isImpactAllNo(impact) {
  return isImpactComplete(impact) && IMPACT_IDS.every((id) => !impact[id]);
}

export function computeTier(impact) {
  if (!isImpactComplete(impact)) return null;
  let tier = 0;
  for (const id of IMPACT_IDS) {
    if (impact[id] && RULES[id].tier > tier) tier = RULES[id].tier;
  }
  return tier || null;
}

export function getRequiredSafeguards(tier, data, impact) {
  const required = [];
  for (const id of getSafeguardIds()) {
    const rule = RULES[id];
    if (!rule.tiers.includes(tier)) continue;
    if (rule.conditional === 'dataAny' && !hasAnyData(data)) continue;
    if (rule.conditional === 'impactI2' && !impact.I2) continue;
    required.push(id);
  }
  return required;
}

/**
 * @param {object} state - card state with step1, impact, data, safeguards
 * @returns {{ tier: number|null, redFlags: string[], missingSafeguards: string[], decision: 'red'|'amber'|'green'|null, firedRules: string[] }}
 */
export function evaluate(state) {
  const { impact = {}, data = {}, safeguards = {}, step1 = {} } = state;
  const tier = computeTier(impact);
  const firedRules = [];
  const redFlags = [];

  if (data.D2 && step1.deployment === 'public-consumer') {
    redFlags.push('R1');
    firedRules.push('R1');
  }
  if (data.D3 && step1.deployment === 'public-consumer') {
    redFlags.push('R4');
    firedRules.push('R4');
  }
  if (impact.I2 && !safeguards.S_HUMAN_REVIEW_EACH_CASE) {
    redFlags.push('R2');
    firedRules.push('R2');
  }
  if (tier === 3 && !safeguards.S_INFO_AFFECTED && !safeguards.S_COMPLAINTS_CHANNEL) {
    redFlags.push('R3');
    firedRules.push('R3');
  }

  if (tier === null) {
    const decision = redFlags.length > 0 ? 'red' : null;
    return { tier: null, redFlags, missingSafeguards: [], decision, firedRules };
  }

  const required = getRequiredSafeguards(tier, data, impact);
  const missingSafeguards = required.filter((id) => !safeguards[id]);

  let decision;
  if (redFlags.length > 0) {
    decision = 'red';
  } else if (missingSafeguards.length > 0) {
    decision = 'amber';
    for (const id of missingSafeguards) firedRules.push(id);
  } else {
    decision = 'green';
  }

  return { tier, redFlags, missingSafeguards, decision, firedRules };
}
