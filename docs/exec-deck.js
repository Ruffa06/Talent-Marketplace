/* Growth — executive ALP deck.  Arial throughout, minimum 14pt.
   Numbers come from docs/exec-model.py. Detail lives in the speaker notes:
   the slides are a visual aid, not a handout. */
const pptx = require('pptxgenjs')
const fs = require('fs')
const p = new pptx()
p.layout = 'LAYOUT_WIDE'                       // 13.333 x 7.5
p.author = 'Ruffa Gayla Gonzales'
p.company = 'Home Credit Philippines'
p.title = 'Growth — a talent marketplace for Home Credit PH'

/* ── palette: Home Credit red on warm neutrals ──────────────────── */
const RED='C00000', RED2='D8272C', REDT='FDF0F0', REDD='9B0000'
const INK='222834', BODY='4B5363', MUTE='858D9B'
const CREAM='FCFAF6', SAND='F6F2EA', SANDD='E9E1D3', LINE='E7E1D7'
const TEAL='0E7C66', TEALT='E8F4F0'
const GOLD='9E6B12', GOLDT='FBF2E0'
const SLATE='5A6473', SLATET='EFF1F4'
const WHITE='FFFFFF'
const F='Arial'
const W=13.333, H=7.5, M=0.62, CW=W-2*M

const img = f => ({ data:'image/png;base64,'+fs.readFileSync(__dirname+'/'+f).toString('base64') })
const soft = () => ({ type:'outer', color:'8A7A62', blur:12, offset:2, angle:90, opacity:0.11 })

/* ── overflow auditor ───────────────────────────────────────────── */
let N = 0
const WARN = []
function estHeight(txt, w, fs, bold, ls) {
  const cpi = w / ((fs/72) * (bold ? 0.545 : 0.50))
  let lines = 0
  String(txt).split('\n').forEach(para => {
    const words = para.split(/\s+/).filter(Boolean)
    if (!words.length) { lines += 1; return }
    let cur = 0, n = 1
    words.forEach(wd => {
      const add = cur ? wd.length + 1 : wd.length
      if (cur + add > cpi && cur) { n++; cur = wd.length } else cur += add
    })
    lines += n
  })
  return lines <= 1 ? fs * 1.16 / 72 : lines * ((ls || fs * 1.20) / 72)
}
const next = (bg) => {
  const s = p.addSlide()
  s.background = { color: bg || WHITE }
  const raw = s.addText.bind(s)
  s.addText = function (t, o) {
    const txt = Array.isArray(t) ? t.map(r => r.text).join('') : String(t)
    if (o && o.w && o.h && !o.bullet) {
      const need = estHeight(txt, o.w, o.fontSize || 18, o.bold, o.lineSpacing)
      if (need > o.h * 1.06 + 0.04) {
        const fs = o.fontSize || 18
        const cpi = o.w / ((fs/72) * (o.bold ? 0.545 : 0.50))
        const maxLines = Math.floor((o.h + 0.02) / ((o.lineSpacing || fs*1.20)/72))
        WARN.push('s' + N + ' | ' + txt.length + ' chars, fits ' +
          Math.max(0, Math.floor(cpi*maxLines*0.94)) + ' | ' + txt.slice(0,46).replace(/\s+/g,' '))
      }
    }
    return raw(t, o)
  }
  return s
}

