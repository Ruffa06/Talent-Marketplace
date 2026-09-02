/* Growth — Action Learning Project deck.  Arial throughout, min 14pt. */
const pptx = require('pptxgenjs')
const fs = require('fs')
const p = new pptx()
p.layout = 'LAYOUT_WIDE'                 // 13.333 x 7.5
p.author = 'Ruffa Gayla Gonzales'
p.company = 'Home Credit Philippines'
p.title = 'Growth — Talent Marketplace'

/* ── tokens ─────────────────────────────────────────────────────── */
const RED='C00000', INK='0F172A', BODY='374151', MUTE='6B7280', LINE='E5E7EB'
const TINT='F7F8FA', REDT='FDF1F1', GREEN='15803D', GREENT='F0FDF4'
const AMBER='B45309', AMBERT='FFFBEB', BLUE='1D4ED8', BLUET='EFF6FF', WHITE='FFFFFF'
const F='Arial'
const M=0.55, W=13.333, CW=W-2*M          // content width 12.233
const shadow = () => ({ type:'outer', color:'000000', blur:9, offset:1, angle:90, opacity:0.07 })

const img = f => ({ data:'image/png;base64,'+fs.readFileSync(f).toString('base64') })

/* ── chrome ─────────────────────────────────────────────────────── */
function head(s, eyebrow, title, sub) {
  const ts = title.length > 56 ? 27 : 32
  s.addText(eyebrow.toUpperCase(), { x:M, y:0.34, w:CW, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:RED, charSpacing:2.2, isTextBox:true, margin:0 })
  s.addText(title, { x:M, y:0.63, w:CW, h:0.62, fontFace:F, fontSize:ts, bold:true,
    color:INK, isTextBox:true, margin:0, valign:'top' })
  if (sub) s.addText(sub, { x:M, y:1.28, w:CW, h:0.34, fontFace:F, fontSize:16,
    color:MUTE, isTextBox:true, margin:0, valign:'top' })
}
function foot(s, txt, n) {
  s.addShape(p.ShapeType.line, { x:M, y:6.88, w:CW, h:0, line:{ color:LINE, width:1 } })
  s.addText(txt, { x:M, y:6.94, w:CW-0.6, h:0.48, fontFace:F, fontSize:14, color:'9CA3AF',
    lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
  s.addText(String(n), { x:W-M-0.45, y:6.94, w:0.45, h:0.28, fontFace:F, fontSize:14,
    color:'9CA3AF', align:'right', isTextBox:true, margin:0 })
}
const card = (s,o) => s.addShape(p.ShapeType.roundRect, Object.assign({
  rectRadius:0.06, fill:{ color:WHITE }, line:{ color:LINE, width:1 }, shadow:shadow() }, o))
const tintCard = (s,o,c) => s.addShape(p.ShapeType.roundRect, Object.assign({
  rectRadius:0.06, fill:{ color:c||TINT }, line:{ width:0 } }, o))

/* A numbered / lettered badge — the deck's repeating motif. */
function badge(s, x, y, txt, fill, txtc, d) {
  d = d || 0.42
  s.addShape(p.ShapeType.ellipse, { x, y, w:d, h:d, fill:{ color:fill||RED }, line:{ width:0 } })
  s.addText(txt, { x, y:y+0.005, w:d, h:d, fontFace:F, fontSize:d>0.5?18:15, bold:true,
    color:txtc||WHITE, align:'center', valign:'middle', isTextBox:true, margin:0 })
}
/* Big number + label + note, used across the money slides. */
function stat(s, x, y, w, big, lbl, note, col, h) {
  h = h || 1.74
  card(s, { x, y, w, h })
  s.addText(big, { x:x+0.22, y:y+0.12, w:w-0.44, h:0.50, fontFace:F, fontSize:30, bold:true,
    color:col||INK, isTextBox:true, margin:0, valign:'middle' })
  s.addText(lbl, { x:x+0.22, y:y+0.60, w:w-0.44, h:0.52, fontFace:F, fontSize:15, bold:true,
    color:INK, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  if (note) s.addText(note, { x:x+0.22, y:y+1.10, w:w-0.44, h:h-1.14, fontFace:F, fontSize:14,
    color:MUTE, lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
}
let N = 0
const WARN = []
function estHeight(txt, w, fs, bold, lineSpacing) {
  const cpi = w / ((fs/72) * (bold ? 0.545 : 0.50))          // chars that fit on one line
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
  if (lines <= 1) return fs * 1.16 / 72
  return lines * ((lineSpacing || fs * 1.20) / 72)
}
const next = (dark) => {
  const s = p.addSlide()
  s.background = { color: dark ? INK : WHITE }
  const raw = s.addText.bind(s)
  s.addText = function (t, o) {
    const txt = Array.isArray(t) ? t.map(r => r.text).join('') : String(t)
    if (o && o.w && o.h && !o.bullet) {
      const need = estHeight(txt, o.w, o.fontSize || 18, o.bold, o.lineSpacing)
      if (need > o.h * 1.06 + 0.04) {
        const fs = o.fontSize || 18
        const cpi = o.w / ((fs/72) * (o.bold ? 0.545 : 0.50))
        const maxLines = Math.floor((o.h + 0.02) / ((o.lineSpacing || fs*1.20)/72))
        const maxChars = Math.max(0, Math.floor(cpi * maxLines * 0.94))
        WARN.push('s' + N + ' | ' + txt.length + ' chars, fits ' + maxChars +
          ' | ' + txt.slice(0, 46).replace(/\s+/g, ' '))
      }
    }
    return raw(t, o)
  }
  return s
}

/* ═══ 1 · TITLE ══════════════════════════════════════════════════ */
{
  const s = next(true); N++
  s.addImage(Object.assign(img('mark-white.png'), { x:M, y:1.62, w:0.95, h:0.95, transparency:6 }))
  s.addText('GROWTH', { x:M, y:2.72, w:11, h:1.05, fontFace:F, fontSize:60, bold:true,
    color:WHITE, charSpacing:2, isTextBox:true, margin:0 })
  s.addText('Find your next move — without leaving Home Credit.', { x:M, y:3.82, w:10.6, h:0.5,
    fontFace:F, fontSize:24, color:'E2E8F0', isTextBox:true, margin:0 })
  s.addText('An internal talent marketplace for Home Credit Philippines', { x:M, y:4.34, w:10.6,
    h:0.36, fontFace:F, fontSize:17, color:'94A3B8', isTextBox:true, margin:0 })
  s.addShape(p.ShapeType.line, { x:M, y:5.28, w:5.4, h:0, line:{ color:RED, width:3 } })
  s.addText([
    { text:'Ruffa Gayla Gonzales', options:{ bold:true, color:WHITE } },
    { text:'   ·   HR Organizational Effectiveness', options:{ color:'94A3B8' } },
  ], { x:M, y:5.48, w:11, h:0.3, fontFace:F, fontSize:17, isTextBox:true, margin:0 })
  s.addText('Sponsor: Barbs Mecua   ·   LIFT Management Development Programme   ·   Action Learning Project',
    { x:M, y:5.82, w:11.6, h:0.3, fontFace:F, fontSize:15, color:'64748B', isTextBox:true, margin:0 })
  s.addText('Internal — do not distribute outside the organization.', { x:M, y:6.86, w:8,
    h:0.3, fontFace:F, fontSize:14, color:'475569', isTextBox:true, margin:0 })
  s.addNotes('Open on the promise, not the product. "Growth is already available at Home Credit — you just cannot see it." Everything after this slide is about the plumbing that makes it visible.')
}

/* ═══ 2 · EXECUTIVE SUMMARY ══════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Executive summary', 'One page, four numbers, one decision.',
    'Everything that follows is evidence for this slide.')
  const bx = [
    ['THE PROBLEM', RED, REDT,
     'We fill 17.6% of roles internally against a ~30% benchmark. In 2025 we spent ₱13.4M hiring, ₱6.1M of it to headhunters for Band C alone — while 88% of our people say they can grow here.'],
    ['THE SOLUTION', BLUE, BLUET,
     'One internal marketplace for gigs, immersions and service offers, with AI matching. It promotes HC Connect vacancies rather than duplicating them — and proves which applications it caused.'],
    ['THE MONEY', GREEN, GREENT,
     '₱1.05M over three years for a 637-person pilot — ₱550 per employee a year. Benefit ₱7.1M, benefit–cost ratio 6.8, payback in 9 months. Buying Gloat or Fuel50 costs ₱10.2M–₱27.8M.'],
    ['THE ASK', INK, TINT,
     'Approve the ₱766k year-one build and a three-month pilot in IT, Operations and People & Culture. And ask recruitment for one new source value in HC Connect — free to them, and what makes the benefit provable.'],
  ]
  const cw = (CW - 3*0.24) / 4
  bx.forEach((b, i) => {
    const x = M + i*(cw+0.24)
    tintCard(s, { x, y:1.82, w:cw, h:3.88 }, b[2])
    s.addText(b[0], { x:x+0.24, y:2.00, w:cw-0.48, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:b[1], charSpacing:1.6, isTextBox:true, margin:0 })
    s.addText(b[3], { x:x+0.24, y:2.36, w:cw-0.48, h:3.16, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.88, w:CW, h:0.86 }, INK)
  s.addText([
    { text:'In one line:  ', options:{ color:'94A3B8', bold:true } },
    { text:'We are paying headhunters to find people we may already employ.', options:{ color:WHITE, bold:true } },
  ], { x:M+0.34, y:5.88, w:CW-0.68, h:0.86, fontFace:F, fontSize:21, valign:'middle', isTextBox:true, margin:0 })
  foot(s, 'Sources: TA hiring data 2024–2026 · HCPH exit survey and eNPS · v2 cost–benefit model.', N)
  s.addNotes('If the panel reads nothing else, this is the slide. Lead with the fill rate, not engagement — our eNPS is healthy and saying so first buys credibility. Land on the one-liner.')
}

/* ═══ 3 · THE PROBLEM ════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The business problem', "The problem isn't ambition. It's plumbing.",
    'Our people believe they can grow here. The data says they mostly do not get to.')
  const cw = (CW - 3*0.24)/4
  const st = [
    ['88%','believe they can grow here','Our eNPS on growth opportunity is healthy', GREEN],
    ['17.6%','of roles filled internally','vs a ~30% benchmark, 50%+ for leaders', RED],
    ['₱13.4M','spent hiring in 2025','324 roles at ₱41k blended per hire', INK],
    ['#1','controllable reason for leaving','Career & Better Opportunity: 22% of exits', RED],
  ]
  st.forEach((v,i) => stat(s, M+i*(cw+0.24), 1.80, cw, v[0], v[1], v[2], v[3], 1.80))
  tintCard(s, { x:M, y:3.78, w:CW*0.615, h:1.92 }, TINT)
  s.addText('The gap is between belief and mechanism', { x:M+0.3, y:3.94, w:CW*0.615-0.6, h:0.3,
    fontFace:F, fontSize:19, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addText('When a role opens here it goes to an outsider four times out of five. That is not a morale problem — our people say they want to grow here and believe they can. It is a connection problem: nothing reliably shows an employee an opportunity they would fit, and nothing tells a hiring manager the person they need is already on payroll.',
    { x:M+0.3, y:4.30, w:CW*0.615-0.6, h:1.28, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  tintCard(s, { x:M+CW*0.615+0.26, y:3.78, w:CW*0.385-0.26, h:1.92 }, REDT)
  s.addText('The industry says the same', { x:M+CW*0.615+0.56, y:3.94, w:CW*0.385-0.86, h:0.3,
    fontFace:F, fontSize:19, bold:true, color:RED, isTextBox:true, margin:0 })
  s.addText([
    { text:'50%', options:{ bold:true, color:INK } },
    { text:' of employees do not know internal opportunities exist.', options:{ color:BODY } },
    { text:'\n\nOnly ', options:{ color:BODY, breakLine:false } },
    { text:'1 in 5', options:{ bold:true, color:INK } },
    { text:' feels confident making an internal move.', options:{ color:BODY } },
  ], { x:M+CW*0.615+0.56, y:4.30, w:CW*0.385-0.86, h:1.28, fontFace:F, fontSize:14,
    lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  s.addText('Business problem:  raise internal mobility from 17.6% to the 30% benchmark by making opportunities visible and matching people to them intelligently.',
    { x:M, y:5.86, w:CW, h:0.72, fontFace:F, fontSize:17, bold:true, color:INK, lineSpacing:24, isTextBox:true, margin:0, valign:'middle' })
  foot(s, 'Sources: HCPH TA data · exit survey · eNPS · LinkedIn and Veris Insights internal-mobility research.', N)
  s.addNotes('Say the eNPS number out loud before the CPO does. The credibility of the whole deck rests on not overclaiming an engagement problem we do not have.')
}

/* ═══ 4 · ROOT CAUSE ═════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Root cause', 'Three failures. Only one is a technology problem.',
    'Three years of vacancy data show where the funnel actually leaks.')
  const cw = (CW*0.635 - 2*0.2)/3
  const rc = [
    ['1','Opportunities are invisible','The HC Connect board is the only channel. For 10 vacancies, 4–5 people apply.'],
    ['2','People do not feel ready','Seeing a role is not seeing a path to it. Without a signal, people opt out.'],
    ['3','Nothing matches or prepares','Nothing connects what a person can do to what an opening needs.'],
  ]
  rc.forEach((r,i) => {
    const x = M + i*(cw+0.2)
    card(s, { x, y:1.86, w:cw, h:2.36 })
    badge(s, x+0.24, 2.04, r[0])
    s.addText(r[1], { x:x+0.24, y:2.56, w:cw-0.48, h:0.6, fontFace:F, fontSize:16, bold:true,
      color:INK, lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
    s.addText(r[2], { x:x+0.24, y:3.20, w:cw-0.48, h:1.00, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  const tx = M + CW*0.635 + 0.24, tw = CW*0.365 - 0.24
  card(s, { x:tx, y:1.86, w:tw, h:2.36 })
  s.addText('Internal applications, 2024–26', { x:tx+0.24, y:2.02, w:tw-0.48, h:0.28,
    fontFace:F, fontSize:16, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addTable([
    [ {text:'Year',options:{bold:true}}, {text:'Vacancies',options:{bold:true,align:'right'}},
      {text:'Internal\napplicants',options:{bold:true,align:'right'}}, {text:'Accepted',options:{bold:true,align:'right'}} ],
    ['2024', {text:'355',options:{align:'right'}}, {text:'116',options:{align:'right'}}, {text:'65',options:{align:'right'}}],
    ['2025', {text:'302',options:{align:'right'}}, {text:'121',options:{align:'right'}}, {text:'54',options:{align:'right'}}],
    ['2026', {text:'351',options:{align:'right'}}, {text:'226',options:{align:'right'}}, {text:'51',options:{align:'right'}}],
    [ {text:'Total',options:{bold:true}}, {text:'1,008',options:{bold:true,align:'right'}},
      {text:'463',options:{bold:true,align:'right'}}, {text:'170',options:{bold:true,align:'right',color:RED}} ],
  ], { x:tx+0.24, y:2.38, w:tw-0.48, colW:[0.80,1.00,1.10,0.85], fontFace:F, fontSize:14, color:BODY, rowH:0.26,
    border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  tintCard(s, { x:M, y:4.40, w:CW, h:2.18 }, INK)
  s.addText('The leak is at the top of the funnel, not the bottom', { x:M+0.36, y:4.60, w:CW-0.72,
    h:0.34, fontFace:F, fontSize:20, bold:true, color:WHITE, isTextBox:true, margin:0 })
  const kw = (CW - 0.72 - 2*0.3)/3
  ;[['0.46','internal applicants per vacancy','463 applicants across 1,008 openings'],
    ['37%','of internal applicants are hired','170 of 463 — the bar is not the problem'],
    ['16.9%','of vacancies filled internally','the number we are trying to move']]
   .forEach((k,i) => {
    const x = M+0.36+i*(kw+0.3)
    s.addText(k[0], { x, y:5.04, w:kw, h:0.46, fontFace:F, fontSize:28, bold:true,
      color:i===1?'4ADE80':WHITE, isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x, y:5.52, w:kw, h:0.28, fontFace:F, fontSize:15, bold:true, color:'E2E8F0',
      isTextBox:true, margin:0 })
    s.addText(k[2], { x, y:5.82, w:kw, h:0.52, fontFace:F, fontSize:14, color:'94A3B8',
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'Source: HCPH internal job posting data, 2024–2026 (1,008 vacancies).', N)
  s.addNotes('The 37% figure is the one that reframes the argument. When our people do apply internally, more than a third are hired — so the screening bar is not the obstacle. Almost nobody applies. That is a visibility and readiness problem, and it is fixable.')
}

/* ═══ 5 · THE COST OF DOING NOTHING ══════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The pain', 'What it costs us to leave this alone.',
    'Five costs we are already paying, every year, for a problem we can see.')
  const items = [
    ['₱6.1M','a year to headhunters, Band C alone','₱58,823 per hire — 68% of the cost of filling a Band C role. Every internal fill returns that fee.', RED],
    ['37 days','of lost output per external hire','58 days to fill externally against 21 internally, on 289 Band B and C roles a year.', AMBER],
    ['22%','of exits cite career opportunity','The top controllable reason people leave. Replacing one costs 50–200% of annual salary.', RED],
  ]
  const items2 = [
    ['Priority work waits','ExCo initiatives get staffed by contractors, because we cannot see who inside could do the work.'],
    ['We cannot answer "who can do X?"','There is no skills inventory, so workforce planning runs on assumption rather than data.'],
  ]
  const cw = (CW - 2*0.24)/3
  items.forEach((it,i) => {
    const x = M + i*(cw+0.24)
    card(s, { x, y:1.86, w:cw, h:2.24 })
    s.addText(it[0], { x:x+0.26, y:2.06, w:cw-0.52, h:0.52, fontFace:F, fontSize:34, bold:true,
      color:it[3], isTextBox:true, margin:0, valign:'middle' })
    s.addText(it[1], { x:x+0.26, y:2.58, w:cw-0.52, h:0.52, fontFace:F, fontSize:16, bold:true,
      color:INK, lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
    s.addText(it[2], { x:x+0.26, y:3.14, w:cw-0.52, h:0.88, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  const c2 = (CW - 0.24)/2
  items2.forEach((it,i) => {
    const x = M + i*(c2+0.24)
    tintCard(s, { x, y:4.28, w:c2, h:1.28 }, TINT)
    s.addText(it[0], { x:x+0.26, y:4.46, w:c2-0.52, h:0.3, fontFace:F, fontSize:17, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(it[1], { x:x+0.26, y:4.80, w:c2-0.52, h:0.62, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.74, w:CW, h:0.86 }, REDT)
  s.addText([
    { text:'The cost of doing nothing is not zero. ', options:{ bold:true, color:RED } },
    { text:'₱6.1M a year in avoidable fees, plus the people we will replace at 50–200% of salary — for want of a mechanism that costs ₱550 per employee a year.', options:{ color:BODY } },
  ], { x:M+0.34, y:5.74, w:CW-0.68, h:0.86, fontFace:F, fontSize:16, valign:'middle',
    lineSpacing:22, isTextBox:true, margin:0 })
  foot(s, 'Sources: 2024 cost-per-hire · 2025 hiring volumes · HCPH exit survey · SHRM replacement-cost range.', N)
  s.addNotes('This is the slide that answers "why now". Every number here is a cost we are already paying. Nothing on it depends on the project working.')
}

/* ═══ 6 · THE PRIZE ══════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The prize', 'What we get back — beyond the fee we stop paying.',
    'One hard number, four compounding ones.')
  tintCard(s, { x:M, y:1.86, w:CW*0.36, h:2.5 }, INK)
  s.addText('₱3.9M', { x:M+0.34, y:2.14, w:CW*0.36-0.68, h:0.8, fontFace:F, fontSize:52,
    bold:true, color:'4ADE80', isTextBox:true, margin:0, valign:'middle' })
  s.addText('a year, if Band B and Band C internal fill reaches the 30% benchmark',
    { x:M+0.34, y:2.96, w:CW*0.36-0.68, h:0.82, fontFace:F, fontSize:16, bold:true, color:WHITE,
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  s.addText('≈ 87 internal fills a year: 56 Band B, 31 Band C.',
    { x:M+0.34, y:3.82, w:CW*0.36-0.68, h:0.62, fontFace:F, fontSize:14, color:'94A3B8',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  const gx = M + CW*0.36 + 0.26, gw = (CW*0.64 - 0.26 - 0.24)/2
  const prize = [
    ['Retention','Internal movers stay materially longer than static peers.', GREEN],
    ['The 70 of 70-20-10','How on-the-job development scales.', BLUE],
    ['Gen Z engagement','New, purposeful work — what 30% of HCPH responds to.', AMBER],
    ['A live skills inventory','Answers "who can do X?" — the people half of Unified Data.', INK],
  ]
  prize.forEach((v,i) => {
    const x = gx + (i%2)*(gw+0.24), y = 1.86 + Math.floor(i/2)*(1.19+0.12)
    card(s, { x, y, w:gw, h:1.19 })
    s.addText(v[0], { x:x+0.24, y:y+0.14, w:gw-0.48, h:0.30, fontFace:F, fontSize:15, bold:true,
      color:v[2], isTextBox:true, margin:0 })
    s.addText(v[1], { x:x+0.24, y:y+0.46, w:gw-0.48, h:0.62, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:4.58, w:CW, h:1.0 }, TINT)
  s.addText([
    { text:'The strategic prize:  ', options:{ bold:true, color:INK } },
    { text:'a middle-management bench and a tech-talent pipeline built from people already on payroll — which is what "Go Wide, Go Deep" needs and what we cannot buy fast enough externally.', options:{ color:BODY } },
  ], { x:M+0.34, y:4.58, w:CW-0.68, h:1.0, fontFace:F, fontSize:17, valign:'middle',
    lineSpacing:23, isTextBox:true, margin:0 })
  s.addText('Deliberately not claimed: engagement uplift. Our eNPS on growth opportunity is already healthy, and this project is not a fix for a problem we do not have.',
    { x:M, y:5.78, w:CW, h:0.7, fontFace:F, fontSize:15, color:MUTE, italic:true,
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Sources: TA hiring data · Deloitte 2026 Gen Z survey · SHRM internal-mobility research · 70-20-10 model.', N)
  s.addNotes('₱3.9M/yr is the gross avoided-cost prize on Bands B and C at the 30% benchmark. The cost-benefit slides later use a more conservative, attribution-safe subset of this. Say that.')
}

/* ═══ 7 · THE EVIDENCE ═══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The evidence', 'The market has already moved this way.',
    'Five findings, and the one conclusion they share.')
  const ev = [
    ['48%','now prioritise internal mobility to build leadership benches.','LinkedIn Workplace Learning'],
    ['83% / 47%','want to build new skills — but 47% do not know where to start.','Bright Horizons Education Index'],
    ['Higher','multi-year retention among employees who move internally.','SHRM'],
    ['94%','would stay longer where a company invests in their career.','BTS / Krungsri career research'],
    ['2×','retention where the learning culture is strong: 57% stay vs 27%.','BTS / Krungsri career research'],
  ]
  const cw = (CW - 4*0.2)/5
  ev.forEach((e,i) => {
    const x = M + i*(cw+0.2)
    card(s, { x, y:1.86, w:cw, h:2.98 })
    s.addText(e[0], { x:x+0.22, y:2.06, w:cw-0.44, h:0.56, fontFace:F, fontSize:e[0].length>5?24:32,
      bold:true, color:RED, isTextBox:true, margin:0, valign:'middle' })
    s.addText(e[1], { x:x+0.22, y:2.66, w:cw-0.44, h:1.56, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
    s.addText(e[2], { x:x+0.22, y:4.26, w:cw-0.44, h:0.50, fontFace:F, fontSize:14, color:'9CA3AF',
      lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.08, w:CW, h:1.5 }, INK)
  s.addText('What all five have in common', { x:M+0.36, y:5.24, w:CW-0.72, h:0.3, fontFace:F,
    fontSize:19, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText('Every finding points at the same gap, and none points at motivation. People want to move and organisations want them to — and in between there is no mechanism showing a specific person a specific opportunity they would fit. That gap is infrastructure, not culture, which is why it can be built and paid back.',
    { x:M+0.36, y:5.58, w:CW-0.72, h:0.86, fontFace:F, fontSize:15, color:'CBD5E1',
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Full citations in the appendix. Percentages are as published by each source and are not Home Credit data.', N)
  s.addNotes('Use this slide to pre-empt "is this just an HR fashion". The answer is that half the market is already doing it, and the published failure mode — intent without a route — is exactly what our own funnel data shows.')
}

/* ═══ 8 · STRATEGIC ALIGNMENT — CORPORATE ════════════════════════ */
{
  const s = next(); N++
  head(s, 'Strategic alignment · Corporate', "Three of eight priorities run on internal talent.",
    "'Go Wide, Go Deep' needs a bench, tech talent and a performance culture — we cannot buy all of it.")
  const lw = CW*0.42
  s.addText("THE EIGHT PRIORITIES '27–'29", { x:M, y:1.92, w:lw, h:0.26, fontFace:F, fontSize:14,
    bold:true, color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  const pri = [
    ['People & Culture','Capabilities · performance culture', true],
    ['Deep Focus on Tech','Core platform · Unified Data', true],
    ['Expand Horizons','MSME · secured loans · e-commerce', true],
    ['POS — defend market position','Acquisition and retention channel', false],
    ['Cash Loan','Profitable, sustainable CLX portfolio', false],
    ['App-led lifecycle','Personalised engagement · revolving', false],
    ['Risk & Collections','Customer-type scorecards · CE tools', false],
    ['Secure local funding','Diversify base · maintain spreads', false],
  ]
  pri.forEach((r,i) => {
    const y = 2.20 + i*0.565
    s.addShape(p.ShapeType.roundRect, { x:M, y, w:lw, h:0.48, rectRadius:0.05,
      fill:{ color: r[2] ? REDT : 'FAFAFA' }, line:{ color: r[2] ? 'F5C6C6' : LINE, width:1 } })
    s.addText(r[0], { x:M+0.42, y:y+0.03, w:lw-0.7, h:0.24, fontFace:F, fontSize:15, bold:true,
      color: r[2] ? INK : '9CA3AF', isTextBox:true, margin:0 })
    s.addText(r[1], { x:M+0.42, y:y+0.25, w:lw-0.7, h:0.22, fontFace:F, fontSize:14,
      color: r[2] ? MUTE : 'B8BFC9', isTextBox:true, margin:0 })
    if (r[2]) badge(s, M+0.1, y+0.10, '✓', RED, WHITE, 0.28)
  })
  const rx = M + lw + 0.42, rw = CW - lw - 0.42
  s.addText('WHAT GROWTH DELIVERS AGAINST THEM', { x:rx, y:1.92, w:rw, h:0.26, fontFace:F,
    fontSize:14, bold:true, color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  const del = [
    ['Strengthens the middle-management bench','Band B pivots and Band C lateral moves become visible, matched and trackable — built from people already on payroll.'],
    ['Builds tech talent from the inside','Gigs and immersions let Operations, Risk and HR people cross into IT work before we pay a headhunter for it.'],
    ['Creates the people half of Unified Data','A live skills inventory as a by-product — "who can do X?" answered from data rather than memory.'],
    ['Staffs new growth engines in days','MSME, e-commerce and the Unified App Journey resourced from internal capacity, not contractors.'],
  ]
  del.forEach((d,i) => {
    const y = 2.16 + i*1.18
    card(s, { x:rx, y, w:rw, h:1.10 })
    s.addText(d[0], { x:rx+0.26, y:y+0.12, w:rw-0.52, h:0.30, fontFace:F, fontSize:16, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(d[1], { x:rx+0.26, y:y+0.44, w:rw-0.52, h:0.58, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, "Source: HCPH Strategic Priorities '27–'29 — Go Wide, Go Deep (draft, to be finalised October).", N)
  s.addNotes('Three of eight — not six. People & Culture, Deep Focus on Tech, and Expand Horizons all depend on internal talent supply. Say which three and why, then move.')
}

/* ═══ 9 · STRATEGIC ALIGNMENT — HR ═══════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Strategic alignment · People & Culture', 'It advances four of the five HR priorities.',
    'And in the OneHR operating model it lands as Tier 0 self-service — digital first, automated, guided.')
  const cw = (CW - 4*0.2)/5
  const hr = [
    ['High-Performance\nCulture','Movement becomes evidence on a record, not a favour someone remembers.', true],
    ['Leadership &\nCapability Development','Immersions are the 70 of 70-20-10 — and how the bench gets built.', true],
    ['Employee Experience\n& Engagement','Delivers the stated priority: clear career progression pathways.', true],
    ['HR Digital\nTransformation','AI matching on a live skills inventory — decisions made from data.', true],
    ['HR Risk &\nCompliance','Governed by Policy 211_2021, with a full audit trail.', false],
  ]
  hr.forEach((h,i) => {
    const x = M + i*(cw+0.2)
    s.addShape(p.ShapeType.roundRect, { x, y:1.94, w:cw, h:0.78, rectRadius:0.05,
      fill:{ color: h[2] ? RED : '8A8F98' }, line:{ width:0 } })
    s.addText(h[0], { x:x+0.12, y:1.94, w:cw-0.24, h:0.78, fontFace:F, fontSize:15, bold:true,
      color:WHITE, align:'center', valign:'middle', lineSpacing:19, isTextBox:true, margin:0 })
    tintCard(s, { x, y:2.80, w:cw, h:1.72 }, TINT)
    s.addText(h[1], { x:x+0.2, y:2.96, w:cw-0.4, h:1.42, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:4.72, w:CW*0.585, h:1.86 }, INK)
  s.addText('Where it sits in the OneHR operating model', { x:M+0.34, y:4.94, w:CW*0.585-0.68,
    h:0.3, fontFace:F, fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText([
    { text:'Tier 0 — Employee & Manager Self-Service.  ', options:{ bold:true, color:'FCA5A5' } },
    { text:'Not another HR service to staff — a self-service layer that takes work off Tier 1 and feeds the Talent Acquisition and People & Culture COEs a live view of internal supply.', options:{ color:'CBD5E1' } },
  ], { x:M+0.34, y:5.30, w:CW*0.585-0.68, h:1.14, fontFace:F, fontSize:15, lineSpacing:21,
    isTextBox:true, margin:0, valign:'top' })
  const ex = M + CW*0.585 + 0.26, ew = CW*0.415 - 0.26
  tintCard(s, { x:ex, y:4.72, w:ew, h:1.86 }, GREENT)
  s.addText('It also serves Recruitment', { x:ex+0.3, y:4.94, w:ew-0.6, h:0.3, fontFace:F,
    fontSize:18, bold:true, color:GREEN, isTextBox:true, margin:0 })
  s.addText('A warm internal pipeline against every requisition, scored before anyone opens a CV.',
    { x:ex+0.3, y:5.30, w:ew-0.6, h:1.14, fontFace:F, fontSize:15, color:'166534',
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Sources: HCPH HR Strategic Priorities · OneHR Operating Model.', N)
  s.addNotes('This slide is for the CPO. Four of five HR priorities, and it lands as Tier 0 self-service rather than new headcount for HR to absorb.')
}

/* ═══ 10 · THE SOLUTION ══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The solution', 'One place. Every opportunity. Matched to you.',
    'Three routes people can join, one they can offer, and every permanent vacancy promoted with a fit score.')
  const cw = (CW - 3*0.22)/4
  const routes = [
    ['GIG','Short-term project','Hours to weeks on a real initiative, without changing roles. Outside work hours, or with the manager\'s permission.', RED, REDT],
    ['DJI','Job Immersion','Three to nine months in another function under Policy 211_2021. Headcount, salary and benefits stay put.', GREEN, GREENT],
    ['OFFER','Service Offer','Runs backwards: an employee publishes what they will help with, and teams request their time.', '6D28D9', 'F5F3FF'],
    ['VACANCY','Promoted, not run','Permanent roles listed and scored here, then handed to HC Connect with a referral code.', BLUE, BLUET],
  ]
  routes.forEach((r,i) => {
    const x = M + i*(cw+0.22)
    card(s, { x, y:1.94, w:cw, h:2.62 })
    s.addShape(p.ShapeType.roundRect, { x:x+0.24, y:2.14, w:1.36, h:0.34, rectRadius:0.17,
      fill:{ color:r[4] }, line:{ width:0 } })
    s.addText(r[0], { x:x+0.24, y:2.14, w:1.36, h:0.34, fontFace:F, fontSize:14, bold:true,
      color:r[3], align:'center', valign:'middle', charSpacing:1, isTextBox:true, margin:0 })
    s.addText(r[1], { x:x+0.24, y:2.60, w:cw-0.48, h:0.32, fontFace:F, fontSize:17, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'top' })
    s.addText(r[2], { x:x+0.24, y:3.00, w:cw-0.48, h:1.42, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:4.72, w:CW*0.49, h:1.86 }, TINT)
  s.addText('The design decision that matters', { x:M+0.32, y:4.90, w:CW*0.49-0.64, h:0.3,
    fontFace:F, fontSize:18, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addText('Growth does not run vacancy applications. HC Connect owns the requisition, the screening and the offer, and a second queue would split one process in two.',
    { x:M+0.32, y:5.24, w:CW*0.49-0.64, h:1.20, fontFace:F, fontSize:15, color:BODY,
      lineSpacing:21, isTextBox:true, margin:0, valign:'top' })
  const rx = M + CW*0.49 + 0.26, rw = CW*0.51 - 0.26
  tintCard(s, { x:rx, y:4.72, w:rw, h:1.86 }, INK)
  s.addText('And it proves what it caused', { x:rx+0.32, y:4.90, w:rw-0.64, h:0.3, fontFace:F,
    fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText([
    { text:'Every handoff carries a referral code. Recruitment adds one source value; a quarterly join turns clicks into confirmed applications: ', options:{ color:'CBD5E1' } },
    { text:'measured here', options:{ color:'4ADE80', bold:true } },
    { text:' · ', options:{ color:'64748B' } },
    { text:'self-reported', options:{ color:'FBBF24', bold:true } },
    { text:' · ', options:{ color:'64748B' } },
    { text:'confirmed by HC Connect', options:{ color:'93C5FD', bold:true } },
    { text:'.', options:{ color:'CBD5E1' } },
  ], { x:rx+0.32, y:5.24, w:rw-0.64, h:1.20, fontFace:F, fontSize:15, lineSpacing:21,
    isTextBox:true, margin:0, valign:'top' })
  foot(s, 'HC Connect Internal Job Posting remains the system of record for all permanent internal recruitment.', N)
  s.addNotes('The build-versus-duplicate decision is the most defensible thing in the design. We deliberately gave up owning the vacancy flow so that we do not fragment recruitment — and we solved the attribution problem that decision created.')
}

/* ═══ 11 · HOW IT WORKS ══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'How it works', 'Profile to permanent record, in six steps.',
    'Most people are through step three inside a lunch break.')
  const cw = (CW - 5*0.16)/6
  const steps = [
    ['Build your profile','You · 5 min','Add your skills, or confirm the ones P&C already imported from HR records.'],
    ['Growth scores openings','Automatic','Every opening scored against your skills, with the reasoning shown.'],
    ['You apply','You / a manager','One click. Managers can also nominate people directly.'],
    ['Sign-off','Owner + manager','A decision inside 7 working days. Immersions add a four-party plan.'],
    ['You do the work','You + host team','Hours to weeks, or 3–9 months. Role, pay and headcount stay put.'],
    ['Rated and recorded','People & Culture','Rated by the host, surveyed the same day, and on your HR file.'],
  ]
  steps.forEach((st,i) => {
    const x = M + i*(cw+0.16)
    card(s, { x, y:1.96, w:cw, h:2.96 })
    badge(s, x+cw/2-0.23, 2.16, String(i+1), RED, WHITE, 0.46)
    s.addText(st[0], { x:x+0.14, y:2.72, w:cw-0.28, h:0.56, fontFace:F, fontSize:15, bold:true,
      color:INK, align:'center', lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
    s.addText(st[1].toUpperCase(), { x:x+0.10, y:3.30, w:cw-0.20, h:0.26, fontFace:F, fontSize:14,
      bold:true, color:RED, align:'center', isTextBox:true, margin:0 })
    s.addText(st[2], { x:x+0.14, y:3.62, w:cw-0.28, h:1.20, fontFace:F, fontSize:14, color:MUTE,
      align:'center', lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
    if (i < 5) s.addText('›', { x:x+cw+0.005, y:2.16, w:0.15, h:0.46, fontFace:F, fontSize:24,
      bold:true, color:'CBD5E1', align:'center', valign:'middle', isTextBox:true, margin:0 })
  })
  const bw = (CW - 0.26)/2
  tintCard(s, { x:M, y:5.08, w:bw, h:1.5 }, BLUET)
  s.addText('If it is a permanent vacancy', { x:M+0.3, y:5.24, w:bw-0.6, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:BLUE, isTextBox:true, margin:0 })
  s.addText('Growth lists it and scores the fit, then hands the employee to HC Connect on a link carrying a referral code — the only proof Growth sent them.',
    { x:M+0.3, y:5.56, w:bw-0.6, h:0.94, fontFace:F, fontSize:14, color:'1E40AF',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  tintCard(s, { x:M+bw+0.26, y:5.08, w:bw, h:1.5 }, 'F5F3FF')
  s.addText('The one route that runs backwards', { x:M+bw+0.56, y:5.24, w:bw-0.6, h:0.28,
    fontFace:F, fontSize:17, bold:true, color:'6D28D9', isTextBox:true, margin:0 })
  s.addText('A Service Offer skips steps 2 and 3: the employee publishes what they will help with, and every completed request lands on the same record.',
    { x:M+bw+0.56, y:5.56, w:bw-0.6, h:0.94, fontFace:F, fontSize:14, color:'5B21B6',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Developmental Job Immersions are governed by HCPH Policy 211_2021 v1.0.', N)
  s.addNotes('Walk this once, slowly. The panel needs to believe an employee can get from nothing to a match in a lunch break, and that a manager is never bypassed.')
}

/* ═══ 12 · THE PRODUCT ═══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The product', 'It exists. A working prototype, not a mock-up.',
    'Built in-house — the same asset the costing on the next slides pays for.')
  s.addImage(Object.assign(img('app-vac.png'), { x:M, y:1.94, w:7.4, h:4.63,
    rounding:false, shadow:shadow() }))
  const rx = M + 7.4 + 0.34, rw = CW - 7.4 - 0.34
  const feat = [
    ['Every role, scored against you','A 90% match and a 34% sit on one board. The score never blocks you.'],
    ['The job description, up front','Carried across from the requisition — people decide on substance, not a title.'],
    ['A referral code on every handoff','Generated at the click and carried on the link into HC Connect.'],
    ['An attribution funnel for P&C','Views, referrals, applications and confirmations — each labelled.'],
  ]
  feat.forEach((f,i) => {
    const y = 1.94 + i*1.22
    card(s, { x:rx, y, w:rw, h:1.10 })
    s.addText(f[0], { x:rx+0.24, y:y+0.12, w:rw-0.48, h:0.3, fontFace:F, fontSize:16, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(f[1], { x:rx+0.24, y:y+0.44, w:rw-0.48, h:0.60, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'Live prototype · six modules · three roles · seeded vacancy board with attached job descriptions.', N)
  s.addNotes('Offer a two-minute live walkthrough here if the panel wants it. The point of showing the real thing is that the build estimate on the next slides is not hypothetical — a working version already exists.')
}

/* ═══ 13 · BUILD VS BUY ══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Positioning', 'Why build this rather than buy Gloat or Fuel50.',
    'The vendors are proven — and a per-head cost that never stops.')
  const cw = (CW - 2*0.22)/3
  const usp = [
    ['Cheaper than hiring out','₱86,796 saved on every Band C internal fill. It pays for itself on Band C alone.'],
    ['Faster than recruiting','A priority project staffed in days from people already on payroll.'],
    ['A skills map, free','Answers "who can do X?" as a by-product of simply running.'],
    ['We own it','Our asset, our data, our logic. No per-head licence and no lock-in.'],
    ['Built for Home Credit','Our bands, our Policy 211_2021, our HC Connect handoff.'],
    ['Low risk to try','Voluntary and ad-hoc, with no KPI or salary impact.'],
  ]
  usp.forEach((u,i) => {
    const x = M + (i%3)*(cw+0.22), y = 1.94 + Math.floor(i/3)*(1.44+0.18)
    card(s, { x, y, w:cw, h:1.44 })
    badge(s, x+0.24, y+0.2, String(i+1), REDT, RED, 0.36)
    s.addText(u[0], { x:x+0.7, y:y+0.2, w:cw-0.94, h:0.3, fontFace:F, fontSize:17, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(u[1], { x:x+0.24, y:y+0.62, w:cw-0.48, h:0.72, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.14, w:CW, h:1.44 }, INK)
  s.addText('The honest version of the buy case', { x:M+0.36, y:5.28, w:CW-0.72, h:0.3,
    fontFace:F, fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText('Gloat, Fuel50 and 365Talents are mature products with track records we do not have, and would be live sooner. What they cannot do is stop costing money: at 637 seats the three-year licence lands between ₱10.2M and ₱27.8M, and recurs forever. If speed to launch were the binding constraint, buying would win. It is not.',
    { x:M+0.36, y:5.60, w:CW-0.72, h:0.92, fontFace:F, fontSize:15, color:'CBD5E1',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Vendor figures are RFP planning bands, not quotes — see the comparison slide.', N)
  s.addNotes('Concede the buy case properly. Speed and maturity are genuinely theirs. Then make the cost and ownership argument, which is genuinely ours.')
}

/* ═══ 14 · THE MARKET ════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The market', 'Our people already wrote the demand down.',
    'Pilot scope: 637 employees across IT, Operations and People & Culture.')
  const fw = CW*0.36
  tintCard(s, { x:M, y:1.94, w:fw, h:2.62 }, TINT)
  s.addText('Pilot population', { x:M+0.3, y:2.10, w:fw-0.6, h:0.26, fontFace:F, fontSize:15,
    bold:true, color:MUTE, isTextBox:true, margin:0 })
  ;[['IT & Innovation','463'],['Operations','37'],['People & Culture','137']].forEach((r,i) => {
    s.addText(r[0], { x:M+0.3, y:2.44+i*0.36, w:fw-1.5, h:0.3, fontFace:F, fontSize:16,
      color:BODY, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[1], { x:M+fw-1.5, y:2.44+i*0.36, w:1.2, h:0.3, fontFace:F, fontSize:16, bold:true,
      color:INK, align:'right', isTextBox:true, margin:0, valign:'middle' })
  })
  s.addShape(p.ShapeType.line, { x:M+0.3, y:3.58, w:fw-0.6, h:0, line:{ color:LINE, width:1 } })
  s.addText('Pilot total', { x:M+0.3, y:3.66, w:fw-1.5, h:0.32, fontFace:F, fontSize:17, bold:true,
    color:INK, isTextBox:true, margin:0, valign:'middle' })
  s.addText('637', { x:M+fw-1.5, y:3.66, w:1.2, h:0.32, fontFace:F, fontSize:22, bold:true,
    color:RED, align:'right', isTextBox:true, margin:0, valign:'middle' })
  s.addText('Full launch: 1,978 non-mass employees', { x:M+0.3, y:4.04, w:fw-0.6, h:0.28,
    fontFace:F, fontSize:14, color:MUTE, isTextBox:true, margin:0 })
  const mx = M + fw + 0.28, mw = CW - fw - 0.28
  const ev = [
    ['630','want to learn by doing','614 by experience, 16 by immersion.'],
    ['55%','want growth, not a promotion','Said at the 2026 midyear review.'],
    ['73%','want a vertical or enrichment','461 vertical, 347 enrichment.'],
    ['80','resigned and later came back','They wanted to be here. They could not find a way to move.'],
  ]
  const ew = (mw - 0.22)/2
  ev.forEach((e,i) => {
    const x = mx + (i%2)*(ew+0.22), y = 1.94 + Math.floor(i/2)*(1.44+0.16)
    card(s, { x, y, w:ew, h:1.44 })
    s.addText(e[0], { x:x+0.24, y:y+0.10, w:1.4, h:0.42, fontFace:F, fontSize:26, bold:true,
      color:RED, isTextBox:true, margin:0, valign:'middle' })
    s.addText(e[1], { x:x+0.24, y:y+0.48, w:ew-0.48, h:0.40, fontFace:F, fontSize:14, bold:true,
      color:INK, isTextBox:true, margin:0, valign:'middle' })
    s.addText(e[2], { x:x+0.24, y:y+0.86, w:ew-0.48, h:0.48, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.10, w:CW, h:1.48 }, INK)
  s.addText('Why start at 637 and not 1,978', { x:M+0.36, y:5.26, w:CW-0.72, h:0.3, fontFace:F,
    fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText('These three functions are where internal moves already happen most and where the tech-talent priority bites hardest, so the pilot tests the hard case. The build is one-time: extending to all 1,978 non-mass employees costs the run line only — under ₱35 per extra employee a year. Mass-market roles are out of scope by design.',
    { x:M+0.36, y:5.60, w:CW-0.72, h:0.90, fontFace:F, fontSize:15, color:'CBD5E1',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Sources: 2026 IDP filings · 2026 Midyear Review · stated career-movement preferences · HRIS headcount.', N)
  s.addNotes('The IDP number is the strongest demand evidence in the deck because our own people wrote it down unprompted: 630 of 1,249 asked for exactly this.')
}

/* ═══ 15 · WHAT IT COSTS ═════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Costing · v2', '₱1.05M over three years. ₱550 per employee a year.',
    'Bottom-up from a completed Business Requirements Document — not a placeholder. Population 637, FX ₱58 = US$1.')
  const cw = (CW - 3*0.22)/4
  ;[['₱766,125','Year one','build ₱711k, run ₱55k', RED],
    ['₱223,125','Year two','referral engine, run', INK],
    ['₱61,125','Year three','run only', INK],
    ['₱1,050,375','Three-year total','₱1,649 per employee', GREEN]]
   .forEach((v,i) => stat(s, M+i*(cw+0.22), 1.88, cw, v[0], v[1], v[2], v[3], 1.72))
  const lw = CW*0.545
  card(s, { x:M, y:3.62, w:lw, h:3.00 })
  s.addText('Year-one build — where the money goes', { x:M+0.28, y:3.76, w:lw-0.56, h:0.28,
    fontFace:F, fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'Item',options:{bold:true,color:MUTE}},{text:'₱',options:{bold:true,color:MUTE,align:'right'}}],
    ['Full-stack developer, 1.4 months', {text:'210,000',options:{align:'right'}}],
    ['Designer, 1.5 months at 50%', {text:'82,500',options:{align:'right'}}],
    ['Project manager / analyst, 4 months at 30%', {text:'180,000',options:{align:'right'}}],
    ['Security review, DPA assessment and DPIA', {text:'120,000',options:{align:'right'}}],
    ['Contingency at 20%', {text:'118,500',options:{align:'right'}}],
    [{text:'Build, year one',options:{bold:true,color:INK}},{text:'711,000',options:{bold:true,align:'right',color:RED}}],
  ], { x:M+0.28, y:4.10, w:lw-0.56, colW:[4.55,1.56], fontFace:F, fontSize:14, color:BODY, rowH:0.26,
    border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  const rx = M + lw + 0.26, rw = CW - lw - 0.26
  tintCard(s, { x:rx, y:3.62, w:rw, h:1.36 }, GREENT)
  s.addText('Cheaper than v1, doing more', { x:rx+0.3, y:3.78, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:GREEN, isTextBox:true, margin:0 })
  s.addText('Five decisions took ₱491,761 out of the first estimate without touching anything that drives internal growth.',
    { x:rx+0.3, y:4.10, w:rw-0.6, h:0.80, fontFace:F, fontSize:14, color:'166534',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  tintCard(s, { x:rx, y:5.14, w:rw, h:1.48 }, AMBERT)
  s.addText('What this figure excludes', { x:rx+0.3, y:5.30, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:AMBER, isTextBox:true, margin:0 })
  s.addText('Ongoing ownership from year two: 0.2–0.3 FTE, ₱360k–₱540k a year. At 0.25 FTE the BCR falls to about 3.1.',
    { x:rx+0.3, y:5.62, w:rw-0.6, h:0.92, fontFace:F, fontSize:14, color:'92400E',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Annual run: Supabase ₱17,400 · Claude API ₱22,065 · email ₱8,700 · monitoring ₱6,960 · reconciliation ₱6,000.   Basis: BRD_V2 build-unit estimate and Growth-v2-CBA.xlsx — every figure is a live formula.', N)
  s.addNotes('The earlier deck carried a ₱4.2M placeholder with "IT to scope" against it. This replaces it with a bottom-up estimate from a completed BRD, which is why the number moved so far.')
}

/* ═══ 16 · COST–BENEFIT ══════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Cost–benefit analysis', 'Benefit–cost ratio 6.8. Payback in nine months.',
    'Three years, 10% discount rate. Break-even is one attributed internal hire a year.')
  const cw = (CW - 3*0.22)/4
  ;[['₱7.13M','three-year benefit','hires + retention', GREEN],
    ['₱6.08M','net of every peso of cost','after all build and run', GREEN],
    ['6.8','benefit–cost ratio','NPV ₱4.84M at 10%', INK],
    ['9 months','payback','benefit from month 4', RED]]
   .forEach((v,i) => stat(s, M+i*(cw+0.22), 1.88, cw, v[0], v[1], v[2], v[3], 1.72))
  const lw = CW*0.60
  card(s, { x:M, y:3.62, w:lw, h:3.00 })
  s.addText('How sensitive is it?', { x:M+0.28, y:3.76, w:lw-0.56, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addText('The case survives the removal of either benefit stream.', { x:M+0.28, y:4.04,
    w:lw-0.56, h:0.24, fontFace:F, fontSize:14, color:MUTE, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'Scenario',options:{bold:true,color:MUTE}},{text:'Benefit',options:{bold:true,color:MUTE,align:'right'}},
     {text:'Net',options:{bold:true,color:MUTE,align:'right'}},{text:'BCR',options:{bold:true,color:MUTE,align:'right'}},
     {text:'Payback',options:{bold:true,color:MUTE,align:'right'}}],
    ['Conservative · 2 hires/yr', {text:'₱5.12M',options:{align:'right'}},
     {text:'₱4.07M',options:{align:'right'}}, {text:'4.9',options:{align:'right'}}, {text:'12 mo',options:{align:'right'}}],
    [{text:'Base · 4 hires/yr',options:{bold:true,color:INK}},
     {text:'₱7.13M',options:{align:'right',bold:true}}, {text:'₱6.08M',options:{align:'right',bold:true}},
     {text:'6.8',options:{align:'right',bold:true,color:GREEN}}, {text:'9 mo',options:{align:'right',bold:true}}],
    ['Optimistic · 7 hires/yr', {text:'₱10.14M',options:{align:'right'}},
     {text:'₱9.09M',options:{align:'right'}}, {text:'9.7',options:{align:'right'}}, {text:'7 mo',options:{align:'right'}}],
    [{text:'Retention removed',options:{italic:true}}, {text:'₱4.02M',options:{align:'right',italic:true}},
     {text:'₱2.97M',options:{align:'right',italic:true}}, {text:'3.8',options:{align:'right',italic:true}}, {text:'14 mo',options:{align:'right',italic:true}}],
    [{text:'Retention only, no hires',options:{italic:true}}, {text:'₱3.11M',options:{align:'right',italic:true}},
     {text:'₱2.06M',options:{align:'right',italic:true}}, {text:'3.0',options:{align:'right',italic:true}}, {text:'16 mo',options:{align:'right',italic:true}}],
  ], { x:M+0.28, y:4.34, w:lw-0.56, colW:[2.48,1.16,1.12,0.86,1.16], fontFace:F, fontSize:14, color:BODY, rowH:0.26,
    border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  s.addText('Both halves would have to be wrong at once for this to fail.',
    { x:M+0.28, y:6.24, w:lw-0.56, h:0.32, fontFace:F, fontSize:14, bold:true, color:GREEN,
      isTextBox:true, margin:0, valign:'middle' })
  const rx = M + lw + 0.26, rw = CW - lw - 0.26
  tintCard(s, { x:rx, y:3.62, w:rw, h:1.42 }, INK)
  s.addText('Break-even: 1.0 hire a year', { x:rx+0.3, y:3.78, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText('One internal fill out of roughly 60 internal requisitions a year — a 1.7% hit rate — repays the whole three-year cost.',
    { x:rx+0.3, y:4.10, w:rw-0.6, h:0.86, fontFace:F, fontSize:14, color:'CBD5E1',
      lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
  tintCard(s, { x:rx, y:5.20, w:rw, h:1.42 }, TINT)
  s.addText('Where the benefit comes from', { x:rx+0.3, y:5.34, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addText([
    { text:'Attributed — ', options:{ bold:true, color:RED } },
    { text:'agency fees and vacancy days avoided.\n', options:{ color:BODY } },
    { text:'Owned — ', options:{ bold:true, color:GREEN } },
    { text:'retention among participants, needing no attribution.', options:{ color:BODY } },
  ], { x:rx+0.3, y:5.64, w:rw-0.6, h:0.94, fontFace:F, fontSize:14, lineSpacing:18,
    isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Basis: Growth-v2-CBA.xlsx. Excludes gig output value, skills built and network effects — real, but not reliably measurable.', N)
  s.addNotes('Lead with the two italic rows. Volunteering that the softest input can be deleted entirely and the case still clears at 3.8 is what makes the other numbers believable.')
}

/* ═══ 17 · VS BUYING ═════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Against the market', 'Ten to twenty-seven times cheaper than buying it.',
    'Gloat · Fuel50 · Eightfold · Workday Talent Marketplace — three-year total cost at 637 seats.')
  const chart = [{ name:'3-year total cost, ₱ millions', labels:['Growth — build in-house','External platform — low band','External platform — high band'],
    values:[1.05, 10.15, 27.84] }]
  s.addChart(p.ChartType.bar, chart, { x:M, y:1.98, w:CW*0.55, h:2.52,
    barDir:'bar', barGapWidthPct:55, chartColors:[RED, '94A3B8', '94A3B8'], varyColors:true,
    showLegend:false, showValue:true, dataLabelPosition:'outEnd', dataLabelFormatCode:'"₱"0.00"M"',
    dataLabelFontFace:F, dataLabelFontSize:14, dataLabelColor:INK, dataLabelFontBold:true,
    catAxisLabelFontFace:F, catAxisLabelFontSize:14, catAxisLabelColor:INK,
    valAxisHidden:true, valGridLine:{ style:'none' }, catGridLine:{ style:'none' },
    valAxisMaxVal:32, showTitle:false })
  const rx = M + CW*0.55 + 0.3, rw = CW - CW*0.55 - 0.3
  ;[['₱1.05M','Growth, built in-house · ₱1,649 per employee', GREEN],
    ['₱10.2M – ₱27.8M','External platform · ₱15,934–₱43,705 per employee', MUTE],
    ['₱9.1M – ₱26.8M','The three-year cost difference', RED]]
   .forEach((v,i) => {
    const y = 1.98 + i*0.88
    card(s, { x:rx, y, w:rw, h:0.78 })
    s.addText(v[0], { x:rx+0.24, y:y+0.06, w:rw-0.48, h:0.36, fontFace:F, fontSize:24, bold:true,
      color:v[2], isTextBox:true, margin:0, valign:'middle' })
    s.addText(v[1], { x:rx+0.24, y:y+0.44, w:rw-0.48, h:0.28, fontFace:F, fontSize:14,
      color:MUTE, isTextBox:true, margin:0, valign:'middle' })
  })
  tintCard(s, { x:M, y:4.72, w:CW, h:1.86 }, INK)
  s.addText('The framing that actually decides it: break-even in internal hires', { x:M+0.36,
    y:4.92, w:CW-0.72, h:0.3, fontFace:F, fontSize:19, bold:true, color:WHITE, isTextBox:true, margin:0 })
  const bw = (CW - 0.72 - 2*0.3)/3
  ;[['29','internal hires over 3 years just to cover the licence','External platform — low band','94A3B8'],
    ['80','internal hires over 3 years to cover the licence','External platform — high band','94A3B8'],
    ['3','internal hires over 3 years — one a year','Growth, built in-house','4ADE80']]
   .forEach((k,i) => {
    const x = M+0.36+i*(bw+0.3)
    s.addText(k[0], { x, y:5.30, w:bw, h:0.52, fontFace:F, fontSize:36, bold:true, color:k[3],
      isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[2], { x, y:5.82, w:bw, h:0.26, fontFace:F, fontSize:15, bold:true, color:WHITE,
      isTextBox:true, margin:0 })
    s.addText(k[1], { x, y:6.08, w:bw, h:0.50, fontFace:F, fontSize:14, color:'94A3B8',
      lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'Vendor figures are RFP planning bands, not quotes. Issue an RFP stating 637 seats and ask for minimum annual contract value before deciding.', N)
  s.addNotes('Be scrupulous that the vendor band is a planning estimate, not a quote — none of them publish per-seat pricing and at 637 seats the binding constraint is minimum contract value. The break-even framing survives even if the band is wrong by half.')
}

/* ═══ 18 · ADOPTION ══════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Adoption plan', 'Adoption is the risk, not the technology.',
    'A great platform nobody climbs into is wasted money. Four phases, and one behaviour we have to design against.')
  const cw = (CW - 3*0.2)/4
  const ph = [
    ['PHASE 0','Seed the shelves','Pre-launch · 2 weeks',
     'Pre-load 20–30 opportunities\nRecruit 5–8 champion managers\nSecure 2–3 ExCo anchor gigs'],
    ['PHASE 1','Land the idea','Launch · weeks 1–2',
     'Sponsor sends the first note\n"Growth is not a ladder" campaign\nLive demo and Q&A at town hall'],
    ['PHASE 2','Make it social','Weeks 3–12',
     'Publish first-mover stories\n"Talent Exporter" recognition\nWeekly "new this week" digest'],
    ['PHASE 3','Prove and scale','Month 3 onward',
     'Report fills and savings to ExCo\nPublish match quality\nExtend beyond the pilot bands'],
  ]
  ph.forEach((v,i) => {
    const x = M + i*(cw+0.2)
    card(s, { x, y:1.94, w:cw, h:3.06 })
    s.addText(v[0], { x:x+0.24, y:2.12, w:cw-0.48, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:RED, charSpacing:1.4, isTextBox:true, margin:0 })
    s.addText(v[1], { x:x+0.24, y:2.40, w:cw-0.48, h:0.3, fontFace:F, fontSize:18, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(v[2], { x:x+0.24, y:2.72, w:cw-0.48, h:0.26, fontFace:F, fontSize:14, color:MUTE,
      isTextBox:true, margin:0 })
    s.addText(v[3].split('\n').map((t,j,a) => ({ text:t,
      options:{ bullet:true, breakLine:j < a.length-1 } })),
      { x:x+0.24, y:3.06, w:cw-0.48, h:1.86, fontFace:F, fontSize:14, color:BODY,
        lineSpacing:18, paraSpaceAfter:6, isTextBox:true, margin:0, valign:'top' })
  })
  tintCard(s, { x:M, y:5.16, w:CW, h:1.42 }, AMBERT)
  s.addText('The adoption killer we have to design against: manager hoarding', { x:M+0.36,
    y:5.32, w:CW-0.72, h:0.3, fontFace:F, fontSize:18, bold:true, color:AMBER, isTextBox:true, margin:0 })
  s.addText('Every manager wants access to other teams\' talent and resists lending their own, and no messaging changes that because the incentive points the other way. The counter is a "Talent Exporter" metric: recognise the leaders whose people grow and move, and report it alongside their other numbers.',
    { x:M+0.36, y:5.64, w:CW-0.72, h:0.86, fontFace:F, fontSize:15, color:'92400E',
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Phase 0 is non-negotiable — an empty marketplace on day one kills the product before it is judged.', N)
  s.addNotes('If the panel presses on one risk, it will be this one. Do not defend it with communications. Defend it with the incentive change, and say plainly that we will report Talent Exporter numbers to ExCo.')
}

/* ═══ 19 · SUCCESS MEASURES ══════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Success measures', 'How we will know it worked — and what we are not claiming.',
    'Business metrics lead. Engagement metrics support; they do not carry the case.')
  const lw = CW*0.615
  card(s, { x:M, y:1.94, w:lw, h:4.64 })
  s.addText('Pilot targets — three months, 637 employees', { x:M+0.28, y:2.12, w:lw-0.56, h:0.28,
    fontFace:F, fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'Measure',options:{bold:true,color:MUTE}},{text:'Today',options:{bold:true,color:MUTE,align:'center'}},
     {text:'Pilot target',options:{bold:true,color:MUTE,align:'center'}},{text:'Why it matters',options:{bold:true,color:MUTE}}],
    ['Internal fill rate', {text:'17.6%',options:{align:'center'}}, {text:'25%+',options:{align:'center',bold:true,color:RED}}, 'The headline number.'],
    ['External-hire spend, B and C', {text:'₱13.1M/yr',options:{align:'center'}}, {text:'−15%',options:{align:'center',bold:true,color:RED}}, '₱22k saved per B fill, ₱87k per C.'],
    ['Gigs and immersions filled', {text:'≈ 0',options:{align:'center'}}, {text:'10+',options:{align:'center',bold:true,color:RED}}, 'Capacity we could not create.'],
    ['Time to staff a priority project', {text:'Weeks',options:{align:'center'}}, {text:'Days',options:{align:'center',bold:true,color:RED}}, 'Agility for ExCo work.'],
    ['Confirmed referrals to HC Connect', {text:'n/a',options:{align:'center'}}, {text:'≥ 20',options:{align:'center',bold:true,color:RED}}, 'Evidence for attributed pesos.'],
    ['Match quality, rated both sides', {text:'n/a',options:{align:'center'}}, {text:'≥ 4.0 / 5',options:{align:'center',bold:true,color:RED}}, 'Bad matches destroy trust fast.'],
    ['Profiles with skills on file', {text:'0',options:{align:'center'}}, {text:'≥ 80%',options:{align:'center',bold:true,color:RED}}, 'An empty profile matches nothing.'],
  ], { x:M+0.28, y:2.44, w:lw-0.56, colW:[2.90,1.02,1.10,2.50], fontFace:F, fontSize:14,
    color:BODY, rowH:0.40, border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  const rx = M + lw + 0.26, rw = CW - lw - 0.26
  tintCard(s, { x:rx, y:1.94, w:rw, h:2.3 }, TINT)
  s.addText('What we are not claiming', { x:rx+0.3, y:2.12, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:18, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addText('Our eNPS on growth opportunity is already healthy, so this is not a fix for a broken career ladder. Nor should internal fill reach 100% — some external hiring brings skills we need. We target the gap between 17.6% and the benchmark.',
    { x:rx+0.3, y:2.44, w:rw-0.6, h:1.72, fontFace:F, fontSize:14, color:BODY, lineSpacing:19,
      isTextBox:true, margin:0, valign:'top' })
  tintCard(s, { x:rx, y:4.42, w:rw, h:2.12 }, INK)
  s.addText('How the pilot will be judged', { x:rx+0.3, y:4.60, w:rw-0.6, h:0.28, fontFace:F,
    fontSize:18, bold:true, color:WHITE, isTextBox:true, margin:0 })
  s.addText('Three months, 637 employees in IT, Operations and P&C, on Band B pivots and Band C lateral moves. Judged on fills and savings. If the fill rate has not moved by month three, we stop and say so.',
    { x:rx+0.3, y:4.92, w:rw-0.6, h:1.50, fontFace:F, fontSize:14, color:'CBD5E1', lineSpacing:19,
      isTextBox:true, margin:0, valign:'top' })
  foot(s, 'Baselines: 2024–2026 internal job posting data · 2024 cost-per-hire · 2025 hiring volumes.', N)
  s.addNotes('Naming a stop condition out loud is worth more than any target on this slide. It tells the panel this is a measured pilot, not a programme looking for a reason to continue.')
}

/* ═══ 20 · RISKS ═════════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Risks', 'What could break this, and what we do about it.',
    'Listed worst-first. The top two are gates: we settle them before a peso is spent.')
  const rows = [
    ['Recruitment declines the HC Connect source field','GATE',
     'Attributed benefit becomes unprovable. BCR falls to 3.0.',
     'Secure it before the build starts. Configuration, not integration.', RED],
    ['The DPO blocks the referral log','GATE',
     'The attribution tier is unavailable. Retention benefits are unaffected.',
     'Get the position in writing before build. The DPIA is already costed in.', RED],
    ['Managers hoard their people','HIGH',
     'Opportunities are never posted and the shelves stay empty.',
     '"Talent Exporter" recognition to ExCo; champions seed Phase 0.', AMBER],
    ['Employees arrive to an empty profile','HIGH',
     'No skills on file means no matches, an empty board, and no return visit.',
     'Batch-load from the HRIS and the LMS. Correcting a list beats authoring one.', AMBER],
    ['The retention lift is zero','MED',
     'Benefits fall to the attributed rows — still BCR 3.8, 14-month payback.',
     'Already modelled. A year-one holdout measures it properly.', MUTE],
    ['Build effort doubles','MED',
     'Three-year cost rises to ₱1.76M; base BCR falls to 4.0.',
     'Still clears, and still far under the vendor bands.', MUTE],
  ]
  const rowH = 0.62
  ;[['Risk',3.5],['',0.85],['Impact if it happens',3.7],['Mitigation',4.18]].reduce((acc,c)=>acc,0)
  s.addText('RISK', { x:M+0.02, y:1.94, w:3.5, h:0.24, fontFace:F, fontSize:14, bold:true,
    color:MUTE, charSpacing:1.2, isTextBox:true, margin:0 })
  s.addText('IMPACT IF IT HAPPENS', { x:M+4.45, y:1.94, w:3.7, h:0.24, fontFace:F, fontSize:14,
    bold:true, color:MUTE, charSpacing:1.2, isTextBox:true, margin:0 })
  s.addText('MITIGATION', { x:M+8.25, y:1.94, w:4.0, h:0.24, fontFace:F, fontSize:14, bold:true,
    color:MUTE, charSpacing:1.2, isTextBox:true, margin:0 })
  rows.forEach((r,i) => {
    const y = 2.24 + i*(rowH+0.08)
    tintCard(s, { x:M, y, w:CW, h:rowH }, i<2 ? REDT : TINT)
    s.addText(r[0], { x:M+0.24, y:y+0.04, w:3.35, h:0.54, fontFace:F, fontSize:15, bold:true,
      color:INK, lineSpacing:19, isTextBox:true, margin:0, valign:'middle' })
    s.addShape(p.ShapeType.roundRect, { x:M+3.72, y:y+0.16, w:0.78, h:0.3, rectRadius:0.15,
      fill:{ color:r[4] }, line:{ width:0 } })
    s.addText(r[1], { x:M+3.72, y:y+0.16, w:0.78, h:0.3, fontFace:F, fontSize:14, bold:true,
      color:WHITE, align:'center', valign:'middle', isTextBox:true, margin:0 })
    s.addText(r[2], { x:M+4.69, y:y+0.04, w:3.5, h:0.54, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:18, isTextBox:true, margin:0, valign:'middle' })
    s.addText(r[3], { x:M+8.29, y:y+0.04, w:3.7, h:0.54, fontFace:F, fontSize:14, color:BODY,
      lineSpacing:18, isTextBox:true, margin:0, valign:'middle' })
  })
  foot(s, 'Full risk register with owners and dates in the Business Requirements Document.', N)
  s.addNotes('Open with the two gates. Saying "we will not start the build until recruitment and the DPO have both said yes in writing" is the single most reassuring sentence available.')
}

/* ═══ 21 · THE ASK ═══════════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'The ask', 'Three decisions, and the first two are free.',
    'Nothing here commits Home Credit beyond a three-month pilot in three functions.')
  const cw = (CW - 2*0.24)/3
  const asks = [
    ['1','Ask recruitment for one form field','Add a "Growth" source value and a referral-code field to the HC Connect form. Without it, half the case cannot be proven.','₱0', GREEN],
    ['2','Get the DPO position in writing','A referral log records who opened which requisition. The assessment is costed; we need the answer first.','₱0', GREEN],
    ['3','Approve the year-one build','₱766,125 to build and run Growth for 637 employees for twelve months — then a go / no-go on the pilot numbers.','₱766,125', RED],
  ]
  asks.forEach((a,i) => {
    const x = M + i*(cw+0.24)
    card(s, { x, y:1.94, w:cw, h:2.86 })
    badge(s, x+0.26, 2.16, a[0], a[4], WHITE, 0.46)
    s.addText(a[3], { x:x+0.9, y:2.16, w:cw-1.16, h:0.46, fontFace:F, fontSize:22, bold:true,
      color:a[4], align:'right', valign:'middle', isTextBox:true, margin:0 })
    s.addText(a[1], { x:x+0.26, y:2.78, w:cw-0.52, h:0.62, fontFace:F, fontSize:18, bold:true,
      color:INK, lineSpacing:22, isTextBox:true, margin:0, valign:'top' })
    s.addText(a[2], { x:x+0.26, y:3.48, w:cw-0.52, h:1.14, fontFace:F, fontSize:15, color:MUTE,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
  })
  s.addText('THE NEXT 90 DAYS', { x:M, y:5.02, w:CW, h:0.26, fontFace:F, fontSize:14, bold:true,
    color:MUTE, charSpacing:1.4, isTextBox:true, margin:0 })
  const tl = [['Weeks 1–2','Secure the source field and the DPO position'],
              ['Weeks 3–8','Build the board, matching, JD reader and handoff'],
              ['Weeks 7–8','Batch-load skills; seed 20–30 opportunities'],
              ['Weeks 9–12','Pilot live in IT, Operations and P&C'],
              ['Month 4','Report to ExCo — go or no-go']]
  const tw = (CW - 4*0.16)/5
  tl.forEach((t,i) => {
    const x = M + i*(tw+0.16)
    tintCard(s, { x, y:5.34, w:tw, h:1.24 }, i===4 ? INK : TINT)
    s.addText(t[0], { x:x+0.2, y:5.50, w:tw-0.4, h:0.26, fontFace:F, fontSize:15, bold:true,
      color:i===4 ? '4ADE80' : RED, isTextBox:true, margin:0 })
    s.addText(t[1], { x:x+0.2, y:5.78, w:tw-0.4, h:0.74, fontFace:F, fontSize:14,
      color:i===4 ? 'CBD5E1' : BODY, lineSpacing:18, isTextBox:true, margin:0, valign:'top' })
    if (i<4) s.addText('›', { x:x+tw+0.005, y:5.34, w:0.15, h:1.24, fontFace:F, fontSize:22,
      bold:true, color:'CBD5E1', align:'center', valign:'middle', isTextBox:true, margin:0 })
  })
  foot(s, 'Year-one figure includes build ₱711,000 and run ₱55,125. Years two and three add ₱223,125 and ₱61,125.', N)
  s.addNotes('End on the two free asks. They are what make the third one safe: if either gate fails, we have spent nothing.')
}

/* ═══ 22 · CLOSING ═══════════════════════════════════════════════ */
{
  const s = next(true); N++
  s.addImage(Object.assign(img('mark-white.png'), { x:M, y:1.42, w:0.8, h:0.8, transparency:20 }))
  s.addText('We are paying headhunters\nto find people we\nmay already employ.', { x:M, y:2.48,
    w:11.4, h:2.3, fontFace:F, fontSize:42, bold:true, color:WHITE, lineSpacing:52,
    isTextBox:true, margin:0, valign:'top' })
  s.addShape(p.ShapeType.line, { x:M, y:5.06, w:5.4, h:0, line:{ color:RED, width:3 } })
  s.addText('₱1.05M over three years to stop doing that. Benefit–cost ratio 6.8, payback in nine months, and a live skills map we have never had.',
    { x:M, y:5.28, w:10.4, h:0.8, fontFace:F, fontSize:19, color:'CBD5E1', lineSpacing:27,
      isTextBox:true, margin:0, valign:'top' })
  s.addText('Thank you.   Questions welcome.', { x:M, y:6.2, w:8, h:0.36, fontFace:F,
    fontSize:17, bold:true, color:'94A3B8', isTextBox:true, margin:0 })
  s.addNotes('Close on the one-liner, not on a summary. Then stop talking.');
}

/* ═══ 23 · APPENDIX DIVIDER ══════════════════════════════════════ */
{
  const s = next(true); N++
  s.addText('APPENDIX', { x:M, y:3.0, w:8, h:0.8, fontFace:F, fontSize:44, bold:true,
    color:WHITE, charSpacing:3, isTextBox:true, margin:0 })
  s.addText('Band economics  ·  business model canvas  ·  demand evidence  ·  sources and assumptions',
    { x:M, y:3.9, w:10.4, h:0.4, fontFace:F, fontSize:17, color:'94A3B8', isTextBox:true, margin:0 })
}

/* ═══ 24 · BAND ECONOMICS ════════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix · Where the money is', 'Two realistic moves, not one heroic leap.',
    'Band C is where the fee is largest — and the move there is lateral, which is why the saving is credible.')
  const cw = (CW - 0.28)/2
  const bands = [
    ['BAND B','The upward pivot','Employees growing into a reachable next-level role — the natural, believable step up.',
     [['Roles filled per year','186'],['Cost per hire','₱22,446'],['Headhunter fee per hire','₱9,791']],
     '₱22,446 saved per internal fill', BLUE, BLUET],
    ['BAND C','Lateral mobility','Existing managers and senior managers moving across functions. Not a level leap — a sideways move.',
     [['Roles filled per year','103'],['Cost per hire','₱86,796'],['Headhunter fee per hire (68%)','₱58,823']],
     '₱86,796 saved per internal fill', RED, REDT],
  ]
  bands.forEach((b,i) => {
    const x = M + i*(cw+0.28)
    card(s, { x, y:1.94, w:cw, h:3.0 })
    s.addShape(p.ShapeType.roundRect, { x:x+0.28, y:2.14, w:1.24, h:0.34, rectRadius:0.17,
      fill:{ color:b[6] }, line:{ width:0 } })
    s.addText(b[0], { x:x+0.28, y:2.14, w:1.24, h:0.34, fontFace:F, fontSize:14, bold:true,
      color:b[5], align:'center', valign:'middle', charSpacing:1, isTextBox:true, margin:0 })
    s.addText(b[1], { x:x+0.28, y:2.58, w:cw-0.56, h:0.32, fontFace:F, fontSize:20, bold:true,
      color:INK, isTextBox:true, margin:0 })
    s.addText(b[2], { x:x+0.28, y:2.92, w:cw-0.56, h:0.5, fontFace:F, fontSize:15, color:MUTE,
      lineSpacing:20, isTextBox:true, margin:0, valign:'top' })
    b[3].forEach((r,j) => {
      s.addText(r[0], { x:x+0.28, y:3.50+j*0.36, w:cw-2.2, h:0.3, fontFace:F, fontSize:15,
        color:BODY, isTextBox:true, margin:0, valign:'middle' })
      s.addText(r[1], { x:x+cw-1.9, y:3.50+j*0.36, w:1.62, h:0.3, fontFace:F, fontSize:16,
        bold:true, color:INK, align:'right', isTextBox:true, margin:0, valign:'middle' })
    })
    tintCard(s, { x:x+0.28, y:4.62, w:cw-0.56, h:0.44 }, b[6])
    s.addText(b[4], { x:x+0.28, y:4.62, w:cw-0.56, h:0.44, fontFace:F, fontSize:16, bold:true,
      color:b[5], align:'center', valign:'middle', isTextBox:true, margin:0 })
  })
  tintCard(s, { x:M, y:5.18, w:CW, h:1.52 }, TINT)
  s.addText('At the ~30% industry benchmark across both bands', { x:M+0.34, y:5.36, w:CW-0.68,
    h:0.28, fontFace:F, fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  const kw = (CW - 0.68 - 2*0.3)/3
  ;[['≈ 87','internal fills a year','56 Band B + 31 Band C'],
    ['₱3.9M','gross avoided cost a year','2025 volumes, 2024 cost-per-hire']]
   .forEach((k,i) => {
    const x = M+0.34+i*(kw+0.3)
    s.addText(k[0], { x, y:5.64, w:kw, h:0.40, fontFace:F, fontSize:24, bold:true,
      color:RED, isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x, y:6.06, w:kw, h:0.24, fontFace:F, fontSize:14, bold:true, color:INK,
      isTextBox:true, margin:0 })
    s.addText(k[2], { x, y:6.30, w:kw, h:0.28, fontFace:F, fontSize:14, color:MUTE,
      isTextBox:true, margin:0, valign:'top' })
  })
  s.addText([{ text:'Caveats we own:  ', options:{ bold:true, color:INK } },
    { text:'internal moves create backfill, usually cheaper · some external hiring is healthy · 2024 costs applied to 2025 volumes', options:{ color:MUTE } }],
    { x:M+0.34+2*(kw+0.3), y:5.64, w:kw, h:0.94, fontFace:F, fontSize:14, lineSpacing:18,
      isTextBox:true, margin:0, valign:'middle' })
  foot(s, 'The cost–benefit slides use a narrower, attribution-safe subset of this figure — not the ₱3.9M gross.', N)
  s.addNotes('This answers "can people really jump into management?". Band B is a reachable step up; Band C is a sideways move by people who are already managers. Neither requires a heroic leap.')
}

/* ═══ 25 · BUSINESS MODEL CANVAS ═════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix · Business model canvas', 'An internal-fill engine, not an engagement tool.',
    'Career growth is the employee-facing promise. Cheaper fills and faster capacity are the argument.')
  const blocks = [
    ['PROBLEM','17.6% internal fill vs ~30%\n₱6.1M a year to headhunters\nProjects staffed by contractors\nNo visibility of skills'],
    ['SOLUTION','One board: gigs, immersions, offers\nHC Connect vacancies scored\nAI matching on skills\nSkills inventory as a by-product'],
    ['CUSTOMER SEGMENTS','Talent Acquisition — cheaper fills\nManagers — capacity\nEmployees — growth and pivots\nHR — workforce intelligence'],
    ['VALUE PROPOSITION','Business: cut headhunter spend,\nstaff priority work in days\nEmployee: see and reach real\ninternal opportunities'],
    ['KEY ACTIVITIES','Post and moderate opportunities\nMatch and surface candidates\nRun immersions with approval\nClose the loop with feedback'],
    ['KEY RESOURCES','Claude API matching engine\nInternal development capacity\nProgramme owner in P&C\nSkills data from HRIS and MyDevt'],
    ['CHANNELS','HC Connect, intranet, newsletter\nManager cascades and town halls\nRecruitment as the first funnel\nChampion network'],
    ['COST STRUCTURE','₱711k one-time build\n₱55k–₱61k a year to run\n0.2–0.3 FTE programme ownership from year two'],
    ['RETURN','₱86,796 saved per Band C fill\n₱22,446 saved per Band B fill\n37 vacancy days avoided per fill\nRetention lift among movers'],
  ]
  const cw = (CW - 2*0.18)/3
  blocks.forEach((b,i) => {
    const x = M + (i%3)*(cw+0.18), y = 1.90 + Math.floor(i/3)*(1.50+0.14)
    card(s, { x, y, w:cw, h:1.50 })
    s.addText(b[0], { x:x+0.22, y:y+0.12, w:cw-0.44, h:0.24, fontFace:F, fontSize:14, bold:true,
      color:RED, charSpacing:1.2, isTextBox:true, margin:0 })
    s.addText(b[1].split('\n').map((t,j,a) => ({ text:t, options:{ bullet:true, breakLine:j<a.length-1 } })),
      { x:x+0.22, y:y+0.40, w:cw-0.44, h:1.04, fontFace:F, fontSize:14, color:BODY,
        lineSpacing:17, paraSpaceAfter:2, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'The shift: we no longer sell "employees feel stuck" — our eNPS says otherwise. We sell cheaper fills, faster capacity and a live skills map.', N)
}

/* ═══ 26 · DEMAND EVIDENCE ═══════════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix · Demand evidence', 'What our people asked for, in their own filings.',
    'None of this was collected for this project. All of it points the same way.')
  const lw = CW*0.47
  card(s, { x:M, y:1.94, w:lw, h:2.70 })
  s.addText('Stated career movement — 1,109 responses', { x:M+0.28, y:2.12, w:lw-0.56, h:0.28,
    fontFace:F, fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'Desired movement',options:{bold:true,color:MUTE}},{text:'Employees',options:{bold:true,color:MUTE,align:'right'}},{text:'Share',options:{bold:true,color:MUTE,align:'right'}}],
    [{text:'Vertical',options:{bold:true}}, {text:'461',options:{align:'right',bold:true}}, {text:'42%',options:{align:'right',bold:true,color:RED}}],
    [{text:'Enrichment',options:{bold:true}}, {text:'347',options:{align:'right',bold:true}}, {text:'31%',options:{align:'right',bold:true,color:RED}}],
    ['Lateral', {text:'134',options:{align:'right'}}, {text:'12%',options:{align:'right'}}],
    ['Exploratory', {text:'132',options:{align:'right'}}, {text:'12%',options:{align:'right'}}],
    ['Relocation', {text:'29',options:{align:'right'}}, {text:'3%',options:{align:'right'}}],
    ['Realignment', {text:'6',options:{align:'right'}}, {text:'1%',options:{align:'right'}}],
  ], { x:M+0.28, y:2.42, w:lw-0.56, colW:[2.75,1.30,1.14], fontFace:F, fontSize:14, color:BODY, rowH:0.25,
    border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  s.addText('73% of intent is what a marketplace serves.',
    { x:M+0.28, y:4.70, w:lw-0.56, h:0.30, fontFace:F, fontSize:14, bold:true, color:GREEN,
      isTextBox:true, margin:0, valign:'middle' })
  const rx = M + lw + 0.26, rw = CW - lw - 0.26
  card(s, { x:rx, y:1.94, w:rw, h:2.70 })
  s.addText('Top learning priorities in 2026 IDPs filed', { x:rx+0.28, y:2.12, w:rw-0.56, h:0.28,
    fontFace:F, fontSize:17, bold:true, color:INK, isTextBox:true, margin:0 })
  s.addTable([
    [{text:'#',options:{bold:true,color:MUTE}},{text:'Skill theme',options:{bold:true,color:MUTE}},
     {text:'Employees',options:{bold:true,color:MUTE,align:'right'}},{text:'Share',options:{bold:true,color:MUTE,align:'right'}}],
    ['1','Data, analytics and AI tools',{text:'105',options:{align:'right'}},{text:'37.1%',options:{align:'right'}}],
    ['2','Functional and technical expertise',{text:'100',options:{align:'right'}},{text:'35.3%',options:{align:'right'}}],
    ['3','Process and change management',{text:'87',options:{align:'right'}},{text:'30.7%',options:{align:'right'}}],
    ['4','Leadership and people management',{text:'56',options:{align:'right'}},{text:'19.8%',options:{align:'right'}}],
    ['5','Communication and stakeholders',{text:'48',options:{align:'right'}},{text:'17.0%',options:{align:'right'}}],
  ], { x:rx+0.28, y:2.42, w:rw-0.56, colW:[0.32, rw-0.56-0.32-1.3-0.86, 1.30, 0.86], fontFace:F,
    fontSize:14, color:BODY, rowH:0.30, border:{ type:'solid', color:'F1F5F9', pt:1 }, valign:'middle' })
  s.addText('Base: 283 employees whose 2026 IDPs named a priority.',
    { x:rx+0.28, y:4.70, w:rw-0.56, h:0.30, fontFace:F, fontSize:14, color:MUTE,
      isTextBox:true, margin:0, valign:'middle' })
  const bw = (CW - 2*0.24)/3
  ;[['630','of 1,249 IDP filers want to learn by doing','614 by experience, 16 by immersion'],
    ['55%','want growth that is not a promotion','2026 Midyear Review'],
    ['2,506','employee movements recorded in 2026','242 promotions · 318 realignments']]
   .forEach((k,i) => {
    const x = M + i*(bw+0.24)
    tintCard(s, { x, y:5.10, w:bw, h:1.48 }, TINT)
    s.addText(k[0], { x:x+0.28, y:5.26, w:bw-0.56, h:0.44, fontFace:F, fontSize:28, bold:true,
      color:RED, isTextBox:true, margin:0, valign:'middle' })
    s.addText(k[1], { x:x+0.28, y:5.70, w:bw-0.56, h:0.5, fontFace:F, fontSize:15, bold:true,
      color:INK, lineSpacing:19, isTextBox:true, margin:0, valign:'top' })
    s.addText(k[2], { x:x+0.28, y:6.22, w:bw-0.56, h:0.32, fontFace:F, fontSize:14, color:MUTE,
      lineSpacing:17, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'Sources: 2026 IDP filings · 2026 Midyear Review · 2026 employee count per department and type of change.', N)
}

/* ═══ 27 · SOURCES & ASSUMPTIONS ═════════════════════════════════ */
{
  const s = next(); N++
  head(s, 'Appendix · Sources and assumptions', 'Every number in this deck, and where it came from.',
    'Anything marked as a planning assumption has not yet been measured and should be challenged.')
  const cw = (CW - 0.28)/2
  const cols = [
    ['HOME CREDIT DATA', [
      'Internal job posting data, 2024–2026 — 1,008 vacancies, 463 internal applicants, 170 accepted.',
      '2025 hiring volumes: 324 roles, of which 186 Band B and 103 Band C.',
      '2024 cost-per-hire: ₱22,446 Band B, ₱86,796 Band C; headhunter fee 68% of Band C cost.',
      'Exit survey — "Career & Better Opportunity", 22% of exits.',
      'eNPS on growth opportunity — 88% believe they can grow here.',
      '2026 IDP filings (1,249) and career movement preferences (1,109).',
      'HRIS headcount — 637 pilot, 1,978 non-mass.',
      "HCPH Strategic Priorities '27–'29 (draft) · HR Strategic Priorities · OneHR Operating Model.",
    ]],
    ['MODEL AND PLANNING ASSUMPTIONS', [
      'Build estimate is bottom-up from the completed BRD at ₱150k per developer-month. Not yet validated by IT.',
      'FX ₱58 = US$1. Discount rate 10%. Three-year horizon.',
      'Avoided agency fee per attributed fill ₱350,000; 37 vacancy days saved.',
      'Retention lift modelled at 3 points, discounted from the 13-point gap in v1 data — that gap is almost certainly selection bias.',
      '120 gig, immersion and service-offer participants a year.',
      'Vendor comparison is an RFP planning band, not a quote — no vendor publishes per-seat pricing.',
      'Excluded from benefits: gig output, skills built, network effects.',
      'Excluded from costs: 0.2–0.3 FTE ownership from year two.',
    ]],
  ]
  cols.forEach((c,i) => {
    const x = M + i*(cw+0.28)
    card(s, { x, y:1.94, w:cw, h:4.62 })
    s.addText(c[0], { x:x+0.28, y:2.12, w:cw-0.56, h:0.26, fontFace:F, fontSize:14, bold:true,
      color:i ? AMBER : RED, charSpacing:1.4, isTextBox:true, margin:0 })
    s.addText(c[1].map((t,j,a) => ({ text:t, options:{ bullet:true, breakLine:j<a.length-1 } })),
      { x:x+0.28, y:2.44, w:cw-0.56, h:4.02, fontFace:F, fontSize:14, color:BODY,
        lineSpacing:18, paraSpaceAfter:5, isTextBox:true, margin:0, valign:'top' })
  })
  foot(s, 'Working model: Growth-v2-CBA.xlsx · Requirements: BRD_V2 · Prototype: Growth v2. Internal — do not distribute outside the organization.', N)
}

if (WARN.length) { console.log('\nOVERFLOW RISKS (' + WARN.length + '):'); WARN.forEach(w => console.log('  ' + w)) }
else console.log('\nno overflow risks')
p.writeFile({ fileName: 'Growth_Talent_Marketplace_ALP.pptx' })
  .then(f => console.log('WROTE', f, '·', N, 'slides'))
