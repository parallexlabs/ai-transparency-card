import { evaluate, TIER_DEFINITIONS, RULES, ruleReasonKey, DATA_IDS } from './rules.js';
import { parseAndValidateJson } from './validate.js';
import {
  SAFE_AI_URL,
  CC_BY_URL,
  SAFE_AI_CREATOR,
  SAFE_AI_ATTRIBUTION_EN,
  buildAttributionObject
} from './attribution.js';
import { encodeMarkdownLiteral } from './markdown-escape.js';

export const CARD_SCHEMA_VERSION = '1.0.0';
export const TOOL_VERSION = '1.0.0';

const COMMUNITY_KEYS = [
  ['informWhat', 'community.informWhat'],
  ['informChannels', 'community.informChannels'],
  ['informLanguages', 'community.informLanguages'],
  ['informFormats', 'community.informFormats'],
  ['informWhen', 'community.informWhen'],
  ['complainChannel', 'community.complainChannel'],
  ['complainResponseTime', 'community.complainResponseTime'],
  ['complainHandover', 'community.complainHandover'],
  ['consultWho', 'community.consultWho'],
  ['consultWhen', 'community.consultWhen'],
  ['consultMethod', 'community.consultMethod'],
  ['consultInfluence', 'community.consultInfluence'],
  ['feedbackHow', 'community.feedbackHow'],
  ['inclusion', 'community.inclusion']
];

export function createEmptyState() {
  return {
    schemaVersion: CARD_SCHEMA_VERSION,
    cardVersion: 1,
    date: new Date().toISOString().slice(0, 10),
    language: 'en',
    step1: {
      name: '',
      purpose: '',
      team: '',
      accountableRole: '',
      toolType: '',
      deployment: '',
      inputLanguages: '',
      outputLanguages: ''
    },
    impact: { I1: null, I2: null, I3: null, I4: null },
    data: { D1: false, D2: false, D3: false, D4: false },
    safeguards: {},
    community: {
      informWhat: '',
      informChannels: '',
      informLanguages: '',
      informFormats: '',
      informWhen: '',
      complainChannel: '',
      complainResponseTime: '',
      complainHandover: '',
      consultWho: '',
      consultWhen: '',
      consultMethod: '',
      consultInfluence: '',
      feedbackHow: '',
      inclusion: ''
    },
    nextReviewDate: '',
    changeLog: []
  };
}

export function buildCard(state) {
  const result = evaluate(state);
  return {
    ...state,
    evaluation: result,
    tierDefinition: result.tier ? TIER_DEFINITIONS[result.tier] : null
  };
}

/**
 * @param {object} state
 * @param {string[]|string} changesOrSummary change identifiers or legacy summary string
 */
export function bumpVersion(state, changesOrSummary) {
  const newVersion = (state.cardVersion || 1) + 1;
  const entry = {
    date: new Date().toISOString().slice(0, 10),
    version: newVersion
  };
  if (Array.isArray(changesOrSummary)) {
    entry.changes = changesOrSummary;
  } else {
    entry.changes = ['minor'];
    entry.summary = changesOrSummary;
  }
  return {
    ...state,
    cardVersion: newVersion,
    date: entry.date,
    changeLog: [...(state.changeLog || []), entry]
  };
}

export function ruleLabel(id, labelFn, reasonFn) {
  const reason = reasonFn(id);
  return `${id}: ${reason}`;
}

function attributionBlock(L, lang) {
  const quoteEn = lang === 'fr'
    ? '(définitions en anglais citées sans modification; traductions françaises non officielles)'
    : '(English definitions quoted without changes; French renderings are unofficial translations)';
  return [
    '',
    `## ${L('card.attribution', 'Attribution')}`,
    `${L('card.attributionSafeAi', 'Tier definitions from')} [SAFE AI v1.2](${SAFE_AI_URL}), ${L('card.attributionLicence', 'licensed')} [CC BY 4.0](${CC_BY_URL}). ${quoteEn}`,
    `${L('card.attributionCreator', 'Creator')}: ${SAFE_AI_CREATOR}.`,
    L('card.independenceShort', 'This tool is independent and is not affiliated with or endorsed by SAFE AI or its stewards.'),
    `${L('card.methodNote', 'Screening questions, data rules, safeguard lists, decision logic and card format are ParalleX\'s own and are not SAFE AI\'s assessment method.')}`
  ];
}

/**
 * @param {object} entry
 * @param {(key: string, fallback: string) => string} L
 */
export function formatChangeLogEntry(entry, L) {
  if (Array.isArray(entry.changes) && entry.changes.length) {
    const parts = entry.changes.map((id) => L(`changelog.change.${id}`, id));
    return `v${entry.version} (${entry.date}): ${parts.join(', ')}`;
  }
  return `v${entry.version} (${entry.date}): ${entry.summary || L('placeholder.notProvided', 'Not provided')}`;
}

