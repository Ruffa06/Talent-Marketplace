# -*- coding: utf-8 -*-
"""The model behind the executive ALP deck (docs/exec-deck.js).

Everything on the money slides comes from here. Change an input and re-run.

    python3 docs/exec-model.py

Three things make this version different from docs/v2-cba-model.py, which it
supersedes for presentation purposes:

1. HRTA cost per hire (P3,378) is NOT avoided on an internal fill. HR still runs
   the process. Only the rest of the band's cost per hire disappears.
2. The BACKFILL is paid for. An internal move leaves a seat empty one band down,
   which we then hire for externally. Every saving below is net of that.
3. The retention number is MEASURED, not assumed. Of 67 internal applicants
   turned down in 2025, 38 are still with Home Credit. 29 have gone — 43%,
   against a company average of 19%. That 24-point gap is halved to 15 here
   because the observation window runs longer than a year.
"""

# ══ INPUTS ════════════════════════════════════════════════════════
FX, DISC = 61.0, 0.10

# TA cost-per-hire file, 2025. Mass operations is band M.
HIRE = {'M': 5_140, 'A': 6_391, 'B': 6_977, 'C': 35_367, 'D': 83_567, 'E': 1_761_790}
HRTA = 3_378                       # HR/TA cost per hire — incurred on internal fills too

# Payroll average monthly basic, September 2026.
SAL_MO = {'M': 15_144.06, 'B': 36_333.85, 'C': 92_821.09,
          'nonmass': 85_802.89, 'mass': 15_144.06}
MONTHS, WORKDAYS = 12, 260         # basic only: no 13th month, no employer contributions
def annual(b): return SAL_MO[b] * MONTHS
def day(b):    return annual(b) / WORKDAYS

DAYS_EXT, DAYS_INT = 58, 21        # days to fill
MIX = {'B': 186, 'C': 103}         # external hires, 2025
NMIX = sum(MIX.values())
BACKFILL = {'C': 'B', 'B': 'M'}    # who backfills whom, one band down

# Internal job posting, 2024-2026.
VAC_TOTAL, APPLICANTS, ACCEPTED, YEARS = 1_008, 463, 170, 3
VAC_YR = VAC_TOTAL / YEARS
FILL_RATE = ACCEPTED / VAC_TOTAL
SUCCESS = ACCEPTED / APPLICANTS    # applications needed per fill

# The 2025 turned-down cohort — the measured retention input.
TD_2025, TD_STILL_HERE = 67, 38
TD_LEFT = TD_2025 - TD_STILL_HERE
TD_ATTRITION = TD_LEFT / TD_2025
CO_ATTRITION = 0.19                # company average, 81% retention
EXCESS_OBSERVED = TD_ATTRITION - CO_ATTRITION
EXCESS = 0.15                      # halved: the window runs longer than a year

# Pilot.
PILOT_NONMASS, PILOT_MASS = 637, 476
PILOT = PILOT_NONMASS + PILOT_MASS
PILOT_REQS = 60                    # internal requisitions a year — BRD planning assumption
IT_BUILD = 1_785_500               # costed by IT in man-hours, EXCLUDING AI
B1, B2 = 1_454_200, 331_300        # phased: promotion first, referral engine in year 2

SUPABASE_USD, CLAUDE_USD, EMAIL_USD, MONITOR_USD = 25*12, 380.4, 150.0, 120.0
ANALYST_HR, RECON_HRS = 375, 24

def m(v): return f'P{v:,.0f}'

# ══ NET VALUE OF ONE INTERNAL FILL ════════════════════════════════
def net_fill(band):
    """External hire, versus internal move plus the backfill it creates."""
    bf = BACKFILL[band]
    ext_cost = HIRE[band] + DAYS_EXT * day(band)
    int_cost = (HRTA + DAYS_INT * day(band)          # the role itself, filled faster
                + HIRE[bf] + DAYS_EXT * day(bf))     # the seat left behind
    hire_part = HIRE[band] - HRTA - HIRE[bf]
    vac_part  = (DAYS_EXT - DAYS_INT) * day(band) - DAYS_EXT * day(bf)
    return ext_cost - int_cost, hire_part, vac_part

print('══ WHAT ONE INTERNAL FILL IS ACTUALLY WORTH ══')
print(f'   {"":22}{"hiring":>12}{"vacancy days":>15}{"NET":>12}')
parts = {}
for b in ('C', 'B'):
    net, h, v = net_fill(b)
    parts[b] = (h, v, net)
    print(f'   Band {b} filled inside {m(h):>12}{m(v):>15}{m(net):>12}'
          f'   (backfilled from band {BACKFILL[b]})')
