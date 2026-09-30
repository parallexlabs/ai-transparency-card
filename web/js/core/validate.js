import { CARD_SCHEMA_VERSION } from './card.js';
import validateSchema from './card-validator.js';
import dateFormat from './ajv-formats-date.js';

export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_NESTING_DEPTH = 32;
export const MAX_STRING_LENGTH = 100_000;

const LANGUAGES = new Set(['en', 'fr']);
const IMPACT_IDS = ['I1', 'I2', 'I3', 'I4'];
const DATA_IDS = ['D1', 'D2', 'D3', 'D4'];
const COMMUNITY_KEYS = [
  'informWhat', 'informChannels', 'informLanguages', 'informFormats', 'informWhen',
  'complainChannel', 'complainResponseTime', 'complainHandover',
  'consultWho', 'consultWhen', 'consultMethod', 'consultInfluence',
  'feedbackHow', 'inclusion'
];
const TOOL_TYPES = new Set([
  'general-chat', 'translation', 'transcription', 'summarisation',
  'classification-triage', 'image-analysis', 'public-chatbot', 'other'
]);
const DEPLOYMENTS = new Set(['org-approved', 'public-consumer', 'local-hosted']);
const CHANGE_LOG_KEYS = new Set(['date', 'version', 'changes', 'summary']);

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {string} text
 * @returns {number}
 */
export function encodedByteLength(text) {
  return new TextEncoder().encode(text).length;
}

/**
 * @param {unknown} value
 * @param {number} [maxDepth]
 * @param {number} [depth]
 * @returns {boolean}
 */
export function exceedsNestingDepth(value, maxDepth = MAX_NESTING_DEPTH, depth = 0) {
  if (depth > maxDepth) return true;
  if (value == null || typeof value !== 'object') return false;
  const items = Array.isArray(value) ? value : Object.values(value);
  for (const item of items) {
    if (exceedsNestingDepth(item, maxDepth, depth + 1)) return true;
  }
  return false;
}

/**
 * @param {unknown} value
 * @param {number} [maxLen]
 * @returns {boolean}
 */
export function exceedsStringLength(value, maxLen = MAX_STRING_LENGTH) {
  if (value == null) return false;
  if (typeof value === 'string') return value.length > maxLen;
  if (typeof value !== 'object') return false;
  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    if (exceedsStringLength(item, maxLen)) return true;
  }
  return false;
}

/**
 * @param {import('ajv').ErrorObject} err
 * @returns {string}
 */
function mapAjvErrorKey(err) {
  const path = err.instancePath || '';
  const missing = err.params?.missingProperty;
  const full = missing ? `${path}/${missing}` : path;

  const map = {
    '/schemaVersion': 'validation.import.schemaVersion',
    '/cardVersion': 'validation.import.cardVersion',
    '/date': 'validation.import.date',
    '/language': 'validation.import.language',
    '/step1': 'validation.import.step1',
    '/step1/name': 'validation.import.name',
    '/step1/purpose': 'validation.import.purpose',
    '/step1/accountableRole': 'validation.import.accountableRole',
    '/step1/toolType': 'validation.import.toolType',
    '/step1/deployment': 'validation.import.deployment',
    '/step1/inputLanguages': 'validation.import.inputLanguages',
    '/step1/outputLanguages': 'validation.import.outputLanguages',
    '/impact': 'validation.import.impact',
    '/data': 'validation.import.data',
    '/safeguards': 'validation.import.safeguards',
    '/community': 'validation.import.community',
    '/nextReviewDate': 'validation.import.nextReviewDate',
    '/changeLog': 'validation.import.changeLog',
    '/evaluation': 'validation.import.evaluation',
    '/provenance': 'validation.import.provenance',
    '/localized': 'validation.import.localized',
    '/attribution': 'validation.import.attribution'
  };

  if (map[full]) return map[full];
  if (map[path]) return map[path];

  if (path.startsWith('/impact/')) return `validation.import.impact.${path.slice(8)}`;
  if (path.startsWith('/data/')) return `validation.import.data.${path.slice(6)}`;
  if (path.startsWith('/community/')) return `validation.import.community.${path.slice(11)}`;
  if (path.startsWith('/changeLog/')) return 'validation.import.changeLogEntry';
  if (err.keyword === 'additionalProperties') return 'validation.import.extra';

  return 'validation.import.invalid';
}