/**
 * Structural headings use trusted fallbacks only; dynamic values are inline code spans.
 * @param {object} card
 * @param {Record<string, string>} [labels]
 * @param {string} [lang]
 * @param {(id: string) => string} [reasonFn]
 */
export function exportMarkdown(card, labels = {}, lang = 'en', reasonFn = (id) => id) {
  const ev = card.evaluation || evaluate(card);
  const tier = ev.tier;
  const td = tier ? TIER_DEFINITIONS[tier] : null;
  const S = (key, fallback) => (lang === 'fr' ? (labels[key] || fallback) : fallback);
  const notProvided = labels['placeholder.notProvided'] || (lang === 'fr' ? 'Non renseigné' : 'Not provided');
  const lit = (value) => encodeMarkdownLiteral(value, notProvided);

  const lines = [
    `# ${S('card.title', 'AI Transparency Card')}`,
    ''
  ];

  if (card.syntheticLabel) {
    lines.push(`> **${S('card.synthetic', 'Synthetic example')}:** ${lit(card.syntheticLabel)}`);
    lines.push('');
  }

  lines.push(
    `**${S('card.name', 'Name')}:** ${lit(card.step1.name)}`,
    `**${S('card.version', 'Card version')}:** ${lit(String(card.cardVersion))}`,
    `**${S('card.date', 'Date')}:** ${lit(card.date)}`,
    `**${S('card.accountable', 'Accountable role')}:** ${lit(card.step1.accountableRole || notProvided)}`,
    '',
    `## ${S('card.purpose', 'Purpose')}`,
    lit(card.step1.purpose || notProvided),
    '',
    `## ${S('card.tool', 'Tool and deployment')}`,
    `- ${S('card.toolType', 'Tool type')}: ${lit(labels[`tool.${card.step1.toolType}`] || card.step1.toolType)}`,
    `- ${S('card.deployment', 'Deployment')}: ${lit(labels[`deploy.${card.step1.deployment}`] || card.step1.deployment)}`,
    `- ${S('card.inputLang', 'Input languages')}: ${lit(card.step1.inputLanguages)}`,
    `- ${S('card.outputLang', 'Output languages')}: ${lit(card.step1.outputLanguages)}`,
    '',
    `## ${S('card.tier', 'Required tier')}`
  );

  if (tier && td) {
    const quote = lang === 'fr' ? labels[`tier.${tier}.quote`] || td.quoteEn : td.quoteEn;
    const tierName = labels[`tier.${tier}.name`] || td.name;
    const unofficial = lang === 'fr' ? ` ${labels['tier.unofficialFr'] || ''}` : '';
    lines.push(`${lit(tierName)}: ${lit(`"${quote}"${unofficial} (${SAFE_AI_ATTRIBUTION_EN})`)}`);
  } else {
    lines.push(S('card.tierIncomplete', 'Incomplete screening'));
  }

  lines.push(
    '',
    `## ${S('card.decision', 'Decision')}`,
    ev.decision ? lit(labels[`decision.${ev.decision}`] || ev.decision.toUpperCase()) : notProvided,
    '',
    `### ${S('card.firedRules', 'Rules that fired')}`,
    ...(ev.firedRules.length
      ? ev.firedRules.map((id) => `- ${lit(ruleLabel(id, (k, fb) => labels[k] || fb, reasonFn))}`)
      : [`- ${S('card.none', 'None')}`]),
    '',
    `## ${S('card.data', 'Data summary')}`,
    ...DATA_IDS.map((id) =>
      `- ${lit(`${labels[`data.${id}`] || id}: ${card.data[id] ? (labels['card.yes'] || 'Yes') : (labels['card.no'] || 'No')}`)}`
    ),
    '',
    `## ${S('card.safeguards', 'Safeguards')}`
  );

  if (ev.missingSafeguards.length) {
    lines.push(`### ${S('card.missing', 'Missing')}`);
    lines.push(...ev.missingSafeguards.map((id) => `- ${lit(ruleLabel(id, (k, fb) => labels[k] || fb, reasonFn))}`));
  }
  lines.push(`### ${S('card.inPlace', 'In place')}`);
  const inPlace = Object.entries(card.safeguards).filter(([, v]) => v);
  lines.push(
    ...(inPlace.length
      ? inPlace.map(([id]) => `- ${lit(ruleLabel(id, (k, fb) => labels[k] || fb, reasonFn))}`)
      : [`- ${S('card.none', 'None')}`])
  );

  lines.push('', `## ${S('card.community', 'Community in the Loop')}`);
  for (const [key, labelKey] of COMMUNITY_KEYS) {
    lines.push(`- ${labels[labelKey] || labelKey}: ${lit(card.community[key] || notProvided)}`);
  }

  lines.push(
    '',
    `**${S('card.nextReview', 'Next review date')}:** ${lit(card.nextReviewDate || notProvided)}`,
    '',
    `## ${S('card.changeLog', 'Change log')}`,
    ...(card.changeLog || []).map((e) => `- ${lit(formatChangeLogEntry(e, (k, fb) => labels[k] || fb))}`),
    ...attributionBlock(S, lang)
  );

  if (card.provenance) {
    lines.push('');
    if (card.provenance.creator) {
      lines.push(`${S('card.provenanceCreator', 'Sample creator')}: ${lit(card.provenance.creator)}`);
    }
    if (card.provenance.sourceUrl) {
      lines.push(`${S('card.provenanceSource', 'Source')}: ${lit(card.provenance.sourceUrl)}`);
    }
    if (card.provenance.licenceUrl) {
      lines.push(`${S('card.provenanceLicence', 'Licence')}: ${lit(card.provenance.licenceUrl)}`);
    }
  }

  return lines.join('\n');
}

