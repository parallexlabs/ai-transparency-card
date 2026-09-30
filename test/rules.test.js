import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluate,
  computeTier,
  getRequiredSafeguards,
  isImpactComplete,
  isImpactAllNo,
  hasAnyData,
  RULES,
  IMPACT_IDS,
  RED_FLAG_IDS
} from '../web/js/core/rules.js';

function base(overrides = {}) {
  return {
    step1: {
      deployment: 'org-approved',
      ...overrides.step1
    },
    impact: { I1: false, I2: false, I3: false, I4: false, ...overrides.impact },
    data: { D1: false, D2: false, D3: false, D4: false, ...overrides.data },
    safeguards: { ...overrides.safeguards }
  };
}

function allBaseSafeguards() {
  return {
    S_ACCOUNTABLE_ROLE: true,
    S_OUTPUT_REVIEW: true,
    S_USER_TRAINING: true,
    S_DATA_MINIMISATION: true,
    S_RECORD_OF_USE: true
  };
}

function tier2Safeguards(extra = {}) {
  return {
    ...allBaseSafeguards(),
    S_RISK_ASSESSMENT: true,
    S_LANGUAGE_TESTING: true,
    S_MONITORING_PLAN: true,
    S_MANUAL_FALLBACK: true,
    ...extra
  };
}

function tier3Safeguards(extra = {}) {
  return {
    ...tier2Safeguards({ S_DPIA: true }),
    S_COMMUNITY_CODESIGN: true,
    S_INFO_AFFECTED: true,
    S_COMPLAINTS_CHANNEL: true,
    S_ERROR_MONITORING: true,
    S_HUMAN_ALTERNATIVE: true,
    S_STOP_CRITERIA: true,
    ...extra
  };
}

