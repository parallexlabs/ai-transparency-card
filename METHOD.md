# Method

This document lists every rule in the AI Transparency Card builder with its ID, plain-language reason and source.

Tier names and definitions are quoted from SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0. This tool is independent and is not affiliated with or endorsed by those organisations. The screening questions, data rules, safeguard lists, decision logic and card format are ParalleX's own and are not SAFE AI's assessment method.

Les noms et définitions des paliers sont reproduits à partir de SAFE AI v1.2 (CDAC Network, The Alan Turing Institute et Humanitarian AI Advisory, août 2026), licence CC BY 4.0. Cet outil est indépendant. Il n'est affilié à aucune de ces organisations et aucune d'entre elles ne l'a approuvé. Les questions d'évaluation préliminaire, les règles sur les données, les listes de mesures de protection, la logique décisionnelle et le format de la fiche sont propres à ParalleX et ne constituent pas la méthode d'évaluation de SAFE AI.

## Impact screening

Required tier = the highest that applies. Answer yes or no to every question (I1–I4). If you answer no to all four, no tier applies; see the tool for guidance.

| ID | Reason | Source |
|----|--------|--------|
| I1 | Outputs reach affected people directly (messages, answers or translations they read or hear). | ParalleX Labs, based on the SAFE AI v1.2 tier definitions |
| I2 | Outputs influence who receives assistance, services or protection, or in what priority (eligibility, targeting, case triage, referrals). | ParalleX Labs, based on the SAFE AI v1.2 tier definitions |
| I3 | Outputs shape operational decisions (planning, allocation, programme design, reports that shape funding) while a person decides. | ParalleX Labs, based on the SAFE AI v1.2 tier definitions |
| I4 | Internal and advisory only (drafting, summarising public or non-sensitive material, brainstorming); a person reviews every output before use. | ParalleX Labs, based on the SAFE AI v1.2 tier definitions |

## Data screening

| ID | Reason | Source |
|----|--------|--------|
| D1 | Personal data of affected people is processed. | Informed by the IASC Operational Guidance on Data Responsibility in Humanitarian Action (2023) |
| D2 | Sensitive categories are processed (health, protection incidents, gender-based violence, legal status, ethnicity, religion, biometrics, precise location of people at risk). | Informed by the ICRC Handbook on Data Protection in Humanitarian Action, 3rd edition (2024) |
| D3 | Data about children is processed. | Informed by the ICRC Handbook on Data Protection in Humanitarian Action, 3rd edition (2024) |
| D4 | Staff personal data is processed. | Informed by the OCHA Data Responsibility Guidelines (2025) |

## Safeguards

