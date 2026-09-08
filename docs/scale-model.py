# -*- coding: utf-8 -*-
"""What Growth costs at four population scopes.

The costed case in V2_CBA.md covers the 637-person pilot. This extends it by
scaling each run line by what actually drives it, and leaving the build alone
because the same software serves any of these populations.

    python3 docs/scale-model.py
"""
FX = 58.0
PILOT = 637

SCOPES = [
    ('Pilot — IT, Operations, HR',      637),
    ('Pilot + Mass Ops',              1_113),
    ('All non-mass',                  1_991),
    ('Full org',                     20_587),
]

# ── Build: one-time, costed by IT, and flat across every scope. ────────────
B1, B2 = 1_454_200, 331_300          # year 1 · year 2 (deferred referral engine)
BUILD = B1 + B2

# ── Run, per year, by what drives each line ───────────────────────────────
def run(n, year_two):
    # Supabase Pro at US$25/mo carries every scope but the full org, which
    # needs one compute tier up (planning assumption, US$60/mo add-on).
    supabase = (25 if n <= 2_000 else 85) * 12 * FX
    # Scoring is per opportunity against a shortlist, not every employee-post
    # pair — so this tracks headcount. Score every pair and it goes quadratic.
    claude = 22_065 * n / PILOT
    # One mailbox per person, same notification set.
    email = 8_700 * n / PILOT
    # Flat until log volume forces a bigger plan.
    monitoring = 6_960 * (1 if n <= 2_000 else 2)
    # HR analyst joining referrals against the HC Connect export, at P375/hr.
    # A join on a key does not scale with headcount; the exceptions do.
    hours = {637: 16, 1_113: 24, 1_991: 32, 20_587: 160}[n]
    recon = hours * 375 if year_two else 0
    return {'Supabase Pro + Auth': supabase, 'Claude API — Sonnet 5, batched': claude,
            'Transactional email': email, 'Monitoring and logging': monitoring,
            'Reconciliation — HR analyst': recon}

rows = []
for label, n in SCOPES:
    r1, r2 = sum(run(n, False).values()), sum(run(n, True).values())
    y1, y2, y3 = B1 + r1, B2 + r2, r2
    tco = y1 + y2 + y3
    rows.append((label, n, r1, r2, y1, y2, y3, tco, tco / n, tco / n / 3))

P = lambda v: '%,d' % round(v) if False else '{:,.0f}'.format(v)
w = max(len(r[0]) for r in rows)
print('scope'.ljust(w), 'people'.rjust(7), 'run Y1'.rjust(9), 'run Y2+'.rjust(9),
      'year 1'.rjust(10), 'year 2'.rjust(9), 'year 3'.rjust(8), '3-yr TCO'.rjust(10),
      'US$'.rjust(9), '/emp 3yr'.rjust(9), '/emp/yr'.rjust(8))
for label, n, r1, r2, y1, y2, y3, tco, pe, pey in rows:
    print(label.ljust(w), P(n).rjust(7), P(r1).rjust(9), P(r2).rjust(9), P(y1).rjust(10),
          P(y2).rjust(9), P(y3).rjust(8), P(tco).rjust(10), P(tco / FX).rjust(9),
          P(pe).rjust(9), P(pey).rjust(8))

print()
print('Run detail, year 2 onward:')
keys = list(run(637, True).keys())
print('  ' + 'line'.ljust(32) + ''.join(('%s' % l.split(' —')[0][:12]).rjust(12) for l, _ in SCOPES))
for k in keys:
    print('  ' + k.ljust(32) + ''.join(P(run(n, True)[k]).rjust(12) for _, n in SCOPES))

print()
print('Build is flat at P{:,.0f}; it is {:.0f}% of the pilot TCO and {:.0f}% of the full-org TCO.'
      .format(BUILD, 100 * BUILD / rows[0][7], 100 * BUILD / rows[3][7]))
print('Per employee per year falls from P{:,.0f} at pilot to P{:,.0f} at full org — {:.1f}x.'
      .format(rows[0][9], rows[3][9], rows[0][9] / rows[3][9]))
