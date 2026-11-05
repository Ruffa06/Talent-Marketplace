/* Growth — the panel walkthrough (1:23).

   A live walkthrough, not a slideshow: a visible cursor, real clicks, real
   typing, and one continuous journey — post, approve, profile, match, apply,
   manager release, host selection, close-out, dashboard.
   Beat lengths are the narration timings in SCRIPT.md, so cut and script
   cannot drift. Run from the repository root:
       node docs/demo/record.js <output-dir>
   then cut it to the voice:
       python3 docs/demo/cut.py <out>/*.webm narration.mp3 docs/demo */
const film = require('./film')
const OUT = process.argv[2]

const BEATS = [
  { t: 6088,  cap: 'Home Credit fills 17% of its roles from the inside.\nGrowth is how that improves.' },
  { t: 9763, cap: 'Four ways to grow — a gig, an immersion, a service offer,\nand a permanent vacancy applied for in HC Connect.' },
  { t: 6085, cap: 'It starts with someone posting — a title, the work,\nand the skills it needs.' },
  { t: 3127,  cap: 'Nothing goes live until HR approves it.' },
  { t: 5882,  cap: 'Nobody begins with an empty profile — HR has already\nloaded what the company knows.' },
  { t: 3834,  cap: "You correct it. You don't begin from scratch." },
  { t: 4701,  cap: 'Every opportunity is scored against that profile,\nand shows its reasoning.' },
  { t: 5957,  cap: 'The score never blocks you.\nA stretch is a choice, not a permission.' },
  { t: 5646, cap: 'You apply in one click — and your manager releases\nthe time before anything starts.' },
  { t: 4505,  cap: 'The host sees what each applicant has finished,\nand who vouched for it.' },
  { t: 6300,  cap: 'At the end, the host rates the work.\nFour stars verifies the skills it used.' },
  { t: 11345,  cap: 'The admin dashboard gives a snapshot of the platform’s progress.\n16 internal hires. ₱5.6M we did not spend on recruitment.' },
  { t: 9967,  cap: 'Opportunities people can see. Skills we can prove.\nThis is Growth — where talent meets opportunities intelligently.' },
]

;(async () => {
  const { pg, beat, point, tap, write, glide, glideTo, go, close } = await film.open(OUT, BEATS)

  await tap('.btn-login')

  // 1 · the problem
  await beat(0)
  // 2 · four shelves, vacancy among them
  await beat(1, async () => { await glideTo('#page-home .growth-grid-4', 120) })
  // 3 · a manager posts
  await beat(2, async () => {
    await tap('#nav-post')
    await write('#postTitle', 'Workforce Planning Sprint — FY27', 11)
    await write('#postEffort', '~20 hours', 11)
    await glide(420)
  })
  // 4 · HR approves it
  await beat(3, async () => {
    await tap('button.btn-red[onclick="submitOpportunity()"]')
    await go('admin-opps', 'admin')
    await tap('#liveQueue .btn-green')
  })
  // 5 · the profile arrives populated
  await beat(4, async () => {
    await go('profile', 'employee')
    await glideTo('#current-skills', 150)
  })
  // 6 · you correct it
  await beat(5, async () => { await point('#current-skills .skill-chip') })
  // 7 · scored, and it explains itself
  await beat(6, async () => {
    await go('matches')
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(600)
    const s = await pg.$('#matchGrid .why-match'); if (s) { await point('#matchGrid .why-match'); await s.hover() }
  })
  // 8 · nothing is hidden
  await beat(7, async () => {
    await go('all-opps')
    await glideTo('#page-all-opps .opp-grid', 90)
  })
  // 9 · apply, and the manager releases the time
  await beat(8, async () => {
    await go('matches')
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(400)
    await tap('#matchGrid .btn-red')
    await write('#applyEssay', 'I rebuilt our headcount model this year.', 11)
    await tap('#applyMgrAware')
    await tap('button[onclick^="submitApplication"]')
  })
  // 10 · the host reads the evidence
  await beat(9, async () => {
    await go('openings', 'manager')
    await tap('#actions-cr .btn-outline')
  })
  // 11 · close-out, and the rating that verifies a skill
  await beat(10, async () => {
    await pg.evaluate(() => { const o = document.querySelector('[data-overlay]'); if (o) o.remove() })
    await pg.waitForTimeout(200)
    await tap('#page-openings .btn-amber')
    await pg.waitForTimeout(400)
    await tap('[data-star="5"]')
  })
  // 12 · what it added up to
  await beat(11, async () => {
    await go('dashboard', 'admin')
    await glide(0)
    await point('#page-dashboard .tipq')
    await pg.waitForTimeout(2600)
    await glide(360); await pg.waitForTimeout(2200)   // the vacancy contribution row
    await glide(760)
  })
  // 13 · close
  await beat(12, async () => {
    await go('home', 'manager')
    await pg.waitForTimeout(2400)
    await glideTo('#page-home .growth-grid-4', 120)   // the shelves once more
    await pg.waitForTimeout(3200)
    await glide(0)                                    // and back to the hero
  })

  await close()
})()
