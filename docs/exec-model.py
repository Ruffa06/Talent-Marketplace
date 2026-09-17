"""Growth — the executive ALP model.

THE SOURCE OF TRUTH IS docs/ALP_Computations.xlsx, TAB "v2".
This file reproduces that tab exactly and checks itself against it at the
bottom. If a number here disagrees with the workbook, the workbook wins and
this file is wrong. Do not "improve" a figure here without changing the sheet.

What tab v2 changed from the earlier model (tab v1, and the deck built on it):

  1. NO BACKFILL NETTING. The hiring-cost saving is the full Band C cost per
     hire less the HR/TA cost we still pay internally — P31,989. v1 deducted a
     Band B backfill hire (P6,977) on the argument that an internal move leaves
     a seat one band down. v2 drops that deduction.
  2. VACANCY COST IS REVENUE, NOT SALARY. v1 valued vacant days at the
     post-holder's day rate. v2 values them at average revenue per employee per
     day — P5,670 — over 69 days, the observed gap between external and
     internal time to hire for bands C and D combined (151 days against 82).
     That is P391,230 a fill, and it is 92% of the whole case.
  3. THE TURNOVER LINE IS GONE. v1 carried an avoided-replacement-cost benefit
     built on the 2025 turned-down cohort. v2 removes it (v1 cell I37 reads
     "consider removing"). Nothing in the benefit now depends on the attrition
     comparator that HR still owes us, which is a real simplification.
  4. THREE SCOPES are costed side by side: the 1,113 pilot, all 20,470, and
     all 1,986 non-mass.
  5. THE DENOMINATOR IS 3 YEARS OF POSTING DATA, 2023-2026.

Four places where this file deliberately departs from the sheet's arithmetic.
Each is a formula error rather than a judgement, each is flagged in output, and
each is listed again in CHECK at the end:

  a. Sheet N17 and Q17 divide the org-wide and non-mass three-year costs by
     1,113 — the pilot headcount — instead of 20,470 and 1,986.
  b. Sheet Q19/Q20 price a vendor at 1,986 seats on the per-seat rate alone,
     which comes out BELOW the flat minimum the same sheet uses for the
     1,113-seat pilot. Below a vendor's contract minimum the price stops
     moving; this file takes the greater of the two.
  c. The sheet's payback divides cost by a three-year benefit and multiplies
     by 36. That is the right answer for a benefit that arrives evenly from
     day one. It does not, so a ramped payback is reported alongside it.
  d. Benefit is ORG-WIDE at every fill rate (336 vacancies a year is the whole
     company), so dividing it by the PILOT's cost is not a benefit-cost ratio.
     The sheet asks this itself at B51, "All data are org-wide except cost?".
     Answered below.
"""

FX = 61.0

# ══ INPUTS — tab v2, column B/C ═══════════════════════════════════
RATE_NOW, RATES = 0.17, (0.17, 0.30, 0.50)   # C3, E28:G28
ENPS_GROWTH = 0.88                            # C5  MyPulse eNPS on growth
VAC_YR = 336                                  # C7  ave non-mass hirings a year
VAC_TOTAL, APPLICANTS, ACCEPTED = 1_008, 463, 170   # C9:C11, 2023-2026
APPLY_RATE = APPLICANTS / VAC_TOTAL           # D10  46%
SUCCESS    = ACCEPTED / APPLICANTS            # D11  37%
FILL_RATE  = ACCEPTED / VAC_TOTAL             # D12  17%

# Rejected and resigned, by year — C16:E17. Context only: v2 carries no
# turnover benefit, so none of this reaches a peso in the case.
REJECTED = {2024: 51, 2025: 67, 2026: 175}
RESIGNED = {2024: 20, 2025: 29, 2026: 30}
REJ, RES = sum(REJECTED.values()), sum(RESIGNED.values())
REJ_ATTRITION = RES / REJ                     # F18  27%, career the top reason
ATTRITION_AVE = 0.17                          # C19

# Benefit per internal fill — C32:C36.
HIRE_C, HRTA = 35_367, 3_378
HIRE_AVOIDED = HIRE_C - HRTA                  # C33  P31,989
REV_PER_EMP_DAY = 5_670                       # C36  net revenue / headcount / day
DAYS_FASTER = 69                              # E59  bands C+D: 151 external, 82 internal
REV_LOST = REV_PER_EMP_DAY * DAYS_FASTER      # C36  P391,230
PER_FILL = HIRE_AVOIDED + REV_LOST            # F48  P423,219

