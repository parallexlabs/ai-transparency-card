import { getNested } from '../core/i18n-core.js';

let currentLang = 'en';
let strings = { en: {}, fr: {} };

export async function loadI18n() {
  const [en, fr] = await Promise.all([
    fetch('i18n/en.json').then((r) => r.json()),
    fetch('i18n/fr.json').then((r) => r.json())
  ]);
  strings.en = en;
  strings.fr = fr;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang === 'fr' ? 'fr' : 'en';
  document.documentElement.lang = currentLang;
  applyI18n();
}

export function t(key, vars) {
  const val = strings[currentLang][key] ?? strings.en[key] ?? getNested(strings[currentLang], key) ?? getNested(strings.en, key) ?? key;
  if (!vars) return val;
  return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export function getLabels() {
  return { ...strings.en, ...strings[currentLang] };
}

export function getStrings(lang) {
  return strings[lang === 'fr' ? 'fr' : 'en'] || strings.en;
}

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'TITLE') document.title = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  const titleKey = document.querySelector('meta[name="i18n-title"]');
  if (titleKey) document.title = t(titleKey.getAttribute('content'));
}
