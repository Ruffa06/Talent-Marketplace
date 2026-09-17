# -*- coding: utf-8 -*-
"""The model behind docs/V2_COSTING.md.

Every figure in that document comes from this script. It is committed so the
assumptions can be challenged line by line and the numbers re-derived rather
than trusted: change an assumption at the top of a section, re-run, and see
what moves.

    python3 docs/v2-costing-model.py

The v1 block reproduces docs/COSTING.md exactly (10,192 backfill pairs, 5,422
per month, PHP930,000 build, PHP60,807 run, PHP1,112,420 3-year TCO), which is
what calibrates the v2 block against it.

Claude API prices are Anthropic first-party list, verified 18 August 2026.
"""
FX = 58.0
EMP = 637

def usd(p): return p / FX
def per_emp(p): return p / EMP

# ── Claude API workload ───────────────────────────────────────────
# Anthropic first-party list price, $/1M tokens (verified 2026-08-18)
PRICES = {'Claude Haiku 4.5': (1, 5), 'Claude Sonnet 5': (3, 15), 'Claude Opus 5': (5, 25)}
TOK_IN, TOK_OUT = 1500, 250

def per_1k(model):
    i, o = PRICES[model]
    return (TOK_IN / 1e6) * 1000 * i + (TOK_OUT / 1e6) * 1000 * o

print('--- $ per 1,000 scoring pairs ---')
for m in PRICES: print('  %-18s $%.2f' % (m, per_1k(m)))

FILT = 0.40   # keyword pre-filter retention

# v1: 40 live opportunities, 15 new/changed per month, 100 profile updates
v1_live, v1_new, v1_prof = 40, 15, 100
v1_backfill = EMP * v1_live * FILT
v1_monthly  = (v1_new * EMP + v1_prof * v1_live) * FILT

# v2: vacancies leave the in-app board (dashboard mix was Gig 22 / Vacancy 15 / DJI 10),
# but the promoted board carries MORE requisitions than were ever posted in-app,
# because the ATS holds all of them.
v2_inapp, v2_promoted = 27, 25
v2_live = v2_inapp + v2_promoted
v2_new_inapp, v2_new_reqs, v2_prof = 10, 12, 100
v2_backfill = EMP * v2_live * FILT
v2_monthly  = ((v2_new_inapp + v2_new_reqs) * EMP + v2_prof * v2_live) * FILT

print('\n--- workload ---')
print('  v1: %d live · backfill %s pairs · %s pairs/mo' % (v1_live, format(v1_backfill, ',.0f'), format(v1_monthly, ',.0f')))
print(f'  v2: {v2_live} live ({v2_inapp} in-app + {v2_promoted} promoted) · backfill {v2_backfill:,.0f} pairs · {v2_monthly:,.0f} pairs/mo')
print(f'  workload change: {(v2_monthly/v1_monthly-1)*100:+.0f}%')

print('\n--- annual matching cost, Batch API (50%% of list) ---')
rows = []
for m in PRICES:
    r = per_1k(m) / 1000
    a1 = v1_monthly * r * 0.5 * 12
    a2 = v2_monthly * r * 0.5 * 12
    rows.append((m, v1_backfill * r, v2_backfill * r, a1, a2))
    print(f'  {m:<18} v1 backfill ${v1_backfill*r:6.0f}  v2 backfill ${v2_backfill*r:6.0f} | v1/yr ${a1:6.0f}  v2/yr ${a2:6.0f}  (+${a2-a1:.0f})')

SON = per_1k('Claude Sonnet 5') / 1000
v1_claude_php = v1_monthly * SON * 0.5 * 12 * FX
v2_claude_php = v2_monthly * SON * 0.5 * 12 * FX
print(f'\n  Sonnet 5 batched, PHP/yr:  v1 P{v1_claude_php:,.0f}   v2 P{v2_claude_php:,.0f}')

# ── Build ─────────────────────────────────────────────────────────
DEV, DES, PM = 150_000, 110_000, 150_000   # PHP per month, fully loaded

v1_build = {'Full-stack developer, 3 months': DEV * 3,
            'Designer, 2 months at 50%': DES * 2 * .5,
            'PM/BA, 3 months at 30%': PM * 3 * .3,
            'Security review + Data Privacy Act assessment': 80_000}
v2_p1_build = {'Full-stack developer, 3.8 months': DEV * 3.8,
               'Designer, 2.5 months at 50%': DES * 2.5 * .5,
               'PM/BA, 4 months at 30%': PM * 4 * .3,
               'Security review + DPA assessment + referral-log DPIA': 120_000}
v2_p2_build = {'Full-stack developer, 0.6 months — ATS requisition feed + webhook': DEV * .6}

def total(d, cont=0.20):
    sub = sum(d.values())
    return sub, sub * cont, sub * (1 + cont)

print('\n--- build ---')
for name, d in [('v1', v1_build), ('v2 phase 1', v2_p1_build), ('v2 phase 2', v2_p2_build)]:
    s, c, t = total(d)
    print(f'  {name:<12} subtotal P{s:,.0f} + contingency P{c:,.0f} = P{t:,.0f}  (US${usd(t):,.0f})')

