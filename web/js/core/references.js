/**
 * Public references cited by this tool. Single source for docs, method page and tests.
 */

export const REFERENCES = [
  {
    id: 'safe-ai',
    titleEn:
      'SAFE AI: Standards and Assurance for Ethical AI, Version 1.2 (August 2026). CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory; stewarded by CDAC Network.',
    titleFr:
      'SAFE AI : Standards and Assurance for Ethical AI, version 1.2 (août 2026). CDAC Network, The Alan Turing Institute et Humanitarian AI Advisory; géré par CDAC Network.',
    url: 'https://www.cdacnetwork.org/safe-ai',
    licenceEn: 'Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ .',
    licenceFr: 'Licence CC BY 4.0 : https://creativecommons.org/licenses/by/4.0/ .',
    noteEn:
      'The English tier definitions are quoted without changes. The French renderings are unofficial translations by ParalleX Labs.',
    noteFr:
      'Les définitions des paliers en anglais sont citées sans modification. Les versions françaises sont des traductions non officielles de ParalleX Labs.'
  },
  {
    id: 'un-ceb-2022',
    titleEn:
      'Principles for the Ethical Use of Artificial Intelligence in the United Nations System, UN System Chief Executives Board for Coordination (September 2022).',
    titleFr:
      'Principles for the Ethical Use of Artificial Intelligence in the United Nations System, Conseil des chefs de secrétariat des organismes des Nations Unies pour la coordination (septembre 2022).',
    url: 'https://unsceb.org/principles-ethical-use-artificial-intelligence-united-nations-system'
  },
  {
    id: 'iasc-2023',
    titleEn:
      'IASC Operational Guidance on Data Responsibility in Humanitarian Action. Inter-Agency Standing Committee (IASC). Revised edition endorsed April 2023.',
    titleFr:
      'Orientations opérationnelles du CPI sur la responsabilité des données dans l\'action humanitaire. Comité permanent interorganisations (CPI). Édition révisée approuvée en avril 2023.',
    url: 'https://centre.humdata.org/revised-iasc-operational-guidance-on-data-responsibility-in-humanitarian-action/'
  },
  {
    id: 'ocha-2025',
    titleEn:
      'OCHA Data Responsibility Guidelines. United Nations Office for the Coordination of Humanitarian Affairs (OCHA). Guidelines dated January 2025.',
    titleFr:
      'Lignes directrices de l\'OCHA sur la responsabilité des données. Bureau de la coordination des affaires humanitaires des Nations Unies (OCHA). Lignes directrices datées de janvier 2025.',
    url: 'https://centre.humdata.org/data-responsibility-guidelines-2025/'
  },
  {
    id: 'icrc-handbook-2024',
    titleEn:
      'ICRC Handbook on Data Protection in Humanitarian Action. International Committee of the Red Cross (ICRC). Third edition (2024).',
    titleFr:
      'Manuel du CICR sur la protection des données dans l\'action humanitaire. Comité international de la Croix-Rouge (CICR). Troisième édition (2024).',
    url: 'https://www.icrc.org/en/data-protection-humanitarian-action-handbook'
  },
  {
    id: 'chs-2024',
    titleEn:
      'Core Humanitarian Standard on Quality and Accountability. CHS Alliance, Groupe URD, Sphere. Edition 2024.',
    titleFr:
      'Norme humanitaire fondamentale de qualité et de redevabilité. CHS Alliance, Groupe URD, Sphere. Édition 2024.',
    url: 'https://www.corehumanitarianstandard.org/the-standard'
  }
];

/** Maps each rules.js sourceKey to a REFERENCES id, or null for ParalleX own rules. */
export const SOURCE_KEY_REFERENCE = {
  'parallex-impact': 'safe-ai',
  'safe-ai-tier2': 'safe-ai',
  'safe-ai-tier3': 'safe-ai',
  'iasc-2023': 'iasc-2023',
  'ocha-2025': 'ocha-2025',
  'icrc-handbook-2024': 'icrc-handbook-2024',
  'chs-2024': 'chs-2024',
  'un-ceb-2022': 'un-ceb-2022',
  parallex: null
};

export function getReferenceById(id) {
  return REFERENCES.find((r) => r.id === id);
}

export function resolveSourceKey(sourceKey) {
  if (sourceKey === 'parallex') return 'ParalleX Labs (own rule)';
  return SOURCE_KEY_REFERENCE[sourceKey] ?? null;
}