/**
 * @param {object} data
 * @param {(key: string) => string} [msg] localized error formatter
 */
export function validateCardData(data, msg = (k) => k) {
  const errors = [];
  const push = (key) => errors.push(msg(key));

  if (!isPlainObject(data)) {
    push('validation.import.invalid');
    return errors;
  }

  if (exceedsNestingDepth(data)) {
    push('validation.import.invalid');
    return errors;
  }

  if (exceedsStringLength(data)) {
    push('validation.import.tooLarge');
    return errors;
  }

  if (!validateSchema(data)) {
    const ajvErrors = validateSchema.errors || [];
    const keys = new Set(ajvErrors.map(mapAjvErrorKey));
    for (const key of keys) push(key);
    if (!keys.size) push('validation.import.invalid');
    return errors;
  }

  if (data.schemaVersion !== CARD_SCHEMA_VERSION) {
    push('validation.import.unsupportedVersion');
  }

  return errors;
}

function isOptionalDateString(value) {
  return value === '' || dateFormat(value);
}

function validateDraftChangeLogEntry(entry, push) {
  if (!isPlainObject(entry)) {
    push('validation.draft.invalid');
    return false;
  }
  for (const key of Object.keys(entry)) {
    if (!CHANGE_LOG_KEYS.has(key)) {
      push('validation.draft.invalid');
      return false;
    }
  }
  if (entry.date != null && (typeof entry.date !== 'string' || !isOptionalDateString(entry.date))) {
    push('validation.draft.invalid');
    return false;
  }
  if (entry.version != null && (!Number.isInteger(entry.version) || entry.version < 1)) {
    push('validation.draft.invalid');
    return false;
  }
  if ('changes' in entry) {
    if (!Array.isArray(entry.changes) || entry.changes.some((c) => typeof c !== 'string')) {
      push('validation.draft.invalid');
      return false;
    }
  }
  if ('summary' in entry && entry.summary != null && typeof entry.summary !== 'string') {
    push('validation.draft.invalid');
    return false;
  }
  return true;
}

function validateDraftCommunity(community, push) {
  if (!isPlainObject(community)) {
    push('validation.draft.invalid');
    return false;
  }
  for (const key of Object.keys(community)) {
    if (!COMMUNITY_KEYS.includes(key)) {
      push('validation.draft.invalid');
      return false;
    }
    if (typeof community[key] !== 'string') {
      push('validation.draft.invalid');
      return false;
    }
  }
  return true;
}

/**
 * @param {object} data draft candidate
 * @param {(key: string) => string} [msg]
 */