/* ── chrome ─────────────────────────────────────────────────────── */
function head(s, eyebrow, title, sub) {
  s.addShape(p.ShapeType.rect, { x:M, y:0.46, w:0.46, h:0.075, fill:{ color:RED }, line:{ width:0 } })
  s.addText(eyebrow.toUpperCase(), { x:M+0.60, y:0.37, w:CW-0.6, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:2.4, isTextBox:true, margin:0, valign:'middle' })
  s.addText(title, { x:M, y:0.76, w:CW, h:0.62, fontFace:F, fontSize:title.length>52?29:33,
    bold:true, color:INK, isTextBox:true, margin:0, valign:'top' })
  if (sub) s.addText(sub, { x:M, y:1.42, w:CW*0.86, h:0.34, fontFace:F, fontSize:16,
    color:MUTE, isTextBox:true, margin:0, valign:'top' })
}
function pageNo(s, col) {
  s.addText(String(N), { x:W-M-0.5, y:H-0.52, w:0.5, h:0.28, fontFace:F, fontSize:14,
    color:col||'ADA69A', align:'right', isTextBox:true, margin:0 })
}
function src(s, txt) {
  s.addText(txt, { x:M, y:H-0.56, w:CW-0.7, h:0.36, fontFace:F, fontSize:14, color:'A69E92',
    lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
}
function logoTile(s, x, y, d) {
  s.addShape(p.ShapeType.roundRect, { x, y, w:d, h:d, rectRadius:0.22,
    fill:{ color:RED }, line:{ width:0 } })
  s.addImage(Object.assign(img('mark-white.png'),
    { x:x+d*0.18, y:y+d*0.18, w:d*0.64, h:d*0.64 }))
}
const card = (s,o) => s.addShape(p.ShapeType.roundRect, Object.assign({
  rectRadius:0.04, fill:{ color:WHITE }, line:{ color:LINE, width:1 }, shadow:soft() }, o))
const panel = (s,o,c) => s.addShape(p.ShapeType.roundRect, Object.assign({
  rectRadius:0.04, fill:{ color:c||SAND }, line:{ width:0 } }, o))
const rule = (s,x,y,w,c) => s.addShape(p.ShapeType.line,
  { x, y, w, h:0, line:{ color:c||LINE, width:1 } })

/* A big editorial figure with a label underneath. */
function figure(s, x, y, w, big, lbl, col, size) {
  s.addText(big, { x, y, w, h:0.62, fontFace:F, fontSize:size||44, bold:true, color:col||INK,
    isTextBox:true, margin:0, valign:'middle' })
  s.addText(lbl, { x, y:y+0.62, w, h:0.52, fontFace:F, fontSize:15, color:BODY,
    lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
}
/* Numbered step chip used on the plan slides. */
function chip(s, x, y, n, fill) {
  s.addShape(p.ShapeType.ellipse, { x, y, w:0.40, h:0.40, fill:{ color:fill||RED }, line:{ width:0 } })
  s.addText(String(n), { x, y, w:0.40, h:0.40, fontFace:F, fontSize:15, bold:true, color:WHITE,
    align:'center', valign:'middle', isTextBox:true, margin:0 })
}

/* ═══ 1 · TITLE ═════════════════════════════════════════════════ */
{
  const s = next(CREAM); N++
  s.addShape(p.ShapeType.rect, { x:0, y:0, w:0.30, h:H, fill:{ color:RED }, line:{ width:0 } })
  logoTile(s, 1.15, 1.22, 0.92)
  s.addText('Growth', { x:1.15, y:2.34, w:9, h:1.05, fontFace:F, fontSize:62, bold:true,
    color:INK, isTextBox:true, margin:0, valign:'middle' })
  s.addText('An internal talent marketplace for Home Credit Philippines',
    { x:1.15, y:3.42, w:9.4, h:0.42, fontFace:F, fontSize:20, color:BODY,
      isTextBox:true, margin:0, valign:'middle' })
  s.addShape(p.ShapeType.rect, { x:1.15, y:4.06, w:1.5, h:0.06, fill:{ color:RED }, line:{ width:0 } })
  s.addText([
    { text:'Action Learning Project', options:{ bold:true, color:INK } },
    { text:'   ·   Ruffa Gayla Gonzales, Organisational Effectiveness   ·   September 2026',
      options:{ color:MUTE } },
  ], { x:1.15, y:4.34, w:11.2, h:0.34, fontFace:F, fontSize:16, isTextBox:true, margin:0 })

  ;[['17%',    'of roles filled\nfrom inside',     RED],
    ['₱4.0M',  'a year that\ncosts us',            INK],
    ['₱2.05M', 'to build and run\nfor three years', INK],
    ['13 mo',  'to pay for\nitself',               TEAL]]
   .forEach((k,i) => {
    const x = 1.15 + i*2.55
    rule(s, x, 5.32, 2.15, SANDD)
    s.addText(k[0], { x, y:5.42, w:2.2, h:0.46, fontFace:F, fontSize:28, bold:true,
      color:k[2], isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x, y:5.90, w:2.2, h:0.56, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
  })
  s.addNotes('Fifteen minutes: roughly seven on the deck, eight in the product. I will show you the problem, show you the thing working, then show you the money.\n\nOne sentence up front: we fill 17% of our roles from the inside, the benchmark is 30%, and the gap is costing us about 4 million pesos a year. Growth closes it for 2.05 million over three years, which is 614 pesos per employee per year.')
}

/* ═══ 2 · EXECUTIVE SUMMARY ═════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Executive summary', 'We are buying from outside what we already have inside.')

  const lw = CW*0.545
  panel(s, { x:M, y:1.86, w:lw, h:5.02 }, SAND)
  s.addText('THE PROBLEM', { x:M+0.34, y:2.06, w:lw-0.68, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:1.8, isTextBox:true, margin:0 })
  s.addText('Over 2024–2026 we opened 1,008 vacancies. 463 people applied from inside. 170 got the job — a 17% internal fill rate against a 30% market benchmark.',
    { x:M+0.34, y:2.42, w:lw-0.68, h:1.04, fontFace:F, fontSize:17, color:INK,
      lineSpacing:24, isTextBox:true, margin:0, valign:'top' })
  rule(s, M+0.34, 3.58, lw-0.68, SANDD)
  s.addText([
    { text:'And saying no has a price. ', options:{ bold:true, color:INK } },
    { text:'Of the 67 internal applicants we turned down in 2025, only 38 are still with Home Credit. 43% of that cohort has already left us.',
      options:{ color:BODY } },
  ], { x:M+0.34, y:3.74, w:lw-0.68, h:1.28, fontFace:F, fontSize:16, lineSpacing:22,
       isTextBox:true, margin:0, valign:'top' })
  rule(s, M+0.34, 5.10, lw-0.68, SANDD)
  s.addText('THE CAUSE', { x:M+0.34, y:5.26, w:lw-0.68, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:1.8, isTextBox:true, margin:0 })
  s.addText('Not selection — visibility. Nothing shows an employee a role they would fit, and nothing tells a manager the person they need is already on payroll.',
    { x:M+0.34, y:5.58, w:lw-0.68, h:1.04, fontFace:F, fontSize:15, color:BODY, lineSpacing:21,
      isTextBox:true, margin:0, valign:'top' })

  const rx = M+lw+0.30, rw = CW-lw-0.30
  s.addText('WHAT WE ARE ASKING FOR', { x:rx, y:1.90, w:rw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:1.8, isTextBox:true, margin:0 })
  s.addText('Build Growth for a 1,113-person pilot — IT, HR and Operations, mass and non-mass.',
    { x:rx, y:2.22, w:rw, h:0.66, fontFace:F, fontSize:17, bold:true, color:INK,
      lineSpacing:23, isTextBox:true, margin:0, valign:'top' })
  ;[['₱2.05M', 'three-year cost, all in', INK],
    ['₱614', 'per employee a year', INK],
    ['13 months', 'to pay for itself', TEAL],
    ['5× – 14×', 'cheaper than buying a platform', TEAL]]
   .forEach((k,i) => {
    const y = 2.98 + i*0.80
    s.addText(k[0], { x:rx, y, w:rw*0.42, h:0.40, fontFace:F, fontSize:21, bold:true,
      color:k[2], isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x:rx+rw*0.42, y, w:rw*0.58, h:0.40, fontFace:F, fontSize:15, color:BODY,
      isTextBox:true, margin:0, valign:'middle' })
    if (i<3) rule(s, rx, y+0.60, rw, LINE)
  })
  panel(s, { x:rx, y:6.26, w:rw, h:0.62 }, REDT)
  s.addText([{ text:'Working prototype already built. ', options:{ bold:true, color:RED } },
             { text:'You will see it in eight minutes.', options:{ color:BODY } }],
    { x:rx+0.24, y:6.26, w:rw-0.48, h:0.62, fontFace:F, fontSize:15, valign:'middle',
      isTextBox:true, margin:0 })
  pageNo(s)
  s.addNotes('This is the whole case on one slide. Everything after it is evidence.\n\nThe 17% is ours: 170 accepted out of 1,008 vacancies posted between 2024 and 2026. The 30% is the published market benchmark for internal fill; mature marketplaces run 40-50%.\n\nThe 67/38 number is the one I would hold onto. It is not modelled, it is a headcount we can check in the HRIS: 67 people raised their hand in 2025, we told them no, and 29 of them have since left. What we do not yet have is the fair comparator — attrition among band B and C non-mass staff, which is who these applicants are. HR has been asked for it. The whole-company rate is the wrong benchmark: mass operations would drag it up and flatter us.\n\nIf asked "is this causal" — no, not proven. It is an association, and the exposure window runs longer than a year so the true excess is smaller than 24 points. I model it at 15. It matters more than it used to: after the days-to-fill correction, retention is five-sixths of the value of an internal fill. The holdout in the adoption plan is how we settle it.')
}

/* ═══ 3 · THE PROBLEM — THE FUNNEL ══════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The problem', 'Four out of five roles go to someone we have not met.',
    'Internal job posting data, 2024 to 2026 — three years, company-wide.')

  const steps = [
    ['1,008', 'vacancies opened',    3.90, 1.70, SAND,  INK],
    ['463',   'internal applicants', 2.80, 1.42, SANDD, INK],
    ['170',   'internal hires',      1.80, 1.14, RED,   WHITE],
  ]
  let fx = M
  steps.forEach(st => {
    const y = 2.86 - st[3]/2
    s.addShape(p.ShapeType.roundRect, { x:fx, y, w:st[2], h:st[3], rectRadius:0.04,
      fill:{ color:st[4] }, line:{ width:0 } })
    s.addText(st[0], { x:fx+0.24, y:y+0.14, w:st[2]-0.48, h:0.58, fontFace:F, fontSize:34,
      bold:true, color:st[5], isTextBox:true, margin:0, valign:'middle' })
    s.addText(st[1], { x:fx+0.24, y:y+0.74, w:st[2]-0.48, h:0.30, fontFace:F, fontSize:14.5,
      bold:true, color:st[5]===WHITE?'F6DADA':BODY, isTextBox:true, margin:0, valign:'top' })
    fx += st[2] + 0.28
  })
  s.addShape(p.ShapeType.rect, { x:10.02, y:2.24, w:0.05, h:1.24, fill:{ color:RED }, line:{ width:0 } })
  s.addText('17%', { x:10.26, y:2.20, w:2.44, h:0.58, fontFace:F, fontSize:38, bold:true,
    color:RED, isTextBox:true, margin:0, valign:'middle' })
  s.addText('internal fill rate', { x:10.26, y:2.80, w:2.44, h:0.28, fontFace:F, fontSize:15,
    bold:true, color:BODY, isTextBox:true, margin:0, valign:'top' })
  s.addText('the benchmark is 30%', { x:10.26, y:3.10, w:2.44, h:0.28, fontFace:F, fontSize:14,
    color:MUTE, isTextBox:true, margin:0, valign:'top' })

  panel(s, { x:M, y:4.30, w:CW, h:2.14 }, REDT)
  s.addShape(p.ShapeType.rect, { x:M, y:4.30, w:0.10, h:2.14, fill:{ color:RED }, line:{ width:0 } })
  s.addText('Then look at the people we turned down.',
    { x:M+0.46, y:4.54, w:5.90, h:0.36, fontFace:F, fontSize:20, bold:true, color:INK,
      isTextBox:true, margin:0, valign:'middle' })
  s.addText('In 2025 we said no to 67 internal applicants. Today 38 are still here. We have already lost 29 of them.',
    { x:M+0.46, y:5.00, w:5.90, h:1.06, fontFace:F, fontSize:16, color:BODY,
      lineSpacing:23, isTextBox:true, margin:0, valign:'top' })
  ;[['43%',   'of that cohort has\nalready left',   RED,  true],
    ['16',    'more than a 28%\ncomparator predicts', INK, false],
    ['₱5.2M', 'replacement cost\nof that excess',    INK,  false]]
   .forEach((k,i) => {
    const x = 7.10 + i*1.88
    s.addText(k[0], { x, y:4.62, w:1.78, h:0.54, fontFace:F, fontSize:29, bold:true, color:k[2],
      isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x, y:5.20, w:1.78, h:0.76, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
    if (i===0) s.addShape(p.ShapeType.rect, { x:x+1.72, y:4.66, w:0.02, h:1.16,
      fill:{ color:SANDD }, line:{ width:0 } })
  })
  src(s, 'The 67 and the 38 are HRIS fact. The comparator attrition rate is not yet confirmed — see appendix. Source: HC Connect 2024–2026.')
  pageNo(s)
  s.addNotes('Read the funnel left to right and it looks like a selection problem. It is not.\n\n463 applications across three years, from a company of 20,587 people. That is the real number: fewer than eight internal applications a week, company-wide. People are not being rejected in droves — they are not applying, because they cannot see the roles.\n\nThe bottom band is the part that should worry us, and I want to be precise about what is measured and what is not.\n\nMEASURED: 67 people raised their hand in 2025, we said no, and 29 have since left. 43% of that cohort. That comes straight out of HRIS and anyone can re-pull it.\n\nNOT MEASURED: what to compare it against. An earlier draft of this used 19% as a company average. I have withdrawn that — it traced back to a placeholder tile in the v1 prototype dashboard, not to Payroll. The right comparator is attrition among band B and C non-mass staff, because that is who these applicants are; a whole-company rate would be dragged up by mass operations. HR has been asked for it.\n\nThe 16 and the 5.2 million on this slide assume a 28% comparator, which is what the 15-point excess I model implies. The appendix shows the case from 20% to 35%. If anyone asks the obvious question — what if the comparator is 35% — the answer is that the expected case still clears a ratio of 4.3, and I would rather show you that range than defend a number I cannot source.')
}

/* ═══ 4 · WHY IT HAPPENS ════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Why it happens', 'Three blind spots, none of which is a people problem.')

  const cw = (CW - 2*0.30)/3
  const cards = [
    ['01', 'Employees cannot see it',
     'Vacancies sit in a tool nobody browses. Gigs and immersions are arranged privately. You hear about the role after it is filled.', RED],
    ['02', 'The manager cannot find them',
     'There is no skills inventory. A hiring manager cannot ask "who inside can already do this?", so the default is to post externally.', GOLD],
    ['03', 'The record does not exist',
     'Skills live in CVs, IDPs and people\'s memories. Nothing is verified, nothing is current, none of it is searchable.', TEAL],
  ]
  cards.forEach((c,i) => {
    const x = M + i*(cw+0.30)
    card(s, { x, y:2.10, w:cw, h:2.86 })
    s.addShape(p.ShapeType.rect, { x, y:2.10, w:cw, h:0.075, fill:{ color:c[3] }, line:{ width:0 } })
    s.addText(c[0], { x:x+0.30, y:2.32, w:1.0, h:0.44, fontFace:F, fontSize:24, bold:true,
      color:c[3], charSpacing:1, isTextBox:true, margin:0, valign:'middle' })
    s.addText(c[1], { x:x+0.30, y:2.86, w:cw-0.60, h:0.66, fontFace:F, fontSize:18, bold:true,
      color:INK, lineSpacing:24, isTextBox:true, margin:0, valign:'top' })
    s.addText(c[2], { x:x+0.30, y:3.58, w:cw-0.60, h:1.22, fontFace:F, fontSize:15, color:BODY,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  })

  panel(s, { x:M, y:5.24, w:CW, h:1.58 }, SAND)
  s.addText('The constraint is not that our people are unqualified. It is that the market inside Home Credit has no shelves.',
    { x:M+0.40, y:5.46, w:CW*0.60, h:0.68, fontFace:F, fontSize:19, bold:true, color:INK,
      lineSpacing:26, isTextBox:true, margin:0, valign:'middle' })
  s.addText('463 applications in three years is not apathy. People say they believe they can grow here — they cannot find where.',
    { x:M+0.40, y:6.14, w:CW*0.60, h:0.60, fontFace:F, fontSize:15, color:BODY,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  s.addShape(p.ShapeType.rect, { x:M+CW*0.66, y:5.52, w:0.05, h:0.96, fill:{ color:RED }, line:{ width:0 } })
  s.addText('88%', { x:M+CW*0.70, y:5.48, w:CW*0.29, h:0.52, fontFace:F, fontSize:32, bold:true,
    color:RED, isTextBox:true, margin:0, valign:'middle' })
  s.addText('believe they can grow at Home Credit\neNPS on growth opportunity',
    { x:M+CW*0.70, y:6.00, w:CW*0.29, h:0.56, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  pageNo(s)
  s.addNotes('Keep this to twenty seconds. It is the bridge between the problem and the product.\n\nThe point to land: every one of these three is a systems gap, not a talent gap or a manager-attitude gap. That matters because it means the fix is buildable rather than cultural, and buildable things have costs and timelines you can approve.\n\nIf a panel member pushes on manager hoarding — it is real, and it is on the risk slide. But hoarding cannot explain 463 applications; you cannot hoard a role nobody applied to.')
}

/* ═══ 5 · WHAT GROWTH IS ════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The solution', 'One place. Every opportunity. Scored against you.')

  const lw = CW*0.455
  const shelves = [
    ['Vacancies',      'Permanent internal roles, mirrored from HC Connect', RED],
    ['Gigs',           'Short projects, days to weeks, alongside the day job', GOLD],
    ['Job immersions', 'Three to nine months in another function', TEAL],
    ['Service offers', 'An employee offering a skill to the business', '4A5468'],
  ]
  s.addText('FOUR SHELVES', { x:M, y:2.06, w:lw, h:0.26, fontFace:F, fontSize:14, bold:true,
    color:RED, charSpacing:1.8, isTextBox:true, margin:0 })
  shelves.forEach((sh,i) => {
    const y = 2.48 + i*0.92
    s.addShape(p.ShapeType.rect, { x:M, y:y+0.04, w:0.055, h:0.66, fill:{ color:sh[2] }, line:{ width:0 } })
    s.addText(sh[0], { x:M+0.26, y, w:lw-0.26, h:0.32, fontFace:F, fontSize:17, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'top' })
    s.addText(sh[1], { x:M+0.26, y:y+0.32, w:lw-0.26, h:0.46, fontFace:F, fontSize:14.5,
      color:BODY, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  panel(s, { x:M, y:6.10, w:lw, h:0.80 }, SAND)
  s.addText([{ text:'Plus a skills passport. ', options:{ bold:true, color:INK } },
             { text:'Seeded from MyDevelopment and LinkedIn, verified by delivery.', options:{ color:BODY } }],
    { x:M+0.26, y:6.10, w:lw-0.52, h:0.80, fontFace:F, fontSize:14.5, lineSpacing:19,
      valign:'middle', isTextBox:true, margin:0 })

  const rx = M+lw+0.46, rw = CW-lw-0.46
  s.addText('EVERY POST IS SCORED AGAINST YOUR PROFILE', { x:rx, y:2.06, w:rw, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:RED, charSpacing:1.4, isTextBox:true, margin:0 })
  s.addImage(Object.assign(img('exec-card.png'),
    { x:rx, y:2.48, w:rw, h:rw*0.583, shadow:soft() }))
  s.addText('An AI model reads the post and your profile, returns a score, and says why. It never blocks an application.',
    { x:rx, y:2.62+rw*0.583, w:rw, h:0.56, fontFace:F, fontSize:15, color:MUTE,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  pageNo(s)
  s.addNotes('Thirty seconds, then straight into the demo.\n\nThe four shelves matter because a vacancy is a once-a-year event but a gig is a once-a-month one. If the only thing on the marketplace is permanent roles, most people have no reason to come back, and the people we turn down leave with nothing. The gigs, immersions and service offers are the second door — and they are the answer to the 67/38 problem.\n\nOn the AI: it is Claude, called in batch when a post goes live. It scores against verified skills, self-declared skills, stated aspiration and track record. The reasoning is shown on every card, and a low score never stops anyone applying. That was a deliberate design decision — an opaque gate would have killed trust in week one.\n\nCost of the AI is 40,544 pesos a year at 1,113 people. It is on the cost slide and it is not inside IT\'s 1,785,500 build figure.')
}

/* ═══ 6 · WHAT IS NEW HERE ══════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'What is new here', 'Four choices that make this more than a job board.')

  const rows = [
    ['A rejection has somewhere to go',
     'Every marketplace on the market is a board: one slot, one winner, everyone else leaves with nothing. Growth routes a "no" to a gig, an immersion or a service offer.', RED],
    ['The AI explains itself, and never gates',
     'Each match shows its reasoning in plain language, and no score can block an application. An opaque ranking engine would have cost us trust in week one.', TEAL],
    ['Skills carry provenance',
     'Verified by delivered work, uploaded by HR, or self-declared — and the rubric weights them differently. A claimed skill is never treated as a proven one.', GOLD],
    ['Built before it was bought',
     'A working prototype exists today, made inside Organisational Effectiveness. We are asking you to fund a build you can use in this room, not a slide.', SLATE],
  ]
  const cw = (CW-0.30)/2
  rows.forEach((r,i) => {
    const x = M + (i%2)*(cw+0.30), y = 2.16 + Math.floor(i/2)*1.88
    card(s, { x, y, w:cw, h:1.72 })
    s.addShape(p.ShapeType.rect, { x, y, w:0.06, h:1.72, fill:{ color:r[2] }, line:{ width:0 } })
    chip(s, x+0.30, y+0.26, i+1, r[2])
    s.addText(r[0], { x:x+0.88, y:y+0.22, w:cw-1.16, h:0.38, fontFace:F, fontSize:17, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[1], { x:x+0.88, y:y+0.64, w:cw-1.16, h:0.92, fontFace:F, fontSize:14.5,
      color:BODY, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  panel(s, { x:M, y:5.88, w:CW, h:1.00 }, SAND)
  s.addText([{ text:'The first two are the ones that matter. ', options:{ bold:true, color:INK } },
             { text:'A board raises applications and therefore raises rejections, and our data says rejection is what makes people leave.', options:{ color:BODY } }],
    { x:M+0.34, y:5.88, w:CW-0.68, h:1.00, fontFace:F, fontSize:15, lineSpacing:21,
      valign:'middle', isTextBox:true, margin:0 })
  pageNo(s)
  s.addNotes('This is the slide for the creativity and innovation criterion, and it is forty seconds.\n\nThe honest framing: internal talent marketplaces are not a new product category. Gloat, Fuel50 and Eightfold have existed for years. What is designed here rather than copied is the response to a problem the category has not solved — that a marketplace which only sells permanent roles manufactures rejection, and rejection is what pushes people out. Our own 67/38 cohort is the evidence. The four shelves exist because of it.\n\nOn provenance: most systems treat a self-declared skill and a demonstrated one as the same string. Ours does not — verified, HR-uploaded and self-declared carry different weight in the match rubric, and the employee can see which is which on their own profile. That is what stops the skills inventory rotting into a wish list.\n\nIf the Chief AI Officer asks what is genuinely AI here rather than rules: the model reads unstructured job posts and unstructured profiles and produces a scored, explained judgement about adjacency — it understands that workforce planning is close to capacity planning without anyone maintaining a synonym table. The deliberate constraints are that it never ranks people against each other, never gates an application, and always shows its reasoning.')
}

/* ═══ 7 · DEMO ══════════════════════════════════════════════════ */
{
  const s = next(CREAM); N++
  s.addShape(p.ShapeType.rect, { x:0, y:0, w:0.30, h:H, fill:{ color:RED }, line:{ width:0 } })
  s.addText('LIVE DEMONSTRATION', { x:1.15, y:1.46, w:8, h:0.30, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:2.4, isTextBox:true, margin:0 })
  s.addText('Let me show you\nthe working product.', { x:1.15, y:1.92, w:7.0, h:1.70, fontFace:F,
    fontSize:40, bold:true, color:INK, lineSpacing:50, isTextBox:true, margin:0, valign:'top' })
  s.addShape(p.ShapeType.rect, { x:1.15, y:3.82, w:1.5, h:0.06, fill:{ color:RED }, line:{ width:0 } })
  ;[['1', 'An employee finds a match they never would have seen'],
    ['2', 'They add one skill — and the matches change in front of you'],
    ['3', 'A manager posts a gig; HR approves it; it appears on the shelf'],
    ['4', 'Work is closed out — and lands on the employee profile']]
   .forEach((k,i) => {
    const y = 4.16 + i*0.62
    chip(s, 1.15, y, k[0], RED)
    s.addText(k[1], { x:1.72, y, w:6.4, h:0.40, fontFace:F, fontSize:16, color:BODY,
      isTextBox:true, margin:0, valign:'middle' })
  })
  s.addImage(Object.assign(img('exec-matches.png'), { x:8.30, y:1.42, w:4.40, h:3.44, shadow:soft() }))
  s.addText('Built and running today. No vendor, no licence, no integration project.',
    { x:8.30, y:5.06, w:4.40, h:0.70, fontFace:F, fontSize:15, color:MUTE, lineSpacing:20,
      isTextBox:true, margin:0, valign:'top' })
  pageNo(s)
  s.addNotes('Eight minutes. Four beats, in this order, and do not improvise beyond them.\n\n1. Sign in as Taylor Swift. Go to My Matches. Point out that the matches are 80% and above, and read one "why this score" line out loud. The panel needs to hear that the machine explains itself.\n\n2. Go to My Profile and add a skill. Come back to My Matches. New opportunities appear. This is the single most persuasive twenty seconds in the demo — the marketplace is live, not a mockup.\n\n3. Switch role to a manager. Post a gig. Switch to HR admin, approve it. Switch back to employee, and it is on the shelf with an applicant count. This proves the full loop, including governance.\n\n4. Close out a completed immersion with a rating, then open the employee profile and show it recorded there. That is how a skill becomes verified rather than claimed.\n\nIf the demo fails: the screenshots in the appendix cover beats 1 and 3. Do not spend more than thirty seconds troubleshooting.')
}

/* ═══ 8 · THE COST OF STAYING AT 17% ════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The financial case', 'Staying at 17% costs us ₱4.0M every year.',
    'Per year, company-wide, at 336 vacancies a year. Not a three-year total. Net of the backfill each internal move creates.')

  const COL = [4.95, 7.55, 10.15], CWD = 2.55
  panel(s, { x:COL[1]-0.10, y:1.92, w:CWD+0.20, h:3.46 }, REDT)
  ;[['17%','where we are',MUTE],['30%','the benchmark',RED],['50%','mature marketplaces',TEAL]]
   .forEach((c,i) => {
    s.addText(c[0], { x:COL[i], y:2.00, w:CWD, h:0.44, fontFace:F, fontSize:26, bold:true,
      color:c[2], align:'center', isTextBox:true, margin:0, valign:'middle' })
    s.addText(c[1], { x:COL[i], y:2.46, w:CWD, h:0.26, fontFace:F, fontSize:14, color:MUTE,
      align:'center', isTextBox:true, margin:0 })
  })

  const rows = [
    ['Internal fills, a year', '57',  '101',    '168'],
    ['Hiring cost avoided, a year',   '—',   '₱0.35M', '₱0.88M'],
    ['Vacancy days saved, a year',    '—',   '₱0.31M', '₱0.79M'],
    ['Turnover avoided, a year',      '—',   '₱3.37M', '₱8.49M'],
  ]
  rows.forEach((r,i) => {
    const y = 2.92 + i*0.62
    s.addText(r[0], { x:M+0.04, y, w:4.10, h:0.56, fontFace:F, fontSize:16, color:BODY,
      isTextBox:true, margin:0, valign:'middle' })
    ;[1,2,3].forEach(k => s.addText(r[k], { x:COL[k-1], y, w:CWD, h:0.56, fontFace:F,
      fontSize:17, bold:k===2, color:k===1?MUTE:INK, align:'center', isTextBox:true,
      margin:0, valign:'middle' }))
    if (i<3) rule(s, M, y+0.58, CW, LINE)
  })

  panel(s, { x:M, y:5.46, w:CW, h:0.72 }, RED)
  s.addText('VALUE WE FORGO EVERY YEAR', { x:M+0.30, y:5.46, w:4.10, h:0.72, fontFace:F,
    fontSize:15, bold:true, color:WHITE, charSpacing:0.8, isTextBox:true, margin:0, valign:'middle' })
  ;[['baseline','F0C2C2',18],['₱4.03M',WHITE,22],['₱10.16M',WHITE,22]].forEach((v,i) =>
    s.addText(v[0], { x:COL[i], y:5.46, w:CWD, h:0.72, fontFace:F, fontSize:v[2], bold:true,
      color:v[1], align:'center', isTextBox:true, margin:0, valign:'middle' }))

  panel(s, { x:M, y:6.30, w:CW, h:0.62 }, SAND)
  s.addText([{ text:'One extra internal fill is worth ₱91,276.  ', options:{ bold:true, color:INK } },
             { text:'₱15,017 of hiring cost and vacancy days after the backfill, plus ₱76,260 of turnover we do not pay. Five-sixths of it is retention, not speed.', options:{ color:BODY } }],
    { x:M+0.30, y:6.30, w:CW-0.60, h:0.62, fontFace:F, fontSize:15, valign:'middle',
      isTextBox:true, margin:0 })
  pageNo(s)
  s.addNotes('This is the slide the CFO will test. Three things to say before being asked.\n\nFIRST \u2014 the hiring-cost row is small on purpose. A Band C hire costs 35,367 pesos through TA. Of that, 3,378 is HR and TA cost per hire which we still pay on an internal move, so it is not a saving. And filling a Band C role internally creates a Band B vacancy we then hire for externally at 6,977. Net of both, one Band C internal fill saves 25,012 pesos of hiring cost, not 35,367. I have netted the backfill everywhere.\n\nSECOND \u2014 vacancy days, and this row got much smaller in the final cut. It is 43 days to fill externally against 23 internally, so 20 days saved on the senior role at its own day rate, minus 43 days on the backfilled seat at its lower day rate. On a Band C move that nets to 13,572 pesos, not the 61,247 an earlier draft carried on a wrong 58/21 assumption. I corrected it down rather than let it be found. It is lost output, not cash.\n\nTHIRD \u2014 turnover is now five-sixths of the value of a fill, and that is the honest shape of this business case: internal mobility at Home Credit is a retention instrument, not a speed instrument. It rests on the measured 67/38 cohort, discounted from 24 points of excess attrition to 15, priced at 75% of blended Band B/C annual basic.\n\nBecause retention carries the case, the single number worth confirming before we spend anything is band B and C non-mass attrition for 2025. HR has been asked. If it comes back at 35% rather than the 28% modelled, the value per fill drops to about 57,000 \u2014 the appendix has the full range.\n\nIf challenged that 4 million a year is too small to matter: agreed, on its own. The point is that we capture it for 86 pesos per employee per year at full rollout.')
}

/* ═══ 9 · WHAT 30% ACTUALLY TAKES ═══════════════════════════════ */
{
  const s = next(); N++
  head(s, 'What 30% actually takes', 'We cannot get there on today\'s applicant flow.',
    'Every figure on this slide is a yearly rate. 463 applications over three years produced 170 hires — a 37% success rate.')

  const lw = CW*0.52
  ;[['154', 'a year today', MUTE, SANDD],
    ['275', 'a year for 30%', RED, REDT],
    ['458', 'a year for 50%', TEAL, TEALT]]
   .forEach((k,i) => {
    const y = 2.14 + i*1.10
    const bw = (parseInt(k[0])/458) * 2.85
    s.addShape(p.ShapeType.roundRect, { x:M+1.55, y:y+0.08, w:Math.max(bw,0.4), h:0.62,
      rectRadius:0.03, fill:{ color:k[3] }, line:{ width:0 } })
    s.addShape(p.ShapeType.rect, { x:M+1.55, y:y+0.08, w:0.05, h:0.62, fill:{ color:k[2] }, line:{ width:0 } })
    s.addText(k[0], { x:M, y:y+0.04, w:1.42, h:0.70, fontFace:F, fontSize:30, bold:true,
      color:k[2], align:'right', isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x:M+1.72+Math.max(bw,0.4)-0.10, y:y+0.08, w:2.20, h:0.62, fontFace:F,
      fontSize:15.5, bold:i>0, color:i?INK:BODY, isTextBox:true, margin:0, valign:'middle' })
  })
  s.addText('Internal applications have to rise 1.8× to reach the benchmark, and 3× to reach 50%. That is the whole job: make the roles visible and make people worth matching.',
    { x:M, y:5.50, w:lw, h:0.86, fontFace:F, fontSize:15, color:BODY, lineSpacing:21,
      isTextBox:true, margin:0, valign:'top' })

  const rx = M+lw+0.42, rw = CW-lw-0.42
  panel(s, { x:rx, y:2.08, w:rw, h:4.28 }, GOLDT)
  s.addShape(p.ShapeType.rect, { x:rx, y:2.08, w:rw, h:0.085, fill:{ color:GOLD }, line:{ width:0 } })
  s.addText('AND HERE IS THE CATCH', { x:rx+0.36, y:2.32, w:rw-0.72, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:GOLD, charSpacing:1.8, isTextBox:true, margin:0 })
  s.addText('More applications means more rejections.', { x:rx+0.36, y:2.62, w:rw-0.72, h:0.76,
    fontFace:F, fontSize:22, bold:true, color:INK, lineSpacing:28, isTextBox:true, margin:0, valign:'top' })
  s.addText('At a 30% fill rate we turn down 174 people a year instead of 98. On today\'s evidence, rejection is what makes them leave.',
    { x:rx+0.36, y:3.48, w:rw-0.72, h:0.86, fontFace:F, fontSize:15.5, color:BODY,
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  rule(s, rx+0.36, 4.44, rw-0.72, SANDD)
  s.addText('So it cannot only sell jobs.', { x:rx+0.36, y:4.60, w:rw-0.72, h:0.34,
    fontFace:F, fontSize:16, bold:true, color:INK, isTextBox:true, margin:0, valign:'middle' })
  s.addText('A "no" routes to a gig, an immersion or a service offer instead of to the exit. That is why Growth has four shelves and not one.',
    { x:rx+0.36, y:5.00, w:rw-0.72, h:1.22, fontFace:F, fontSize:15, color:BODY,
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  pageNo(s)
  s.addNotes('This slide exists because "let us get to 30%" is the kind of target that gets approved and then quietly missed. The arithmetic says why.\n\n463 applications produced 170 hires over three years — a 37% success rate. If that rate holds, 30% of 336 vacancies means 101 internal hires a year, which needs 275 applications, up from 154. Nearly double.\n\nThe catch is genuine and I would rather raise it than have it raised at me. Doubling applications while holding the success rate means rejecting 174 people a year instead of 98. Our own data says a rejected internal applicant leaves at 43%. Scale that naively and we would be building a machine that generates attrition.\n\nThe four shelves are the mitigation. A vacancy is zero-sum — one slot, one winner. A gig is not. An immersion is not. A service offer is not. Those absorb the people a vacancy turns away, and they are the reason the retention benefit in the model is defensible rather than wishful.\n\nThis is the answer if anyone asks what is actually innovative here versus a job board.')
}

/* ═══ 10 · BUILD VS BUY ═════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Build or buy', 'The two things we could buy instead, and what they are.',
    'Three-year planning bands at 1,113 seats. These are not quotes.')

  const tiers = [
    ['₱10.7M', 'US$175,000', 'CAREER AND MOBILITY TOOLS',
     'Fuel50 · Gloat', 'Opportunity marketplace and career pathing, as a point solution. At our seat count we would pay a vendor minimum, not a per-seat rate.', SLATE, SLATET],
    ['₱29.3M', 'US$480,000', 'TALENT INTELLIGENCE SUITES',
     'Eightfold · Workday Talent Marketplace', 'A skills-inference engine inside a wider HR suite, with implementation services and usually a multi-module commitment.', SLATE, SLATET],
  ]
  const cw = (CW-0.30)/2
  tiers.forEach((t,i) => {
    const x = M + i*(cw+0.30)
    panel(s, { x, y:2.14, w:cw, h:2.22 }, t[7])
    s.addText(t[2], { x:x+0.30, y:2.32, w:cw-0.60, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
    s.addText(t[0], { x:x+0.30, y:2.62, w:2.10, h:0.50, fontFace:F, fontSize:28, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(t[1], { x:x+2.44, y:2.66, w:1.90, h:0.42, fontFace:F, fontSize:15, color:MUTE,
      isTextBox:true, margin:0, valign:'middle' })
    s.addText(t[3], { x:x+0.30, y:3.16, w:cw-0.60, h:0.28, fontFace:F, fontSize:15, bold:true,
      color:RED, isTextBox:true, margin:0, valign:'top' })
    s.addText(t[4], { x:x+0.30, y:3.48, w:cw-0.60, h:0.76, fontFace:F, fontSize:14.5, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })

  s.addText('WHAT BUYING WOULD GIVE US', { x:M, y:4.62, w:cw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:TEAL, charSpacing:1.4, isTextBox:true, margin:0 })
  s.addText('WHAT IT WOULD COST US BEYOND THE LICENCE', { x:M+cw+0.30, y:4.62, w:cw, h:0.26,
    fontFace:F, fontSize:14, bold:true, color:RED, charSpacing:1.4, isTextBox:true, margin:0 })
  ;[['A mature skills ontology we have not built, external benchmarking, a contractual support SLA, and a vendor roadmap. These are real and we do not have them.', M, TEAL],
    ['Fit. No vendor ships job immersion under Policy 211_2021, service offers, or HC Connect and MyDevelopment wiring. Four to nine months to implement, and they own the skills data model.', M+cw+0.30, RED]]
   .forEach(c => {
    s.addShape(p.ShapeType.rect, { x:c[1], y:4.98, w:0.05, h:1.00, fill:{ color:c[2] }, line:{ width:0 } })
    s.addText(c[0], { x:c[1]+0.24, y:4.94, w:cw-0.30, h:1.08, fontFace:F, fontSize:14.5,
      color:BODY, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })

  panel(s, { x:M, y:6.18, w:CW, h:0.70 }, REDT)
  s.addText([{ text:'Build now, revisit buying at scale. ', options:{ bold:true, color:RED } },
             { text:'₱2.05M proves demand at 1,113 seats, where vendor minimums make per-seat economics worst. If it works across 20,587 people, buying becomes a fair question — with real usage data behind the RFP.', options:{ color:BODY } }],
    { x:M+0.34, y:6.18, w:CW-0.68, h:0.70, fontFace:F, fontSize:15, lineSpacing:20,
      valign:'middle', isTextBox:true, margin:0 })
  src(s, 'No vendor here publishes per-seat pricing. Bands derive from how enterprise HR SaaS is structured. ₱61 = US$1.')
  pageNo(s)
  s.addNotes('Be scrupulous here: I built these bands from how enterprise HR SaaS is typically structured. They are not quotes and no vendor in the set publishes per-seat pricing. If anyone treats them as firm, correct them.\n\nThe two tiers are genuinely different products. Fuel50 and Gloat sell an opportunity marketplace and career pathing — closest to what we have built. Eightfold and Workday sell a skills-inference layer inside a wider suite, which is more capability than we need and usually comes with a multi-module commitment.\n\nThe honest case for buying, which I would rather make myself than have made at me: they have spent years on a skills ontology, they benchmark against other companies, and they carry a support SLA. We have none of that, and our 0.2 to 0.3 FTE of ownership from year two is the thin end of that problem.\n\nThe case against, at our size: 1,113 seats is below every vendor minimum, so we would pay for a minimum contract value rather than for seats — the worst possible per-seat economics. And none of them ship developmental job immersion, which is a Home Credit policy instrument, or service offers, or day-one wiring into HC Connect and MyDevelopment.\n\nSo the recommendation is sequencing, not ideology: build cheap now to prove people actually use it, and if it works across the whole company, run a real RFP with real usage data behind it.')
}

/* ═══ 11 · STRATEGIC ALIGNMENT ══════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Strategic alignment', 'Three of the eight priorities run on internal talent.',
    "We cannot buy a bench, tech capability and a performance culture all at once.")

  const lw = CW*0.415
  s.addText("THE EIGHT PRIORITIES '27–'29", { x:M, y:2.12, w:lw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  const pri = [
    ['People & Culture',       'Capabilities · performance culture',  true],
    ['Deep Focus on Tech',     'Core platform · Unified Data',        true],
    ['Expand Horizons',        'MSME · secured loans · e-commerce',   true],
    ['POS — defend position',  'Acquisition and retention channel',   false],
    ['Cash Loan',              'Profitable, sustainable CLX',         false],
    ['App-led lifecycle',      'Personalised engagement',             false],
    ['Risk & Collections',     'Scorecards · CE tools',               false],
    ['Secure local funding',   'Diversify base · hold spreads',       false],
  ]
  pri.forEach((r,i) => {
    const y = 2.48 + i*0.545
    s.addShape(p.ShapeType.roundRect, { x:M, y, w:lw, h:0.47, rectRadius:0.04,
      fill:{ color: r[2] ? REDT : CREAM }, line:{ color: r[2] ? 'F2D4D4' : LINE, width:1 } })
    if (r[2]) s.addShape(p.ShapeType.rect, { x:M, y:y+0.04, w:0.05, h:0.39,
      fill:{ color:RED }, line:{ width:0 } })
    s.addText(r[0], { x:M+0.22, y:y+0.03, w:lw-0.42, h:0.23, fontFace:F, fontSize:15,
      bold:true, color: r[2] ? INK : MUTE, isTextBox:true, margin:0 })
    s.addText(r[1], { x:M+0.22, y:y+0.25, w:lw-0.42, h:0.21, fontFace:F, fontSize:14,
      color: r[2] ? BODY : 'A8AEB9', isTextBox:true, margin:0 })
  })

  const rx = M+lw+0.42, rw = CW-lw-0.42
  s.addText('WHAT GROWTH DELIVERS AGAINST THEM', { x:rx, y:2.12, w:rw, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  ;[['Builds tech talent from the inside',
     'Gigs and immersions let Operations, Risk and HR people do real IT and analytics work before we pay a headhunter for it.'],
    ['Strengthens the middle-management bench',
     'Band B pivots and Band C lateral moves become visible, matched and tracked — from people already on payroll.'],
    ['Creates the people half of Unified Data',
     'A live, verified skills inventory as a by-product. "Who can do X?" answered from data rather than memory.'],
    ['Staffs new growth engines in days',
     'MSME, e-commerce and the app journey resourced from internal capacity instead of contractors.']]
   .forEach((d,i) => {
    const y = 2.48 + i*1.10
    card(s, { x:rx, y, w:rw, h:1.00 })
    s.addShape(p.ShapeType.rect, { x:rx, y, w:0.055, h:1.00, fill:{ color:RED }, line:{ width:0 } })
    s.addText(d[0], { x:rx+0.28, y:y+0.12, w:rw-0.56, h:0.30, fontFace:F, fontSize:16, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(d[1], { x:rx+0.28, y:y+0.44, w:rw-0.56, h:0.48, fontFace:F, fontSize:14.5,
      color:BODY, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  src(s, "HCPH Strategic Priorities '27–'29, Go Wide Go Deep (draft) · HR Strategic Priorities · OneHR Operating Model.")
  pageNo(s)
  s.addNotes('Forty seconds. Name the three, say why, move on. Do not read the right column.\n\nThree of eight, not six — I would rather claim three convincingly than eight loosely. People & Culture, Deep Focus on Tech and Expand Horizons all depend on internal talent supply, and none of them can be met by hiring alone at the pace the plan assumes.\n\nThe strongest single argument in this room: Deep Focus on Tech needs engineers and data people we are currently buying at a premium through headhunters, and our own Operations and Risk populations contain people who could cross into that work if there were a route. Gigs and immersions are that route, and they cost us nothing but a manager saying yes.\n\nThe asset is not the app. It is the first live, verified skills inventory this company has had — and it stays current because people update it to get matched, which is the reason every previous attempt at a skills database died.\n\nIf the Chief AI Officer asks where AI sits: it reads unstructured job posts and profiles and returns an explained score. It does not make selection decisions, does not rank people against each other, and never gates an application.')
}

/* ═══ 12 · COST, PAYBACK AND SCALE ══════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Cost and payback', '₱2.05M for the pilot. ₱5.26M for all 20,470.',
    'Three-year totals. The build is bought once, so the whole company costs 2.6× the pilot — not 18×.')

  /* ── left: what it costs, both scopes side by side ── */
  const lw = CW*0.53
  s.addText('THREE-YEAR COST', { x:M, y:2.02, w:lw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:1.6, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'',options:{}}, {text:'Pilot · 1,113',options:{bold:true,color:MUTE,align:'right'}},
     {text:'Full · 20,470',options:{bold:true,color:MUTE,align:'right'}}],
    [{text:'Build — bought once',options:{bold:true,color:INK}},
     {text:'₱1,785,500',options:{align:'right'}},
     {text:'₱1,785,500',options:{align:'right',bold:true,color:TEAL}}],
    ['AI matching (Claude), a year', {text:'₱40,544',options:{align:'right'}}, {text:'₱745,674',options:{align:'right'}}],
    ['Email, a year', {text:'₱15,987',options:{align:'right'}}, {text:'₱294,035',options:{align:'right'}}],
    ['Platform and monitoring, a year', {text:'₱25,620',options:{align:'right'}}, {text:'₱76,860',options:{align:'right'}}],
    ['HR reconciliation, a year', {text:'₱9,000',options:{align:'right'}}, {text:'₱60,000',options:{align:'right'}}],
    [{text:'THREE-YEAR TOTAL',options:{bold:true,color:INK}},
     {text:'₱2,049,954',options:{align:'right',bold:true}},
     {text:'₱5,255,207',options:{align:'right',bold:true,color:RED}}],
    [{text:'Per employee, a year',options:{color:MUTE}},
     {text:'₱614',options:{align:'right',color:MUTE}},
     {text:'₱86',options:{align:'right',bold:true,color:TEAL}}],
  ], { x:M, y:2.38, w:lw, colW:[3.10,1.62,1.62], fontFace:F, fontSize:14.5, color:BODY,
       rowH:0.34, border:{ type:'solid', color:LINE, pt:1 }, valign:'middle' })

  panel(s, { x:M, y:5.22, w:lw, h:0.78 }, SAND)
  s.addText([{ text:'₱55 per extra employee a year. ', options:{ bold:true, color:INK } },
             { text:'Going from 1,113 to 20,470 adds ₱3.21M for 19,357 more people.', options:{ color:BODY } }],
    { x:M+0.28, y:5.22, w:lw-0.56, h:0.78, fontFace:F, fontSize:14.5, lineSpacing:19,
      valign:'middle', isTextBox:true, margin:0 })
  panel(s, { x:M, y:6.10, w:lw, h:0.60 }, GOLDT)
  s.addText([{ text:'Watch the AI line. ', options:{ bold:true, color:GOLD } },
             { text:'63% of the full-org run, against 44% at the pilot.', options:{ color:BODY } }],
    { x:M+0.28, y:6.10, w:lw-0.56, h:0.60, fontFace:F, fontSize:14.5, valign:'middle',
      isTextBox:true, margin:0 })

  /* ── right: what comes back, and how fast ── */
  const rx = M+lw+0.42, rw = CW-lw-0.42
  s.addText('WHAT COMES BACK', { x:rx, y:2.02, w:rw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:TEAL, charSpacing:1.6, isTextBox:true, margin:0 })
  ;[['', 'PILOT', 'FULL'],
    ['Payback — expected',    '13 mo', '6 mo'],
    ['Payback — floor',       '43 mo', '18 mo'],
    ['Benefit–cost — expected', '4.4',  '9.7'],
    ['Benefit–cost — floor',    '0.8',  '1.8']]
   .forEach((r,i) => {
    const y = 2.40 + i*0.56
    const hdr = i===0
    if (i===4) panel(s, { x:rx-0.14, y:y-0.03, w:rw+0.28, h:0.54 }, GOLDT)
    s.addText(r[0], { x:rx, y, w:rw-2.60, h:0.48, fontFace:F, fontSize:hdr?13:15,
      bold:hdr, color:hdr?MUTE:BODY, isTextBox:true, margin:0, valign:'middle' })
    ;[1,2].forEach(k => s.addText(r[k], { x:rx+rw-2.60+(k-1)*1.30, y, w:1.24, h:0.48,
      fontFace:F, fontSize:hdr?13:19, bold:true,
      color:hdr?MUTE:(i===4?GOLD:(k===2?TEAL:INK)),
      align:'right', isTextBox:true, margin:0, valign:'middle' }))
    if (i>0 && i<4) rule(s, rx, y+0.50, rw, LINE)
  })

  panel(s, { x:rx, y:5.22, w:rw, h:0.78 }, WHITE)
  s.addShape(p.ShapeType.roundRect, { x:rx, y:5.22, w:rw, h:0.78, rectRadius:0.04,
    fill:{ color:WHITE }, line:{ color:GOLD, width:1 } })
  s.addText([{ text:'The pilot does not clear on measured benefit alone. ', options:{ bold:true, color:GOLD } },
             { text:'BCR 0.8, NPV −₱0.42M. The rollout does, at 1.8.', options:{ color:BODY } }],
    { x:rx+0.26, y:5.22, w:rw-0.52, h:0.78, fontFace:F, fontSize:14.5, lineSpacing:19,
      valign:'middle', isTextBox:true, margin:0 })

  panel(s, { x:rx, y:6.10, w:rw, h:0.60 }, REDT)
  s.addText('So the pilot is not the cheap option. It is the evidence.',
    { x:rx+0.26, y:6.10, w:rw-0.52, h:0.60, fontFace:F, fontSize:14.5, bold:true, color:RED,
      valign:'middle', isTextBox:true, margin:0 })

  src(s, 'Build costed by IT in man-hours, excluding AI. ₱61 = US$1, 10% discount. Benefit starts month 4, ramped to 40% through year 1.')
  pageNo(s)
  s.addNotes('Three numbers to hold: 2.05 million for the pilot, 5.26 million for the whole company, 86 pesos per employee per year at full scale.\\n\\nNote the time base, because it differs from the last money slide. Slide 8 is per year. This one is a three-year total, because that is how the build is funded.\\n\\nSTART WITH THE COST TABLE, because it answers the question the CFO is already forming: if 1,113 people cost 2 million, does the whole company cost 38? No. 5.26 million, because the build never moves. Going from the pilot to everyone costs 55 pesos per extra employee per year. The asset is bought once and every wave after it is nearly free.\\n\\nTHEN THE RIGHT-HAND SIDE, and do not skip the awkward row. The pilot pays back in 13 months on the expected case and 43 months on the measured floor. Full rollout pays back in 6 and 18. The pilot is the WORSE investment on every line, and I want to say that before anyone works it out. The reason is structural: the build costs the same either way, but a 1,113-person boundary only captures about 719,000 pesos a year of a 4 million company-wide prize.\\n\\nThe gold box is the one I would not hide. On measured benefit alone — extra internal fills and the turnover we can evidence, nothing else — the pilot returns 0.8 and an NPV of minus 420,000. It does not clear. An earlier version of this pack said 1.1; that was built on a wrong days-to-fill assumption of 58 external against 21 internal. The real gap is 43 against 23, the vacancy-days benefit is a fifth of what I had, and the floor case went underwater. I corrected it.\\n\\nSo the argument is not that the pilot is a good investment in isolation. It is that a 2 million pilot is the cheapest way to buy certainty about a 5.26 million decision that does clear, at 1.8 on measured benefit and 9.7 with the shelves. If the panel would rather skip the pilot and approve the rollout, the economics actually support that — but we would be spending 5.26 million on an untested adoption assumption, and I am not recommending it.\\n\\nExcluded from the cost, and material: 0.2 to 0.3 FTE of internal ownership from year two. At 0.25 FTE the pilot three-year cost is about 3.4 million and the expected ratio falls to roughly 2.6. I would rather you heard that from me.')
}

/* ═══ 13 · HOW IT RUNS ══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'How it runs', 'Where the data comes from, and where it stops.',
    'No new system of record. Growth reads from what we already run, and writes back one field.')

  const cols = [
    ['SOURCES', RED, [
      ['HRIS', 'Band, function, manager. Nightly.'],
      ['MyDevelopment', 'Learning and LinkedIn seed skills.'],
      ['HC Connect', 'Open vacancies onto the shelf.'],
      ['People', 'Employees correct. Managers post.'],
    ]],
    ['STORE', SLATE, [
      ['Supabase Postgres', 'Encrypted in transit and at rest.'],
      ['Row-level security', 'You see yours. A manager sees theirs.'],
      ['SSO via Azure AD', 'No separate password or leaver process.'],
      ['Retention', 'Profile +12 months. Log 24 months.'],
    ]],
    ['MATCH', GOLD, [
      ['Claude scores fit', 'A score, plus its reasoning in words.'],
      ['Batch, on change', 'Not per page view. The cost control.'],
      ['Four factors', 'Verified 50 · claimed 20 · rest 30.'],
      ['What we send', 'Skills and role text. No name or ID.'],
    ]],
    ['SURFACES', TEAL, [
      ['My Matches', 'Everything at 80% and above.'],
      ['Quarterly email', 'Three best matches. One click.'],
      ['Manager shortlist', 'Their own applicants, with evidence.'],
      ['Skills inventory', 'The planning asset, kept current.'],
    ]],
  ]
  const cw = (CW - 3*0.22)/4
  cols.forEach((c,i) => {
    const x = M + i*(cw+0.22)
    card(s, { x, y:2.06, w:cw, h:3.72 })
    s.addShape(p.ShapeType.rect, { x, y:2.06, w:cw, h:0.075, fill:{ color:c[1] }, line:{ width:0 } })
    s.addText(c[0], { x:x+0.24, y:2.24, w:cw-0.48, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:c[1], charSpacing:1.6, isTextBox:true, margin:0 })
    c[2].forEach((r,j) => {
      const y = 2.62 + j*0.76
      s.addText(r[0], { x:x+0.24, y, w:cw-0.48, h:0.24, fontFace:F, fontSize:14.5, bold:true,
        color:INK, isTextBox:true, margin:0, valign:'top' })
      s.addText(r[1], { x:x+0.24, y:y+0.24, w:cw-0.48, h:0.50, fontFace:F, fontSize:14,
        color:MUTE, lineSpacing:16, isTextBox:true, margin:0, valign:'top' })
    })
    if (i<3) s.addText('›', { x:x+cw+0.02, y:3.72, w:0.18, h:0.40, fontFace:F, fontSize:26,
      bold:true, color:'C4BCAE', align:'center', valign:'middle', isTextBox:true, margin:0 })
  })

  panel(s, { x:M, y:5.88, w:CW, h:1.00 }, SAND)
  s.addText('GOVERNANCE', { x:M+0.30, y:6.04, w:1.60, h:0.26, fontFace:F, fontSize:14, bold:true,
    color:RED, charSpacing:1.6, isTextBox:true, margin:0 })
  ;[['DPIA signed before build starts'],
    ['Immersions governed by Policy 211_2021'],
    ['HR approves every post before it goes live'],
    ['The model never gates an application'],
    ['Audit trail on every match']]
   .forEach((g,i) => {
    const x = M + 2.00 + i*2.02
    s.addShape(p.ShapeType.rect, { x, y:6.06, w:0.04, h:0.58, fill:{ color:TEAL }, line:{ width:0 } })
    s.addText(g[0], { x:x+0.16, y:6.02, w:1.80, h:0.66, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:17, isTextBox:true, margin:0, valign:'middle' })
  })
  pageNo(s)
  s.addNotes('One minute. This is the slide IT, the DPO and the Chief AI Officer will each want, for different reasons.\n\nFor IT: there is no new system of record. Growth reads from HRIS, MyDevelopment and HC Connect, and the only thing it writes back into a corporate system is one source-field value on a requisition. Supabase gives us Postgres, authentication, row-level security and scheduled jobs in one managed service — that is the lever that took a separate API service out of the build.\n\nFor the DPO: row-level security means a manager sees applicants to their own post and nothing else. Authentication is Azure AD single sign-on, so joiners and leavers are handled by the process we already run — nobody has to remember to deprovision. LinkedIn data is employee-supplied and opt-in. Retention is profile-while-employed plus twelve months, referral log twenty-four. The DPIA is costed into the build and is a launch gate, not a follow-up.\n\nFor the Chief AI Officer, four design constraints, and I would say all four out loud. One: the prompt carries skills, role text and stated aspiration — no name, no employee ID, no band, no salary, no protected attributes. Two: it scores a person against a post, never people against each other. Three: it never gates an application; a low score is advice, and anyone can apply anyway. Four: the reasoning is shown on every card, so an employee can see why and disagree.\n\nOn commercial data terms specifically: zero-data-retention is an available enterprise configuration, and confirming it in the DPA with Anthropic is on the pre-build checklist. I am not claiming it is already in place — that is a procurement action, and it should be closed before the first real profile is loaded.\n\nOn cost control, since the previous slide raised it: batch scoring, rescoring only on change, and the cheaper model tier are the three levers, and all three are already in the design rather than being things we would bolt on later.')
}

/* ═══ 14 · ADOPTION ═════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Adoption', 'An empty marketplace dies in week one.',
    'So we stock the shelves and seed the profiles before anyone is invited in.')

  const cw = (CW - 0.34)/2
  const before = [
    ['Seed the shelves', '25 opportunities live before anyone is invited in, each committed by a named manager.'],
    ['Seed the skills', 'Pre-filled from MyDevelopment and LinkedIn. People correct a draft, not fill a blank page.'],
    ['Recruit six champions', 'Managers who post and hire early. "Talent Exporter" recognition to ExCo.'],
  ]
  const after = [
    ['Launch comms', 'Town hall demo, a film of one real internal move, and the CEO posting the first opportunity.'],
    ['Quarterly top-match email', 'Your three best matches, by name, one click to apply. This is what doubles applications.'],
    ['Measure it properly', 'Hold back half of requisitions from promotion for a quarter. That settles the retention claim.'],
  ]
  ;[['BEFORE LAUNCH — 90 DAYS', before, RED, M],
    ['AT LAUNCH AND AFTER', after, TEAL, M+cw+0.34]].forEach(col => {
    s.addText(col[0], { x:col[3], y:2.30, w:cw, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:col[2], charSpacing:1.8, isTextBox:true, margin:0 })
    col[1].forEach((it,i) => {
      const y = 2.74 + i*1.26
      chip(s, col[3], y, i+1, col[2])
      s.addText(it[0], { x:col[3]+0.58, y:y-0.02, w:cw-0.58, h:0.34, fontFace:F, fontSize:17,
        bold:true, color:INK, isTextBox:true, margin:0, valign:'top' })
      s.addText(it[1], { x:col[3]+0.58, y:y+0.34, w:cw-0.62, h:0.66, fontFace:F, fontSize:15,
        color:BODY, lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
    })
  })
  panel(s, { x:M, y:6.32, w:CW, h:0.60 }, SAND)
  s.addText([{ text:'Year-one target:  ', options:{ bold:true, color:INK } },
             { text:'275 internal applications · 60% of the pilot with a populated profile · 25 opportunities live at any time.', options:{ color:BODY } }],
    { x:M+0.30, y:6.32, w:CW-0.60, h:0.60, fontFace:F, fontSize:15, valign:'middle',
      isTextBox:true, margin:0 })
  pageNo(s)
  s.addNotes('The failure mode for every internal marketplace is the same: it launches, it is empty, people look once and never return. So the first three items all happen before anyone is invited in.\n\nOn seeding skills — this is why MyDevelopment and LinkedIn matter. A blank profile is a dead profile. If we pre-fill from records we already hold and ask the employee to correct rather than author, completion goes from a twenty-minute chore to a two-minute one. Data protection position: LinkedIn data is employee-supplied and opt-in, and the DPIA covers it.\n\nOn the quarterly email — this is the mechanism that does the heavy lifting on the previous slide. We need applications to go from 154 to 275 a year. A quarterly note saying "here are your three best matches, by name" is the cheapest way to get there. It costs 15,987 pesos a year, it is on the cost slide, and it is the line I would defend last if the budget were cut.\n\nOn measurement — the holdout is not optional. It is what turns the retention number from an argument into a finding, and it is what I would want to bring back to this room in twelve months.\n\nFurther comms detail if asked: the launch film features one real internal mover telling their own story; a monthly "new on the shelves" digest; and a standing item in the ExCo pack showing posts, applications and fills by function — visibility of who is NOT posting is what moves managers.')
}

/* ═══ 15 · THE ASK ══════════════════════════════════════════════ */
{
  const s = next(CREAM); N++
  s.addShape(p.ShapeType.rect, { x:0, y:0, w:0.26, h:H, fill:{ color:RED }, line:{ width:0 } })
  s.addText('THE ASK', { x:1.15, y:0.92, w:8, h:0.30, fontFace:F, fontSize:14, bold:true,
    color:RED, charSpacing:2.4, isTextBox:true, margin:0 })
  s.addText('Three decisions.', { x:1.15, y:1.32, w:9, h:0.72, fontFace:F, fontSize:38,
    bold:true, color:INK, isTextBox:true, margin:0, valign:'middle' })

  const asks = [
    ['Approve the build', '₱1.54M in year one, ₱2.05M over three. Pilot goes live in IT, HR and Operations — 1,113 people.', 'CFO'],
    ['Commit the source field', 'Recruitment adds a "Growth Marketplace" value to HC Connect. A form change, free, and without it no attributed hire can be proved.', 'CPO'],
    ['Name the six champion managers', 'Six leaders who commit to posting a gig or an immersion before launch. Without stock on the shelves, nothing else here works.', 'ExCo'],
  ]
  asks.forEach((a,i) => {
    const y = 2.34 + i*1.34
    chip(s, 1.15, y+0.10, i+1, RED)
    s.addText(a[0], { x:1.78, y:y, w:5.2, h:0.40, fontFace:F, fontSize:21, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(a[1], { x:1.78, y:y+0.42, w:7.6, h:0.76, fontFace:F, fontSize:15.5,
      color:BODY, lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
    s.addShape(p.ShapeType.roundRect, { x:9.62, y:y+0.04, w:0.96, h:0.36, rectRadius:0.18,
      fill:{ color:SAND }, line:{ color:SANDD, width:1 } })
    s.addText(a[2], { x:9.62, y:y+0.04, w:0.96, h:0.36, fontFace:F, fontSize:14, bold:true,
      color:GOLD, align:'center', valign:'middle', isTextBox:true, margin:0 })
    if (i<2) rule(s, 1.15, y+1.22, 9.43, SANDD)
  })
  s.addShape(p.ShapeType.rect, { x:1.15, y:6.42, w:1.5, h:0.06, fill:{ color:RED }, line:{ width:0 } })
  s.addText('We are paying to find people we may already employ. ₱614 per employee a year stops that.',
    { x:1.15, y:6.62, w:11.4, h:0.44, fontFace:F, fontSize:17, bold:true, color:INK,
      isTextBox:true, margin:0, valign:'middle' })
  pageNo(s)
  s.addNotes('Close on the three asks and then stop talking. Do not summarise.\n\nThe second ask is the one people underestimate. Without a "Growth Marketplace" source value in HC Connect, every internal hire that came through the marketplace is invisible in our own data and gets attributed to the recruitment tool. It costs nothing and it is the difference between coming back here in a year with evidence and coming back with anecdotes. Get it agreed before the build starts, not after.\n\nThe third ask is the one that determines whether this works. Six managers, each committing one gig or one immersion before launch. If nobody in this room will name them, the honest answer is that the organisation is not ready and we should not spend the 1.78 million yet.')
}

/* ═══ 16 · APPENDIX — HOW ONE FILL IS VALUED ════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix', 'What one internal fill is worth, net of the backfill.',
    'The hiring-cost saving is smaller than it looks, and this is why.')

  const lw = CW*0.56
  const steps = [
    ['We do not pay TA to hire a Band C from outside', '+₱35,367', TEAL],
    ['But HR and TA still run the internal process', '−₱3,378', RED],
    ['And the Band B seat they vacate is hired externally', '−₱6,977', RED],
    ['Band C seat filled in 23 days, not 43 — output kept', '+₱85,681', TEAL],
    ['The Band B seat is now empty for 43 days', '−₱72,109', RED],
  ]
  steps.forEach((st,i) => {
    const y = 2.10 + i*0.66
    s.addText(st[0], { x:M, y, w:lw-1.70, h:0.56, fontFace:F, fontSize:15, color:BODY,
      lineSpacing:20, isTextBox:true, margin:0, valign:'middle' })
    s.addText(st[1], { x:M+lw-1.66, y, w:1.60, h:0.56, fontFace:F, fontSize:16, bold:true,
      color:st[2], align:'right', isTextBox:true, margin:0, valign:'middle' })
    rule(s, M, y+0.58, lw, LINE)
  })
  panel(s, { x:M, y:5.48, w:lw, h:0.74 }, RED)
  s.addText('NET VALUE, ONE BAND C INTERNAL FILL', { x:M+0.28, y:5.48, w:lw-2.10, h:0.74,
    fontFace:F, fontSize:15, bold:true, color:WHITE, charSpacing:0.6, isTextBox:true,
    margin:0, valign:'middle' })
  s.addText('₱38,584', { x:M+lw-2.06, y:5.48, w:1.80, h:0.74, fontFace:F, fontSize:22, bold:true,
    color:WHITE, align:'right', isTextBox:true, margin:0, valign:'middle' })

  const rx = M+lw+0.40, rw = CW-lw-0.40
  s.addText('BLENDED ON THE 2024–2026 HIRING MIX', { x:rx, y:2.02, w:rw, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:RED, charSpacing:1.4, isTextBox:true, margin:0 })
  ;[['Band B fills', '539 over 3 yrs', '₱1,943 each'],
    ['Band C fills', '299 over 3 yrs', '₱38,584 each'],
    ['Blended', '838 over 3 yrs', '₱15,017 each']]
   .forEach((r,i) => {
    const y = 2.44 + i*0.70
    const last = i===2
    if (last) panel(s, { x:rx-0.18, y:y-0.06, w:rw+0.40, h:0.62 }, SAND)
    s.addText(r[0], { x:rx, y, w:rw*0.40, h:0.50, fontFace:F, fontSize:15, bold:last,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[1], { x:rx+rw*0.38, y, w:rw*0.28, h:0.50, fontFace:F, fontSize:14.5, color:MUTE,
      isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[2], { x:rx+rw*0.56, y, w:rw*0.42, h:0.50, fontFace:F, fontSize:15, bold:true,
      color:last?RED:BODY, align:'right', isTextBox:true, margin:0, valign:'middle' })
  })
  rule(s, rx, 4.62, rw, LINE)
  s.addText('Plus turnover we avoid', { x:rx, y:4.76, w:rw, h:0.30, fontFace:F, fontSize:15,
    bold:true, color:INK, isTextBox:true, margin:0, valign:'top' })
  s.addText('15 points of excess attrition × ₱508,397 replacement cost = ₱76,260 for every person who gets the move.',
    { x:rx, y:5.08, w:rw, h:0.80, fontFace:F, fontSize:14.5, color:BODY, lineSpacing:19,
      isTextBox:true, margin:0, valign:'top' })
  panel(s, { x:rx-0.16, y:5.92, w:rw+0.2, h:0.72 }, REDT)
  s.addText([{ text:'₱91,276  ', options:{ fontSize:20, bold:true, color:RED } },
             { text:'total, per extra internal fill', options:{ fontSize:14.5, color:BODY } }],
    { x:rx, y:5.92, w:rw, h:0.72, fontFace:F, valign:'middle', isTextBox:true, margin:0 })
  pageNo(s)
  s.addNotes('This is the slide to turn to when someone says the hiring-cost saving looks small.\n\nIt is small, and that is the honest answer. Internal mobility does not eliminate a hire — it moves the hire one band down the chain, where it is cheaper and faster but not free. Most business cases for talent marketplaces quietly skip this. Ours does not.\n\nThe earlier draft of this business case used a 350,000-peso avoided agency fee per internal fill. I retired it: it was cited to the v1 paper, that paper does not contain it, and it conflicts with TA\'s own 2025 cost-per-hire file. Everything here now comes from that file and from Payroll.\n\nWhere the value genuinely is: the 76,260 of replacement cost we do not pay because the person stayed. That is five-sixths of it. An earlier draft of this pack had the speed benefit far larger, because it assumed 58 days to fill externally against 21 internally. The real figures are 43 and 23 — 20 days saved, not 37 — and the backfilled seat sits empty for 43 of them. Correcting it cut the value of a fill from 119,822 to 91,276 and turned this into a retention case rather than a speed case. Band B barely pays at all on this basis: 1,943 a fill, because the Band M seat left behind eats nearly the whole saving.')
}

/* ═══ 17 · APPENDIX — THE TURNOVER INPUT ════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix', 'The turnover line, and the number HR still owes us.',
    'The largest line in the case. Measured, derived and assumed, kept apart.')

  const lw = CW*0.47
  s.addText('WHAT ₱508,397 IS', { x:M, y:2.12, w:lw, h:0.26, fontFace:F, fontSize:14, bold:true,
    color:RED, charSpacing:1.4, isTextBox:true, margin:0 })
  ;[['Band B average monthly basic', '₱36,333.85', 'Payroll'],
    ['Band C average monthly basic', '₱92,821.09', 'Payroll'],
    ['Blended on 539 B / 299 C hires', '₱56,488.60', '3-yr mix'],
    ['Annualised ×12, basic only', '₱677,863', 'a year'],
    ['Replacement at 75% of that', '₱508,397', 'assumed']]
   .forEach((r,i) => {
    const y = 2.52 + i*0.62
    const last = i===4
    if (last) panel(s, { x:M-0.14, y:y-0.05, w:lw+0.28, h:0.62 }, REDT)
    s.addText(r[0], { x:M, y, w:lw-2.60, h:0.52, fontFace:F, fontSize:14.5, bold:last,
      color:INK, lineSpacing:19, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[1], { x:M+lw-2.62, y, w:1.40, h:0.52, fontFace:F, fontSize:15.5, bold:true,
      color:last?RED:INK, align:'right', isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[2], { x:M+lw-1.16, y, w:1.16, h:0.52, fontFace:F, fontSize:14, color:MUTE,
      align:'right', isTextBox:true, margin:0, valign:'middle' })
    if (!last) rule(s, M, y+0.54, lw, LINE)
  })
  panel(s, { x:M, y:5.78, w:lw, h:1.10 }, SAND)
  s.addText([{ text:'The 75% is not a Home Credit figure. ', options:{ bold:true, color:INK } },
             { text:'Published ranges run 50–200% of salary by level. 75% of basic is at the low end, and basic excludes the 13th month.', options:{ color:BODY } }],
    { x:M+0.28, y:5.78, w:lw-0.56, h:1.10, fontFace:F, fontSize:14.5, lineSpacing:19,
      valign:'middle', isTextBox:true, margin:0 })

  const rx = M+lw+0.42, rw = CW-lw-0.42
  s.addText('THE COMPARATOR WE DO NOT YET HAVE', { x:rx, y:2.12, w:rw, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:GOLD, charSpacing:1.4, isTextBox:true, margin:0 })
  s.addText('43% of the 2025 turned-down cohort has left. Against what? Earlier drafts used 19%, which traced to a placeholder tile in the v1 prototype, not to Payroll. It is withdrawn.',
    { x:rx, y:2.48, w:rw, h:0.86, fontFace:F, fontSize:14.5, color:BODY, lineSpacing:19,
      isTextBox:true, margin:0, valign:'top' })
  s.addText('THE ASK: band B and C non-mass attrition, 2025. Not the company rate — mass operations would drag it up.',
    { x:rx, y:3.40, w:rw, h:0.60, fontFace:F, fontSize:14.5, bold:true, color:INK,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  s.addTable([
    [{text:'comparator',options:{bold:true,color:MUTE}},{text:'excess',options:{bold:true,color:MUTE,align:'right'}},
     {text:'per fill',options:{bold:true,color:MUTE,align:'right'}},{text:'floor',options:{bold:true,color:MUTE,align:'right'}},
     {text:'exp.',options:{bold:true,color:MUTE,align:'right'}}],
    ['20%', {text:'23 pt',options:{align:'right'}}, {text:'₱133,390',options:{align:'right'}},
            {text:'1.2',options:{align:'right'}}, {text:'4.7',options:{align:'right'}}],
    ['25%', {text:'18 pt',options:{align:'right'}}, {text:'₱107,970',options:{align:'right'}},
            {text:'1.0',options:{align:'right'}}, {text:'4.5',options:{align:'right'}}],
    [{text:'28%  modelled',options:{bold:true,color:INK}}, {text:'15 pt',options:{align:'right',bold:true}},
     {text:'₱92,718',options:{align:'right',bold:true}}, {text:'0.9',options:{align:'right',bold:true,color:RED}},
     {text:'4.4',options:{align:'right',bold:true,color:TEAL}}],
    ['30%', {text:'13 pt',options:{align:'right'}}, {text:'₱82,550',options:{align:'right'}},
            {text:'0.8',options:{align:'right'}}, {text:'4.3',options:{align:'right'}}],
    ['35%', {text:'8 pt',options:{align:'right'}}, {text:'₱57,130',options:{align:'right'}},
            {text:'0.5',options:{align:'right'}}, {text:'4.0',options:{align:'right'}}],
  ], { x:rx, y:4.20, w:rw, colW:[1.74,0.95,1.36,0.80,0.92], fontFace:F, fontSize:14, color:BODY,
       rowH:0.30, border:{ type:'solid', color:LINE, pt:1 }, valign:'middle' })
  s.addText('Even at a 35% comparator the expected case clears 4.0. The pilot floor never clears — that is the real finding.',
    { x:rx, y:6.18, w:rw, h:0.60, fontFace:F, fontSize:14.5, bold:true, color:INK,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  pageNo(s)
  s.addNotes('Turn to this the moment anyone questions the turnover line, and volunteer it if the CFO looks sceptical.\n\nThree layers, and I want them kept apart.\n\nMEASURED: 67 turned down in 2025, 38 still employed in September 2026. HRIS fact, re-pullable. Payroll band averages are also fact.\n\nDERIVED: the blend. The 2025 band split — 186 Band B to 103 Band C — scaled onto the three-year external hire volume of 838, weights the two band averages into about 56,488 a month, 677,863 a year. Arithmetic, plus one assumption I should name: we only have band-level counts for 2025, so those proportions are held constant across 2024 and 2026. If TA can give us the real splits it is a one-line change, and it matters, because Band B and Band C now differ twentyfold per fill.\n\nASSUMED: two things. First, replacement at 75% of annual basic — published ranges run 50 to 200% of salary depending on seniority, so 75% of basic is deliberately at the low end, and using basic rather than total cost understates it again. Second, the comparator attrition rate, which we do not have.\n\nOn that second one: I had 19% in an earlier draft. It came from a demo tile in the v1 prototype that read "94% versus 81% company average" — illustrative placeholder text I wrote, never a Payroll figure. Withdrawing it is the right call and I would rather say so than have it found.\n\nThe table is the answer to "what if you are wrong". Across the whole plausible range the expected case stays above 4.0. The floor moves from 1.2 to 0.5 and never clears 1.0 at the modelled comparator — so on measured benefit alone, at pilot scale, this does not pay for itself. That is exactly why confirming this number is the first thing on the measurement plan, and why the ask is framed as buying evidence rather than buying a return.')
}

/* ═══ 18 · APPENDIX — SOURCES AND ASSUMPTIONS ═══════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix', 'Every number, and where it came from.',
    'Anything marked as a planning assumption has not been measured and should be challenged.')

  const cw = (CW-0.34)/2
  const cols = [
    ['MEASURED — HOME CREDIT DATA', RED, [
      'Internal job posting, 2024–2026: 1,008 vacancies, 463 internal applicants, 170 accepted. Internal fill rate 17%.',
      '2025 turned-down cohort: 67 applicants, 38 still employed as of September 2026 — 43% of the cohort has left.',
      'TA cost per hire, 2025: ₱5,140 band M, ₱6,977 band B, ₱35,367 band C. HR/TA cost per hire ₱3,378, incurred on internal fills too.',
      '2025 external hires: 186 band B, 103 band C — the only band-level split we hold, scaled onto 838 external hires over 2024–2026.',
      'Payroll average monthly basic, September 2026: ₱15,144 band M, ₱36,334 band B, ₱92,821 band C.',
      'Build: ₱1,785,500, costed by IT in man-hours, excluding AI.',
      'HRIS headcount: 1,113 in the pilot scope.',
    ]],
    ['MODELLED — AND HOW HARD', GOLD, [
      'Salaries annualised ×12, basic only — 13th month and contributions excluded.',
      'Replacement at 75% of annual basic = ₱508,397 blended band B/C.',
      'Comparator attrition NOT confirmed. The 19% in earlier drafts is withdrawn. Modelled at 15 points.',
      'Days to fill: 43 external, 23 internal — 20 days saved. Backfill assumed one band down, hired externally, and idle for the full 43.',
      '336 vacancies a year company-wide; 60 internal requisitions a year in the pilot (BRD).',
      'Shelf retention: 174 participants a year at a 3-point lift, cut from 13 observed in v1.',
      'Vendor band is an RFP planning range, not a quote. ₱61 = US$1, 10% discount.',
    ]],
  ]
  cols.forEach((c,i) => {
    const x = M + i*(cw+0.34)
    card(s, { x, y:2.00, w:cw, h:4.66 })
    s.addShape(p.ShapeType.rect, { x, y:2.00, w:cw, h:0.075, fill:{ color:c[1] }, line:{ width:0 } })
    s.addText(c[0], { x:x+0.30, y:2.22, w:cw-0.60, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:c[1], charSpacing:1.4, isTextBox:true, margin:0 })
    s.addText(c[2].map((t,j,a) => ({ text:t, options:{ bullet:true, breakLine:j<a.length-1 } })),
      { x:x+0.30, y:2.58, w:cw-0.60, h:3.94, fontFace:F, fontSize:14, color:BODY,
        lineSpacing:18, paraSpaceAfter:5, isTextBox:true, margin:0, valign:'top' })
  })
  src(s, 'Working model: exec-model.py · Full CBA: V2_CBA.md · Internal — do not distribute outside the organization.')
  pageNo(s)
  s.addNotes('Do not present this. It is here so that any number challenged from the floor can be answered by turning to one slide.\n\nThe division is deliberate: the left column is data we hold and can re-pull, the right column is judgement. If a panel member wants to argue, point them at the right column — that is where the argument is, and I have already taken the conservative side of every item in it.')
}

/* ═══ 19 · APPENDIX — RISKS ═════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix', 'What could go wrong, and what we have done about it.',
    'The two gates are free — both are decisions, not budget.')

  const rows = [
    ['Managers do not post', 'GATE',
     'Empty shelves, and the marketplace dies in week one.',
     'Twenty-five opportunities committed before launch. Six named champions. "Talent Exporter" recognition to ExCo.', RED],
    ['Recruitment declines the source field', 'GATE',
     'No attributed hire can be proved. We come back in a year with anecdotes.',
     'Secure it before the build starts. It is a form configuration, not an integration.', RED],
    ['Employees arrive to an empty profile', 'HIGH',
     'No skills on file means no matches, an empty board, and no second visit.',
     'Pre-load from MyDevelopment and LinkedIn. Correcting a draft beats authoring one.', GOLD],
    ['The retention lift is smaller than modelled', 'HIGH',
     'The benefit case thins. At zero it falls back to the measured floor.',
     'Already halved from what the data shows. The year-one holdout settles it either way.', GOLD],
    ['Build overruns', 'MED',
     'Three-year cost rises toward ₱2.9M; ratio falls to about 3.2.',
     'Still clears, and still far under the vendor bands.', MUTE],
  ]
  s.addText('RISK', { x:M+0.02, y:2.16, w:3.3, h:0.24, fontFace:F, fontSize:14, bold:true,
    color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  s.addText('IMPACT', { x:M+4.28, y:2.16, w:3.3, h:0.24, fontFace:F, fontSize:14, bold:true,
    color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  s.addText('WHAT WE HAVE DONE', { x:M+7.98, y:2.16, w:4.0, h:0.24, fontFace:F, fontSize:14,
    bold:true, color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  rows.forEach((r,i) => {
    const y = 2.52 + i*0.86
    s.addShape(p.ShapeType.roundRect, { x:M, y:y+0.20, w:0.74, h:0.30, rectRadius:0.15,
      fill:{ color:r[4]===MUTE?'ECEAE5':(r[4]===RED?REDT:GOLDT) }, line:{ width:0 } })
    s.addText(r[1], { x:M, y:y+0.20, w:0.74, h:0.30, fontFace:F, fontSize:14, bold:true,
      color:r[4], align:'center', valign:'middle', isTextBox:true, margin:0 })
    s.addText(r[0], { x:M+0.88, y, w:3.24, h:0.72, fontFace:F, fontSize:15.5, bold:true,
      color:INK, lineSpacing:20, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[2], { x:M+4.28, y, w:3.50, h:0.72, fontFace:F, fontSize:14.5, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[3], { x:M+7.98, y, w:4.05, h:0.72, fontFace:F, fontSize:14.5, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'middle' })
    if (i<rows.length-1) rule(s, M, y+0.78, CW, LINE)
  })
  pageNo(s)
  s.addNotes('Two of these are gates rather than risks: manager supply and the source field. Both are decisions this room can make today, both cost nothing, and the project should not start without them. Saying that out loud is what makes the rest of the risk table credible.')
}

/* ── write ──────────────────────────────────────────────────────── */
p.writeFile({ fileName: __dirname + '/Growth_Executive_ALP.pptx' }).then(() => {
  if (WARN.length) { console.log('OVERFLOW RISKS (' + WARN.length + '):'); WARN.forEach(w => console.log('  ' + w)) }
  else console.log('no overflow risks')
  console.log('WROTE Growth_Executive_ALP.pptx · ' + N + ' slides')
})
