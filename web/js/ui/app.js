import {
  evaluate,
  computeTier,
  getSafeguardIds,
  getRequiredSafeguards,
  isImpactComplete,
  isImpactAllNo,
  IMPACT_IDS,
  DATA_IDS,
  ruleReasonKey
} from '../core/rules.js';
import {
  createEmptyState,
  buildCard,
  exportMarkdown,
  exportJson,
  parseImportedJson,
  bumpVersion,
  diffChanges,
  applyLocalizedContent
} from '../core/card.js';
import { MAX_IMPORT_BYTES } from '../core/validate.js';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  saveLanguage,
  loadLanguage,
  hasValidDraft,
  listQuarantinedDrafts,
  getQuarantinedDraftRaw,
  deleteQuarantinedDraft,
  hasPreservedUnreadableDraft,
  getPreservedUnreadableDraftRaw,
  getPreservedUnreadableDraftCause,
  discardPreservedUnreadableDraft
} from '../core/storage.js';
import { loadI18n, setLang, getLang, applyI18n, t, getLabels, getStrings } from './i18n.js';
import { renderCardDom, renderDecisionPreviewDom } from './render-card.js';

const SAFEGUARD_IDS = getSafeguardIds();
let state = createEmptyState();
let currentStep = 1;
let previousState = null;
let savedDraftState = null;

const SAMPLE_PATHS = {
  1: 'data/samples/sample-tier1-green.json',
  2: 'data/samples/sample-tier2-amber.json',
  3: 'data/samples/sample-tier3-red.json'
};

const FIELD_LABELS = {
  'f-name': 'field.name',
  'f-purpose': 'field.purpose',
  'f-accountable': 'field.accountableRole',
  'f-tool-type': 'field.toolType',
  'f-deployment': 'field.deployment',
  'f-input-lang': 'field.inputLanguages',
  'f-output-lang': 'field.outputLanguages',
  'c-inform-what': 'community.informWhat',
  'c-inform-channels': 'community.informChannels',
  'c-inform-languages': 'community.informLanguages',
  'c-inform-formats': 'community.informFormats',
  'c-inform-when': 'community.informWhen',
  'c-complain-channel': 'community.complainChannel',
  'c-complain-time': 'community.complainResponseTime',
  'c-complain-handover': 'community.complainHandover',
  'c-consult-who': 'community.consultWho',
  'c-consult-when': 'community.consultWhen',
  'c-consult-method': 'community.consultMethod',
  'c-consult-influence': 'community.consultInfluence',
  'c-feedback-how': 'community.feedbackHow',
  'c-inclusion': 'community.inclusion'
};

function $(id) { return document.getElementById(id); }

function ruleText(id) {
  return t(ruleReasonKey(id));
}

function showView(id) {
  document.querySelectorAll('.view').forEach((v) => { v.hidden = v.id !== id; });
}

function clearFieldErrors() {
  document.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  });
  document.querySelectorAll('.field-error').forEach((el) => el.remove());
}

function readStep1() {
  state.step1 = {
    name: $('f-name').value.trim(),
    purpose: $('f-purpose').value.trim(),
    team: $('f-team').value.trim(),
    accountableRole: $('f-accountable').value.trim(),
    toolType: $('f-tool-type').value,
    deployment: $('f-deployment').value,
    inputLanguages: $('f-input-lang').value.trim(),
    outputLanguages: $('f-output-lang').value.trim()
  };
}

function readImpact() {
  for (const id of IMPACT_IDS) {
    const yes = document.querySelector(`input[name="impact-${id}"][value="yes"]`);
    const no = document.querySelector(`input[name="impact-${id}"][value="no"]`);
    if (yes?.checked) state.impact[id] = true;
    else if (no?.checked) state.impact[id] = false;
    else state.impact[id] = null;
  }
}

function readData() {
  for (const id of DATA_IDS) {
    state.data[id] = $(`data-${id}`)?.checked || false;
  }
}

function readSafeguards() {
  state.safeguards = {};
  for (const id of SAFEGUARD_IDS) {
    const el = document.querySelector(`[data-safeguard="${id}"]`);
    if (el) state.safeguards[id] = el.checked;
  }
}