export function validateDraftData(data, msg = (k) => k) {
  const errors = [];
  const push = (key) => errors.push(msg(key));

  if (!isPlainObject(data)) {
    push('validation.draft.invalid');
    return errors;
  }

  if (exceedsNestingDepth(data)) {
    push('validation.draft.invalid');
    return errors;
  }

  if (exceedsStringLength(data)) {
    push('validation.draft.invalid');
    return errors;
  }

  if (data.schemaVersion != null && !/^\d+\.\d+\.\d+$/.test(data.schemaVersion)) {
    push('validation.draft.invalid');
  }
  if (data.cardVersion != null && (!Number.isInteger(data.cardVersion) || data.cardVersion < 1)) {
    push('validation.draft.invalid');
  }
  if ('date' in data && (typeof data.date !== 'string' || !isOptionalDateString(data.date))) {
    push('validation.draft.invalid');
  }
  if (data.language != null && !LANGUAGES.has(data.language)) push('validation.draft.invalid');

  const s1 = data.step1;
  if (!isPlainObject(s1) || typeof s1.name !== 'string') {
    push('validation.draft.invalid');
    return errors;
  }

  if (s1.purpose != null && typeof s1.purpose !== 'string') push('validation.draft.invalid');
  if (s1.team != null && typeof s1.team !== 'string') push('validation.draft.invalid');
  if (s1.accountableRole != null && typeof s1.accountableRole !== 'string') push('validation.draft.invalid');
  if (s1.toolType != null && typeof s1.toolType !== 'string') push('validation.draft.invalid');
  if (s1.toolType != null && s1.toolType !== '' && !TOOL_TYPES.has(s1.toolType)) {
    push('validation.draft.invalid');
  }
  if (s1.deployment != null && typeof s1.deployment !== 'string') push('validation.draft.invalid');
  if (s1.deployment != null && s1.deployment !== '' && !DEPLOYMENTS.has(s1.deployment)) {
    push('validation.draft.invalid');
  }
  if (s1.inputLanguages != null && typeof s1.inputLanguages !== 'string') push('validation.draft.invalid');
  if (s1.outputLanguages != null && typeof s1.outputLanguages !== 'string') push('validation.draft.invalid');

  if ('impact' in data) {
    if (!isPlainObject(data.impact)) push('validation.draft.invalid');
    else {
      for (const id of IMPACT_IDS) {
        const v = data.impact[id];
        if (v != null && typeof v !== 'boolean') push('validation.draft.invalid');
      }
    }
  }

  if ('data' in data) {
    if (!isPlainObject(data.data)) push('validation.draft.invalid');
    else {
      for (const id of DATA_IDS) {
        if (data.data[id] != null && typeof data.data[id] !== 'boolean') push('validation.draft.invalid');
      }
    }
  }

  if ('safeguards' in data) {
    if (!isPlainObject(data.safeguards)) push('validation.draft.invalid');
    else {
      for (const v of Object.values(data.safeguards)) {
        if (typeof v !== 'boolean') push('validation.draft.invalid');
      }
    }
  }

  if ('community' in data && !validateDraftCommunity(data.community, push)) {
    return errors;
  }

  if (data.nextReviewDate != null && (typeof data.nextReviewDate !== 'string' || !isOptionalDateString(data.nextReviewDate))) {
    push('validation.draft.invalid');
  }

  if ('changeLog' in data) {
    if (!Array.isArray(data.changeLog)) push('validation.draft.invalid');
    else {
      for (const entry of data.changeLog) {
        if (!validateDraftChangeLogEntry(entry, push)) break;
      }
    }
  }

  if ('localized' in data) {
    if (!isPlainObject(data.localized)) push('validation.draft.invalid');
    else if ('fr' in data.localized && data.localized.fr != null && !isPlainObject(data.localized.fr)) {
      push('validation.draft.invalid');
    }
  }

  if ('provenance' in data) {
    const p = data.provenance;
    if (!isPlainObject(p)) push('validation.draft.invalid');
    else {
      for (const v of Object.values(p)) {
        if (v != null && typeof v !== 'string') push('validation.draft.invalid');
      }
    }
  }

  if ('syntheticLabel' in data && data.syntheticLabel != null && typeof data.syntheticLabel !== 'string') {
    push('validation.draft.invalid');
  }

  return errors;
}

export function parseAndValidateJson(text, msg) {
  if (typeof text !== 'string') {
    throw new Error(msg('validation.import.invalid'));
  }
  if (encodedByteLength(text) > MAX_IMPORT_BYTES) {
    throw new Error(msg('validation.import.tooLarge'));
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(msg('validation.import.parse'));
  }
  const errors = validateCardData(parsed, msg);
  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
  return parsed;
}

/** @returns {boolean} true when data passes schema validation (for parity tests) */
export function schemaValidates(data) {
  if (exceedsNestingDepth(data) || exceedsStringLength(data)) return false;
  return validateSchema(data) === true;
}
