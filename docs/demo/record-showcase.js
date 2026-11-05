/* Growth — the showcase film (2:01).

   The longer cut, for an audience meeting the product for the first time: it
   opens on the problem, walks the whole journey once in order — post, HR
   approval, a profile that is already filled in, matching, the weekly digest,
   applying, manager sign-off, the conversation, the host's choice, the rating
   — and closes on what a manager and HR each see out the other end.

   Beat lengths are the spoken lengths of each line in SHOWCASE.md, so the cut
   and the script cannot drift. Run from the repository root:
       node docs/demo/record-showcase.js <output-dir>
   then cut it to the voice:
       python3 docs/demo/cut.py <out>/*.webm narration.mp3 docs/demo \
           docs/demo/record-showcase.js */
const film = require('./film')
const OUT = process.argv[2]

const BEATS = [
  { t: 8571, cap: 'Home Credit fills more than 8 in 10 roles from outside.\nThe talent was already inside.' },
  { t: 7857, cap: 'Four ways to move — a gig, an immersion,\na service offer, and a permanent vacancy.' },
  { t: 8214, cap: 'One path through all of them: profile, match, apply,\nsign-off, the work, on record.' },
  { t: 6429, cap: 'It starts with someone posting —\nten minutes, no requisition.' },
  { t: 5357, cap: 'Nothing goes live until HR approves it.' },
  { t: 5357, cap: 'Nobody starts with an empty profile — HR has already\nloaded what the company knows.' },
  { t: 10000, cap: 'Verified by a manager, uploaded by HR from MyDevelopment,\nor added by you. You don\u2019t begin from scratch.' },
  { t: 7500, cap: 'Every opportunity is scored against that profile —\nand it shows its reasoning.' },
  { t: 6429, cap: 'Like LinkedIn, your top matches\narrive in your email every week.' },
  { t: 4643, cap: 'The score never blocks you.\nA stretch is a choice, not a permission.' },
  { t: 11071, cap: 'Anyone can nominate anyone — and the top referrer\neach quarter wins a prize.' },
  { t: 6786, cap: 'One click to apply — and your manager releases\nthe time before anything starts.' },
  { t: 6071, cap: 'You always know where you stand — in review,\nscheduled, accepted, and a no comes with reasons.' },
  { t: 6071, cap: 'The host chooses on evidence — what you finished,\nand who vouched for it.' },
  { t: 6071, cap: 'The host rates the work, and that rating\nverifies the skill on your record.' },
  { t: 5000, cap: "Managers see their whole team's growth\nin one place." },
  { t: 8571, cap: 'Admin sees it in real time — transactions made,\ncareers impacted, and what it saved Home Credit.' },
  { t: 2857, cap: 'This is Growth — where talent meets\nopportunity, intelligently.' },
]

;(async () => {
  const { pg, beat, point, tap, write, glide, glideTo, go, close } = await film.open(OUT, BEATS)
  const shut = () => pg.evaluate(() => {
    const o = document.querySelector('[data-overlay]'); if (o) o.remove()
  })

  await tap('.btn-login')

  // 1 · the problem
  await beat(0)
  // 2 · four ways to move
  await beat(1, async () => { await glideTo('#page-home .growth-grid-4', 120) })
  // 3 · one path through all of them
  await beat(2, async () => { await glideTo('#page-home .flow', 110) })
  // 4 · a manager posts
  await beat(3, async () => {
    await tap('#nav-post')
    await write('#postTitle', 'Workforce Planning Sprint — FY27', 11)
    await write('#postEffort', '~20 hours', 11)
    await glide(420)
  })
  // 5 · HR approves it
  await beat(4, async () => {
    await tap('button.btn-red[onclick="submitOpportunity()"]')
    await go('admin-opps', 'admin')
    await tap('#liveQueue .btn-green')
  })
  // 6 · the profile arrives populated
  await beat(5, async () => {
    await go('profile', 'employee')
    await glideTo('#current-skills', 150)
  })
  // 7 · where each skill came from, and you correct it
  await beat(6, async () => {
    const chip = await pg.$('#current-skills .skill-chip')
    if (chip) { await point('#current-skills .skill-chip'); await chip.hover() }
    await pg.waitForTimeout(3000)
    await glide(640)                                  // skills I want to develop
  })
  // 8 · scored, and it explains itself
  await beat(7, async () => {
    await go('matches')
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(600)
    const s = await pg.$('#matchGrid .why-match'); if (s) { await point('#matchGrid .why-match'); await s.hover() }
  })
  // 9 · and the matches come to you
  await beat(8, async () => {
    await go('notifications')
    await point('#page-notifications .notif-item')
  })
  // 10 · nothing is hidden
  await beat(9, async () => {
    await go('all-opps')
    await glideTo('#page-all-opps .opp-grid', 90)
  })
  // 11 · anyone can put anyone else forward, and it is worth something
  await beat(10, async () => {
    await tap('#page-all-opps button[onclick^="openNominateDialog"]')
    await pg.waitForTimeout(3200)
    await shut()
    await go('nominations', 'employee')
    await pg.waitForTimeout(2400)
    await glide(300)                                  // the nominations you have made
  })
  // 12 · apply, and the manager releases the time
  await beat(11, async () => {
    await go('matches')
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(300)
    await tap('#matchGrid .btn-red')
    await write('#applyEssay', 'I rebuilt our headcount model this year.', 11)
    await tap('#applyMgrAware')
    await tap('button[onclick^="submitApplication"]')
  })
  // 13 · you always know where you stand
  await beat(12, async () => {
    await go('applications')
    await pg.waitForTimeout(1500)
    await glide(300); await pg.waitForTimeout(1500)   // conversation scheduled
    await glide(700)                                  // accepted, and a no with reasons
  })
  // 14 · the host reads the evidence
  await beat(13, async () => {
    await go('openings', 'manager')
    await tap('#actions-cr .btn-outline')
  })
  // 15 · close-out, and the rating that verifies a skill
  await beat(14, async () => {
    await shut()
    await pg.waitForTimeout(200)
    await tap('#page-openings .btn-amber')
    await pg.waitForTimeout(400)
    await tap('[data-star="5"]')
  })
  // 16 · what a manager sees
  await beat(15, async () => {
    await go('team', 'manager')
    await glide(260)
  })
  // 17 · what admin sees, in real time
  await beat(16, async () => {
    await go('dashboard', 'admin')
    await glide(0)
    await point('#page-dashboard .tipq')
    await pg.waitForTimeout(3000)
    await glide(360)
  })
  // 18 · close
  await beat(17, async () => {
    await go('home', 'manager')
    await glide(0)
  })

  await close()
})()