export function exportJson(card) {
  const built = buildCard(card);
  const { evaluation } = built;
  const rest = { ...built };
  delete rest.evaluation;
  delete rest.tierDefinition;
  return JSON.stringify(
    {
      ...rest,
      attribution: buildAttributionObject(),
      evaluation: {
        tier: evaluation.tier,
        decision: evaluation.decision,
        redFlags: evaluation.redFlags,
        missingSafeguards: evaluation.missingSafeguards,
        firedRules: evaluation.firedRules
      }
    },
    null,
    2
  );
}

function normalizeImportedState(parsed) {
  const state = { ...parsed };
  delete state.evaluation;
  delete state.tierDefinition;
  delete state.attribution;
  return state;
}

/**
 * Validate, normalize, and dry-run render before returning import state.
 * @param {string} text
 * @param {(key: string) => string} [msg]
 */
export function parseImportedJson(text, msg = (k) => k) {
  const parsed = parseAndValidateJson(text, msg);
  const state = normalizeImportedState(parsed);
  try {
    exportMarkdown(buildCard(state), {}, state.language || 'en', (id) => id);
  } catch {
    throw new Error(msg('validation.import.invalid'));
  }
  return state;
}

function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffChanges(oldState, newState) {
  const parts = [];
  const baseOld = { ...createEmptyState(), ...oldState };
  const baseNew = { ...createEmptyState(), ...newState };

  if (baseOld.step1?.name !== baseNew.step1?.name) parts.push('name');
  if (baseOld.step1?.purpose !== baseNew.step1?.purpose) parts.push('purpose');
  if (baseOld.step1?.team !== baseNew.step1?.team) parts.push('team');
  if (baseOld.step1?.accountableRole !== baseNew.step1?.accountableRole) parts.push('accountableRole');
  if (baseOld.step1?.toolType !== baseNew.step1?.toolType) parts.push('toolType');
  if (baseOld.step1?.deployment !== baseNew.step1?.deployment) parts.push('deployment');
  if (baseOld.step1?.inputLanguages !== baseNew.step1?.inputLanguages) parts.push('inputLanguages');
  if (baseOld.step1?.outputLanguages !== baseNew.step1?.outputLanguages) parts.push('outputLanguages');
  if (baseOld.nextReviewDate !== baseNew.nextReviewDate) parts.push('nextReviewDate');
  if (!jsonEqual(baseOld.impact, baseNew.impact)) parts.push('impact');
  if (!jsonEqual(baseOld.data, baseNew.data)) parts.push('data');
  if (!jsonEqual(baseOld.safeguards, baseNew.safeguards)) parts.push('safeguards');
  if (!jsonEqual(baseOld.community, baseNew.community)) parts.push('community');

  const oldEv = evaluate(baseOld);
  const newEv = evaluate(baseNew);
  if (oldEv.decision !== newEv.decision) parts.push('decision');
  if (oldEv.tier !== newEv.tier) parts.push('tier');

  return parts.length ? parts : ['minor'];
}

/** @deprecated use diffChanges */
export function diffSummary(oldState, newState) {
  const changes = diffChanges(oldState, newState);
  if (changes.length === 1 && changes[0] === 'minor') return 'minor updates';
  return changes.join(', ');
}

export function applyLocalizedContent(state, lang) {
  if (lang !== 'fr' || !state.localized?.fr) return state;
  const fr = state.localized.fr;
  const merged = { ...state };
  if (fr.step1) merged.step1 = { ...merged.step1, ...fr.step1 };
  if (fr.community) merged.community = { ...merged.community, ...fr.community };
  if (fr.syntheticLabel) merged.syntheticLabel = fr.syntheticLabel;
  if (fr.changeLog) merged.changeLog = fr.changeLog;
  merged.language = 'fr';
  return merged;
}

export { ruleReasonKey, RULES, encodeMarkdownLiteral, encodeMarkdownLiteral as escapeMarkdownLiteral };
