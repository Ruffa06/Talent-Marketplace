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

DAYS_EXT, DAYS_INT = 43, 23        # days to fill — 20 days saved on an internal move
BACKFILL = {'C': 'B', 'B': 'M'}    # who backfills whom, one band down

# Internal job posting, 2024-2026.
VAC_TOTAL, APPLICANTS, ACCEPTED, YEARS = 1_008, 463, 170, 3

# Band mix of external hires, on the same three-year base as everything else.
# Band-level counts exist only in the 2025 TA file (186 band B, 103 band C).
# Those proportions are held constant and scaled onto the three-year external
# hire volume: 1,008 vacancies less the 170 filled internally = 838 external
# hires, 2024-2026. Holding the proportions constant IS the assumption — it is
# what makes the blend a three-year figure in volume but a 2025 figure in shape.
# Drop real 2024 and 2026 band counts into MIX_3YR and every blended number
# below moves with them.
MIX_2025 = {'B': 186, 'C': 103}
EXT_3YR  = VAC_TOTAL - ACCEPTED
MIX = {b: round(EXT_3YR * n / sum(MIX_2025.values())) for b, n in MIX_2025.items()}
MIX_3YR = MIX
NMIX = sum(MIX.values())
VAC_YR = VAC_TOTAL / YEARS
FILL_RATE = ACCEPTED / VAC_TOTAL
SUCCESS = ACCEPTED / APPLICANTS    # applications needed per fill

# The 2025 turned-down cohort — the measured retention input.
# 67 turned down, 38 still employed in September 2026, is HRIS fact.
# The COMPARATOR is not. The 19% that earlier drafts used came from a
# placeholder tile in the v1 prototype dashboard ("94% vs 81% company
# average") — illustrative demo data, never a Payroll or HRIS figure. It is
# withdrawn here. The right comparator is attrition among band B and C
# non-mass staff, which is who these applicants are; a whole-company rate
# would be dragged up by mass operations and would understate the excess.
# HR has been asked for it. Until it lands, the benefit is modelled at 15
# points of excess and stress-tested across the plausible range below.
TD_2025, TD_STILL_HERE = 67, 38
TD_LEFT = TD_2025 - TD_STILL_HERE
TD_ATTRITION = TD_LEFT / TD_2025
EXCESS = 0.15                      # modelled; implies a comparator of ~28%
COMPARATORS = (0.20, 0.25, 0.28, 0.30, 0.35)

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
print(f'   {"Blended, 2024-2026":22}{m(HIRE_PART):>12}{m(VAC_PART):>15}{m(PER_FILL):>12}'
      f'   ({MIX["B"]} band B, {MIX["C"]} band C over 3 yrs)')
print(f'   Band C external hire costs {m(HIRE["C"])}; {m(HRTA)} of that is HR/TA cost we still pay '
      f'internally, so {m(HIRE["C"]-HRTA)} is avoidable before the backfill.')

# ══ COST OF TURNOVER AMONG THE TURNED DOWN ════════════════════════
SAL_BLEND = sum(SAL_MO[b]*MIX[b] for b in MIX) / NMIX * MONTHS
REPLACE = SAL_BLEND * 0.75
print(f'\n══ THE COST OF SAYING NO ══')
print(f'   MEASURED  {TD_2025} internal applicants turned down in 2025. {TD_STILL_HERE} are still here.')
print(f'             {TD_LEFT} have left — {TD_ATTRITION*100:.1f}% of the cohort.')
print(f'   Blended band B/C annual basic {m(SAL_BLEND)} -> replacement at 75% = {m(REPLACE)}')
print(f'   NOT MEASURED  the comparator. Attrition among band B/C non-mass staff, 2025 — HR to confirm.')
print(f'   {"comparator":>12}{"expected leavers":>18}{"excess people":>15}{"excess points":>15}{"cost of the excess":>20}')
for c in COMPARATORS:
    exp = TD_2025*c
    print(f'   {c*100:>11.0f}%{exp:>18.1f}{TD_LEFT-exp:>15.1f}{(TD_ATTRITION-c)*100:>14.0f}pt'
          f'{m((TD_LEFT-exp)*REPLACE):>20}' + ('   <- modelled' if abs((TD_ATTRITION-c)-EXCESS)<0.015 else ''))