| ID | Tiers | Reason | Source |
|----|-------|--------|--------|
| S_ACCOUNTABLE_ROLE | 1, 2, 3 | An accountable role is assigned (a role, never a person's name). | Informed by the Principles for the Ethical Use of Artificial Intelligence in the United Nations System (2022) |
| S_OUTPUT_REVIEW | 1, 2, 3 | A person reviews outputs before use. | Informed by the Principles for the Ethical Use of Artificial Intelligence in the United Nations System (2022) |
| S_USER_TRAINING | 1, 2, 3 | Users are trained on the tool and its limits. | ParalleX Labs (own rule) |
| S_DATA_MINIMISATION | 1, 2, 3 | Data minimisation is applied. | Informed by the IASC Operational Guidance on Data Responsibility in Humanitarian Action (2023) |
| S_RECORD_OF_USE | 1, 2, 3 | A record of use is kept. | ParalleX Labs (own rule) |
| S_RISK_ASSESSMENT | 2, 3 | A documented risk and impact assessment exists. | Based on the SAFE AI v1.2 Tier 2 definition |
| S_DPIA | 2, 3 (when D1–D4) | A data protection impact assessment exists when personal or sensitive data applies. | Informed by the ICRC Handbook on Data Protection in Humanitarian Action, 3rd edition (2024) |
| S_LANGUAGE_TESTING | 2, 3 | Testing on representative examples in every language used. | ParalleX Labs (own rule) |
| S_MONITORING_PLAN | 2, 3 | A monitoring plan with a review date is in place. | Informed by the Core Humanitarian Standard on Quality and Accountability (2024) |
| S_MANUAL_FALLBACK | 2, 3 | A manual fallback is available. | ParalleX Labs (own rule) |
| S_COMMUNITY_CODESIGN | 3 | Evidence of community co-design (who was consulted and what changed as a result). | Based on the SAFE AI v1.2 Tier 3 definition |
| S_INFO_AFFECTED | 3 | Information for affected people in their languages and accessible formats. | Informed by the Core Humanitarian Standard on Quality and Accountability (2024) |
| S_COMPLAINTS_CHANNEL | 3 | A feedback and complaints channel with a human response. | Informed by the Core Humanitarian Standard on Quality and Accountability (2024) |
| S_ERROR_MONITORING | 3 | Ongoing monitoring of errors and harms. | Based on the SAFE AI v1.2 Tier 3 definition |
| S_HUMAN_ALTERNATIVE | 3 | A way to get a human alternative. | Informed by the Core Humanitarian Standard on Quality and Accountability (2024) |
| S_STOP_CRITERIA | 3 | Stop criteria are defined. | ParalleX Labs (own rule) |
| S_HUMAN_REVIEW_EACH_CASE | when I2 | A person reviews each case when outputs influence eligibility, targeting, triage or referrals. | ParalleX Labs (own rule) |

## Red flags

| ID | Reason | Source |
|----|--------|--------|
| R1 | Sensitive categories (D2) in a public consumer tool. | ParalleX Labs (own rule) |
| R2 | Outputs influence assistance or protection (I2) with no human review of each case. | ParalleX Labs (own rule) |
| R3 | Tier 3 use with no information for affected people and no complaints channel. | ParalleX Labs (own rule) |
| R4 | Data about children (D3) in a public consumer tool. | ParalleX Labs (own rule) |

## Decision logic

- **Red (stop):** any red-flag rule fires.
- **Amber (pause for review):** no red flag, but at least one required safeguard is missing.
- **Green (proceed with checks):** no red flag and every required safeguard is in place.

## Incomplete red (stop) records

A Tier 3 card may legitimately reach a **red** decision when required safeguards or community evidence are missing (for example, R3 when neither information for affected people nor a complaints channel is in place). The builder allows saving and exporting such records with incomplete community fields when the evaluated decision is already red, and shows missing community answers on the card with a translated "Not provided" label. This matches the red synthetic sample, which can be reproduced through the ordinary workflow.

## References

1. SAFE AI: Standards and Assurance for Ethical AI, Version 1.2 (August 2026). CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory; stewarded by CDAC Network. https://www.cdacnetwork.org/safe-ai . Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . The English tier definitions are quoted without changes. The French renderings are unofficial translations by ParalleX Labs.

2. Principles for the Ethical Use of Artificial Intelligence in the United Nations System, UN System Chief Executives Board for Coordination (September 2022). https://unsceb.org/principles-ethical-use-artificial-intelligence-united-nations-system

3. IASC Operational Guidance on Data Responsibility in Humanitarian Action. Inter-Agency Standing Committee (IASC). Revised edition endorsed April 2023. https://centre.humdata.org/revised-iasc-operational-guidance-on-data-responsibility-in-humanitarian-action/

4. OCHA Data Responsibility Guidelines. United Nations Office for the Coordination of Humanitarian Affairs (OCHA). Guidelines dated January 2025. https://centre.humdata.org/data-responsibility-guidelines-2025/

5. ICRC Handbook on Data Protection in Humanitarian Action. International Committee of the Red Cross (ICRC). Third edition (2024). https://www.icrc.org/en/data-protection-humanitarian-action-handbook

6. Core Humanitarian Standard on Quality and Accountability. CHS Alliance, Groupe URD, Sphere. Edition 2024. https://www.corehumanitarianstandard.org/the-standard

## Références

1. SAFE AI : Standards and Assurance for Ethical AI, version 1.2 (août 2026). CDAC Network, The Alan Turing Institute et Humanitarian AI Advisory; géré par CDAC Network. https://www.cdacnetwork.org/safe-ai . Licence CC BY 4.0 : https://creativecommons.org/licenses/by/4.0/ . Les définitions des paliers en anglais sont citées sans modification. Les versions françaises sont des traductions non officielles de ParalleX Labs.

2. Principles for the Ethical Use of Artificial Intelligence in the United Nations System, Conseil des chefs de secrétariat des organismes des Nations Unies pour la coordination (septembre 2022). https://unsceb.org/principles-ethical-use-artificial-intelligence-united-nations-system

3. Orientations opérationnelles du CPI sur la responsabilité des données dans l'action humanitaire. Comité permanent interorganisations (CPI). Édition révisée approuvée en avril 2023. https://centre.humdata.org/revised-iasc-operational-guidance-on-data-responsibility-in-humanitarian-action/

4. Lignes directrices de l'OCHA sur la responsabilité des données. Bureau de la coordination des affaires humanitaires des Nations Unies (OCHA). Lignes directrices datées de janvier 2025. https://centre.humdata.org/data-responsibility-guidelines-2025/

5. Manuel du CICR sur la protection des données dans l'action humanitaire. Comité international de la Croix-Rouge (CICR). Troisième édition (2024). https://www.icrc.org/en/data-protection-humanitarian-action-handbook

6. Norme humanitaire fondamentale de qualité et de redevabilité. CHS Alliance, Groupe URD, Sphere. Édition 2024. https://www.corehumanitarianstandard.org/the-standard