HIRE_PART = sum(parts[b][0]*MIX[b] for b in MIX) / NMIX
VAC_PART  = sum(parts[b][1]*MIX[b] for b in MIX) / NMIX
PER_FILL  = HIRE_PART + VAC_PART
print(f'   {"Blended on 2025 mix":22}{m(HIRE_PART):>12}{m(VAC_PART):>15}{m(PER_FILL):>12}'
      f'   ({MIX["B"]} band B, {MIX["C"]} band C)')
print(f'   Band C external hire costs {m(HIRE["C"])}; {m(HRTA)} of that is HR/TA cost we still pay '
      f'internally, so {m(HIRE["C"]-HRTA)} is avoidable before the backfill.')

# ══ COST OF TURNOVER AMONG THE TURNED DOWN ════════════════════════
SAL_BLEND = sum(SAL_MO[b]*MIX[b] for b in MIX) / NMIX * MONTHS
REPLACE = SAL_BLEND * 0.75
print(f'\n══ THE COST OF SAYING NO ══')
print(f'   2025: {TD_2025} internal applicants turned down. {TD_STILL_HERE} are still here.')
print(f'   {TD_LEFT} have left — {TD_ATTRITION*100:.0f}% against a company average of {CO_ATTRITION*100:.0f}%.')
print(f'   Observed excess {EXCESS_OBSERVED*100:.0f} points; modelled at {EXCESS*100:.0f}.')
print(f'   Blended band B/C annual basic {m(SAL_BLEND)} -> replacement at 75% = {m(REPLACE)}')
print(f'   Expected leavers at company average: {TD_2025*CO_ATTRITION:.0f}. Actual: {TD_LEFT}. '
      f'Excess: {TD_LEFT - TD_2025*CO_ATTRITION:.0f} people, {m((TD_LEFT-TD_2025*CO_ATTRITION)*REPLACE)}.')

# ══ 17% vs 30% vs 50%, COMPANY-WIDE ══════════════════════════════
def scenario(rate, vac):
    fills = vac * rate
    apps  = fills / SUCCESS
    return fills, apps, apps - fills

print(f'\n══ STAYING AT {FILL_RATE*100:.0f}% vs 30% vs 50% — company-wide, {VAC_YR:.0f} vacancies a year ══')
base_f, base_a, base_td = scenario(FILL_RATE, VAC_YR)
rows = []
for r in (FILL_RATE, 0.30, 0.50):
    f, a, td = scenario(r, VAC_YR)
    extra = f - base_f
    h, v = extra*HIRE_PART, extra*VAC_PART
    t = extra * EXCESS * REPLACE
    rows.append((r, f, a, td, h, v, t, h+v+t))
hdr = f'   {"internal fill rate":<22}{"17% today":>14}{"30%":>14}{"50%":>14}'
print(hdr)
def line(lbl, fmt, idx):
    print(f'   {lbl:<22}' + ''.join(f'{fmt(r[idx]):>14}' for r in rows))
line('internal fills / yr',  lambda v: f'{v:,.0f}', 1)
line('applications needed',  lambda v: f'{v:,.0f}', 2)
line('turned down / yr',     lambda v: f'{v:,.0f}', 3)
print(f'   {"":-<64}')
line('hiring cost avoided',  lambda v: m(v) if v else '—', 4)
line('vacancy days saved',   lambda v: m(v) if v else '—', 5)
line('turnover avoided',     lambda v: m(v) if v else '—', 6)
line('ANNUAL VALUE',         lambda v: m(v) if v else 'baseline', 7)
print(f'\n   Staying at {FILL_RATE*100:.0f}% costs {m(rows[1][7])} a year against 30%, '
      f'{m(rows[2][7])} against 50%.')
print(f'   Reaching 30% needs internal applications to go from {base_a:,.0f} to {rows[1][2]:,.0f} a year '
      f'({rows[1][2]/base_a:.1f}x). 50% needs {rows[2][2]/base_a:.1f}x.')
print(f'   It also creates {rows[1][3]-base_td:,.0f} more rejections a year at 30% — which is why the '
      f'gig, immersion and service-offer shelves exist.')

# ══ THE PILOT: COST, BENEFIT, PAYBACK ════════════════════════════
run_y1 = {'Supabase Pro + Auth': SUPABASE_USD*FX, 'Claude API (AI matching)': CLAUDE_USD*FX*PILOT/637,
          'Transactional email': EMAIL_USD*FX*PILOT/637, 'Monitoring and logging': MONITOR_USD*FX}