# Cost — tab v2, columns J to R.
SCOPES = {                      # label:            headcount
    'Pilot — IT, HR, Ops':       1_113,
    'Non-mass only':             1_986,
    'Org wide':                 20_470,
}
RUN = {   # line:                            pilot,   non-mass,  org wide
    'AI matching (Claude)':                 (40_544,   72_345,   745_674),
    'Transactional email':                  (15_987,   28_527,   294_035),
    'Platform, monitoring':                 (25_620,   25_620,    76_860),
    'HR reconciliation':                    ( 9_000,    9_000,    60_000),
}
IT_BUILD = 1_785_500            # L7/N7/Q7 — one off, costed by IT in man-hours

# Vendors — J19:R20. Per seat a year, plus a one-off implementation, in US$.
# Below a vendor's own contract minimum the licence is a floor price: the sheet
# uses US$175,000 and US$480,000 for the 1,113-seat pilot, and those floors are
# applied at every scope here.
VENDORS = {
    'Gloat · Fuel50':            (12, 70_000,  175_000),
    'Eightfold · Workday TM':    (30, 250_000, 480_000),
}

def m(v):  return f'P{v:,.0f}'
def mm(v): return f'P{v/1e6:,.2f}M'

# ══ WHAT ONE INTERNAL FILL IS WORTH ═══════════════════════════════
print('══ WHAT ONE INTERNAL FILL IS WORTH ══')
print(f'   Band C cost per hire {m(HIRE_C)} less HR/TA cost {m(HRTA)}, which we')
print(f'   pay on an internal move too{"":19}hiring cost avoided {m(HIRE_AVOIDED):>12}')
print(f'   Revenue per employee per day {m(REV_PER_EMP_DAY)} x {DAYS_FASTER} days faster')
print(f'   (bands C+D: 151 days external, 82 internal){"":3}revenue not lost {m(REV_LOST):>12}')
print(f'   {"":<62}{"":->12}')
print(f'   {"":<62}{m(PER_FILL):>12}  a fill')
print(f'   Revenue is {100*REV_LOST/PER_FILL:.0f}% of it. This is a speed case, not a cost-per-hire case.')

# ══ THE THREE FILL RATES ══════════════════════════════════════════
fills   = {r: VAC_YR * r for r in RATES}
hiring  = {r: fills[r] * HIRE_AVOIDED for r in RATES}
revenue = {r: fills[r] * REV_LOST for r in RATES}
total   = {r: hiring[r] + revenue[r] for r in RATES}
incr    = {r: total[r] - total[RATE_NOW] for r in RATES}
incr3   = {r: incr[r] * 3 for r in RATES}

print(f'\n══ STAYING AT 17% vs 30% vs 50% — company-wide, {VAC_YR} vacancies a year ══')
hdr = f'   {"":<34}' + ''.join(f'{f"{r*100:.0f}%":>16}' for r in RATES)
print(hdr)
print(f'   {"":<34}' + ''.join(f'{lbl:>16}' for lbl in
      ('do nothing', 'benchmark', 'mature')))
print('   ' + '-' * (34 + 16*3))
for lbl, row in (('Internal fills a year', fills),
                 ('Hiring cost avoided a year', hiring),
                 ('Revenue lost to vacancy a year', revenue)):
    fmt = (lambda v: f'{v:,.1f}') if row is fills else (lambda v: m(v))
    print(f'   {lbl:<34}' + ''.join(f'{fmt(row[r]):>16}' for r in RATES))
print('   ' + '-' * (34 + 16*3))
print(f'   {"TOTAL a year":<34}' + ''.join(f'{m(total[r]):>16}' for r in RATES))
print(f'   {"INCREMENTAL a year":<34}{"baseline":>16}' +
      ''.join(f'{m(incr[r]):>16}' for r in RATES[1:]))
print(f'   {"INCREMENTAL x 3 years":<34}{"baseline":>16}' +
      ''.join(f'{m(incr3[r]):>16}' for r in RATES[1:]))
print(f'\n   Applications have to rise from {fills[0.17]/SUCCESS:,.0f} a year to '
      f'{fills[0.30]/SUCCESS:,.0f} for 30% ({fills[0.30]/fills[0.17]:.1f}x), '
      f'{fills[0.50]/SUCCESS:,.0f} for 50% ({fills[0.50]/fills[0.17]:.1f}x).')