describe('rules engine', () => {
  const tierCases = [
    { impact: { I1: false, I2: false, I3: false, I4: true }, tier: 1 },
    { impact: { I1: false, I2: false, I3: true, I4: false }, tier: 2 },
    { impact: { I1: true, I2: false, I3: false, I4: false }, tier: 3 },
    { impact: { I1: false, I2: true, I3: false, I4: false }, tier: 3 },
    { impact: { I1: true, I2: false, I3: true, I4: false }, tier: 3 },
    { impact: { I1: false, I2: true, I3: false, I4: true }, tier: 3 },
    { impact: { I1: false, I2: false, I3: true, I4: true }, tier: 2 }
  ];

  for (const { impact, tier } of tierCases) {
    it(`computeTier ${JSON.stringify(impact)} => ${tier}`, () => {
      assert.equal(computeTier(impact), tier);
    });
  }

  it('incomplete impact returns null tier', () => {
    assert.equal(computeTier({ I1: null, I2: null, I3: null, I4: null }), null);
    assert.equal(isImpactComplete({ I1: null, I2: null, I3: null, I4: null }), false);
  });

  it('all impact answers no returns null tier', () => {
    const impact = { I1: false, I2: false, I3: false, I4: false };
    assert.equal(isImpactComplete(impact), true);
    assert.equal(isImpactAllNo(impact), true);
    assert.equal(computeTier(impact), null);
    const ev = evaluate(base({ impact }));
    assert.equal(ev.tier, null);
    assert.equal(ev.decision, null);
  });

  it('partial impact answers are incomplete', () => {
    assert.equal(isImpactComplete({ I4: true, I1: false, I2: false, I3: null }), false);
  });

  it('answered impact with one yes is complete', () => {
    assert.equal(isImpactComplete({ I4: true, I1: false, I2: false, I3: false }), true);
    assert.equal(isImpactAllNo({ I4: true, I1: false, I2: false, I3: false }), false);
  });

  it('hasAnyData detects data flags', () => {
    assert.equal(hasAnyData({ D1: true, D2: false, D3: false, D4: false }), true);
    assert.equal(hasAnyData({ D1: false, D2: false, D3: false, D4: false }), false);
  });

  it('tier 1 requires five base safeguards', () => {
    const req = getRequiredSafeguards(1, {}, { I4: true });
    assert.equal(req.length, 5);
  });

  it('tier 2 adds safeguards without DPIA when no data', () => {
    const req = getRequiredSafeguards(2, { D1: false, D2: false, D3: false, D4: false }, { I3: true });
    assert.ok(req.includes('S_RISK_ASSESSMENT'));
    assert.ok(!req.includes('S_DPIA'));
  });

  it('tier 2 requires DPIA when D1 applies', () => {
    const req = getRequiredSafeguards(2, { D1: true, D2: false, D3: false, D4: false }, { I3: true });
    assert.ok(req.includes('S_DPIA'));
  });

  it('tier 3 requires community safeguards', () => {
    const req = getRequiredSafeguards(3, {}, { I1: true });
    assert.ok(req.includes('S_COMMUNITY_CODESIGN'));
    assert.ok(req.includes('S_STOP_CRITERIA'));
  });

  it('I2 requires S_HUMAN_REVIEW_EACH_CASE', () => {
    const req = getRequiredSafeguards(2, {}, { I2: true, I3: true });
    assert.ok(req.includes('S_HUMAN_REVIEW_EACH_CASE'));
  });

  const redCases = [
    {
      name: 'R1 D2 public consumer',
      state: base({ data: { D2: true }, step1: { deployment: 'public-consumer' } }),
      flag: 'R1'
    },
    {
      name: 'R4 D3 public consumer',
      state: base({ data: { D3: true }, step1: { deployment: 'public-consumer' } }),
      flag: 'R4'
    },
    {
      name: 'R2 I2 no each-case review',
      state: base({
        impact: { I2: true },
        safeguards: { ...tier3Safeguards(), S_HUMAN_REVIEW_EACH_CASE: false }
      }),
      flag: 'R2'
    },
    {
      name: 'R3 tier3 no info and no complaints',
      state: base({
        impact: { I1: true },
        safeguards: tier3Safeguards({ S_INFO_AFFECTED: false, S_COMPLAINTS_CHANNEL: false })
      }),
      flag: 'R3'
    }
  ];

  for (const { name, state, flag } of redCases) {
    it(`red flag ${name}`, () => {
      const ev = evaluate(state);
      assert.equal(ev.decision, 'red');
      assert.ok(ev.redFlags.includes(flag));
    });
  }

  it('green tier 1 with all safeguards', () => {
    const ev = evaluate(base({ impact: { I4: true }, safeguards: allBaseSafeguards() }));
    assert.equal(ev.decision, 'green');
    assert.equal(ev.tier, 1);
  });

  it('amber tier 2 missing language testing', () => {
    const ev = evaluate(base({
      impact: { I3: true },
      data: { D1: true },
      safeguards: tier2Safeguards({ S_LANGUAGE_TESTING: false, S_DPIA: true })
    }));
    assert.equal(ev.decision, 'amber');
    assert.ok(ev.missingSafeguards.includes('S_LANGUAGE_TESTING'));
  });

  it('green tier 3 with full safeguards', () => {
    const ev = evaluate(base({
      impact: { I1: true },
      data: { D1: true },
      safeguards: tier3Safeguards()
    }));
    assert.equal(ev.decision, 'green');
  });

  it('R3 does not fire when info present', () => {
    const ev = evaluate(base({
      impact: { I1: true },
      safeguards: tier3Safeguards({ S_COMPLAINTS_CHANNEL: false })
    }));
    assert.ok(!ev.redFlags.includes('R3'));
  });

  it('R3 does not fire when complaints present', () => {
    const ev = evaluate(base({
      impact: { I1: true },
      safeguards: tier3Safeguards({ S_INFO_AFFECTED: false })
    }));
    assert.ok(!ev.redFlags.includes('R3'));
  });

  it('incomplete impact yields null decision', () => {
    const ev = evaluate(base());
    assert.equal(ev.decision, null);
    assert.equal(ev.tier, null);
  });

  it('every impact rule has tier', () => {
    for (const id of IMPACT_IDS) assert.ok(RULES[id].tier);
  });

  it('every red flag rule exists', () => {
    for (const id of RED_FLAG_IDS) assert.equal(RULES[id].type, 'red-flag');
  });

  it('D1-D4 are data rules', () => {
    for (const id of ['D1', 'D2', 'D3', 'D4']) assert.equal(RULES[id].type, 'data');
  });

  it('public consumer without sensitive data no R1', () => {
    const ev = evaluate(base({ step1: { deployment: 'public-consumer' } }));
    assert.ok(!ev.redFlags.includes('R1'));
  });

  it('local hosted D2 no R1', () => {
    const ev = evaluate(base({ data: { D2: true }, step1: { deployment: 'local-hosted' } }));
    assert.ok(!ev.redFlags.includes('R1'));
  });

  it('I2 with each-case review no R2', () => {
    const ev = evaluate(base({
      impact: { I2: true },
      safeguards: { ...tier3Safeguards(), S_HUMAN_REVIEW_EACH_CASE: true }
    }));
    assert.ok(!ev.redFlags.includes('R2'));
  });

  it('tier 1 missing output review is amber', () => {
    const ev = evaluate(base({
      impact: { I4: true },
      safeguards: { ...allBaseSafeguards(), S_OUTPUT_REVIEW: false }
    }));
    assert.equal(ev.decision, 'amber');
  });

  it('fired rules include missing safeguards for amber', () => {
    const ev = evaluate(base({
      impact: { I4: true },
      safeguards: { ...allBaseSafeguards(), S_RECORD_OF_USE: false }
    }));
    assert.ok(ev.firedRules.includes('S_RECORD_OF_USE'));
  });

  it('tier boundary I3 only is tier 2', () => {
    assert.equal(computeTier({ I1: false, I2: false, I3: true, I4: false }), 2);
  });

  it('tier boundary I4 only is tier 1', () => {
    assert.equal(computeTier({ I1: false, I2: false, I3: false, I4: true }), 1);
  });

  it('D4 triggers DPIA at tier 2', () => {
    const req = getRequiredSafeguards(2, { D4: true, D1: false, D2: false, D3: false }, { I3: true });
    assert.ok(req.includes('S_DPIA'));
  });

  it('multiple red flags can fire', () => {
    const ev = evaluate(base({
      data: { D2: true, D3: true },
      step1: { deployment: 'public-consumer' }
    }));
    assert.ok(ev.redFlags.includes('R1'));
    assert.ok(ev.redFlags.includes('R4'));
  });
});
