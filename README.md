# AI Transparency Card

<picture>
  <source srcset="web/assets/brand/parallex-mark-dark.png" media="(prefers-color-scheme: dark)">
  <img src="web/assets/brand/parallex-mark.png" alt="ParalleX Labs" width="160">
</picture>

Bilingual, client-side tool to build a one-page AI transparency card for humanitarian governance.

**Try it:** [https://parallexlabs.github.io/ai-transparency-card/](https://parallexlabs.github.io/ai-transparency-card/)

## How it works

Six steps in the browser:

1. **Describe the use:** name, purpose, tool type, deployment, languages.
2. **Impact screening:** I1–I4; required tier is the highest that applies (SAFE AI tier definitions quoted verbatim).
3. **Data screening:** D1–D4 against humanitarian data responsibility references.
4. **Safeguards:** checklist grows with tier; decision colour (red / amber / green).
5. **Community in the Loop:** how affected people are informed, consulted and heard.
6. **Transparency card:** printable record with change log; export Markdown or JSON. Layout aims for one page, but long field values or a large change log may span additional pages.

| Type | IDs | Outcome |
|------|-----|---------|
| Impact | I1–I4 | Tier 1, 2 or 3 |
| Data | D1–D4 | Informs DPIA requirement |
| Safeguards | S_* | Required by tier |
| Red flags | R1–R4 | Stop (red) |

See [METHOD.md](METHOD.md) for every rule with reason and source.

Tier names and definitions are quoted from SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0. This tool is independent and is not affiliated with or endorsed by those organisations. The screening questions, data rules, safeguard lists, decision logic and card format are ParalleX's own and are not SAFE AI's assessment method.

Les noms et définitions des paliers sont reproduits à partir de SAFE AI v1.2 (CDAC Network, The Alan Turing Institute et Humanitarian AI Advisory, août 2026), licence CC BY 4.0. Cet outil est indépendant. Il n'est affilié à aucune de ces organisations et aucune d'entre elles ne l'a approuvé. Les questions d'évaluation préliminaire, les règles sur les données, les listes de mesures de protection, la logique décisionnelle et le format de la fiche sont propres à ParalleX et ne constituent pas la méthode d'évaluation de SAFE AI.

## Privacy

Nothing you enter is sent to a server. Drafts may be stored in your browser's localStorage only on this device.

## Hosting and framing protection

GitHub Pages cannot send custom HTTP response headers. The public demo therefore loads a small frame guard script that hides the page when embedded in another site. Self-hosted copies should send `Content-Security-Policy: frame-ancestors 'none'` (the `web/_headers` file covers hosts that read it; the local development server sends this header and CI verifies it).

## Limitations

This is a planning aid, not legal or ethics approval. Organisational policy and law prevail. The tier screen is a simplification of SAFE AI. The tool has not been validated with affected communities; no consultation took place in building it.

## Using it in training

Session 3 exercise in the [ParalleX Humanitarian AI Training Kit](https://github.com/parallexlabs/humanitarian-ai-training-kit).

## Languages

English and Canadian French (`fr`). Switch at any time in the header.

## Related ParalleX work

- [Humanitarian AI Training Kit](https://github.com/parallexlabs/humanitarian-ai-training-kit)
- [humanitarian-ai-risk-screen](https://github.com/parallexlabs/humanitarian-ai-risk-screen)
- [before-you-paste](https://github.com/parallexlabs/before-you-paste)
- [source-check-lab](https://github.com/parallexlabs/source-check-lab)
- [translation-check-lab](https://github.com/parallexlabs/translation-check-lab)

## Open by design

ParalleX publishes its methods and tools openly so organisations can inspect, adapt and reuse them. This repository contains no client data.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

- Code: [Apache-2.0](LICENSE), except these MIT-licensed files (ajv-formats 3.0.1 and [Ajv](https://github.com/ajv-validator/ajv) 8.x; see inline notices in each file):
  - `web/js/core/card-validator.js` (generated; inlines vendored validator code)
  - `web/js/core/ajv-formats-date.js`
  - `web/js/core/ajv-formats-uri.js`
- Content, samples and schema documentation: [CC BY 4.0](LICENSE-CONTENT)
- SAFE AI quotations: CC BY 4.0 with attribution to CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory

## Citation

```bibtex
@software{daneshpajouh2026transparencycard,
  author = {Daneshpajouh, Amirhossein},
  title = {AI Transparency Card},
  year = {2026},
  version = {1.0.0},
  publisher = {ParalleX Labs},
  url = {https://github.com/parallexlabs/ai-transparency-card}
}
```

Or use [CITATION.cff](CITATION.cff).

## References

1. SAFE AI: Standards and Assurance for Ethical AI, Version 1.2 (August 2026). CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory; stewarded by CDAC Network. https://www.cdacnetwork.org/safe-ai . Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . The English tier definitions are quoted without changes. The French renderings are unofficial translations by ParalleX Labs.

2. Principles for the Ethical Use of Artificial Intelligence in the United Nations System, UN System Chief Executives Board for Coordination (September 2022). https://unsceb.org/principles-ethical-use-artificial-intelligence-united-nations-system

3. IASC Operational Guidance on Data Responsibility in Humanitarian Action. Inter-Agency Standing Committee (IASC). Revised edition endorsed April 2023. https://centre.humdata.org/revised-iasc-operational-guidance-on-data-responsibility-in-humanitarian-action/

4. OCHA Data Responsibility Guidelines. United Nations Office for the Coordination of Humanitarian Affairs (OCHA). Guidelines dated January 2025. https://centre.humdata.org/data-responsibility-guidelines-2025/

5. ICRC Handbook on Data Protection in Humanitarian Action. International Committee of the Red Cross (ICRC). Third edition (2024). https://www.icrc.org/en/data-protection-humanitarian-action-handbook

6. Core Humanitarian Standard on Quality and Accountability. CHS Alliance, Groupe URD, Sphere. Edition 2024. https://www.corehumanitarianstandard.org/the-standard

See also [METHOD.md](METHOD.md) for rule-level sources and the [method page](web/method.html#references) (English and French).