function readCommunity() {
  state.community = {
    informWhat: $('c-inform-what').value.trim(),
    informChannels: $('c-inform-channels').value.trim(),
    informLanguages: $('c-inform-languages').value.trim(),
    informFormats: $('c-inform-formats').value.trim(),
    informWhen: $('c-inform-when').value.trim(),
    complainChannel: $('c-complain-channel').value.trim(),
    complainResponseTime: $('c-complain-time').value.trim(),
    complainHandover: $('c-complain-handover').value.trim(),
    consultWho: $('c-consult-who').value.trim(),
    consultWhen: $('c-consult-when').value.trim(),
    consultMethod: $('c-consult-method').value.trim(),
    consultInfluence: $('c-consult-influence').value.trim(),
    feedbackHow: $('c-feedback-how').value.trim(),
    inclusion: $('c-inclusion').value.trim()
  };
}

function writeStep1() {
  $('f-name').value = state.step1.name || '';
  $('f-purpose').value = state.step1.purpose || '';
  $('f-team').value = state.step1.team || '';
  $('f-accountable').value = state.step1.accountableRole || '';
  $('f-tool-type').value = state.step1.toolType || '';
  $('f-deployment').value = state.step1.deployment || '';
  $('f-input-lang').value = state.step1.inputLanguages || '';
  $('f-output-lang').value = state.step1.outputLanguages || '';
}

function writeImpact() {
  for (const id of IMPACT_IDS) {
    const yes = document.querySelector(`input[name="impact-${id}"][value="yes"]`);
    const no = document.querySelector(`input[name="impact-${id}"][value="no"]`);
    if (yes) yes.checked = state.impact[id] === true;
    if (no) no.checked = state.impact[id] === false;
  }
}

function writeData() {
  for (const id of DATA_IDS) {
    const el = $(`data-${id}`);
    if (el) el.checked = !!state.data[id];
  }
}

function writeSafeguards() {
  buildSafeguardFieldset();
  for (const id of SAFEGUARD_IDS) {
    const el = document.querySelector(`[data-safeguard="${id}"]`);
    if (el) el.checked = !!state.safeguards[id];
  }
}

function writeCommunity() {
  const c = state.community || {};
  $('c-inform-what').value = c.informWhat || '';
  $('c-inform-channels').value = c.informChannels || '';
  $('c-inform-languages').value = c.informLanguages || '';
  $('c-inform-formats').value = c.informFormats || '';
  $('c-inform-when').value = c.informWhen || '';
  $('c-complain-channel').value = c.complainChannel || '';
  $('c-complain-time').value = c.complainResponseTime || '';
  $('c-complain-handover').value = c.complainHandover || '';
  $('c-consult-who').value = c.consultWho || '';
  $('c-consult-when').value = c.consultWhen || '';
  $('c-consult-method').value = c.consultMethod || '';
  $('c-consult-influence').value = c.consultInfluence || '';
  $('c-feedback-how').value = c.feedbackHow || '';
  $('c-inclusion').value = c.inclusion || '';
  $('f-next-review').value = state.nextReviewDate || '';
}

function buildSafeguardFieldset() {
  const fs = $('safeguards-fieldset');
  if (!fs) return;
  readImpact();
  readData();
  const tier = computeTier(state.impact) || 1;
  const required = new Set(getRequiredSafeguards(tier, state.data, state.impact));
  fs.replaceChildren();
  const legend = document.createElement('legend');
  legend.textContent = t('step.4');
  fs.appendChild(legend);

  for (const id of SAFEGUARD_IDS) {
    const isRequired = required.has(id);
    const label = document.createElement('label');
    label.className = `inline safeguard-item${isRequired ? ' safeguard-required' : ' safeguard-optional'}`;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.safeguard = id;
    input.id = `sg-${id}`;
    input.checked = !!state.safeguards[id];
    const span = document.createElement('span');
    span.textContent = t(`safeguards.${id}`);
    if (!isRequired) {
      const tag = document.createElement('span');
      tag.className = 'safeguard-tag';
      tag.textContent = t('safeguards.notRequired');
      span.appendChild(document.createTextNode(' '));
      span.appendChild(tag);
    }
    label.appendChild(input);
    label.appendChild(span);
    fs.appendChild(label);
  }
}

