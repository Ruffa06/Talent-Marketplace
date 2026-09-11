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

Benefit side now rests on two real inputs: Payroll's average monthly basic
salary by band (September 2026) and TA's 2025 cost-per-hire file. The retention
lift on top of them is still a judgement. The retention lift in
particular is a judgement: the v1 dashboard shows 94% retention among
participants against an 81% company average, which is almost certainly
selection bias, so the 13-point observed gap is discounted to 3 points here.
The CBA is reported with and without it for exactly that reason.

Mass operations' replacement cost is now Payroll's own figure; the remaining
assumption there is participation — shift roles are assumed to take part at 60%
of the office rate. The stress table reports the case with mass-operations benefit removed
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

# ── Benefit-side constants, needed by the comparison below ──────────
# Salaries are Payroll's average monthly basic, September 2026 — they replace
# the earlier P480,000/P260,000 planning assumptions. Annualised x12, i.e. basic
# only: the mandatory 13th month and employer contributions are deliberately
# left out, so every benefit below is quoted on the low side. The x13 variant is
# printed underneath so the size of that haircut is visible.
SAL_MO = {'B': 36_333.85, 'C': 92_821.09, 'nonmass': 85_802.89, 'mass': 15_144.06}
MONTHS = 12                                     # basic only; 13 reported as a variant
SALARY      = SAL_MO['nonmass'] * MONTHS        # IT + Operations (non-mass) + HR
SALARY_MASS = SAL_MO['mass']    * MONTHS        # mass operations
PART_RATE = 120/637                             # participants per head, from the v1 pilot
MASS_PART = 0.60                                # ASSUMPTION — shift roles participate less
REPL, REPL_MASS = SALARY*0.75, SALARY_MASS*0.75
RET = 0.03

# Cost of filling a vacancy externally, from TA's 2025 cost-per-hire file. The
# P350,000 agency fee that used to sit here was a v1 planning figure with no
# traceable source and is retired. Internal mobility fills Band B and C roles,
# in the mix TA actually hired in 2025, so both the fee and the vacancy-day cost
# are blended on that mix rather than taken at Band C.
HIRE_MIX  = {'B': 186, 'C': 103}                # external hires, 2025
HIRE_COST = {'B': 6_977, 'C': 35_367}           # TA cost per hire, incl. headhunter
HIRES_N   = sum(HIRE_MIX.values())
HIRE_AVOID = sum(HIRE_COST[b]*n for b, n in HIRE_MIX.items()) / HIRES_N
SAL_HIRE  = sum(SAL_MO[b]*n for b, n in HIRE_MIX.items()) / HIRES_N * MONTHS
VAC_DAY, TTF = SAL_HIRE/260, 37                 # 37 days to fill, 260 working days
VAC_FILL  = VAC_DAY * TTF
PER_FILL  = HIRE_AVOID + VAC_FILL

# ══ COMPETITION ═══════════════════════════════════════════════════
# Vendor bands are quoted in dollars, so they move with the exchange rate too.
vlo3, vhi3 = (75_000+2*50_000)*FX, (240_000+2*120_000)*FX
print(f'\n══ vs COMPETITION ══')
print(f'   v2-lean            {m(TCO):>12}   {u(TCO):>12}            {m(TCO/EMP):>9}/emp')
print(f'   External platform  {m(vlo3)} - {m(vhi3)}   US$175,000 - 480,000   {m(vlo3/EMP)} - {m(vhi3/EMP)}/emp')
print(f'   → {vlo3/TCO:.0f}x - {vhi3/TCO:.0f}x cheaper. Vendor needs {vlo3/PER_FILL:.0f}-{vhi3/PER_FILL:.0f} attributed fills just to break even.')

# ══ BENEFITS ══════════════════════════════════════════════════════

def benefits(nonmass, mass):
    """Attributed hires scale with the non-mass population only; retention
       scales with everyone, at each group's own replacement cost."""
    hires = {k: round(v * nonmass/637) for k, v in {'Conservative': 2, 'Base': 4, 'Optimistic': 7}.items()}
    p_nm, p_ms = nonmass*PART_RATE, mass*PART_RATE*MASS_PART
    ret = p_nm*RET*REPL + p_ms*RET*REPL_MASS
    return hires, ret, p_nm+p_ms