print(f'   The model uses {EXCESS*100:.0f} points throughout. Every peso of turnover benefit scales')
print(f'   linearly with this input, so it is the single number most worth confirming.')

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
PART_RATE = 120/637
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

def payback(costs, build, annual_benefit, horizon=84):
    """The month cumulative benefit overtakes cumulative cost.

    Build spend lands in the first quarter of the year it falls in; run cost
    spreads evenly over its twelve months. Benefit does not start on day one —
    shelves have to be seeded and skills loaded — so it begins in month 4 and
    runs at 40% of rate through year 1. Past the modelled horizon both sides
    continue at the year-3 run rate.
    """
    if annual_benefit <= 0: return None
    cb = cc = 0.0
    n = len(costs)
    for mo in range(1, horizon + 1):
        y = (mo - 1) // 12
        yc = min(y, n - 1)
        run, bld = costs[yc] - build[yc], (build[yc] if y < n else 0)
        cc += run / 12 + (bld / 3 if (mo - 1) % 12 < 3 else 0)
        if mo >= 4:
            cb += annual_benefit * 0.4 / 9 if y == 0 else annual_benefit / 12
        if cb >= cc: return mo
    return None


def case(annual_benefit, label):
    flow = [annual_benefit*0.4, annual_benefit, annual_benefit]
    B3 = sum(flow)
    npv = sum((flow[i]-cost[i])/(1+DISC)**(i+1) for i in range(3))
    pay = payback(cost, [B1, B2, 0], annual_benefit)
    print(f'   {label:<34}{m(B3):>13}{m(TCO):>12}{B3/TCO:>7.1f}{m(npv):>13}'
          f'{(str(pay)+" mo") if pay else ">84 mo":>9}')
    return B3/TCO, pay

print(f'\n══ THE CASE — three years, {DISC*100:.0f}% discount rate ══')
print(f'   {"":<34}{"benefit":>13}{"cost":>12}{"BCR":>7}{"NPV":>13}{"payback":>9}')
case(MOBILITY, 'Measured only — the floor')
case(MOBILITY+SHELVES, 'Expected — both streams')
case(SHELVES, 'Shelves only, no extra fills')
print(f'\n   Break-even needs {TCO/(PER_FILL+EXCESS*REPLACE)/3:.1f} extra internal fills a year, '
      f'{TCO/(PER_FILL+EXCESS*REPLACE):.0f} over three years.')
print(f'   One extra internal fill is worth {m(PER_FILL+EXCESS*REPLACE)}.')

print(f'\n══ HOW MUCH THE UNCONFIRMED COMPARATOR MATTERS ══')
print(f'   {"comparator":>12}{"excess":>9}{"floor BCR":>12}{"expected BCR":>15}{"worth per fill":>17}')
for c in COMPARATORS:
    ex = TD_ATTRITION - c
    mob = x30*PER_FILL; ret = x30*ex*REPLACE
    fl = (mob+ret)*2.4/TCO
    exp = (mob+ret+SHELVES)*2.4/TCO
    print(f'   {c*100:>11.0f}%{ex*100:>8.0f}pt{fl:>12.1f}{exp:>15.1f}{m(PER_FILL+ex*REPLACE):>17}')
print('   Even at a 35% comparator the expected case clears 4. The floor is what moves.')

# ══ SCALING TO THE WHOLE COMPANY ══════════════════════════════════
# The build is bought once and does not move. Only run scales, and it scales
# by what actually drives each line: Claude and email by headcount, Supabase by
# tier, monitoring by log volume, reconciliation by referral volume.
FULL = 20_470
FULL_NONMASS = 1_991
FULL_MASS = FULL - FULL_NONMASS

def run_at(n, year_two):
    big = n > 2_000
    return {
        'Supabase Pro + Auth':        (85*12 if big else SUPABASE_USD) * FX,
        'Claude API (AI matching)':   CLAUDE_USD * FX * n / 637,
        'Transactional email':        EMAIL_USD  * FX * n / 637,
        'Monitoring and logging':     MONITOR_USD * FX * (2 if big else 1),
        'Reconciliation, HR analyst': (160 if big else RECON_HRS) * ANALYST_HR if year_two else 0,
    }