function renderStepsNav() {
  const nav = $('steps-nav');
  if (!nav) return;
  nav.replaceChildren();
  nav.setAttribute('aria-label', t('progress.label', { n: currentStep, total: 6 }));

  for (let n = 1; n <= 6; n++) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'step-nav-btn';
    btn.dataset.step = String(n);
    btn.textContent = `${n}. ${t(`step.${n}`)}`;
    if (n === currentStep) {
      btn.setAttribute('aria-current', 'step');
      btn.disabled = true;
    } else if (n > currentStep) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => goToStep(n));
    }
    li.appendChild(btn);
    nav.appendChild(li);
  }

  const status = $('step-progress-status');
  if (status) {
    status.textContent = t('progress.status', { n: currentStep, total: 6, name: t(`step.${currentStep}`) });
  }
}

function renderTierResult() {
  const el = $('tier-result');
  if (!el) return;
  readImpact();
  el.replaceChildren();
  if (!isImpactComplete(state.impact)) {
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = t('impact.incomplete');
    el.appendChild(p);
    return;
  }
  if (isImpactAllNo(state.impact)) {
    const p = document.createElement('p');
    p.className = 'note impact-all-no';
    p.textContent = t('impact.allNo');
    el.appendChild(p);
    return;
  }
  const tier = computeTier(state.impact);
  const h2 = document.createElement('h2');
  h2.textContent = `${t('tier.label')}: ${t(`tier.${tier}.name`)}`;
  el.appendChild(h2);
  const quote = document.createElement('blockquote');
  quote.className = 'tier-quote';
  quote.textContent = `"${t(`tier.${tier}.quote`)}"`;
  if (getLang() === 'fr') {
    const unofficial = document.createElement('span');
    unofficial.className = 'note';
    unofficial.textContent = ` ${t('tier.unofficialFr')}`;
    quote.appendChild(unofficial);
  }
  el.appendChild(quote);
  const attr = document.createElement('p');
  attr.className = 'note';
  attr.setAttribute('lang', getLang());
  attr.textContent = t('tier.attribution');
  el.appendChild(attr);
}

function renderDecisionPreview() {
  readSafeguards();
  readData();
  const el = $('decision-preview');
  if (!el) return;
  renderDecisionPreviewDom(el, state, t, ruleText);
}

function renderCard() {
  readStep1();
  readImpact();
  readData();
  readSafeguards();
  readCommunity();
  state.nextReviewDate = $('f-next-review')?.value || '';
  state.language = getLang();
  const card = buildCard(state);

  const banner = $('synthetic-banner');
  if (banner) {
    banner.hidden = !state.syntheticLabel;
    if (state.syntheticLabel) banner.textContent = state.syntheticLabel;
  }

  const preview = $('card-content');
  if (preview) renderCardDom(preview, { ...state, evaluation: card.evaluation }, t, ruleText);

  const previewSide = $('card-preview-content');
  if (previewSide) renderCardDom(previewSide, { ...state, evaluation: card.evaluation }, t, ruleText);
}

function validateStep(step) {
  const errors = [];
  const add = (id, msgKey, vars) => {
    const labelKey = FIELD_LABELS[id];
    const label = labelKey ? t(labelKey) : '';
    const msg = vars ? t(msgKey, vars) : (label ? t('validation.requiredField', { field: label }) : t(msgKey));
    errors.push({ id, msg });
  };

  if (step === 1) {
    readStep1();
    if (!state.step1.name) add('f-name', 'validation.requiredField', { field: t('field.name') });
    if (!state.step1.purpose) add('f-purpose', 'validation.requiredField', { field: t('field.purpose') });
    if (!state.step1.accountableRole) add('f-accountable', 'validation.requiredField', { field: t('field.accountableRole') });
    if (!state.step1.toolType) add('f-tool-type', 'validation.requiredField', { field: t('field.toolType') });
    if (!state.step1.deployment) add('f-deployment', 'validation.requiredField', { field: t('field.deployment') });
    if (!state.step1.inputLanguages) add('f-input-lang', 'validation.requiredField', { field: t('field.inputLanguages') });
    if (!state.step1.outputLanguages) add('f-output-lang', 'validation.requiredField', { field: t('field.outputLanguages') });
  }
  if (step === 2) {
    readImpact();
    if (!isImpactComplete(state.impact)) add('impact-fieldset', 'impact.incomplete');
  }
  if (step === 5) {
    readCommunity();
    readImpact();
    readSafeguards();
    readData();
    const tier = computeTier(state.impact);
    const ev = evaluate(state);
    if (tier === 3 && ev.decision !== 'red') {
      for (const [fieldId, labelKey] of Object.entries(FIELD_LABELS)) {
        if (!fieldId.startsWith('c-')) continue;
        const el = $(fieldId);
        if (el && !el.value.trim()) {
          add(fieldId, 'validation.requiredField', { field: t(labelKey) });
        }
      }
    }
  }
  return errors;
}

