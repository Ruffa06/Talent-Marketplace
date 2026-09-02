# -*- coding: utf-8 -*-
"""The model behind docs/V2_CBA.md — v2-lean costing, competitive comparison, CBA.

637 employees, 3-year horizon, PHP58 = US$1, 10% discount rate. Every figure in
that document comes from this script; change an assumption and re-run rather
than trusting the numbers.

    python3 docs/v2-cba-model.py

Cost side descends from docs/v2-costing-model.py: v2 phase 1 developer effort
was 3.8 months, lever B removes 1.5 (Supabase-native, no separate API service)
and lever A moves 0.9 (referral engine + reporting) into year 2.

Benefit side is NOT derived from measured data. The retention lift in
particular is a judgement: the v1 dashboard shows 94% retention among
participants against an 81% company average, which is almost certainly
selection bias, so the 13-point observed gap is discounted to 3 points here.
The CBA is reported with and without it for exactly that reason.
"""
FX, EMP, C, DISC = 58.0, 637, 1.20, 0.10
def m(p): return f'P{p:,.0f}'

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
run_y1 = {'Supabase Pro + Auth (US$25/mo)': 25*12*FX, 'Claude API — Sonnet 5, batched': 22_065,
          'Transactional email (incl. the nudge)': 8_700, 'Monitoring and logging': 6_960}
run_y2 = dict(run_y1); run_y2['Reconciliation — 4 hrs/quarter, PCD analyst'] = 4*4*(60_000/160)

# IT has costed the man-hours: P1,785,500 for the whole build. That supersedes the
# bottom-up planning estimate below, which is kept only to show what moved and why.
IT_BUILD = 1_785_500
plan_y1, plan_y2 = sum(build_y1.values())*C, sum(build_y2.values())*C
B1 = round(IT_BUILD * plan_y1/(plan_y1+plan_y2), -2)   # ship promotion first
B2 = IT_BUILD - B1
R1, R2 = sum(run_y1.values()), sum(run_y2.values())
cost = [B1+R1, B2+R2, R2]; TCO = sum(cost)

print('══ v2-LEAN · COST BREAKDOWN ══')
print(f'BUILD, COSTED BY IT  {m(IT_BUILD)}  →  year 1 {m(B1)} · year 2 {m(B2)}')
print(f'   (our planning estimate was {m(plan_y1+plan_y2)} — kept below to show what moved)')
print('YEAR 1 BUILD — planning estimate, superseded')
for k,v in build_y1.items(): print(f'   {k:<72}{m(v):>11}')
print(f'   {"Contingency (20%)":<72}{m(sum(build_y1.values())*0.2):>11}\n   {"":<72}{m(plan_y1):>11}')
print('YEAR 2 BUILD — planning estimate, superseded (deferred referral engine, lever A)')
for k,v in build_y2.items(): print(f'   {k:<72}{m(v):>11}')
print(f'   {"Contingency (20%)":<72}{m(sum(build_y2.values())*0.2):>11}\n   {"":<72}{m(plan_y2):>11}')
print('ANNUAL RUN')
for k in run_y2: print(f'   {k:<72}{m(run_y2[k]):>11}' + ('' if k in run_y1 else '  Y2+ only'))
print(f'   {"Y1 / Y2+":<72}{m(R1)+" / "+m(R2):>11}')
print(f'\n   Y1 {m(cost[0])}  |  Y2 {m(cost[1])}  |  Y3 {m(cost[2])}')
print(f'   3-YEAR TCO {m(TCO)}  US${TCO/FX:,.0f}  ·  {m(TCO/EMP)}/employee  ·  {m(TCO/EMP/3)}/employee/yr')
print(f'   vs v2 as costed P1,542,136 → {(TCO/1_542_136-1)*100:+.0f}%   ·   vs v1 P1,112,420 → {(TCO/1_112_420-1)*100:+.0f}%')
print(f'   (on our planning estimate the TCO would have been {m(plan_y1+plan_y2+R1+2*R2)})')

# ══ COMPETITION ═══════════════════════════════════════════════════
vlo3, vhi3 = (75_000+2*50_000)*FX, (240_000+2*120_000)*FX
print(f'\n══ vs COMPETITION ══')
print(f'   v2-lean            {m(TCO):>12}   US${TCO/FX:>8,.0f}            {m(TCO/EMP):>9}/emp')
print(f'   External platform  {m(vlo3)} - {m(vhi3)}   US$175,000 - 480,000   {m(vlo3/EMP)} - {m(vhi3/EMP)}/emp')
print(f'   → {vlo3/TCO:.0f}x - {vhi3/TCO:.0f}x cheaper. Vendor needs {vlo3/350_000:.0f}-{vhi3/350_000:.0f} attributed hires just to break even.')

# ══ BENEFITS ══════════════════════════════════════════════════════
AGENCY, SALARY = 350_000, 480_000
REPL, VAC_DAY, TTF = SALARY*0.75, SALARY/260, 37
PART, RET = 120, 0.03
ret_ben = PART*RET*REPL
scen = {'Conservative': 2, 'Base': 4, 'Optimistic': 7}
print(f'\n══ BENEFITS (annual, steady state) ══')
print(f'   Attributed — requires a confirmed referral, so exists only because of the tracking spend')
for n,h in scen.items():
    print(f'     {n:<13} {h} hires/yr:  agency {m(h*AGENCY):>10} + vacancy days {m(h*TTF*VAC_DAY):>9} = {m(h*AGENCY+h*TTF*VAC_DAY):>10}')
print(f'   Owned — gigs, DJIs, service offers run end to end here, no attribution needed')
print(f'     Retention: {PART} participants x {RET*100:.0f}pt lift x {m(REPL)} replacement = {m(ret_ben)}/yr')

# ══ CBA ═══════════════════════════════════════════════════════════
def cba(total_b, label):
    bflow = [total_b*0.4, total_b, total_b]          # 40% in Y1 — part-year, adoption ramp
    B3 = sum(bflow)
    npv = sum((bflow[i]-cost[i])/(1+DISC)**(i+1) for i in range(3))
    # payback: build spent in months 1-3, no benefit until month 4
    cb = cc = 0; pay = None
    for mo in range(1, 37):
        y = (mo-1)//12
        cc += (cost[y]-[B1,B2,0][y])/12 + ([B1,B2,0][y]/3 if (mo-1) % 12 < 3 else 0)
        if mo >= 4: cb += bflow[y]/9 if y == 0 else bflow[y]/12
        if pay is None and cb >= cc: pay = mo
    print(f'   {label:<26}{m(B3):>13}{m(TCO):>12}{m(B3-TCO):>13}{B3/TCO:>7.1f}{m(npv):>12}{(str(pay)+" mo") if pay else ">36 mo":>9}')

print(f'\n══ COST-BENEFIT ANALYSIS · 3 years, 10% discount rate ══')
print(f'   {"Scenario":<26}{"Benefit":>13}{"Cost":>12}{"Net":>13}{"BCR":>7}{"NPV":>12}{"Payback":>9}')
for n,h in scen.items(): cba(h*AGENCY + h*TTF*VAC_DAY + ret_ben, f'{n} ({h} hires/yr)')
print(f'   {"":-<82}')
cba(4*AGENCY + 4*TTF*VAC_DAY, 'Base, retention EXCLUDED')
cba(ret_ben, 'Retention only, 0 hires')

print(f'\n   Break-even on attributed hires alone (retention excluded): {TCO/AGENCY/3:.1f} hires/yr')
print(f'   Retention alone repays the 3-yr TCO in {TCO/ret_ben:.1f} years with zero vacancy hires')
