import { validateDraftData } from './validate.js';

const STORAGE_KEY = 'ai-transparency-card-draft';
const LANG_KEY = 'ai-transparency-card-lang';
const INVALID_DRAFT_KEY = 'ai-transparency-card-draft-invalid';

let preservedUnreadableCause = null;

function isStorageReadDisabled() {
  try {
    localStorage.getItem('__storage_read_probe__');
    return false;
  } catch {
    return true;
  }
}

function isQuotaError(err) {
  if (!err) return false;
  const name = typeof err === 'object' && err.name ? err.name : '';
  const msg = typeof err === 'string' ? err : (err.message || String(err));
  return name === 'QuotaExceededError' || /quota/i.test(msg);
}

function setPreservedCause(err) {
  if (!err) {
    preservedUnreadableCause = null;
    return;
  }
  preservedUnreadableCause = isQuotaError(err) ? 'quota' : 'blocked';
}

export function getPreservedUnreadableDraftCause() {
  return preservedUnreadableCause;
}

function getDraftRaw() {
  try {
    return { ok: true, raw: localStorage.getItem(STORAGE_KEY) };
  } catch (err) {
    return { ok: false, error: err.message || 'read_failed' };
  }
}

function isValidDraftRaw(raw) {
  try {
    const parsed = JSON.parse(raw);
    return validateDraftData(parsed).length === 0;
  } catch {
    return false;
  }
}

function isQuarantineEntry(entry) {
  return Boolean(
    entry
    && typeof entry === 'object'
    && typeof entry.id === 'string'
    && typeof entry.raw === 'string'
    && typeof entry.quarantinedAt === 'string'
  );
}

function generateQuarantineId(existingIds) {
  let id;
  do {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  } while (existingIds.has(id));
  return id;
}

function stableIdFromRaw(raw) {
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 33) ^ raw.charCodeAt(i);
  }
  return `legacy-${(h >>> 0).toString(36)}`;
}

function legacyQuarantineEntry(raw) {
  return {
    id: stableIdFromRaw(raw),
    raw,
    quarantinedAt: '1970-01-01T00:00:00.000Z'
  };
}

function assignUniqueQuarantineIds(entries) {
  const ordinal = new Map();
  return entries.map((entry) => {
    const base = entry.id;
    const n = ordinal.get(base) ?? 0;
    ordinal.set(base, n + 1);
    if (n === 0) return entry;
    return { ...entry, id: `${base}#${n + 1}` };
  });
}

function readQuarantineList() {
  let stored;
  try {
    stored = localStorage.getItem(INVALID_DRAFT_KEY);
  } catch (err) {
    return { ok: false, error: err.message || 'read_failed' };
  }
  if (!stored) return { ok: true, list: [] };
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every(isQuarantineEntry)) {
      const list = assignUniqueQuarantineIds(parsed);
      const hadDupes = list.some((entry, index) => entry.id !== parsed[index].id);
      if (hadDupes) {
        try {
          writeQuarantineList(list);
        } catch {
          /* keep in-memory list only */
        }
      }
      return { ok: true, list };
    }
  } catch {
    /* legacy single raw value */
  }
  const migrated = [legacyQuarantineEntry(stored)];
  try {
    writeQuarantineList(migrated);
  } catch {
    /* keep in-memory list only; ID is stable from raw */
  }
  return { ok: true, list: migrated };
}

function writeQuarantineList(list) {
  if (!list.length) {
    localStorage.removeItem(INVALID_DRAFT_KEY);
    return;
  }
  localStorage.setItem(INVALID_DRAFT_KEY, JSON.stringify(list));
}

function quarantineDraft(raw) {
  const listResult = readQuarantineList();
  if (!listResult.ok) {
    return { ok: false, error: listResult.error || 'read_failed' };
  }
  try {
    const list = listResult.list;
    const ids = new Set(list.map((d) => d.id));
    list.push({
      id: generateQuarantineId(ids),
      raw,
      quarantinedAt: new Date().toISOString()
    });
    writeQuarantineList(list);
    localStorage.removeItem(STORAGE_KEY);
    setPreservedCause(null);
    return { ok: true };
  } catch (err) {
    setPreservedCause(err);
    return { ok: false, error: err.message || 'quarantine_failed', cause: err.name };
  }
}

export function hasPreservedUnreadableDraft() {
  if (isStorageReadDisabled()) return false;
  const read = getDraftRaw();
  if (!read.ok) return false;
  return Boolean(read.raw && !isValidDraftRaw(read.raw));
}