print(f'   {APPLY_RATE*100:.0f}% of vacancies drew an internal applicant; {SUCCESS*100:.0f}% of applicants got the job.')

# ══ COST, THREE SCOPES ════════════════════════════════════════════
def cost_rows(i):
    """Year 1 carries the whole build and a full year of run, per the sheet."""
    run = sum(v[i] for v in RUN.values())
    y1  = IT_BUILD + run
    return [y1, run, run]

costs = {}
print(f'\n══ COST, THREE SCOPES ══')
print(f'   {"":<34}' + ''.join(f'{lbl.split(" —")[0]:>15}' for lbl in SCOPES))
print(f'   {"headcount":<34}' + ''.join(f'{n:>15,}' for n in SCOPES.values()))
print(f'   {"Build (IT man-hours), one off":<34}' + ''.join(f'{m(IT_BUILD):>15}' for _ in SCOPES))
for line, vals in RUN.items():
    print(f'   {line + ", a year":<34}' + ''.join(f'{m(v):>15}' for v in vals))
for lbl, idx in (('YEAR 1', 0), ('YEAR 2', 1), ('YEAR 3', 2)):
    print(f'   {lbl:<34}' + ''.join(f'{m(cost_rows(i)[idx]):>15}' for i in range(3)))
print('   ' + '-' * (34 + 15*3))
for i, (lbl, n) in enumerate(SCOPES.items()):
    costs[lbl] = sum(cost_rows(i))
print(f'   {"THREE-YEAR TOTAL":<34}' + ''.join(f'{m(costs[l]):>15}' for l in SCOPES))
print(f'   {"per employee a year":<34}' +
      ''.join(f'{m(costs[l]/n/3):>15}' for l, n in SCOPES.items()))
print(f'   NOTE  sheet N17/Q17 divide all three by 1,113. Corrected here: org wide is')
print(f'         {m(costs["Org wide"]/20_470/3)} an employee a year, non-mass {m(costs["Non-mass only"]/1_986/3)} — not '
      f'{m(costs["Org wide"]/1_113/3)} and {m(costs["Non-mass only"]/1_113/3)}.')

# ══ THE CASE ══════════════════════════════════════════════════════
def payback_simple(cost, benefit3):
    """The sheet's payback: cost as a share of three years of benefit."""
    return cost / benefit3 * 36

def payback_ramped(cost_years, benefit_yr, horizon=84):
    """The same question with the build paid up front and the benefit ramping.

    Build lands in the first quarter. Benefit starts in month 4 — shelves have
    to be seeded and skills loaded before anything matches — and runs at 40% of
    rate through year one.
    """
    if benefit_yr <= 0: return None
    cb = cc = 0.0
    for mo in range(1, horizon + 1):
        y  = (mo - 1) // 12
        yc = min(y, len(cost_years) - 1)
        bld = IT_BUILD if (y == 0 and (mo - 1) % 12 < 3) else 0
        cc += (cost_years[yc] - (IT_BUILD if y == 0 else 0)) / 12 + bld / 3
        if mo >= 4:
            cb += benefit_yr * 0.4 / 9 if y == 0 else benefit_yr / 12
        if cb >= cc: return mo
    return None

B30, B50 = incr3[0.30], incr3[0.50]
print(f'\n══ THE CASE — three years at the 30% benchmark ══')
print(f'   Benefit is ORG-WIDE at every rate: {VAC_YR} vacancies a year is the whole')
print(f'   company. So only the org-wide column is a true benefit-cost ratio. The other')
print(f'   two compare a company-wide prize against a fenced-off cost — useful for')
print(f'   "what would it take to be wrong", not a return. (Sheet B51 asks this.)')
print(f'\n   {"":<24}{"3-yr cost":>14}{"BCR @30%":>11}{"BCR @50%":>11}'
      f'{"payback":>10}{"ramped":>9}{"fills":>8}')
for lbl, n in SCOPES.items():
    c = costs[lbl]
    i = list(SCOPES).index(lbl)
    pr = payback_ramped(cost_rows(i), incr[0.30])
    tag = '' if lbl == 'Org wide' else '  *'
    print(f'   {lbl:<24}{m(c):>14}{B30/c:>11.1f}{B50/c:>11.1f}'
          f'{payback_simple(c, B30):>9.1f}mo{(str(pr)+"mo") if pr else ">84mo":>9}'
          f'{c/PER_FILL:>8.1f}{tag}')
