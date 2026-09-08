# -*- coding: utf-8 -*-
"""The model behind docs/V2_CBA.md — v2-lean costing, competitive comparison, CBA.

Primary scope: 1,113 employees (the 637-person pilot in IT, Operations and HR,
plus 476 in mass operations). 3-year horizon, PHP61 = US$1, 10% discount rate.
Every figure in that document comes from this script; change an assumption and
re-run rather than trusting the numbers.

    python3 docs/v2-cba-model.py

Cost side descends from docs/v2-costing-model.py: v2 phase 1 developer effort
was 3.8 months, lever B removes 1.5 (Supabase-native, no separate API service)
and lever A moves 0.9 (referral engine + reporting) into year 2. IT has since
costed the man-hours at P1,785,500, which supersedes that estimate.

Four run lines are bought in dollars and one is not, so the exchange rate moves
the peso cost of running this UP as the peso weakens — it is not only a
presentation conversion. The build is peso labour and does not move.

Benefit side is NOT derived from measured data. The retention lift in
particular is a judgement: the v1 dashboard shows 94% retention among
participants against an 81% company average, which is almost certainly
selection bias, so the 13-point observed gap is discounted to 3 points here.
The CBA is reported with and without it for exactly that reason.

Mass operations carries two assumptions HR has not yet confirmed, both marked
below: a lower replacement cost, and a lower participation rate for shift
roles. The stress table reports the case with mass-operations benefit removed
entirely, which is the floor if both are wrong.
"""
FX, C, DISC = 61.0, 1.20, 0.10

# ── Population, by composition, because the two groups behave differently ──
#    Agency fees and 37-day vacancies belong to non-mass roles; mass roles are
#    hired in volume without an agency, so they earn no attributed-hire benefit.
SCOPES = [
    ('Pilot — IT, Operations, HR',   637,     0),
    ('Pilot + mass operations',      637,   476),
    ('All non-mass',               1_991,     0),
    ('Full organisation',          1_991, 18_596),
]
PRIMARY = 1                                    # the case is made at 1,113
NAME, NONMASS, MASS = SCOPES[PRIMARY]
EMP = NONMASS + MASS

def m(p): return f'P{p:,.0f}'
def u(p): return f'US${p/FX:,.0f}'

# ══ COSTS ═════════════════════════════════════════════════════════
# v2 phase 1 dev was 3.8 months. Lever B removes 1.5 (Supabase-native);
# lever A moves 0.9 (referral engine + reporting) into year 2. 1.4 left in Y1.
build_y1 = {
 'Full-stack developer, 1.4 months @ P150k — board, matching, JD reader, handoff': 210_000,
 'Designer, 1.5 months at 50% @ P110k — reuses the v1 design system': 82_500,
 'PM/BA, 4 months at 30% @ P150k — incl. recruitment-side coordination': 180_000,
 'Security review + DPA assessment + referral-log DPIA': 120_000,
}
build_y2 = {'Full-stack developer, 0.9 months @ P150k — referral engine + attribution reporting': 135_000}

# IT has costed the man-hours: P1,785,500 for the whole build, in pesos, and it
# does not change with population — the same software serves 637 or 20,587.
IT_BUILD = 1_785_500
plan_y1, plan_y2 = sum(build_y1.values())*C, sum(build_y2.values())*C
B1 = round(IT_BUILD * plan_y1/(plan_y1+plan_y2), -2)   # ship promotion first
B2 = IT_BUILD - B1

# Run: what is bought in dollars, and what is bought in pesos.
SUPABASE_USD, CLAUDE_USD, EMAIL_USD, MONITOR_USD = 25*12, 380.4, 150.0, 120.0
ANALYST_HR = 375                                # P60,000/month / 160 hours
RECON_HOURS = {637: 16, 1_113: 24, 1_991: 32, 20_587: 160}

def run_lines(n, year_two):
    """Annual run at population n. Only the analyst is peso-denominated."""
    big = n > 2_000
    # Rounded to whole pesos so the printed years sum to the printed total.
    return {k: round(v) for k, v in {
        'Supabase Pro + Auth (US$25/mo)':  (SUPABASE_USD if not big else 85*12) * FX,
        'Claude API — Sonnet 5, batched':   CLAUDE_USD * FX * n / 637,
        'Transactional email (incl. the nudge)': EMAIL_USD * FX * n / 637,
        'Monitoring and logging':           MONITOR_USD * FX * (2 if big else 1),
        'Reconciliation — 4 hrs/quarter, HR analyst': RECON_HOURS[n] * ANALYST_HR if year_two else 0,
    }.items()}

