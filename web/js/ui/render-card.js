import {
  evaluate,
  isImpactAllNo,
  DATA_IDS,
  ruleReasonKey
} from '../core/rules.js';
import { SAFE_AI_URL, CC_BY_URL, SAFE_AI_CREATOR } from '../core/attribution.js';
import { formatChangeLogEntry } from '../core/card.js';

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function textLine(strongKey, value, t) {
  const p = el('p');
  const strong = el('strong');
  strong.textContent = `${t(strongKey)}: `;
  p.appendChild(strong);
  p.appendChild(document.createTextNode(value || t('placeholder.notProvided')));
  return p;
}

function appendList(parent, items) {
  if (!items.length) return;
  const ul = el('ul');
  for (const text of items) {
    const li = el('li');
    li.textContent = text;
    ul.appendChild(li);
  }
  parent.appendChild(ul);
}

function renderDecisionBox(ev, t, ruleText) {
  if (!ev.decision) return null;
  const box = el('div', `decision-box ${ev.decision}`);
  box.setAttribute('role', 'status');

  const p = el('p');
  const icon = el('span', 'decision-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = { red: '⛔', amber: '⚠', green: '✓' }[ev.decision];
  p.appendChild(icon);
  p.appendChild(document.createTextNode(' '));
  const strong = el('strong');
  strong.textContent = t(`decision.${ev.decision}`);
  p.appendChild(strong);
  box.appendChild(p);

  const fired = ev.firedRules.filter((id) => id.startsWith('R'));
  if (fired.length) {
    const h = el('h3');
    h.textContent = t('decision.firedRules');
    box.appendChild(h);
    appendList(box, fired.map((id) => `${id}: ${ruleText(id)}`));
  }

  if (ev.missingSafeguards.length) {
    const h = el('h3');
    h.textContent = t('decision.pathToGreen');
    box.appendChild(h);
    const miss = el('p');
    miss.textContent = t('decision.missing');
    box.appendChild(miss);
    appendList(box, ev.missingSafeguards.map((id) => ruleText(id)));
  }

  return box;
}

function renderAttribution(t, lang) {
  const block = el('div', 'attribution-block');
  const h = el('h3');
  h.textContent = t('card.attribution');
  block.appendChild(h);

  const p1 = el('p');
  p1.appendChild(document.createTextNode(`${t('card.attributionSafeAi')} `));
  const safeLink = el('a');
  safeLink.href = SAFE_AI_URL;
  safeLink.textContent = 'SAFE AI v1.2';
  p1.appendChild(safeLink);
  p1.appendChild(document.createTextNode(`, ${t('card.attributionLicence')} `));
  const licLink = el('a');
  licLink.href = CC_BY_URL;
  licLink.textContent = 'CC BY 4.0';
  p1.appendChild(licLink);
  p1.appendChild(document.createTextNode(`. ${t('card.attributionQuoteNote')}`));
  block.appendChild(p1);

  const p2 = el('p');
  p2.textContent = `${t('card.attributionCreator')}: ${SAFE_AI_CREATOR}.`;
  block.appendChild(p2);

  const p3 = el('p');
  p3.textContent = t('card.independenceShort');
  block.appendChild(p3);

  if (lang === 'fr') {
    const frQuote = el('p');
    frQuote.setAttribute('lang', 'fr');
    frQuote.className = 'note';
    frQuote.textContent = t('tier.attribution');
    block.appendChild(frQuote);
  }

  return block;
}

export function renderCardDom(container, state, t, ruleText) {
  container.replaceChildren();
  const ev = state.evaluation || evaluate(state);
  const tier = ev.tier;
  const lang = state.language || 'en';

  if (state.syntheticLabel) {
    const synthetic = el('p', 'card-synthetic-notice');
    const strong = el('strong');
    strong.textContent = `${t('card.synthetic')}: `;
    synthetic.appendChild(strong);
    synthetic.appendChild(document.createTextNode(state.syntheticLabel));
    container.appendChild(synthetic);
    if (state.provenance?.creator) {
      const prov = el('p', 'card-provenance-note');
      prov.textContent = `${t('card.provenanceCreator')}: ${state.provenance.creator}`;
      container.appendChild(prov);
    }
  }

  const badge = el('div', `tier-badge tier-badge-${tier || 'none'}`);
  badge.textContent = tier ? t(`tier.${tier}.name`) : t('card.tierIncomplete');
  container.appendChild(badge);

  const decisionEl = renderDecisionBox(ev, t, ruleText);
  if (decisionEl) container.appendChild(decisionEl);

  const meta = el('div', 'meta-block');
  meta.appendChild(textLine('card.name', state.step1.name, t));
  const versionLine = el('p');
  versionLine.appendChild(document.createTextNode(
    `${t('card.version')}: ${state.cardVersion} · ${t('card.date')}: ${state.date}`
  ));
  meta.appendChild(versionLine);
  meta.appendChild(textLine('card.accountable', state.step1.accountableRole, t));
  container.appendChild(meta);

  const purposeH = el('h3');
  purposeH.textContent = t('card.purpose');
  container.appendChild(purposeH);
  const purposeP = el('p');
  purposeP.textContent = state.step1.purpose;
  container.appendChild(purposeP);

  const toolH = el('h3');
  toolH.textContent = t('card.tool');
  container.appendChild(toolH);
  const toolUl = el('ul');
  for (const [key, val] of [
    ['card.toolType', t(`tool.${state.step1.toolType}`)],
    ['card.deployment', t(`deploy.${state.step1.deployment}`)],
    ['card.inputLang', state.step1.inputLanguages],
    ['card.outputLang', state.step1.outputLanguages]
  ]) {
    const li = el('li');
    li.textContent = `${t(key)}: ${val}`;
    toolUl.appendChild(li);
  }
  container.appendChild(toolUl);

  const tierH = el('h3');
  tierH.textContent = t('card.tier');
  container.appendChild(tierH);

  if (isImpactAllNo(state.impact)) {
    const note = el('p', 'note');
    note.textContent = t('impact.allNo');
    container.appendChild(note);
  } else if (tier) {
    const tierP = el('p');
    const strong = el('strong');
    strong.textContent = t(`tier.${tier}.name`);
    tierP.appendChild(strong);
    container.appendChild(tierP);
    const quote = el('p', 'tier-quote');
    if (lang === 'fr') {
      quote.setAttribute('lang', 'fr');
      quote.textContent = `"${t(`tier.${tier}.quote`)}" ${t('tier.unofficialFr')}`;
    } else {
      quote.setAttribute('lang', 'en');
      quote.textContent = `"${t(`tier.${tier}.quote`)}"`;
    }
    container.appendChild(quote);
    const attr = el('p', 'note');
    attr.setAttribute('lang', lang);
    attr.textContent = t('tier.attribution');
    container.appendChild(attr);
  } else {
    const inc = el('p');
    inc.textContent = t('card.tierIncomplete');
    container.appendChild(inc);
  }

  const dataH = el('h3');
  dataH.textContent = t('card.dataSummary');
  container.appendChild(dataH);
  appendList(container, DATA_IDS.map((id) =>
    `${t(`data.${id}`)}: ${state.data[id] ? t('card.yes') : t('card.no')}`
  ));

  const sgH = el('h3');
  sgH.textContent = t('card.safeguardsSummary');
  container.appendChild(sgH);
  if (ev.missingSafeguards.length) {
    const missStrong = el('p');
    const s = el('strong');
    s.textContent = t('card.missing');
    missStrong.appendChild(s);
    container.appendChild(missStrong);
    appendList(container, ev.missingSafeguards.map((id) => ruleText(id)));
  }
  const inPlaceStrong = el('p');
  const ip = el('strong');
  ip.textContent = t('card.inPlace');
  inPlaceStrong.appendChild(ip);
  container.appendChild(inPlaceStrong);
  const inPlace = Object.entries(state.safeguards).filter(([, v]) => v).map(([id]) => ruleText(id));
  appendList(container, inPlace.length ? inPlace : [t('card.none')]);

  const commH = el('h3');
  commH.textContent = t('card.communitySummary');
  container.appendChild(commH);
  const commKeys = [
    'informWhat', 'informChannels', 'informLanguages', 'informFormats', 'informWhen',
    'complainChannel', 'complainResponseTime', 'complainHandover',
    'consultWho', 'consultWhen', 'consultMethod', 'consultInfluence',
    'feedbackHow', 'inclusion'
  ];
  const commLabels = {
    informWhat: 'community.informWhat',
    informChannels: 'community.informChannels',
    informLanguages: 'community.informLanguages',
    informFormats: 'community.informFormats',
    informWhen: 'community.informWhen',
    complainChannel: 'community.complainChannel',
    complainResponseTime: 'community.complainResponseTime',
    complainHandover: 'community.complainHandover',
    consultWho: 'community.consultWho',
    consultWhen: 'community.consultWhen',
    consultMethod: 'community.consultMethod',
    consultInfluence: 'community.consultInfluence',
    feedbackHow: 'community.feedbackHow',
    inclusion: 'community.inclusion'
  };
  appendList(container, commKeys.map((k) =>
    `${t(commLabels[k])}: ${state.community[k] || t('placeholder.notProvided')}`
  ));

  const reviewP = el('p', 'print-review-date');
  const reviewStrong = el('strong');
  reviewStrong.textContent = `${t('card.nextReview')}: `;
  reviewP.appendChild(reviewStrong);
  reviewP.appendChild(document.createTextNode(state.nextReviewDate || t('placeholder.notProvided')));
  container.appendChild(reviewP);

  const logH = el('h3');
  logH.textContent = t('card.changeLog');
  container.appendChild(logH);
  const logEntries = (state.changeLog || []).map((e) => formatChangeLogEntry(e, t));
  appendList(container, logEntries.length ? logEntries : [t('card.none')]);

  container.appendChild(renderAttribution(t, lang));
}

export function renderDecisionPreviewDom(container, state, t, ruleText) {
  container.replaceChildren();
  const ev = evaluate(state);
  const box = renderDecisionBox(ev, t, ruleText);
  if (box) container.appendChild(box);
}

export function ruleTextFromT(t) {
  return (id) => t(ruleReasonKey(id));
}