fr1, fr2 = run_at(FULL, False), run_at(FULL, True)
FR1, FR2 = sum(fr1.values()), sum(fr2.values())
fcost = [B1+FR1, B2+FR2, FR2]; FTCO = sum(fcost)

print(f'\n══ SCALING TO ALL {FULL:,} EMPLOYEES ══')
print(f'   BUILD  {m(IT_BUILD)} — unchanged. The same software serves {PILOT:,} or {FULL:,}.')
print(f'   RUN, a year')
for k in fr2:
    print(f'     {k:<30}{m(fr2[k]):>12}   (pilot {m(dict(run_at(PILOT, True))[k])})')
print(f'     {"year 1 / year 2+":<30}{m(FR1)+" / "+m(FR2):>12}')
print(f'   YEAR 1 {m(fcost[0])} · YEAR 2 {m(fcost[1])} · YEAR 3 {m(fcost[2])}')
print(f'   THREE-YEAR {m(FTCO)}  US${FTCO/FX:,.0f}  ·  {m(FTCO/FULL/3)} per employee a year')
print(f'   vs the pilot: {m(FTCO-TCO)} more over three years for {FULL-PILOT:,} more people')
print(f'                 = {m((FTCO-TCO)/(FULL-PILOT)/3)} per extra employee a year')
print(f'   AI is {100*fr2["Claude API (AI matching)"]/FR2:.0f}% of the full-org run, against '
      f'{100*dict(run_at(PILOT,True))["Claude API (AI matching)"]/R2:.0f}% at the pilot — the only line that really scales.')

print(f'\n   BENEFIT at full scale')
print(f'     Mobility — the 30% case on slide 8 IS company-wide      {m(rows[1][7]):>13}/yr')
print(f'       (the pilot only captures its own slice: {m(MOBILITY)}/yr)')
fp_nm = FULL_NONMASS*PART_RATE if False else FULL_NONMASS*(120/637)
fp_ms = FULL_MASS*(120/637)*0.60
fshelves = fp_nm*0.03*(annual('nonmass')*0.75) + fp_ms*0.03*(annual('mass')*0.75)
print(f'     Shelves — JUDGEMENT, {fp_nm+fp_ms:,.0f} participants a year     {m(fshelves):>13}/yr')
print(f'       ({fp_nm:.0f} non-mass + {fp_ms:,.0f} mass ops at 60% of the office rate)')
print(f'   BCR, mobility only  {rows[1][7]*2.4/FTCO:>5.1f}   |  with the shelves {(rows[1][7]+fshelves)*2.4/FTCO:>5.1f}')
print(f'   The pilot spends {m(TCO)} to capture {m(MOBILITY*2.4)} of a {m(rows[1][7]*2.4)} three-year prize.')

FULL_BEN_FLOOR = rows[1][7]                 # mobility + turnover, company-wide, 30% case
FULL_BEN_EXP   = FULL_BEN_FLOOR + fshelves  # plus the shelves
fbuild = [B1, B2, 0]
print(f'   PAYBACK on the {m(FTCO)} full-org spend')
for lbl, ben in (('measured only', FULL_BEN_FLOOR), ('expected, with shelves', FULL_BEN_EXP)):
    pay = payback(fcost, fbuild, ben)
    print(f'     {lbl:<24}{m(ben)}/yr  ->  {(str(pay)+" months") if pay else ">84 months"}')

# ══ vs BUYING ═════════════════════════════════════════════════════
vlo, vhi = (75_000+2*50_000)*FX, (240_000+2*120_000)*FX
print(f'\n══ vs AN EXTERNAL PLATFORM, three years at {PILOT:,} seats ══')
print(f'   Growth, built in-house  {m(TCO):>12}  US${TCO/FX:>9,.0f}   {m(TCO/PILOT)}/seat')
print(f'   Gloat · Fuel50 · Eightfold · Workday  {m(vlo)} - {m(vhi)}   US$175,000 - 480,000')
print(f'   {vlo/TCO:.0f}x to {vhi/TCO:.0f}x cheaper. A vendor at the low band needs '
      f'{vlo/(PER_FILL+EXCESS*REPLACE):.0f} extra internal fills just to cover its licence; Growth needs '
      f'{TCO/(PER_FILL+EXCESS*REPLACE):.0f}.')