run_y1, run_y2 = run_lines(EMP, False), run_lines(EMP, True)
R1, R2 = sum(run_y1.values()), sum(run_y2.values())
cost = [B1+R1, B2+R2, R2]; TCO = sum(cost)

print('══ v2-LEAN · COST BREAKDOWN ══')
print(f'SCOPE  {NAME}  —  {EMP:,} people ({NONMASS:,} non-mass + {MASS:,} mass ops)')
print(f'BUILD, COSTED BY IT  {m(IT_BUILD)}  →  year 1 {m(B1)} · year 2 {m(B2)}   (peso labour, flat at any population)')
print(f'   (our planning estimate was {m(plan_y1+plan_y2)} — kept below to show what moved)')
print('YEAR 1 BUILD — planning estimate, superseded')
for k,v in build_y1.items(): print(f'   {k:<72}{m(v):>11}')
print(f'   {"Contingency (20%)":<72}{m(sum(build_y1.values())*0.2):>11}\n   {"":<72}{m(plan_y1):>11}')
print('YEAR 2 BUILD — planning estimate, superseded (deferred referral engine, lever A)')
for k,v in build_y2.items(): print(f'   {k:<72}{m(v):>11}')
print(f'   {"Contingency (20%)":<72}{m(sum(build_y2.values())*0.2):>11}\n   {"":<72}{m(plan_y2):>11}')
print(f'ANNUAL RUN at {EMP:,}')
for k in run_y2: print(f'   {k:<72}{m(run_y2[k]):>11}' + ('' if run_y1[k] else '  Y2+ only'))
print(f'   {"Y1 / Y2+":<72}{m(R1)+" / "+m(R2):>11}')
print(f'\n   Y1 {m(cost[0])}  |  Y2 {m(cost[1])}  |  Y3 {m(cost[2])}')
print(f'   3-YEAR TCO {m(TCO)}  {u(TCO)}  ·  {m(TCO/EMP)}/employee  ·  {m(TCO/EMP/3)}/employee/yr')

# ══ COMPETITION ═══════════════════════════════════════════════════
# Vendor bands are quoted in dollars, so they move with the exchange rate too.
vlo3, vhi3 = (75_000+2*50_000)*FX, (240_000+2*120_000)*FX
print(f'\n══ vs COMPETITION ══')
print(f'   v2-lean            {m(TCO):>12}   {u(TCO):>12}            {m(TCO/EMP):>9}/emp')
print(f'   External platform  {m(vlo3)} - {m(vhi3)}   US$175,000 - 480,000   {m(vlo3/EMP)} - {m(vhi3/EMP)}/emp')
print(f'   → {vlo3/TCO:.0f}x - {vhi3/TCO:.0f}x cheaper. Vendor needs {vlo3/350_000:.0f}-{vhi3/350_000:.0f} attributed hires just to break even.')

# ══ BENEFITS ══════════════════════════════════════════════════════
AGENCY, SALARY = 350_000, 480_000               # non-mass average, fully loaded
SALARY_MASS = 260_000                           # ASSUMPTION — confirm with HR
PART_RATE = 120/637                             # participants per head, from the v1 pilot
MASS_PART = 0.60                                # ASSUMPTION — shift roles participate less
REPL, VAC_DAY, TTF = SALARY*0.75, SALARY/260, 37
RET = 0.03

def benefits(nonmass, mass):
    """Attributed hires scale with the non-mass population only; retention
       scales with everyone, at each group's own replacement cost."""
    hires = {k: round(v * nonmass/637) for k, v in {'Conservative': 2, 'Base': 4, 'Optimistic': 7}.items()}
    p_nm, p_ms = nonmass*PART_RATE, mass*PART_RATE*MASS_PART
    ret = p_nm*RET*REPL + p_ms*RET*SALARY_MASS*0.75
    return hires, ret, p_nm+p_ms

scen, ret_ben, participants = benefits(NONMASS, MASS)
print(f'\n══ BENEFITS (annual, steady state) at {EMP:,} ══')
print('   Attributed — requires a confirmed referral, so exists only because of the tracking spend')
for n,h in scen.items():
    print(f'     {n:<13} {h} hires/yr:  agency {m(h*AGENCY):>10} + vacancy days {m(h*TTF*VAC_DAY):>9} = {m(h*AGENCY+h*TTF*VAC_DAY):>10}')