print(f'   * benefit is org-wide; not a like-for-like ratio')
print(f'\n   Contribution margin, org wide (sheet H2/H3, savings less cost)')
print(f'     at 30%  {mm(B30)} - {mm(costs["Org wide"])} = {mm(B30 - costs["Org wide"])}')
print(f'     at 50%  {mm(B50)} - {mm(costs["Org wide"])} = {mm(B50 - costs["Org wide"])}')
print(f'   Break-even is {costs["Org wide"]/PER_FILL:.1f} extra internal fills over three years,')
print(f'   against {fills[0.30]-fills[0.17]:.0f} more a year at the benchmark. It clears in the first year.')

# ══ BUILD VS BUY ══════════════════════════════════════════════════
print(f'\n══ BUILD VS BUY — three years, US${FX:.0f} = P1 ══')
print(f'   {"":<26}' + ''.join(f'{lbl.split(" —")[0]:>17}' for lbl in SCOPES))
print(f'   {"Growth, built in-house":<26}' + ''.join(f'{m(costs[l]):>17}' for l in SCOPES))
for vlbl, (seat, impl, floor) in VENDORS.items():
    cells, notes = [], []
    for lbl, n in SCOPES.items():
        quoted = impl + seat * n * 3
        binding = max(quoted, floor)
        cells.append(f'{m(binding*FX):>17}')
        notes.append('minimum' if binding > quoted else 'per seat')
    print(f'   {vlbl:<26}' + ''.join(cells))
    print(f'   {"  US$" + str(seat) + "/seat/yr + $" + f"{impl:,}" + " impl":<26}'
          + ''.join(f'{nt:>17}' for nt in notes))
    print(f'   {"  multiple vs building":<26}'
          + ''.join(f'{max(impl+seat*n*3, floor)*FX/costs[l]:>16.1f}x'
                    for l, n in SCOPES.items()))
print(f'   NOTE  sheet Q19/Q20 price 1,986 seats on the per-seat rate alone, giving')
print(f'         {m((70_000+12*1986*3)*FX)} and {m((250_000+30*1986*3)*FX)} — both BELOW the flat minimum the same')
print(f'         sheet applies at 1,113 seats. Below a vendor minimum the price stops')
print(f'         moving, so the floor is used here at both of the smaller scopes.')
print(f'   Workday Talent Marketplace is a module on Workday HCM, which we do not run.')
print(f'   Buying it means buying the core HCM first, well above these numbers.')

# ══ WHAT v2 TOOK OUT, AND WHY IT MATTERS ══════════════════════════
print(f'\n══ WHAT IS NO LONGER IN THE CASE ══')
print(f'   TURNOVER. v2 removes the avoided-replacement-cost benefit entirely, so')
print(f'   nothing in the numbers above depends on the band B/C attrition comparator')
print(f'   HR has not yet given us. That is a simplification worth saying out loud.')
print(f'   The evidence still stands on its own as a reason the shelves exist:')
print(f'     {REJ} internal applicants turned down 2024-2026 ({", ".join(f"{y}: {v}" for y,v in REJECTED.items())})')
print(f'     {RES} of them have since resigned — {REJ_ATTRITION*100:.0f}%, against a {ATTRITION_AVE*100:.0f}% company average,')
print(f'     with career the top reason given. That is {(REJ_ATTRITION-ATTRITION_AVE)*100:.0f} points of excess.')
print(f'   MyPulse eNPS on growth is {ENPS_GROWTH*100:.0f}% — people want this; they cannot find it.')
print(f'   BACKFILL NETTING. v2 counts the full P{HIRE_AVOIDED:,} of hiring cost avoided. An')
print(f'   internal move does leave a seat one band down, and v1 deducted P6,977 for it.')
print(f'   Reinstating that deduction would cut the hiring line by {6977/PER_FILL*100:.1f}% of the case.')

