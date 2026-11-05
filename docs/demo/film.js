/* The film rig — shared by every recorder in this folder.

   Chrome renders no cursor into a screencast, so the film draws its own: a
   cursor that glides, a ripple where it presses, a caption bar and a progress
   line. Without them a click looks like a jump cut and the viewer loses the
   thread.

   A recorder supplies BEATS — a spoken line's length in ms and the caption
   that runs under it — and a sequence of actions. Beat lengths come from the
   delivered narration, so the cut and the script cannot drift. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')

const CSS = `
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
    z-index:100002; transition:width .3s linear; pointer-events:none; }`

async function open (out, BEATS) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: out, size: { width: 1280, height: 720 } },
    deviceScaleFactor: 1,
  })
  const pg = await ctx.newPage()
  pg.on('pageerror', e => console.log('PAGE ERROR: ' + e.message))
  await pg.goto('file://' + process.cwd() + '/prototype/talent-marketplace-v2.html')

  await pg.addStyleTag({ content: CSS })
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
    await pg.click(sel).catch(() => console.log('CLICK FAIL ' + sel))
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
  const glideTo = async (sel, pad) => {              // put a thing below the top chrome
    const y = await pg.evaluate(([s, p]) => {
      const c = document.querySelector('.content'), el = document.querySelector(s)
      if (!c || !el) return 0
      return c.scrollTop + el.getBoundingClientRect().top - c.getBoundingClientRect().top - (p || 110)
    }, [sel, pad])
    await glide(Math.max(0, Math.round(y)))
  }
  const go = async (page, role) => {                 // jump straight to a page
    await pg.evaluate(([p, r]) => {
      const o = document.querySelector('[data-overlay]'); if (o) o.remove()
      if (r) setRole(r)
      navigate(p)
    }, [page, role])
    await pg.waitForTimeout(400)
  }

  const total = BEATS.reduce((a, x) => a + x.t, 0)
  let done = 0
  const t0 = Date.now()
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
  const close = async () => {
    await ctx.close(); await browser.close()
    console.log('beats ' + (total / 1000) + 's · wall ' + ((Date.now() - t0) / 1000).toFixed(1) + 's')
  }

  return { pg, beat, point, tap, write, glide, glideTo, go, close }
}

module.exports = { open }