print('   Owned — gigs, DJIs, service offers run end to end here, no attribution needed')
print(f'     Retention: {participants:.0f} participants x {RET*100:.0f}pt lift = {m(ret_ben)}/yr')
print(f'       ({NONMASS*PART_RATE:.0f} non-mass at {m(REPL)} replacement · '
      f'{MASS*PART_RATE*MASS_PART:.0f} mass ops at {m(SALARY_MASS*0.75)})')

# ══ CBA ═══════════════════════════════════════════════════════════
def cba(total_b, label):
    bflow = [total_b*0.4, total_b, total_b]          # 40% in Y1 — part-year, adoption ramp
    B3 = sum(bflow)
    npv = sum((bflow[i]-cost[i])/(1+DISC)**(i+1) for i in range(3))
    cb = cc = 0; pay = None
    for mo in range(1, 37):
        y = (mo-1)//12
        cc += (cost[y]-[B1,B2,0][y])/12 + ([B1,B2,0][y]/3 if (mo-1) % 12 < 3 else 0)
        if mo >= 4: cb += bflow[y]/9 if y == 0 else bflow[y]/12
        if pay is None and cb >= cc: pay = mo
    print(f'   {label:<34}{m(B3):>13}{m(TCO):>12}{m(B3-TCO):>13}{B3/TCO:>7.1f}{m(npv):>12}{(str(pay)+" mo") if pay else ">36 mo":>9}')
    return B3/TCO

print(f'\n══ COST-BENEFIT ANALYSIS · 3 years, 10% discount rate, {EMP:,} people ══')
print(f'   {"Scenario":<34}{"Benefit":>13}{"Cost":>12}{"Net":>13}{"BCR":>7}{"NPV":>12}{"Payback":>9}')
for n,h in scen.items(): cba(h*AGENCY + h*TTF*VAC_DAY + ret_ben, f'{n} ({h} hires/yr)')
print(f'   {"":-<90}')
base_h = scen['Base']
cba(base_h*AGENCY + base_h*TTF*VAC_DAY, 'Base, retention EXCLUDED')
cba(ret_ben, 'Retention only, 0 hires')
_, ret_pilot, _ = benefits(NONMASS, 0)
cba(base_h*AGENCY + base_h*TTF*VAC_DAY + ret_pilot, 'Base, mass-ops benefit EXCLUDED')

print(f'\n   Break-even on attributed hires alone (retention excluded): {TCO/AGENCY/3:.1f} hires/yr')
print(f'   Retention alone repays the 3-yr TCO in {TCO/ret_ben:.1f} years with zero vacancy hires')

# ══ EVERY SCOPE ═══════════════════════════════════════════════════
print('\n══ COST AND CASE BY POPULATION ══')
hdr = f'   {"scope":<28}{"people":>8}{"year 1":>11}{"year 2":>10}{"year 3":>10}{"3-yr TCO":>11}{"US$":>9}{"/emp/yr":>9}{"BCR":>6}'
print(hdr)
for label, nm, ms in SCOPES:
    n = nm + ms
    r1, r2 = sum(run_lines(n, False).values()), sum(run_lines(n, True).values())
    y1, y2, y3 = B1+r1, B2+r2, r2
    t = y1+y2+y3
    h, rb, _ = benefits(nm, ms)
    b3 = (h['Base']*AGENCY + h['Base']*TTF*VAC_DAY + rb) * 2.4     # 40% + 100% + 100%
    print(f'   {label:<28}{n:>8,}{y1:>11,.0f}{y2:>10,.0f}{y3:>10,.0f}{t:>11,.0f}{t/FX:>9,.0f}{t/n/3:>9,.0f}{b3/t:>6.1f}')
print(f'   Build is flat at {m(IT_BUILD)} — {100*IT_BUILD/ (B1+sum(run_lines(637,False).values()) + B2+2*sum(run_lines(637,True).values())):.0f}% of the pilot TCO, '
      f'{100*IT_BUILD/(B1+sum(run_lines(20_587,False).values()) + B2+2*sum(run_lines(20_587,True).values())):.0f}% of the full-org TCO.')