function showErrors(errors) {
  clearFieldErrors();
  const summary = $('error-summary');
  const list = $('error-list');
  if (!errors.length) {
    if (summary) summary.hidden = true;
    return;
  }
  if (summary) summary.hidden = false;
  if (list) {
    list.replaceChildren();
    for (const e of errors) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${e.id}`;
      a.textContent = e.msg;
      li.appendChild(a);
      list.appendChild(li);
      const field = $(e.id);
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        const errId = `${e.id}-error`;
        let errEl = $(errId);
        if (!errEl) {
          errEl = document.createElement('span');
          errEl.id = errId;
          errEl.className = 'field-error';
          errEl.setAttribute('role', 'alert');
          field.parentElement?.appendChild(errEl);
        }
        errEl.textContent = e.msg;
        field.setAttribute('aria-describedby', errId);
      }
    }
  }
  summary?.focus();
  summary?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateCommunityNote() {
  const note = $('community-req-note');
  if (!note) return;
  readImpact();
  const tier = computeTier(state.impact);
  const ev = evaluate({ ...state, community: state.community });
  if (tier === 3 && ev.decision === 'red') {
    note.textContent = t('community.incompleteAllowed');
    note.dataset.i18nKey = 'community.incompleteAllowed';
  } else if (tier === 3) {
    note.textContent = t('community.required');
    note.dataset.i18nKey = 'community.required';
  } else {
    note.textContent = t('community.recommended');
    note.dataset.i18nKey = 'community.recommended';
  }
}

function updateWizardButtons() {
  const back = $('btn-back');
  const next = $('btn-next');
  const save = $('btn-save');
  if (back) back.disabled = currentStep === 1;
  if (next) next.textContent = currentStep === 6 ? t('btn.save') : t('btn.next');
  if (save) save.hidden = currentStep === 6;
}

function scrollStepHeadingIntoView(heading) {
  if (!heading) return;
  requestAnimationFrame(() => {
    const header = document.querySelector('.site-header');
    const offset = (header?.offsetHeight || 0) + 16;
    const top = heading.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    heading.focus({ preventScroll: true });
  });
}

function goToStep(step) {
  if (step === 4) readData();
  currentStep = step;
  document.querySelectorAll('.step-panel').forEach((p) => {
    p.hidden = Number(p.dataset.step) !== step;
  });
  renderStepsNav();
  updateWizardButtons();
  scrollStepHeadingIntoView($(`step-${step}-title`));
  if (step === 2) renderTierResult();
  if (step === 4) {
    buildSafeguardFieldset();
    renderDecisionPreview();
  }
  if (step === 5) updateCommunityNote();
  if (step === 6) {
    renderCard();
  }
}

function syncAllFromForm() {
  readStep1();
  readImpact();
  readData();
  readSafeguards();
  readCommunity();
  state.nextReviewDate = $('f-next-review')?.value || '';
  state.language = getLang();
}

function tryPersistDraft() {
  syncAllFromForm();
  const result = saveDraft(state);
  if (!result.ok) {
    if (result.error === 'unreadable_draft_preserved') {
      $('live-region').textContent = t('storage.saveBlockedUnreadable');
    } else if (result.error === 'validation_failed') {
      $('live-region').textContent = t('validation.draft.invalid');
    } else {
      $('live-region').textContent = t('storage.saveFailed');
    }
    return false;
  }
  $('live-region').textContent = t('btn.save');
  return true;
}

function persistDraft() {
  return tryPersistDraft();
}

function finalizeRevisionIfNeeded() {
  syncAllFromForm();
  const changes = diffChanges(previousState, state);
  if (!(changes.length === 1 && changes[0] === 'minor') || !state.changeLog?.length) {
    state = bumpVersion(state, changes);
  }
  previousState = JSON.parse(JSON.stringify(state));
}

function saveWithVersioning() {
  finalizeRevisionIfNeeded();
  return persistDraft();
}

function finalizeForExport() {
  finalizeRevisionIfNeeded();
  return tryPersistDraft();
}

function showImportErrors(messages) {
  const lines = Array.isArray(messages) ? messages : [messages];
  for (const id of ['import-error-summary-home', 'import-error-summary-wizard']) {
    const summary = $(id);
    const list = $(`${id}-list`);
    if (!summary || !list) continue;
    summary.hidden = false;
    list.replaceChildren();
    for (const msg of lines) {
      const li = document.createElement('li');
      li.textContent = msg;
      list.appendChild(li);
    }
    summary.focus();
  }
}

function clearImportErrors() {
  for (const id of ['import-error-summary-home', 'import-error-summary-wizard']) {
    const summary = $(id);
    if (summary) summary.hidden = true;
  }
}

function formatQuarantineDate(iso) {
  try {
    return new Date(iso).toLocaleString(getLang() === 'fr' ? 'fr-CA' : 'en-CA');
  } catch {
    return iso;
  }
}

function renderInvalidDraftNotices() {
  const container = $('invalid-draft-notices');
  if (!container) return;
  const { ok, drafts } = listQuarantinedDrafts();
  container.replaceChildren();
  const hasPreserved = hasPreservedUnreadableDraft();
  if (!hasPreserved && (!ok || !drafts.length)) {
    container.hidden = true;
    return;
  }
  container.hidden = false;

  if (hasPreserved) {
    const item = document.createElement('div');
    item.className = 'invalid-draft-item preserved-unreadable-draft';

    const notice = document.createElement('p');
    notice.className = 'invalid-draft-notice';
    const noticeKey = getPreservedUnreadableDraftCause() === 'quota'
      ? 'home.preservedUnreadableDraftQuota'
      : 'home.preservedUnreadableDraft';
    notice.textContent = t(noticeKey);
    item.appendChild(notice);

    const actions = document.createElement('div');
    actions.className = 'invalid-draft-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.textContent = t('home.downloadUnreadableDraft');
    downloadBtn.setAttribute('aria-label', t('home.downloadPreservedUnreadableDraft'));
    downloadBtn.addEventListener('click', () => {
      const result = getPreservedUnreadableDraftRaw();
      if (!result.ok) {
        $('live-region').textContent = t('storage.quarantineNotFound');
        return;
      }
      downloadBlob(result.raw, 'unreadable-draft-preserved.json', 'application/json');
    });

    const discardBtn = document.createElement('button');
    discardBtn.type = 'button';
    discardBtn.textContent = t('home.discardUnreadableDraft');
    discardBtn.setAttribute('aria-label', t('home.discardUnreadableDraftLabel'));
    discardBtn.addEventListener('click', () => {
      const result = discardPreservedUnreadableDraft();
      if (result.ok) {
        renderInvalidDraftNotices();
        updateHomeDraftUI();
        $('live-region').textContent = t('home.unreadableDraftDeleted');
      } else {
        $('live-region').textContent = t('storage.quarantineNotFound');
      }
    });

    actions.appendChild(downloadBtn);
    actions.appendChild(discardBtn);
    item.appendChild(actions);
    container.appendChild(item);
  }

  if (!ok) return;
  for (const draft of drafts) {
    const dateLabel = formatQuarantineDate(draft.quarantinedAt);
    const item = document.createElement('div');
    item.className = 'invalid-draft-item';
    item.dataset.quarantineId = draft.id;

    const notice = document.createElement('p');
    notice.className = 'invalid-draft-notice';
    notice.textContent = t('home.invalidDraftItem', { date: dateLabel });
    item.appendChild(notice);

    const actions = document.createElement('div');
    actions.className = 'invalid-draft-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.textContent = t('home.downloadUnreadableDraft');
    downloadBtn.setAttribute('aria-label', t('home.downloadUnreadableDraftLabel', { date: dateLabel }));
    downloadBtn.addEventListener('click', () => {
      const result = getQuarantinedDraftRaw(draft.id);
      if (!result.ok) {
        $('live-region').textContent = t('storage.quarantineNotFound');
        return;
      }
      const stamp = draft.quarantinedAt.replace(/[:.]/g, '-');
      downloadBlob(result.raw, `unreadable-draft-${stamp}.json`, 'application/json');
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = t('home.deleteUnreadableDraft');
    deleteBtn.setAttribute('aria-label', t('home.deleteUnreadableDraftLabel', { date: dateLabel }));
    deleteBtn.addEventListener('click', () => {
      const result = deleteQuarantinedDraft(draft.id);
      if (result.ok) {
        renderInvalidDraftNotices();
        $('live-region').textContent = t('home.unreadableDraftDeleted');
      } else {
        $('live-region').textContent = t('storage.quarantineNotFound');
      }
    });

    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(actions);
    container.appendChild(item);
  }
}

function updateHomeDraftUI() {
  const resumeBtn = $('btn-resume');
  if (resumeBtn) resumeBtn.hidden = !hasValidDraft();
  renderInvalidDraftNotices();
}

function applyWizardState(fromState) {
  state = { ...createEmptyState(), ...fromState };
  delete state.evaluation;
  delete state.tierDefinition;
  delete state.attribution;
  state.language = getLang();
  previousState = JSON.parse(JSON.stringify(state));
  writeStep1();
  writeImpact();
  writeData();
  writeSafeguards();
  writeCommunity();
}

function startWizard(fromState = null) {
  clearImportErrors();
  if (fromState) {
    applyWizardState(fromState);
  } else {
    state = createEmptyState();
    state.changeLog = [{ date: state.date, version: 1, changes: ['initial'] }];
    state.language = getLang();
    previousState = JSON.parse(JSON.stringify(state));
    writeStep1();
    writeImpact();
    writeData();
    writeSafeguards();
    writeCommunity();
  }
  showView('view-wizard');
  goToStep(1);
}

async function loadSample(n) {
  const res = await fetch(SAMPLE_PATHS[n]);
  const data = await res.json();
  const localized = applyLocalizedContent(data, getLang());
  startWizard(localized);
  goToStep(6);
}

function captureImpactSnapshot() {
  const impact = {};
  for (const id of IMPACT_IDS) {
    const yes = document.querySelector(`input[name="impact-${id}"][value="yes"]`);
    const no = document.querySelector(`input[name="impact-${id}"][value="no"]`);
    if (yes?.checked) impact[id] = 'yes';
    else if (no?.checked) impact[id] = 'no';
    else impact[id] = null;
  }
  return impact;
}

function captureDataSnapshot() {
  const data = {};
  for (const id of DATA_IDS) {
    data[id] = !!$(`data-${id}`)?.checked;
  }
  return data;
}

function captureSafeguardsSnapshot() {
  const safeguards = {};
  for (const id of SAFEGUARD_IDS) {
    const el = document.querySelector(`[data-safeguard="${id}"]`);
    if (el) safeguards[id] = el.checked;
  }
  return safeguards;
}

function captureCommunitySnapshot() {
  return {
    informWhat: $('c-inform-what')?.value ?? '',
    informChannels: $('c-inform-channels')?.value ?? '',
    informLanguages: $('c-inform-languages')?.value ?? '',
    informFormats: $('c-inform-formats')?.value ?? '',
    informWhen: $('c-inform-when')?.value ?? '',
    complainChannel: $('c-complain-channel')?.value ?? '',
    complainResponseTime: $('c-complain-time')?.value ?? '',
    complainHandover: $('c-complain-handover')?.value ?? '',
    consultWho: $('c-consult-who')?.value ?? '',
    consultWhen: $('c-consult-when')?.value ?? '',
    consultMethod: $('c-consult-method')?.value ?? '',
    consultInfluence: $('c-consult-influence')?.value ?? '',
    feedbackHow: $('c-feedback-how')?.value ?? '',
    inclusion: $('c-inclusion')?.value ?? ''
  };
}

function captureFormSnapshot() {
  return {
    state: JSON.parse(JSON.stringify(state)),
    previousState: JSON.parse(JSON.stringify(previousState)),
    step1: {
      name: $('f-name')?.value ?? '',
      purpose: $('f-purpose')?.value ?? '',
      team: $('f-team')?.value ?? '',
      accountableRole: $('f-accountable')?.value ?? '',
      toolType: $('f-tool-type')?.value ?? '',
      deployment: $('f-deployment')?.value ?? '',
      inputLanguages: $('f-input-lang')?.value ?? '',
      outputLanguages: $('f-output-lang')?.value ?? ''
    },
    community: captureCommunitySnapshot(),
    nextReviewDate: $('f-next-review')?.value ?? '',
    impact: captureImpactSnapshot(),
    data: captureDataSnapshot(),
    safeguards: captureSafeguardsSnapshot(),
    currentStep,
    viewId: document.querySelector('.view:not([hidden])')?.id ?? null
  };
}

function restoreImpactSnapshot(impact) {
  for (const id of IMPACT_IDS) {
    const yes = document.querySelector(`input[name="impact-${id}"][value="yes"]`);
    const no = document.querySelector(`input[name="impact-${id}"][value="no"]`);
    if (yes) yes.checked = impact[id] === 'yes';
    if (no) no.checked = impact[id] === 'no';
  }
}

function restoreDataSnapshot(dataSnap) {
  for (const id of DATA_IDS) {
    const el = $(`data-${id}`);
    if (el) el.checked = !!dataSnap[id];
  }
}

function restoreSafeguardsSnapshot(safeguardsSnap) {
  for (const id of SAFEGUARD_IDS) {
    const el = document.querySelector(`[data-safeguard="${id}"]`);
    if (el) el.checked = !!safeguardsSnap[id];
  }
}

function restoreFormSnapshot(snapshot) {
  state = snapshot.state;
  previousState = snapshot.previousState;
  $('f-name').value = snapshot.step1.name;
  $('f-purpose').value = snapshot.step1.purpose;
  $('f-team').value = snapshot.step1.team;
  $('f-accountable').value = snapshot.step1.accountableRole;
  $('f-tool-type').value = snapshot.step1.toolType;
  $('f-deployment').value = snapshot.step1.deployment;
  $('f-input-lang').value = snapshot.step1.inputLanguages;
  $('f-output-lang').value = snapshot.step1.outputLanguages;
  if ($('f-next-review')) $('f-next-review').value = snapshot.nextReviewDate;
  const c = snapshot.community || {};
  $('c-inform-what').value = c.informWhat ?? '';
  $('c-inform-channels').value = c.informChannels ?? '';
  $('c-inform-languages').value = c.informLanguages ?? '';
  $('c-inform-formats').value = c.informFormats ?? '';
  $('c-inform-when').value = c.informWhen ?? '';
  $('c-complain-channel').value = c.complainChannel ?? '';
  $('c-complain-time').value = c.complainResponseTime ?? '';
  $('c-complain-handover').value = c.complainHandover ?? '';
  $('c-consult-who').value = c.consultWho ?? '';
  $('c-consult-when').value = c.consultWhen ?? '';
  $('c-consult-method').value = c.consultMethod ?? '';
  $('c-consult-influence').value = c.consultInfluence ?? '';
  $('c-feedback-how').value = c.feedbackHow ?? '';
  $('c-inclusion').value = c.inclusion ?? '';
  if (snapshot.impact) restoreImpactSnapshot(snapshot.impact);
  if (snapshot.data) restoreDataSnapshot(snapshot.data);
  if (snapshot.safeguards) restoreSafeguardsSnapshot(snapshot.safeguards);
  currentStep = snapshot.currentStep;
  document.querySelectorAll('.step-panel').forEach((p) => {
    p.hidden = Number(p.dataset.step) !== currentStep;
  });
  if (snapshot.viewId) showView(snapshot.viewId);
}

function handleImport(file, inputEl) {
  if (!file) return;
  if (file.size > MAX_IMPORT_BYTES) {
    showImportErrors([t('validation.import.tooLarge')]);
    if (inputEl) inputEl.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => {
    showImportErrors([t('validation.import.readFailed')]);
    if (inputEl) inputEl.value = '';
  };
  reader.onload = () => {
    const snapshot = captureFormSnapshot();
    try {
      const imported = parseImportedJson(reader.result, t);
      try {
        applyWizardState(imported);
        showView('view-wizard');
        goToStep(6);
        clearImportErrors();
      } catch (applyErr) {
        restoreFormSnapshot(snapshot);
        showImportErrors([applyErr.message || t('validation.import.invalid')]);
      }
    } catch (err) {
      restoreFormSnapshot(snapshot);
      showImportErrors(err.message.split('\n').filter(Boolean));
    }
    if (inputEl) inputEl.value = '';
  };
  reader.readAsText(file);
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function refreshLanguageDependent() {
  document.title = t(document.querySelector('meta[name="i18n-title"]')?.getAttribute('content') || 'meta.title');
  renderStepsNav();
  updateCommunityNote();
  updateWizardButtons();
  if (currentStep === 2) renderTierResult();
  if (currentStep === 4) {
    buildSafeguardFieldset();
    renderDecisionPreview();
  }
  if (currentStep === 6) renderCard();
  renderInvalidDraftNotices();
  const note = $('community-req-note');
  if (note?.dataset.i18nKey) note.textContent = t(note.dataset.i18nKey);
}

async function init() {
  await loadI18n();
  const langResult = loadLanguage();
  if (langResult.ok && (langResult.lang === 'fr' || langResult.lang === 'en')) setLang(langResult.lang);
  applyI18n();

  const draft = loadDraft();
  if (draft.ok && draft.state) savedDraftState = draft.state;
  updateHomeDraftUI();

  $('btn-start')?.addEventListener('click', () => startWizard());
  $('btn-resume')?.addEventListener('click', () => {
    if (savedDraftState) startWizard(savedDraftState);
  });
  $('btn-sample-1')?.addEventListener('click', () => loadSample(1));
  $('btn-sample-2')?.addEventListener('click', () => loadSample(2));
  $('btn-sample-3')?.addEventListener('click', () => loadSample(3));
  $('btn-clear-draft')?.addEventListener('click', () => {
    const result = clearDraft();
    savedDraftState = null;
    state = createEmptyState();
    updateHomeDraftUI();
    $('live-region').textContent = result.ok ? t('home.draftCleared') : t('storage.clearFailed');
  });

  const importHome = $('import-file-home');
  $('btn-import-home')?.addEventListener('click', () => importHome?.click());
  importHome?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) handleImport(e.target.files[0], e.target);
  });

  $('btn-back')?.addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });
  $('btn-next')?.addEventListener('click', () => {
    const errors = validateStep(currentStep);
    if (errors.length) { showErrors(errors); return; }
    $('error-summary').hidden = true;
    clearFieldErrors();
    if (currentStep < 6) goToStep(currentStep + 1);
    else {
      if (saveWithVersioning()) renderCard();
    }
  });

  $('btn-save')?.addEventListener('click', () => {
    if (saveWithVersioning()) {
      savedDraftState = JSON.parse(JSON.stringify(state));
      updateHomeDraftUI();
    }
  });

  IMPACT_IDS.forEach((id) => {
    document.querySelectorAll(`input[name="impact-${id}"]`).forEach((input) => {
      input.addEventListener('change', renderTierResult);
    });
  });

  $('safeguards-fieldset')?.addEventListener('change', renderDecisionPreview);
  DATA_IDS.forEach((id) => {
    $(`data-${id}`)?.addEventListener('change', () => {
      if (currentStep === 4) renderDecisionPreview();
    });
  });

  $('f-next-review')?.addEventListener('input', () => {
    state.nextReviewDate = $('f-next-review').value;
    if (currentStep === 6) renderCard();
  });
  $('f-next-review')?.addEventListener('change', () => {
    state.nextReviewDate = $('f-next-review').value;
    if (currentStep === 6) renderCard();
  });

  $('btn-export-md')?.addEventListener('click', () => {
    finalizeForExport();
    const labels = getLabels();
    const lang = getLang();
    const reasonFn = (id) => getStrings(lang)[ruleReasonKey(id)] || id;
    downloadBlob(
      exportMarkdown(buildCard(state), labels, lang, reasonFn),
      `transparency-card-${state.cardVersion}.md`,
      'text/markdown'
    );
  });
  $('btn-export-json')?.addEventListener('click', () => {
    finalizeForExport();
    downloadBlob(exportJson(state), `transparency-card-${state.cardVersion}.json`, 'application/json');
  });
  $('btn-print-letter')?.addEventListener('click', () => {
    finalizeForExport();
    renderCard();
    document.body.classList.remove('print-a4');
    window.print();
  });
  $('btn-print-a4')?.addEventListener('click', () => {
    finalizeForExport();
    renderCard();
    document.body.classList.add('print-a4');
    window.print();
  });
  $('btn-import')?.addEventListener('click', () => $('import-file')?.click());
  $('import-file')?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) handleImport(e.target.files[0], e.target);
  });

  $('lang-switch')?.addEventListener('click', () => {
    const next = getLang() === 'en' ? 'fr' : 'en';
    setLang(next);
    saveLanguage(next);
    $('lang-switch').textContent = t('lang.switch');
    refreshLanguageDependent();
  });

  updateHomeDraftUI();
}

export {
  captureFormSnapshot,
  restoreFormSnapshot,
  handleImport,
  __testSetWizardState,
  __testFinalizeForExport,
  __testExportJson
};

function __testFinalizeForExport() {
  return finalizeForExport();
}

function __testExportJson() {
  return exportJson(state);
}

function __testSetWizardState(nextState, nextPreviousState, step) {
  state = nextState;
  previousState = nextPreviousState;
  currentStep = step ?? currentStep;
}

if (!globalThis.__ATC_SKIP_INIT__) {
  init();
}