scen, ret_ben, participants = benefits(NONMASS, MASS)
print(f'\n══ BENEFITS (annual, steady state) at {EMP:,} ══')
print('   Salaries — Payroll average monthly basic, annualised x%d' % MONTHS)
for k in ('B', 'C', 'nonmass', 'mass'):
    print(f'     {k:<9}{m(SAL_MO[k]):>11}/mo  →  {m(SAL_MO[k]*MONTHS):>12}/yr  ·  replacement at 75% {m(SAL_MO[k]*MONTHS*0.75):>12}')
print(f'   Cost of one external fill, blended on the 2025 hiring mix '
      f'({HIRE_MIX["B"]} Band B + {HIRE_MIX["C"]} Band C)')
print(f'     TA cost per hire, incl. headhunter                    {m(HIRE_AVOID):>12}')
print(f'     {TTF} vacancy days at {m(VAC_DAY)}/day (on {m(SAL_HIRE)} blended)  {m(VAC_FILL):>12}')
print(f'     {"PER FILL":<54}{m(PER_FILL):>12}')
print('   Attributed — requires a confirmed referral, so exists only because of the tracking spend')
for n,h in scen.items():
    print(f'     {n:<13} {h} hires/yr:  hiring cost {m(h*HIRE_AVOID):>9} + vacancy days {m(h*VAC_FILL):>10} = {m(h*PER_FILL):>10}')
print('   Owned — gigs, DJIs, service offers run end to end here, no attribution needed')
print(f'     Retention: {participants:.0f} participants x {RET*100:.0f}pt lift = {m(ret_ben)}/yr')
print(f'       ({NONMASS*PART_RATE:.0f} non-mass x {RET*100:.0f}% x {m(REPL)} = {m(NONMASS*PART_RATE*RET*REPL)} · '
      f'{MASS*PART_RATE*MASS_PART:.0f} mass ops x {RET*100:.0f}% x {m(REPL_MASS)} = {m(MASS*PART_RATE*MASS_PART*RET*REPL_MASS)})')
_r13 = NONMASS*PART_RATE*RET*SAL_MO['nonmass']*13*0.75 + MASS*PART_RATE*MASS_PART*RET*SAL_MO['mass']*13*0.75
print(f'     Variant — annualised x13 (mandatory 13th month): {m(_r13)}/yr, '
      f'{m(_r13-ret_ben)} more. Not claimed.')

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
for n,h in scen.items(): cba(h*PER_FILL + ret_ben, f'{n} ({h} hires/yr)')
print(f'   {"":-<90}')
base_h = scen['Base']
cba(base_h*PER_FILL, 'Base, retention EXCLUDED')
cba(ret_ben, 'Retention only, 0 hires')
_, ret_pilot, _ = benefits(NONMASS, 0)
cba(base_h*PER_FILL + ret_pilot, 'Base, mass-ops benefit EXCLUDED')
cba(base_h*HIRE_AVOID + ret_ben, 'Base, vacancy days EXCLUDED')

print(f'\n   Break-even on attributed fills alone (retention excluded): '
      f'{TCO/PER_FILL/3:.1f} fills/yr — {TCO/PER_FILL:.0f} over three years')
print(f'   On avoided hiring cost alone, no vacancy-day credit: {TCO/HIRE_AVOID:.0f} fills over three years')
print(f'   Retention alone repays the 3-yr TCO in {TCO/ret_ben:.1f} years with zero vacancy fills')

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
    b3 = (h['Base']*PER_FILL + rb) * 2.4                            # 40% + 100% + 100%
    print(f'   {label:<28}{n:>8,}{y1:>11,.0f}{y2:>10,.0f}{y3:>10,.0f}{t:>11,.0f}{t/FX:>9,.0f}{t/n/3:>9,.0f}{b3/t:>6.1f}')
print(f'   Build is flat at {m(IT_BUILD)} — {100*IT_BUILD/ (B1+sum(run_lines(637,False).values()) + B2+2*sum(run_lines(637,True).values())):.0f}% of the pilot TCO, '
      f'{100*IT_BUILD/(B1+sum(run_lines(20_587,False).values()) + B2+2*sum(run_lines(20_587,True).values())):.0f}% of the full-org TCO.')