run_y2 = dict(run_y1, **{'Reconciliation, HR analyst': RECON_HRS*ANALYST_HR})
R1, R2 = sum(run_y1.values()), sum(run_y2.values())
cost = [B1+R1, B2+R2, R2]; TCO = sum(cost)

pf, pa, ptd = scenario(FILL_RATE, PILOT_REQS)
def pilot_value(rate):
    f, a, td = scenario(rate, PILOT_REQS)
    extra = f - pf
    return extra, extra*PER_FILL, extra*EXCESS*REPLACE
x30, mob30, ret30 = pilot_value(0.30)
MOBILITY = mob30 + ret30
SHELVES = 120*0.03*(annual('nonmass')*0.75) + 54*0.03*(annual('mass')*0.75)

print(f'\n══ THE PILOT — {PILOT:,} people (IT, HR, operations mass and non-mass) ══')
print(f'   BUILD, costed by IT in man-hours (excludes AI)  {m(IT_BUILD)}  '
      f'-> year 1 {m(B1)} · year 2 {m(B2)}')
print(f'   RUN, a year')
for k in run_y2: print(f'     {k:<34}{m(run_y2[k]):>10}' + ('' if k in run_y1 else '  year 2+'))
print(f'     {"year 1 / year 2+":<34}{m(R1)+" / "+m(R2):>10}')
print(f'   YEAR 1 {m(cost[0])} · YEAR 2 {m(cost[1])} · YEAR 3 {m(cost[2])}')
print(f'   THREE-YEAR COST {m(TCO)}  US${TCO/FX:,.0f}  ·  {m(TCO/PILOT/3)} per employee a year')
print(f'\n   BENEFIT, a year, at a 30% internal fill rate on {PILOT_REQS} requisitions')
print(f'     Measured  · mobility, {x30:.0f} more internal fills  {m(mob30):>12}')
print(f'     Measured  · turnover among those {x30:.0f} people   {m(ret30):>12}')
print(f'     {"":<49}{m(MOBILITY):>12}  floor')
print(f'     Judgement · retention across 174 shelf participants {m(SHELVES):>10}')
print(f'     {"":<49}{m(MOBILITY+SHELVES):>12}  expected')

def case(annual_benefit, label):
    flow = [annual_benefit*0.4, annual_benefit, annual_benefit]
    B3 = sum(flow)
    npv = sum((flow[i]-cost[i])/(1+DISC)**(i+1) for i in range(3))
    cb = cc = 0; pay = None
    for mo in range(1, 61):
        y = min((mo-1)//12, 2)
        cc += (cost[y]-[B1,B2,0][y])/12 + ([B1,B2,0][y]/3 if (mo-1) % 12 < 3 else 0)
        if mo >= 4: cb += flow[y]/9 if y == 0 else flow[y]/12
        if pay is None and cb >= cc: pay = mo
    print(f'   {label:<34}{m(B3):>13}{m(TCO):>12}{B3/TCO:>7.1f}{m(npv):>13}'
          f'{(str(pay)+" mo") if pay else ">60 mo":>9}')
    return B3/TCO, pay

print(f'\n══ THE CASE — three years, {DISC*100:.0f}% discount rate ══')
print(f'   {"":<34}{"benefit":>13}{"cost":>12}{"BCR":>7}{"NPV":>13}{"payback":>9}')
case(MOBILITY, 'Measured only — the floor')
case(MOBILITY+SHELVES, 'Expected — both streams')
case(SHELVES, 'Shelves only, no extra fills')
print(f'\n   Break-even needs {TCO/(PER_FILL+EXCESS*REPLACE)/3:.1f} extra internal fills a year, '
      f'{TCO/(PER_FILL+EXCESS*REPLACE):.0f} over three years.')
print(f'   One extra internal fill is worth {m(PER_FILL+EXCESS*REPLACE)}.')

# ══ vs BUYING ═════════════════════════════════════════════════════
vlo, vhi = (75_000+2*50_000)*FX, (240_000+2*120_000)*FX
print(f'\n══ vs AN EXTERNAL PLATFORM, three years at {PILOT:,} seats ══')
print(f'   Growth, built in-house  {m(TCO):>12}  US${TCO/FX:>9,.0f}   {m(TCO/PILOT)}/seat')
print(f'   Gloat · Fuel50 · Eightfold · Workday  {m(vlo)} - {m(vhi)}   US$175,000 - 480,000')
print(f'   {vlo/TCO:.0f}x to {vhi/TCO:.0f}x cheaper. A vendor at the low band needs '
      f'{vlo/(PER_FILL+EXCESS*REPLACE):.0f} extra internal fills just to cover its licence; Growth needs '
      f'{TCO/(PER_FILL+EXCESS*REPLACE):.0f}.')
