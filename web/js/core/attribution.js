export const SAFE_AI_URL = 'https://www.cdacnetwork.org/safe-ai';
export const CC_BY_URL = 'https://creativecommons.org/licenses/by/4.0/';
export const SAFE_AI_CREATOR =
  'CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory';

export const SAFE_AI_ATTRIBUTION_EN =
  'SAFE AI v1.2 (CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, August 2026), licensed CC BY 4.0';

export const INDEPENDENCE_STATEMENT_EN =
  'This tool is independent and is not affiliated with or endorsed by SAFE AI or its stewards.';

export const ADAPTATION_NOTICE_EN =
  "Screening questions, data rules, safeguard lists, decision logic and card format are ParalleX's own and are not SAFE AI's assessment method.";

export function buildAttributionObject() {
  return {
    sourceUrl: SAFE_AI_URL,
    licenceUrl: CC_BY_URL,
    creator: SAFE_AI_CREATOR,
    independenceStatement: INDEPENDENCE_STATEMENT_EN,
    adaptationNotice: ADAPTATION_NOTICE_EN
  };
}
