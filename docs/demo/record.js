const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const OUT = process.argv[2]

const BEATS = [
  { t: 7000, cap: 'Home Credit fills 17% of its roles from the inside.\nGrowth is how that changes.' },
  { t: 9000, cap: 'Four ways to move — a gig, an immersion, a service offer,\nand permanent roles applied for in HC Connect.' },
  { t: 8000, cap: 'Nobody begins with an empty profile.' },
  { t: 8000, cap: 'HR loads what the company already knows:\nHC Connect, MyDevelopment, and your public LinkedIn skills.' },
  { t: 5000, cap: "You correct it. You don't write it." },
  { t: 8000, cap: 'Every opportunity is scored against that profile —\nand shows its reasoning.' },
  { t: 7000, cap: 'The score never blocks you. Every opportunity stays visible.\nA stretch is a choice, not a permission.' },
  { t: 5000, cap: 'A host sees what each applicant has finished,\nand who vouched for it.' },
  { t: 3000, cap: 'Work people can see. Skills we can prove.' },
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

  // Caption bar, injected so it is part of the recording and styled like the app.
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
      setTimeout(() => { el.textContent = text; el.style.opacity = '1' }, 260)
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

  // 1 · hero
  await beat(0)
  // 2 · the four shelves
  await beat(1, async () => { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.evaluate(() => {
    const el = [...document.querySelectorAll('#page-home div')].find(d => d.textContent.trim().startsWith('Three ways to grow here'))
    if (el) el.scrollIntoView({ block: 'start' }) }) })
  // 3 · seeded profile
  await beat(2, async () => { await pg.evaluate(() => { navigate('profile'); window.scrollTo(0, 420) }) })
  // 4 · where the data comes from
  await beat(3, async () => { await pg.evaluate(() => { setRole('admin'); navigate('admin-skills'); window.scrollTo(0, 260) }) })
  // 5 · provenance
  await beat(4, async () => {
    await pg.evaluate(() => { setRole('employee'); navigate('profile'); window.scrollTo(0, 470) })
  })
  // 6 · scored, with reasoning
  await beat(5, async () => {
    await pg.evaluate(() => { navigate('matches'); window.scrollTo(0, 980) })
    await pg.waitForTimeout(500)
    const s = await pg.$('#matchGrid .why-match')
    if (s) await s.hover()
  })
  // 7 · nothing is hidden
  await beat(6, async () => { await pg.evaluate(() => { navigate('all-opps'); window.scrollTo(0, 560) }) })
  // 8 · the host's side
  await beat(7, async () => {
    await pg.evaluate(() => { setRole('manager'); navigate('openings') })
    await pg.waitForTimeout(400)
    await pg.evaluate(() => openApplicantProfile('Cristiano Ronaldo', 'DJI: Business Intelligence — FP&A Team'))
  })
  // 9 · close
  await beat(8, async () => {
    await pg.evaluate(() => { const o = document.querySelector('[data-overlay]'); if (o) o.remove(); navigate('home'); window.scrollTo(0, 0) })
  })

  await ctx.close(); await b.close()
  console.log('recorded ~' + Math.round(total / 1000) + 's')
})()
