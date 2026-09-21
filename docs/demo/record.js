/* Growth — the demo film.
   Shot against the real prototype: every screen is the app doing the thing
   the caption describes. Beat durations are the narration timings from
   SCRIPT.md, so the cut and the script cannot drift apart.
   Run: node docs/demo/record.js <output-dir>   (from the repository root) */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const OUT = process.argv[2]

const BEATS = [
  { t: 7750, cap: 'Home Credit fills 17% of its roles from the inside.\nGrowth is how that changes.' },
  { t: 12360, cap: 'Four ways to move — a gig, an immersion, a service offer,\nand permanent roles applied for in HC Connect.' },
  { t: 3685, cap: 'Nobody begins with an empty profile.' },
  { t: 8952, cap: 'HR loads what the company already knows: HC Connect,\nMyDevelopment, your public LinkedIn skills.' },
  { t: 3867, cap: "You correct it. You don't write it." },
  { t: 6103, cap: 'Every opportunity is scored against that profile —\nand shows its reasoning.' },
  { t: 8598, cap: 'The score never blocks you. Every opportunity stays visible.\nA stretch is a choice, not a permission.' },
  { t: 6677, cap: 'Anyone can post. Five minutes, and HR approves it\nbefore it goes live.' },
  { t: 5704, cap: 'A host sees what each applicant has finished,\nand who vouched for it.' },
  { t: 7643, cap: 'HR sees the whole pilot — what is waiting, what has gone stale,\nwhat it has been worth.' },
  { t: 3982, cap: 'Every figure downloads as the rows behind it.' },
  { t: 4434, cap: 'People rate the product itself, one to five.' },
  { t: 4581, cap: 'The questions people actually ask are answered in the app.' },
  { t: 4661, cap: 'Work people can see. Skills we can prove.' },
]

;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
    deviceScaleFactor: 1,
  })
  const pg = await ctx.newPage()
  pg.on('pageerror', e => console.log('PAGE ERROR: ' + e.message))
  await pg.goto('file://' + process.cwd() + '/prototype/talent-marketplace-v2.html')
  await pg.click('.btn-login')

  await pg.evaluate(() => {
    const d = document.createElement('div')
    d.id = 'filmCap'
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;' +
      'background:linear-gradient(transparent,rgba(9,12,18,.93) 42%);color:#fff;' +
      'font:600 21px/1.45 Arial,sans-serif;padding:52px 64px 26px;text-align:center;' +
      'white-space:pre-line;letter-spacing:.1px;text-shadow:0 2px 10px rgba(0,0,0,.6);' +
      'opacity:0;transition:opacity .45s;pointer-events:none;'
    document.body.appendChild(d)
    const p = document.createElement('div')
    p.id = 'filmProg'
    p.style.cssText = 'position:fixed;left:0;bottom:0;height:3px;background:#C00000;' +
      'width:0;z-index:100000;transition:width .3s linear;pointer-events:none;'
    document.body.appendChild(p)
    window.__cap = (text, pct) => {
      const el = document.getElementById('filmCap')
      el.style.opacity = '0'
      setTimeout(() => { el.textContent = text; el.style.opacity = '1' }, 150)
      document.getElementById('filmProg').style.width = pct + '%'
    }
  })

  const total = BEATS.reduce((a, x) => a + x.t, 0)
  let done = 0
  const beat = async (i, setup) => {
    if (setup) await setup()
    done += BEATS[i].t
    await pg.evaluate(([c, p]) => window.__cap(c, p), [BEATS[i].cap, Math.round(done / total * 100)])
    await pg.waitForTimeout(BEATS[i].t)
  }
  const go = (role, page, y) => pg.evaluate(([r, p, s]) => {
    if (r) setRole(r); navigate(p); window.scrollTo(0, s || 0)
  }, [role, page, y])

  await beat(0)                                                   // hero
  await beat(1, async () => { await pg.evaluate(() => {           // the four shelves
    const el = [...document.querySelectorAll('#page-home div')]
      .find(d => d.textContent.trim().startsWith('Three ways to grow here'))
    if (el) el.scrollIntoView({ block: 'start' }) }) })
  await beat(2, () => go('employee', 'profile', 430))             // seeded profile
  await beat(3, () => go('admin', 'admin-skills', 250))           // the four sources
  await beat(4, () => go('employee', 'profile', 470))             // provenance
  await beat(5, async () => {                                     // scored, with reasoning
    await go(null, 'matches', 980); await pg.waitForTimeout(500)
    const s = await pg.$('#matchGrid .why-match'); if (s) await s.hover()
  })
  await beat(6, () => go(null, 'all-opps', 560))                  // nothing hidden
  await beat(7, () => go('manager', 'post', 260))                 // posting
  await beat(8, async () => {                                     // the host's side
    await go(null, 'openings', 0); await pg.waitForTimeout(400)
    await pg.evaluate(() => openApplicantProfile('Cristiano Ronaldo', 'DJI: Business Intelligence — FP&A Team'))
  })
  await beat(9, async () => {                                     // the HR dashboard
    await pg.evaluate(() => { const o = document.querySelector('[data-overlay]'); if (o) o.remove() })
    await go('admin', 'dashboard', 0)
  })
  await beat(10, () => go(null, 'dashboard', 640))                // raw report export
  await beat(11, () => go(null, 'rate', 0))                       // rating the product
  await beat(12, async () => {                                    // the FAQ
    await go('employee', 'faq', 120); await pg.waitForTimeout(300)
    await pg.evaluate(() => { const d = document.querySelectorAll('#page-faq details'); if (d[3]) d[3].open = true })
  })
  await beat(13, () => go('manager', 'home', 0))                  // close

  await ctx.close(); await b.close()
  console.log('recorded ~' + Math.round(total / 1000) + 's of beats')
})()