# ══ THE ONE NUMBER THAT CARRIES EVERYTHING ════════════════════════
print(f'\n══ SENSITIVITY — revenue per employee per day ══')
print(f'   {REV_LOST/PER_FILL*100:.0f}% of the benefit is one input, so it is the only one worth stress-testing.')
print(f'   The sheet header reads "Contribution Margin". If the CFO applies one —')
print(f'   lost revenue is not lost profit — the whole case scales with it:')
print(f'   {"margin applied":>16}{"per fill":>13}{"3-yr @30%":>15}{"BCR org wide":>15}')
for margin in (1.00, 0.50, 0.30, 0.20):
    pf = HIRE_AVOIDED + REV_LOST * margin
    b3 = (fills[0.30] - fills[0.17]) * pf * 3
    lab = 'none (as built)' if margin == 1 else f'{margin*100:.0f}%'
    print(f'   {lab:>16}{m(pf):>13}{mm(b3):>15}{b3/costs["Org wide"]:>15.1f}')
print(f'   Even at a 20% contribution margin the org-wide case returns '
      f'{((fills[0.30]-fills[0.17])*(HIRE_AVOIDED+REV_LOST*0.20)*3)/costs["Org wide"]:.1f}x.')
print(f'   Also worth naming: the {DAYS_FASTER}-day gap is bands C+D combined, while the')
print(f'   hiring-cost line is band C alone. Band C on its own is 42 days (177 vs 135),')
print(f'   which would put revenue lost at {m(REV_PER_EMP_DAY*42)} and a fill at '
      f'{m(HIRE_AVOIDED + REV_PER_EMP_DAY*42)}.')

# ══ CHECK AGAINST THE WORKBOOK ════════════════════════════════════
CELLS = {   # tab v2 cell: value openpyxl reads
    'C33 hiring cost avoided':      (HIRE_AVOIDED,        31_989),
    'C36 revenue lost':             (REV_LOST,            391_230),
    'F48 value per fill':           (PER_FILL,            423_219),
    'E31 fills at 17%':             (fills[0.17],         57.120000000000005),
    'F31 fills at 30%':             (fills[0.30],         100.8),
    'G31 fills at 50%':             (fills[0.50],         168),
    'E38 total at 17%':             (total[0.17],         24_174_269.28),
    'F38 total at 30%':             (total[0.30],         42_660_475.2),
    'G38 total at 50%':             (total[0.50],         71_100_792),
    'F39 incremental at 30%':       (incr[0.30],          18_486_205.92),
    'G39 incremental at 50%':       (incr[0.50],          46_926_522.72),
    'F40 x3 at 30%':                (incr3[0.30],         55_458_617.76),
    'G40 x3 at 50%':                (incr3[0.50],         140_779_568.16),
    'L16 pilot 3-yr cost':          (costs['Pilot — IT, HR, Ops'], 2_058_953),
    'N16 org 3-yr cost':            (costs['Org wide'],   5_315_207),
    'Q16 non-mass 3-yr cost':       (costs['Non-mass only'], 2_191_976),
    'N19 Gloat org wide':           (max(70_000+12*20_470*3, 175_000)*FX, 49_222_120),
    'N20 Eightfold org wide':       (max(250_000+30*20_470*3, 480_000)*FX, 127_630_300),
    'L19 Gloat pilot':              (max(70_000+12*1_113*3, 175_000)*FX, 10_675_000),
    'L20 Eightfold pilot':          (max(250_000+30*1_113*3, 480_000)*FX, 29_280_000),
    'E50 payback, org wide':        (payback_simple(costs['Org wide'], B30), 3.4502744519898756),
    'E49 fills to break even':      (costs['Org wide']/PER_FILL, 12.558999005243146),
    'F18 rejected-cohort attrition':(REJ_ATTRITION,       0.2696245733788396),
}
bad = [(k, a, b) for k, (a, b) in CELLS.items() if abs(a - b) > max(1.0, abs(b) * 1e-9)]
print(f'\n══ CHECK — {len(CELLS)-len(bad)}/{len(CELLS)} cells reproduce tab v2 exactly ══')
for k, a, b in bad:
    print(f'   MISMATCH {k}: model {a:,.4f} vs sheet {b:,.4f}')
if not bad:
    print('   Every figure above is the workbook. The four departures are formula')
    print('   corrections, listed in the docstring and flagged where they appear:')
    print('     N17/Q17 per-employee cost divided by the wrong headcount')
    print('     Q19/Q20 vendor priced below the sheet\'s own contract minimum')
    print('     E50 payback ignores the build landing up front — ramped figure added')
    print('     B51 answered: benefit is org-wide, so only that column is a true BCR')