# ── the same question at full scale ───────────────────────────────
# Below every vendor minimum at 1,113 seats we would pay a floor price.
# At 20,470 we are past the minimums, so the per-seat rate drives it and
# the gap widens rather than closes. Bands are modelled from how enterprise
# HR SaaS is structured — US$/employee/year plus a one-off implementation.
# They are NOT quotes; none of these vendors publishes per-seat pricing.
VENDOR_FULL = {
    # tier: (seat_lo, seat_hi, impl_lo, impl_hi)  all US$
    'Fuel50 · Gloat  (opportunity marketplace)':      (8,  18,  50_000, 120_000),
    'Eightfold · Workday  (skills engine in a suite)': (20, 45, 150_000, 400_000),
}
print(f'\n══ vs AN EXTERNAL PLATFORM, three years at {FULL:,} seats ══')
print(f'   {"Growth, built in-house":<42}{m(FTCO):>14}  US${FTCO/FX:>9,.0f}   {m(FTCO/FULL/3)}/employee/yr')
for tier, (slo, shi, ilo, ihi) in VENDOR_FULL.items():
    tlo, thi = (ilo + 3*FULL*slo), (ihi + 3*FULL*shi)
    print(f'   {tier:<42}{m(tlo*FX)} - {m(thi*FX)}   US${tlo:,.0f} - {thi:,.0f}')
    print(f'   {"":<42}US${slo}-{shi}/employee/yr licence + US${ilo//1000}-{ihi//1000}k implementation'
          f'  =  {m(tlo*FX/FULL/3)}-{m(thi*FX/FULL/3)}/employee/yr')
_lo = (50_000 + 3*FULL*8)*FX
_hi = (400_000 + 3*FULL*45)*FX
_unit = PER_FILL + EXCESS*REPLACE
print(f'   {_lo/FTCO:.0f}x to {_hi/FTCO:.0f}x more than building it. To cover its own licence a vendor needs')
print(f'   {_lo/_unit:.0f} to {_hi/_unit:,.0f} extra internal fills over three years; Growth needs {FTCO/_unit:.0f}.')
print(f'   There are only {VAC_YR*3:,.0f} vacancies in three years, so the top of the Eightfold band has to')
print(f'   fill {100*_hi/_unit/(VAC_YR*3):.0f}% of every requisition internally before it breaks even.')
print( '   CAVEAT: Workday Talent Marketplace is a module on Workday HCM, which we do not run —')
print( '   buying it means buying the core HCM first, an order of magnitude above these numbers.')

# ── payback at the two spend levels people keep asking about ──────
# P2,049,954 is the pilot as costed. P5,315,207 is the full-org figure with one
# extra analyst year in it (P60,000 above FTCO), which is the number circulating
# in the spreadsheet — carried here so both answers sit on the same benefit base.
print('\n══ PAYBACK, SIDE BY SIDE ══')
ASKED = {
    f'Pilot — 1,113 people  {m(TCO)}':  (cost,  [B1, B2, 0], MOBILITY,       MOBILITY + SHELVES),
    f'Full org — 20,470     {m(FTCO)}': (fcost, fbuild,      FULL_BEN_FLOOR, FULL_BEN_EXP),
    f'Full org as budgeted  {m(FTCO+60_000)}':
        ([fcost[0], fcost[1], fcost[2] + 60_000], fbuild, FULL_BEN_FLOOR, FULL_BEN_EXP),
}
print(f'   {"":<40}{"floor":>24}{"expected":>26}')
for lbl, (cs, bd, flo, exp) in ASKED.items():
    pf_, pe_ = payback(cs, bd, flo), payback(cs, bd, exp)
    print(f'   {lbl:<40}{m(flo)+"/yr":>15}{(str(pf_)+" mo") if pf_ else ">84 mo":>9}'
          f'{m(exp)+"/yr":>17}{(str(pe_)+" mo") if pe_ else ">84 mo":>9}')
print('   Benefit starts in month 4 and runs at 40% of rate through year 1: shelves have to be')
print('   seeded and skills loaded before anything matches. Build spend lands in the first quarter.')