v1_B  = total(v1_build)[2]
v2p1_B = total(v2_p1_build)[2]
v2p2_B = total(v2_p2_build)[2]

# ── Run ───────────────────────────────────────────────────────────
ANALYST_HR = 60_000 / 160   # PCD analyst, fully loaded, per hour

v1_run = {'Supabase Pro (US$25/mo)': 25 * 12 * FX,
          'API hosting (US$20/mo)': 20 * 12 * FX,
          'Claude API — Sonnet 5, batched': v1_claude_php,
          'Transactional email': 6_960,
          'Monitoring and logging': 6_960}
v2_run_p1 = {'Supabase Pro (US$25/mo)': 25 * 12 * FX,
             'API hosting (US$20/mo)': 20 * 12 * FX,
             'Claude API — Sonnet 5, batched': v2_claude_php,
             'Transactional email (adds the "did you apply?" nudge)': 8_700,
             'Monitoring and logging': 6_960,
             'Monthly reconciliation — 3 hrs/mo, PCD analyst': 3 * 12 * ANALYST_HR}
v2_run_p2 = dict(v2_run_p1)
v2_run_p2['Monthly reconciliation — 0.5 hrs/mo, PCD analyst'] = 0.5 * 12 * ANALYST_HR
del v2_run_p2['Monthly reconciliation — 3 hrs/mo, PCD analyst']

v1_R, v2_R1, v2_R2 = sum(v1_run.values()), sum(v2_run_p1.values()), sum(v2_run_p2.values())
print('\n--- run (P/yr) ---')
print(f'  v1 P{v1_R:,.0f} (US${usd(v1_R):,.0f}) | v2 phase 1 P{v2_R1:,.0f} (US${usd(v2_R1):,.0f}) | v2 phase 2 P{v2_R2:,.0f} (US${usd(v2_R2):,.0f})')
for k, v in v2_run_p1.items(): print(f'     {k:<58} P{v:,.0f}')

# ── Three-year TCO ────────────────────────────────────────────────
def tco(y1, y2, y3): return y1 + y2 + y3

v1_tco   = tco(v1_B + v1_R, v1_R, v1_R)
# phased: phase 2 built in year 2
v2_ph    = tco(v2p1_B + v2_R1, v2p2_B + v2_R2, v2_R2)
# both up front
v2_up    = tco(v2p1_B + v2p2_B + v2_R2, v2_R2, v2_R2)
# phase 1 only, never automate
v2_only1 = tco(v2p1_B + v2_R1, v2_R1, v2_R1)

print('\n--- 3-year TCO ---')
for n, v, y1, y2 in [('v1', v1_tco, v1_B + v1_R, v1_R),
                     ('v2 phase 1 only', v2_only1, v2p1_B + v2_R1, v2_R1),
                     ('v2 phased (P2 in Y2)', v2_ph, v2p1_B + v2_R1, v2p2_B + v2_R2),
                     ('v2 both up front', v2_up, v2p1_B + v2p2_B + v2_R2, v2_R2)]:
    print(f'  {n:<22} Y1 P{y1:,.0f} | 3-yr P{v:,.0f} (US${usd(v):,.0f}) | per employee P{per_emp(v):,.0f}')

print(f'\n  delta v1 -> v2 phased: P{v2_ph-v1_tco:,.0f} (US${usd(v2_ph-v1_tco):,.0f}), {(v2_ph/v1_tco-1)*100:+.0f}% | per employee P{per_emp(v1_tco):,.0f} -> P{per_emp(v2_ph):,.0f}')
print(f'  phased vs up-front premium: P{v2_ph-v2_up:,.0f} ({(v2_ph/v2_up-1)*100:.1f}%) — the price of the option to cancel phase 2')

# ── Break-even ────────────────────────────────────────────────────
AGENCY = 350_000
print('\n--- break-even ---')
print(f'  v2 3-yr TCO / P{AGENCY:,.0f} avoided agency fee = {v2_ph/AGENCY:.1f} attributed hires over 3 years ({v2_ph/AGENCY/3:.1f}/yr)')
print(f'  v1 equivalent: {v1_tco/AGENCY:.1f} hires over 3 years ({v1_tco/AGENCY/3:.1f}/yr)')

# ── Sensitivities ─────────────────────────────────────────────────
print('\n--- sensitivities (3-yr, v2 phased) ---')
no_field = 8 * 12 * ANALYST_HR - 3 * 12 * ANALYST_HR
print(f'  recruitment refuses the source field (8 hrs/mo reconciliation): +P{no_field*3:,.0f} -> P{v2_ph+no_field*3:,.0f}')
print(f'  cancel phase 2 entirely: P{v2_only1:,.0f} (saves P{v2_ph-v2_only1:,.0f} vs phased)')
print(f'  FX to P65/US$: P{v2_ph*65/58:,.0f}')
fte = 0.25 * 900_000
print(f'  0.25 FTE internal ownership from Y2: +P{fte*2:,.0f} -> P{v2_ph+fte*2:,.0f}')
print(f'\n  vendor comparison: v2 US${usd(v2_ph):,.0f} vs US$175,000-480,000 = {175_000/usd(v2_ph):.0f}x - {480_000/usd(v2_ph):.0f}x cheaper')
