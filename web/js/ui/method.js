import { RULES, ruleReasonKey, SOURCE_KEYS } from '../core/rules.js';
import { REFERENCES } from '../core/references.js';
import { loadI18n, setLang, getLang, applyI18n, t } from './i18n.js';
import { saveLanguage, loadLanguage } from '../core/storage.js';

function tierApplicability(rule) {
  if (rule.type === 'impact') return String(rule.tier);
  if (rule.type === 'data') return t('method.tierAll');
  if (rule.type === 'red-flag') return t('placeholder.notProvided');
  if (rule.conditional === 'impactI2') return t('method.tierConditional');
  if (rule.conditional === 'dataAny') return t('method.tierDataConditional');
  if (rule.tiers) return rule.tiers.join(', ');
  return t('placeholder.notProvided');
}

function renderRules() {
  const container = document.getElementById('method-rules');
  if (!container) return;
  const lang = getLang();
  const groups = [
    { titleKey: 'method.impactTitle', filter: (r) => r.type === 'impact' },
    { titleKey: 'method.dataTitle', filter: (r) => r.type === 'data' },
    { titleKey: 'method.safeguardsTitle', filter: (r) => r.type === 'safeguard' },
    { titleKey: 'method.redFlagsTitle', filter: (r) => r.type === 'red-flag' }
  ];
  container.replaceChildren();
  for (const g of groups) {
    const h2 = document.createElement('h2');
    h2.textContent = t(g.titleKey);
    container.appendChild(h2);

    const table = document.createElement('table');
    table.className = 'method-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const col of ['method.table.id', 'method.table.reason', 'method.table.tier', 'method.table.applicability', 'method.table.source']) {
      const th = document.createElement('th');
      th.textContent = t(col);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const r of Object.values(RULES).filter(g.filter)) {
      const tr = document.createElement('tr');
      const idTd = document.createElement('td');
      const code = document.createElement('code');
      code.textContent = r.id;
      idTd.appendChild(code);
      tr.appendChild(idTd);

      const reasonTd = document.createElement('td');
      reasonTd.textContent = t(ruleReasonKey(r.id));
      tr.appendChild(reasonTd);

      const tierTd = document.createElement('td');
      tierTd.textContent = r.tier ? String(r.tier) : (r.tiers ? r.tiers.join(', ') : t('placeholder.notProvided'));
      tr.appendChild(tierTd);

      const appTd = document.createElement('td');
      appTd.textContent = tierApplicability(r);
      tr.appendChild(appTd);

      const srcTd = document.createElement('td');
      srcTd.textContent = SOURCE_KEYS[r.sourceKey] || r.sourceKey;
      if (lang === 'fr') srcTd.setAttribute('lang', 'en');
      tr.appendChild(srcTd);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  }

  const decisionH = document.createElement('h2');
  decisionH.textContent = t('method.decisionTitle');
  container.appendChild(decisionH);
  const decisionP = document.createElement('p');
  decisionP.textContent = t('method.decisionText');
  container.appendChild(decisionP);
}

function renderReferences() {
  const container = document.getElementById('method-references');
  if (!container) return;
  const lang = getLang();
  const ol = document.createElement('ol');
  ol.className = 'references-list';
  for (const ref of REFERENCES) {
    const li = document.createElement('li');
    const titleP = document.createElement('p');
    titleP.textContent = `${lang === 'fr' ? ref.titleFr : ref.titleEn} `;
    const a = document.createElement('a');
    a.href = ref.url;
    a.textContent = ref.url;
    titleP.appendChild(a);
    li.appendChild(titleP);
    const licence = lang === 'fr' ? ref.licenceFr : ref.licenceEn;
    if (licence) {
      const licP = document.createElement('p');
      const licMatch = licence.match(/(https?:\/\/[^\s]+)/);
      if (licMatch) {
        const before = licence.slice(0, licence.indexOf(licMatch[0]));
        const after = licence.slice(licence.indexOf(licMatch[0]) + licMatch[0].length);
        licP.appendChild(document.createTextNode(before));
        const licA = document.createElement('a');
        licA.href = licMatch[0];
        licA.textContent = licMatch[0];
        licP.appendChild(licA);
        licP.appendChild(document.createTextNode(after));
      } else {
        licP.textContent = licence;
      }
      li.appendChild(licP);
    }
    const note = lang === 'fr' ? ref.noteFr : ref.noteEn;
    if (note) {
      const noteP = document.createElement('p');
      noteP.textContent = note;
      li.appendChild(noteP);
    }
    ol.appendChild(li);
  }
  container.replaceChildren(ol);
}

async function init() {
  await loadI18n();
  const langResult = loadLanguage();
  if (langResult.ok && (langResult.lang === 'fr' || langResult.lang === 'en')) setLang(langResult.lang);
  applyI18n();
  renderRules();
  renderReferences();
  document.getElementById('lang-switch')?.addEventListener('click', () => {
    const next = getLang() === 'en' ? 'fr' : 'en';
    setLang(next);
    saveLanguage(next);
    document.getElementById('lang-switch').textContent = t('lang.switch');
    document.title = t('meta.methodTitle');
    renderRules();
    renderReferences();
  });
}

init();