export function getPreservedUnreadableDraftRaw() {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  const read = getDraftRaw();
  if (!read.ok) return { ok: false, error: read.error };
  const raw = read.raw;
  if (!raw) return { ok: false, error: 'not_found' };
  if (isValidDraftRaw(raw)) return { ok: false, error: 'not_unreadable' };
  return { ok: true, raw };
}

export function discardPreservedUnreadableDraft() {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  const read = getDraftRaw();
  if (!read.ok) return { ok: false, error: read.error };
  const raw = read.raw;
  if (!raw || isValidDraftRaw(raw)) return { ok: false, error: 'not_found' };
  try {
    localStorage.removeItem(STORAGE_KEY);
    setPreservedCause(null);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function saveDraft(state) {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  const validationErrors = validateDraftData(state);
  if (validationErrors.length) {
    return { ok: false, error: 'validation_failed', validationErrors };
  }
  const read = getDraftRaw();
  if (!read.ok) {
    return { ok: false, error: read.error || 'read_failed' };
  }
  const existing = read.raw;
  if (existing && !isValidDraftRaw(existing)) {
    return { ok: false, error: 'unreadable_draft_preserved' };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function loadDraft() {
  if (isStorageReadDisabled()) return { ok: true, state: null, invalid: false };
  const read = getDraftRaw();
  if (!read.ok) {
    return { ok: false, error: read.error, state: null, invalid: false };
  }
  const raw = read.raw;
  if (!raw) return { ok: true, state: null, invalid: false };
  try {
    const parsed = JSON.parse(raw);
    const errors = validateDraftData(parsed);
    if (errors.length) {
      const quarantine = quarantineDraft(raw);
      if (!quarantine.ok) {
        return {
          ok: false,
          error: 'quarantine_failed',
          quarantineError: quarantine.error,
          quarantineCause: preservedUnreadableCause,
          state: null,
          invalid: true,
          preserved: true,
          invalidRaw: raw
        };
      }
      return { ok: true, state: null, invalid: true, invalidRaw: raw };
    }
    return { ok: true, state: parsed, invalid: false };
  } catch (err) {
    const retry = getDraftRaw();
    if (!retry.ok) {
      return { ok: false, error: retry.error, state: null, invalid: true };
    }
    const unreadable = retry.raw;
    if (unreadable) {
      const quarantine = quarantineDraft(unreadable);
      if (!quarantine.ok) {
        return {
          ok: false,
          error: 'quarantine_failed',
          quarantineError: quarantine.error,
          quarantineCause: preservedUnreadableCause,
          state: null,
          invalid: true,
          preserved: true,
          invalidRaw: unreadable
        };
      }
    }
    return { ok: false, error: err.message, state: null, invalid: true };
  }
}

export function clearDraft() {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function listQuarantinedDrafts() {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable', drafts: [] };
  const listResult = readQuarantineList();
  if (!listResult.ok) {
    return { ok: false, error: listResult.error, drafts: [] };
  }
  return { ok: true, drafts: listResult.list };
}

export function getQuarantinedDraftRaw(id) {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  const listResult = readQuarantineList();
  if (!listResult.ok) return { ok: false, error: listResult.error };
  const entry = listResult.list.find((d) => d.id === id);
  if (!entry) return { ok: false, error: 'not_found' };
  return { ok: true, raw: entry.raw };
}

export function deleteQuarantinedDraft(id) {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  const listResult = readQuarantineList();
  if (!listResult.ok) return { ok: false, error: listResult.error };
  try {
    const list = listResult.list;
    const next = list.filter((d) => d.id !== id);
    if (next.length === list.length) return { ok: false, error: 'not_found' };
    writeQuarantineList(next);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function saveLanguage(lang) {
  if (isStorageReadDisabled()) return { ok: false, error: 'storage_unavailable' };
  try {
    localStorage.setItem(LANG_KEY, lang);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function loadLanguage() {
  if (isStorageReadDisabled()) return { ok: true, lang: null };
  try {
    return { ok: true, lang: localStorage.getItem(LANG_KEY) };
  } catch (err) {
    return { ok: false, error: err.message, lang: null };
  }
}

export function hasValidDraft() {
  const result = loadDraft();
  return Boolean(result.ok && result.state && !result.invalid);
}

export function hasInvalidDraft() {
  if (isStorageReadDisabled()) return false;
  const listResult = readQuarantineList();
  if (!listResult.ok) return hasPreservedUnreadableDraft();
  return listResult.list.length > 0 || hasPreservedUnreadableDraft();
}
