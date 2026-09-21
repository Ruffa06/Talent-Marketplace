/* Growth — the demo film.
   A live walkthrough, not a slideshow: a visible cursor, real clicks, real
   typing, and one continuous journey — post, approve, profile, match, apply,
   manager release, host selection, close-out, dashboard.
   Beat lengths are the narration timings in SCRIPT.md, so cut and script
   cannot drift. Run from the repository root:
       node docs/demo/record.js <output-dir> */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const OUT = process.argv[2]

const BEATS = [
  { t: 7129,  cap: 'Home Credit fills 17% of its roles from the inside.\nGrowth is how that improves.' },
  { t: 11270, cap: 'Four ways to grow — a gig, an immersion, a service offer,\nand a permanent vacancy applied for in HC Connect.' },
  { t: 6179, cap: 'It starts with someone posting — a title, the work,\nand the skills it needs.' },
  { t: 3415,  cap: 'Nothing goes live until HR approves it.' },
  { t: 6170,  cap: 'Nobody begins with an empty profile — HR has already\nloaded what the company knows.' },
  { t: 3129,  cap: "You correct it. You don't begin from scratch." },
  { t: 5337,  cap: 'Every opportunity is scored against that profile,\nand shows its reasoning.' },
  { t: 6183,  cap: 'The score never blocks you.\nA stretch is a choice, not a permission.' },
  { t: 6044, cap: 'You apply in one click — and your manager releases\nthe time before anything starts.' },
  { t: 4945,  cap: 'The host sees what each applicant has finished,\nand who vouched for it.' },
  { t: 6845,  cap: 'At the end, the host rates the work.\nFour stars verifies the skills it used.' },
  { t: 12758,  cap: 'The admin dashboard gives a snapshot of the platform’s progress.\n16 internal hires. ₱5.6M we did not spend on recruitment.' },
  { t: 9936,  cap: 'Opportunities people can see. Skills we can prove.\nThis is Growth — where talent meets opportunities intelligently.' },
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

  /* Chrome renders no cursor into a recording, so the film draws its own.
     Without it every click looks like a jump cut. */
  await pg.addStyleTag({ content: `
    #filmCur { position:fixed; z-index:100001; width:22px; height:22px; margin:-2px 0 0 -2px;
      pointer-events:none; transition:left .3s cubic-bezier(.4,.0,.2,1), top .3s cubic-bezier(.4,.0,.2,1);
      filter:drop-shadow(0 2px 4px rgba(0,0,0,.45)); left:640px; top:380px; }
    #filmRip { position:fixed; z-index:100000; width:16px; height:16px; margin:-8px 0 0 -8px;
      border-radius:50%; background:rgba(192,0,0,.45); pointer-events:none; opacity:0; transform:scale(.4); }
    #filmRip.go { animation:filmRip .5s ease-out; }
    @keyframes filmRip { 0%{opacity:.9;transform:scale(.4)} 100%{opacity:0;transform:scale(3.2)} }
    #filmCap { position:fixed; left:0; right:0; bottom:0; z-index:99999;
      background:linear-gradient(transparent,rgba(9,12,18,.93) 42%); color:#fff;
      font:600 21px/1.45 Arial,sans-serif; padding:52px 64px 26px; text-align:center;
      white-space:pre-line; text-shadow:0 2px 10px rgba(0,0,0,.6); opacity:0;
      transition:opacity .4s; pointer-events:none; }
    #filmProg { position:fixed; left:0; bottom:0; height:3px; background:#C00000; width:0;
      z-index:100002; transition:width .3s linear; pointer-events:none; }` })
  await pg.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend',
      '<svg id="filmCur" viewBox="0 0 24 24"><path d="M5 2l14 10.5-6.2.6 3.4 7-2.6 1.2-3.3-7L5 18.6z" fill="#fff" stroke="#111827" stroke-width="1.4" stroke-linejoin="round"/></svg>' +
      '<div id="filmRip"></div><div id="filmCap"></div><div id="filmProg"></div>')
    window.__cur = (x, y) => {
      const c = document.getElementById('filmCur'); c.style.left = x + 'px'; c.style.top = y + 'px'
    }
    window.__rip = (x, y) => {
      const r = document.getElementById('filmRip')
      r.style.left = x + 'px'; r.style.top = y + 'px'
      r.classList.remove('go'); void r.offsetWidth; r.classList.add('go')
    }
    window.__cap = (t, p) => {
      const el = document.getElementById('filmCap')
      el.style.opacity = '0'
      setTimeout(() => { el.textContent = t; el.style.opacity = '1' }, 150)
      document.getElementById('filmProg').style.width = p + '%'
    }
  })

  const box = async sel => {
    const el = await pg.$(sel); if (!el) return null
    await el.scrollIntoViewIfNeeded()
    await pg.waitForTimeout(140)
    return el.boundingBox()
  }
  const point = async sel => {                       // glide the cursor to something
    const bb = await box(sel); if (!bb) return null
    const x = Math.round(bb.x + bb.width / 2), y = Math.round(bb.y + Math.min(bb.height / 2, 22))
    await pg.evaluate(([a, b]) => window.__cur(a, b), [x, y])
    await pg.waitForTimeout(320)
    return { x, y, sel }
  }
  const tap = async sel => {                         // …and press it for real
    const p = await point(sel); if (!p) { console.log('MISS ' + sel); return false }
    await pg.evaluate(([a, b]) => window.__rip(a, b), [p.x, p.y])
    await pg.waitForTimeout(110)
    await pg.click(sel).catch(e => console.log('CLICK FAIL ' + sel))
    await pg.waitForTimeout(190)
    return true
  }
  const write = async (sel, text, ms) => {           // typed, not pasted
    if (!(await tap(sel))) return
    await pg.fill(sel, '')
    await pg.type(sel, text, { delay: ms || 12 })
  }
  /* The app is a flex shell — body never scrolls, .content does. Scrolling
     the window here is a silent no-op, which is exactly how it was missed. */
  const glide = y => pg.evaluate(v => {
    const c = document.querySelector('.content') || document.scrollingElement
    c.scrollTo({ top: v, behavior: 'smooth' })
  }, y)
  const glideTo = async (sel, pad) => {               // put a thing below the top chrome
    const y = await pg.evaluate(([s, p]) => {
      const c = document.querySelector('.content'), el = document.querySelector(s)
      if (!c || !el) return 0
      return c.scrollTop + el.getBoundingClientRect().top - c.getBoundingClientRect().top - (p || 110)
    }, [sel, pad])
    await glide(Math.max(0, Math.round(y)))
  }

  const total = BEATS.reduce((a, x) => a + x.t, 0)
  let done = 0, t0 = Date.now()
  const beat = async (i, act) => {
    const start = Date.now()
    await pg.evaluate(([c, p]) => window.__cap(c, p),
      [BEATS[i].cap, Math.round((done + BEATS[i].t) / total * 100)])
    if (act) await act()
    const left = BEATS[i].t - (Date.now() - start)
    if (left > 0) await pg.waitForTimeout(left)
    else console.log('OVER beat ' + (i + 1) + ' by ' + (-left) + 'ms')
    done += BEATS[i].t
  }

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
    await pg.evaluate(() => { setRole('admin'); navigate('admin-opps') })
    await pg.waitForTimeout(500)
    await tap('#liveQueue .btn-green')
  })
  // 5 · the profile arrives populated
  await beat(4, async () => {
    await pg.evaluate(() => { setRole('employee'); navigate('profile') })
    await pg.waitForTimeout(400); await glideTo('#current-skills', 150)
  })
  // 6 · you correct it
  await beat(5, async () => { await point('#current-skills .skill-chip') })
  // 7 · scored, and it explains itself
  await beat(6, async () => {
    await pg.evaluate(() => navigate('matches')); await pg.waitForTimeout(400)
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(600)
    const s = await pg.$('#matchGrid .why-match'); if (s) { await point('#matchGrid .why-match'); await s.hover() }
  })
  // 8 · nothing is hidden
  await beat(7, async () => {
    await pg.evaluate(() => navigate('all-opps')); await pg.waitForTimeout(300)
    await glideTo('#page-all-opps .opp-grid', 90)
  })
  // 9 · apply, and the manager releases the time
  await beat(8, async () => {
    await pg.evaluate(() => navigate('matches')); await pg.waitForTimeout(300)
    await glideTo('#matchGrid', 90); await pg.waitForTimeout(400)
    await tap('#matchGrid .btn-red')
    await write('#applyEssay', 'I rebuilt our headcount model this year.', 11)
    await tap('#applyMgrAware')
    await tap('button[onclick^="submitApplication"]')
  })
  // 10 · the host reads the evidence
  await beat(9, async () => {
    await pg.evaluate(() => { setRole('manager'); navigate('openings') })
    await pg.waitForTimeout(450)
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
    await pg.evaluate(() => { const o = document.querySelector('[data-overlay]'); if (o) o.remove()
      setRole('admin'); navigate('dashboard') })
    await pg.waitForTimeout(400); await glide(0)
    await point('#page-dashboard .tipq')
    await pg.waitForTimeout(2600)
    await glide(360); await pg.waitForTimeout(2200)   // the vacancy contribution row
    await glide(760)
  })
  // 13 · close
  await beat(12, async () => {
    await pg.evaluate(() => { setRole('manager'); navigate('home') })
    await pg.waitForTimeout(2800)
    await glideTo('#page-home .growth-grid-4', 120)   // the shelves once more
    await pg.waitForTimeout(3200)
    await glide(0)                                    // and back to the hero
  })

  await ctx.close(); await b.close()
  console.log('beats ' + (total / 1000) + 's · wall ' + ((Date.now() - t0) / 1000).toFixed(1) + 's')
})()
