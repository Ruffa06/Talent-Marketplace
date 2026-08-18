/* Generates docs/Growth-v2-Business-Case.pptx — the 13-slide decision deck for
 * the v2-lean business case. Every figure traces to docs/V2_CBA.md, which in
 * turn is derived by docs/v2-cba-model.py.
 *
 *   npm install pptxgenjs && node docs/v2-deck.js
 *
 * Palette is the product's own: navy ground, Home Credit red as the single
 * accent. The repeating motif is the provenance pill from the marketplace
 * itself — the small uppercase token that says how a number is known.
 */
const pptxgen = require('pptxgenjs')
const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE'                 // 13.3 x 7.5
pres.author = 'People & Culture Department'
pres.title  = 'Growth Marketplace v2 — Build Recommendation'

// ── Palette: the product's own. Navy ground, Home Credit red as the one accent.
const INK='0F172A', RED='C00000', WHITE='FFFFFF', PAPER='F8FAFC', LINE='E2E8F0'
const MUTE='64748B', SOFT='94A3B8', GREEN='16A34A', BLUE='1E40AF', ICE='CBD5E1'
const HEAD='Cambria', BODY='Calibri'
const M = 0.62, W = 13.33, H = 7.5, CW = W - M*2

const notes = (s,t) => s.addNotes(t)

// Motif: the provenance pill from the product itself — small uppercase tokens
// that say how a thing is known, or what class it belongs to.
function pill(s, x, y, text, fg, bg, w) {
  const ww = w || (0.115 * text.length + 0.30)
  s.addShape(pres.ShapeType.roundRect, { x, y, w: ww, h: 0.245, fill:{color:bg}, line:{color:bg}, rectRadius:0.12 })
  s.addText(text, { x, y, w: ww, h: 0.245, fontFace:BODY, fontSize:9, bold:true, color:fg,
                    align:'center', valign:'middle', charSpacing:0.8, margin:0 })
  return ww
}
function slideTitle(s, t, sub, dark) {
  s.addText(t, { x:M, y:0.44, w:CW, h:0.62, fontFace:HEAD, fontSize:33, bold:true,
                 color: dark?WHITE:INK, margin:0 })
  if (sub) s.addText(sub, { x:M, y:1.10, w:CW, h:0.34, fontFace:BODY, fontSize:13.5,
                            color: dark?ICE:MUTE, margin:0 })
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill:{color: fill||WHITE},
    line:{color: fill && fill!==WHITE ? fill : LINE, width:1}, rectRadius:0.09,
    shadow:{ type:'outer', angle:90, blur:9, offset:1.4, color:'0F172A', opacity:0.07 } })
}
function newSlide(dark) {
  const s = pres.addSlide()
  s.background = { color: dark ? INK : PAPER }
  return s
}

/* ══ 1 · TITLE ══════════════════════════════════════════════════ */
{
const s = newSlide(true)
s.addText('GROWTH · HC TALENT MARKETPLACE', { x:M, y:1.62, w:CW, h:0.3, fontFace:BODY,
  fontSize:12, bold:true, color:SOFT, charSpacing:2.4, margin:0 })
s.addText('Version 2:\nbuild recommendation', { x:M, y:2.05, w:8.6, h:1.9, fontFace:HEAD,
  fontSize:47, bold:true, color:WHITE, lineSpacing:50, margin:0 })
s.addText('Promoting internal vacancies we no longer run — and proving it worked.', {
  x:M, y:4.05, w:8.6, h:0.4, fontFace:BODY, fontSize:16, color:ICE, margin:0 })
const stats = [['₱1,050,375','3-year total cost',3.55],['6.8','Benefit-cost ratio',2.5],['9 mo','Payback',2.5]]
let sx = M
stats.forEach((st,i) => {
  const x = sx; sx += st[2] + 0.42
  s.addText(st[0], { x, y:4.86, w:st[2], h:0.62, fontFace:HEAD, fontSize:29, bold:true,
    color: i===0?WHITE:GREEN, margin:0 })
  s.addText(st[1], { x, y:5.46, w:st[2], h:0.3, fontFace:BODY, fontSize:11.5, color:SOFT, margin:0 })
})
s.addText('People & Culture Department  ·  637 employees  ·  18 August 2026', {
  x:M, y:6.62, w:CW, h:0.3, fontFace:BODY, fontSize:11, color:MUTE, margin:0 })
notes(s,'We are asking to build v2-lean: 766,125 pesos in year one, 1.05M over three years. Base-case benefit-cost ratio 6.8, payback nine months. It is cheaper than v1 and 10 to 27 times cheaper than buying a platform.')
}

/* ══ 2 · THE CONSTRAINT ════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Careers already runs internal vacancies',
  'So v2 gives up the half it was never going to win, and keeps the half Careers cannot do.')
const cols = [
  { t:'Careers owns', c:INK, items:['The requisition','The application and CV','Screening and interviews','The offer'], pl:'SYSTEM OF RECORD', pc:SOFT, pb:'E2E8F0' },
  { t:'Growth owns',  c:RED, items:['Knowing what someone can already do','Scoring fit against every open role','Surfacing a role they were never going to search for','Gigs, DJIs and service offers, end to end'], pl:'WHERE WE ADD VALUE', pc:WHITE, pb:RED },
]
cols.forEach((col,i) => {
  const x = M + i*(CW/2 + 0.16), w = CW/2 - 0.16
  card(s, x, 1.78, w, 3.66)
  pill(s, x+0.34, 2.06, col.pl, col.pc, col.pb)
  s.addText(col.t, { x:x+0.34, y:2.44, w:w-0.68, h:0.42, fontFace:HEAD, fontSize:22, bold:true, color:col.c, margin:0 })
  col.items.forEach((it,j) => {
    s.addShape(pres.ShapeType.ellipse, { x:x+0.36, y:3.06+j*0.56, w:0.11, h:0.11, fill:{color: i===1?RED:SOFT}, line:{color: i===1?RED:SOFT} })
    s.addText(it, { x:x+0.60, y:2.94+j*0.56, w:w-0.98, h:0.42, fontFace:BODY, fontSize:13.5, color: i===1?INK:MUTE, valign:'middle', margin:0 })
  })
})
card(s, M, 5.66, CW, 1.02, INK)
s.addText([
  { text:'Running a second application queue would not add a channel. ', options:{ color:ICE } },
  { text:'It would split one process across two systems and lose people in the seam.', options:{ color:WHITE, bold:true } },
], { x:M+0.34, y:5.66, w:CW-0.68, h:1.02, fontFace:BODY, fontSize:14.5, valign:'middle', margin:0 })
notes(s,'The constraint is real and it is not a limitation of the marketplace. Recruitment already has a system of record. Duplicating it would be worse than useless.')
}

/* ══ 3 · WHAT v2 DOES INSTEAD ══════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Promote here. Apply there. Count the handoff.',
  'Four steps. Each one produces a different grade of evidence, and we label every number with which.')
const steps = [
  { n:'01', t:'Promote', d:'The vacancy appears on our board with a match score and its job description — the part Careers cannot do.', p:'MEASURED HERE', pb:'DCFCE7', pc:'166534' },
  { n:'02', t:'Hand off', d:'Opening it mints a referral code and carries it to Careers on the link. The click is ours, exactly.', p:'MEASURED HERE', pb:'DCFCE7', pc:'166534' },
  { n:'03', t:'Confirm', d:'We ask the employee afterwards whether they applied. One tap, and the board asks unprompted.', p:'SELF-REPORTED', pb:'FEF3C7', pc:'92400E' },
  { n:'04', t:'Reconcile', d:'Quarterly, join our referral export against the Careers export on the referral code.', p:'FROM CAREERS', pb:'E0E7FF', pc:'3730A3' },
]
const cw2 = (CW - 0.36*3)/4
steps.forEach((st,i) => {
  const x = M + i*(cw2 + 0.36)
  card(s, x, 1.80, cw2, 3.42)
  s.addText(st.n, { x:x+0.28, y:2.02, w:1.2, h:0.5, fontFace:HEAD, fontSize:25, bold:true, color: 'E2E8F0', margin:0 })
  s.addText(st.t, { x:x+0.28, y:2.56, w:cw2-0.56, h:0.38, fontFace:HEAD, fontSize:19, bold:true, color:INK, margin:0 })
  s.addText(st.d, { x:x+0.28, y:3.00, w:cw2-0.56, h:1.42, fontFace:BODY, fontSize:12.5, color:MUTE, margin:0 })
  pill(s, x+0.28, 4.62, st.p, st.pc, st.pb)
  if (i < 3) s.addText('→', { x:x+cw2+0.02, y:3.24, w:0.32, h:0.4, fontFace:BODY, fontSize:19, color:SOFT, align:'center', margin:0 })
})
card(s, M, 5.52, CW, 1.16)
s.addText([
  { text:'The attribution rule, agreed before the first number is reported:  ', options:{ color:MUTE } },
  { text:'a vacancy application counts as ours when a referral click precedes it by no more than 30 days, last touch.', options:{ color:INK, bold:true } },
  { text:'  Undercounting is the intended failure mode.', options:{ color:MUTE } },
], { x:M+0.34, y:5.52, w:CW-0.68, h:1.16, fontFace:BODY, fontSize:14, valign:'middle', margin:0 })
notes(s,'Three tiers of evidence, never conflated. Clicks are exact and ours. Self-reports are free but biased upward. Only the Careers-confirmed number goes in a board paper.')
}

/* ══ 4 · THE FINDING ═══════════════════════════════════════════ */
{
const s = newSlide(true)
pill(s, M, 0.52, 'THE COUNTERINTUITIVE FINDING', WHITE, RED)
s.addText('Removing a service made\nthe system more expensive.', { x:M, y:0.98, w:7.5, h:1.5,
  fontFace:HEAD, fontSize:34, bold:true, color:WHITE, lineSpacing:38, margin:0 })
s.addText('v1 owned the whole vacancy funnel, so measuring it was free — the data was already in our database. v2 hands that funnel to Careers and keeps only the top of it. The outcome now sits in someone else’s system, and has to be tracked, handed off, self-reported and reconciled to be claimable at all.',
  { x:M, y:2.62, w:7.3, h:1.5, fontFace:BODY, fontSize:14.5, color:ICE, lineSpacing:23, margin:0 })
card(s, 8.28, 1.06, 4.4, 2.5, '1E293B')
s.addText('Developer effort', { x:8.62, y:1.28, w:3.8, h:0.3, fontFace:BODY, fontSize:11.5, bold:true, color:SOFT, charSpacing:0.8, margin:0 })
const de = [['Deleting the vacancy flow saves','0.4 months', GREEN],['Building the machinery to count it costs','1.2 months', RED]]
de.forEach((d,i) => {
  s.addText(d[0], { x:8.62, y:1.74+i*0.82, w:3.8, h:0.3, fontFace:BODY, fontSize:12, color:ICE, margin:0 })
  s.addText(d[1], { x:8.62, y:2.02+i*0.82, w:3.8, h:0.4, fontFace:HEAD, fontSize:20, bold:true, color:d[2], margin:0 })
})
const tco = [['v1','₱1,112,420', SOFT],['v2 as first scoped','₱1,542,136', RED]]
tco.forEach((t,i) => {
  s.addText(t[0], { x:8.28, y:3.88+i*0.66, w:2.3, h:0.36, fontFace:BODY, fontSize:13, color:ICE, valign:'middle', margin:0 })
  s.addText(t[1], { x:10.5, y:3.88+i*0.66, w:2.18, h:0.36, fontFace:HEAD, fontSize:16, bold:true, color:t[2], align:'right', valign:'middle', margin:0 })
})
s.addText('+39% over three years', { x:8.28, y:5.24, w:4.4, h:0.34, fontFace:BODY, fontSize:12.5, bold:true, color:RED, align:'right', margin:0 })
s.addText('That is the honest trade — and it is fixable without touching what drives internal growth.',
  { x:M, y:4.46, w:7.3, h:0.8, fontFace:BODY, fontSize:15, italic:true, color:WHITE, margin:0 })
s.addText('The next slide takes ₱491,761 back out.', { x:M, y:5.42, w:7.3, h:0.4,
  fontFace:HEAD, fontSize:19, bold:true, color:GREEN, margin:0 })
notes(s,'Say this plainly. It is counterintuitive and it is not a mistake. But the next slide fixes it.')
}

/* ══ 5 · FIVE CHANGES ══════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Five changes remove ₱491,761',
  'None of them touches the board, the match scores or the job descriptions.')
const rows = [
  ['B','Supabase-native','Auth, RLS and Edge Functions replace the separate API service.','₱270,000 + ₱13,920/yr'],
  ['C','Reuse the v1 design system','All three new surfaces are already designed in the working prototype.','₱66,000'],
  ['A','Ship promotion Q1, tracking Q2','Launch the board first; measure Q1 from the Careers source field alone.','₱162,000 out of Y1'],
  ['D','No phase 2','Do not automate the ATS join unless referral volume justifies it.','₱108,000'],
  ['F','Reconcile quarterly','Not monthly.','₱7,500/yr'],
]
card(s, M, 1.76, CW, 4.06)
rows.forEach((r,i) => {
  const y = 1.98 + i*0.775
  s.addShape(pres.ShapeType.ellipse, { x:M+0.3, y:y+0.09, w:0.42, h:0.42, fill:{color:INK}, line:{color:INK} })
  s.addText(r[0], { x:M+0.3, y:y+0.09, w:0.42, h:0.42, fontFace:HEAD, fontSize:14, bold:true, color:WHITE, align:'center', valign:'middle', margin:0 })
  s.addText(r[1], { x:M+0.92, y:y+0.02, w:4.5, h:0.34, fontFace:BODY, fontSize:14, bold:true, color:INK, margin:0 })
  s.addText(r[2], { x:M+0.92, y:y+0.34, w:7.4, h:0.34, fontFace:BODY, fontSize:11.5, color:MUTE, margin:0 })
  s.addText(r[3], { x:W-M-3.3, y:y+0.09, w:3.0, h:0.42, fontFace:HEAD, fontSize:15, bold:true, color:GREEN, align:'right', valign:'middle', margin:0 })
  if (i < 4) s.addShape(pres.ShapeType.line, { x:M+0.3, y:y+0.70, w:CW-0.6, h:0, line:{ color:'F1F5F9', width:1 } })
})
card(s, M, 6.0, CW, 0.86, 'FFFBEB')
s.addText([
  { text:'Held back:  ', options:{ bold:true, color:'92400E' } },
  { text:'Claude Haiku instead of Sonnet would save ₱14,674/yr — but match quality ', options:{ color:'92400E' } },
  { text:'is', options:{ color:'92400E', italic:true, bold:true } },
  { text:' promotion efficiency. Benchmark on 50 real pairs first.', options:{ color:'92400E' } },
], { x:M+0.34, y:6.0, w:CW-0.68, h:0.86, fontFace:BODY, fontSize:13, valign:'middle', margin:0 })
notes(s,'Every one of these is plumbing or sequencing. None changes what an employee sees or how well the marketplace surfaces a role to them.')
}

/* ══ 6 · WHAT WE DID NOT CUT ═══════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'What we deliberately did not cut',
  'Promotion efficiency lives in five cheap things. Cutting any of them saves little and costs the case.')
const keeps = [
  ['Match scores on promoted roles','The entire reason our board beats a plain Careers listing. Without it we have built a duplicate job board.'],
  ['The job description on the card','What people actually decide on before clicking through.'],
  ['The “did you apply?” nudge','₱1,740/yr — the cheapest line in the model, and what turns a click into a countable application.'],
  ['The referral-log DPIA','A legal gate, not a documentation task. The log records who looked at which internal role.'],
  ['Recruitment’s source field','Free to them. It carries Q1 attribution on its own, which is what makes deferring the engine safe.'],
]
const cw3 = (CW - 0.32*2)/3
keeps.forEach((k,i) => {
  const col = i % 3, row = Math.floor(i/3)
  const x = M + col*(cw3+0.32), y = 1.78 + row*2.52
  card(s, x, y, cw3, 2.32)
  s.addShape(pres.ShapeType.ellipse, { x:x+0.3, y:y+0.28, w:0.44, h:0.44, fill:{color:'FEE2E2'}, line:{color:'FEE2E2'} })
  s.addText('✓', { x:x+0.3, y:y+0.28, w:0.44, h:0.44, fontFace:BODY, fontSize:15, bold:true, color:RED, align:'center', valign:'middle', margin:0 })
  s.addText(k[0], { x:x+0.3, y:y+0.82, w:cw3-0.6, h:0.56, fontFace:HEAD, fontSize:14.5, bold:true, color:INK, margin:0 })
  s.addText(k[1], { x:x+0.3, y:y+1.42, w:cw3-0.6, h:0.76, fontFace:BODY, fontSize:11.5, color:MUTE, margin:0 })
})
card(s, M + 2*(cw3+0.32), 4.30, cw3, 2.32, INK)
s.addText('78% of v2’s cost is the build —\nand none of the build\nis the promotion.', {
  x: M + 2*(cw3+0.32) + 0.3, y:4.66, w:cw3-0.6, h:1.6, fontFace:HEAD, fontSize:17, bold:true,
  color:WHITE, lineSpacing:24, margin:0 })
notes(s,'This is the answer to "can we cut more". We cut plumbing, not product.')
}

/* ══ 7 · COST BREAKDOWN ════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'v2-lean — where the money goes', 'Build front-loaded, run flat. All figures in pesos, ₱58 = US$1.')
// Left: line-item table
const items = [
  ['YEAR 1 BUILD','', true],
  ['Developer, 1.4 months — board, matching, JD reader, handoff','210,000'],
  ['Designer, 1.5 months at 50% — reuses the v1 design system','82,500'],
  ['PM/BA, 4 months at 30% — incl. recruitment coordination','180,000'],
  ['Security review + DPA assessment + referral-log DPIA','120,000'],
  ['Contingency (20%)','118,500'],
  ['Build, year 1','711,000', false, true],
  ['YEAR 2 BUILD','', true],
  ['Developer, 0.9 months — referral engine + reporting, +20%','162,000', false, true],
  ['ANNUAL RUN','', true],
  ['Run, year 1 — Supabase Pro + Auth, Claude API, email, monitoring','55,125'],
  ['Run, year 2 onward — adds quarterly reconciliation','61,125', false, true],
]
card(s, M, 1.72, 7.55, 5.0)
let yy = 1.94
items.forEach(it => {
  if (it[2]) { pill(s, M+0.3, yy+0.04, it[0], MUTE, 'F1F5F9'); yy += 0.42; return }
  s.addText(it[0], { x:M+0.3, y:yy, w:5.5, h:0.32, fontFace:BODY, fontSize:11.5,
    bold: !!it[3], color: it[3]?INK:MUTE, valign:'middle', margin:0 })
  s.addText('₱'+it[1], { x:M+5.85, y:yy, w:1.4, h:0.32, fontFace:HEAD, fontSize: it[3]?13:12,
    bold: !!it[3], color: it[3]?INK:MUTE, align:'right', valign:'middle', margin:0 })
  yy += 0.355
})
// Right: year totals + headline
const years = [['Year 1','₱766,125'],['Year 2','₱223,125'],['Year 3','₱61,125']]
years.forEach((y2,i) => {
  const x = 8.45
  card(s, x, 1.72 + i*0.74, 4.26, 0.62)
  s.addText(y2[0], { x:x+0.26, y:1.72+i*0.74, w:1.6, h:0.62, fontFace:BODY, fontSize:13, color:MUTE, valign:'middle', margin:0 })
  s.addText(y2[1], { x:x+1.9, y:1.72+i*0.74, w:2.1, h:0.62, fontFace:HEAD, fontSize:16, bold:true, color:INK, align:'right', valign:'middle', margin:0 })
})
card(s, 8.45, 4.02, 4.26, 2.7, INK)
s.addText('3-YEAR TOTAL', { x:8.71, y:4.28, w:3.74, h:0.28, fontFace:BODY, fontSize:11, bold:true, color:SOFT, charSpacing:1.6, margin:0 })
s.addText('₱1,050,375', { x:8.71, y:4.58, w:3.74, h:0.72, fontFace:HEAD, fontSize:34, bold:true, color:WHITE, margin:0 })
s.addText('US$18,110', { x:8.71, y:5.30, w:3.74, h:0.3, fontFace:BODY, fontSize:13, color:ICE, margin:0 })
;[['₱1,649','per employee, 3 years'],['₱550','per employee, per year']].forEach((p,i) => {
  s.addText(p[0], { x:8.71, y:5.74+i*0.44, w:1.2, h:0.34, fontFace:HEAD, fontSize:15, bold:true, color:GREEN, valign:'middle', margin:0 })
  s.addText(p[1], { x:9.95, y:5.74+i*0.44, w:2.5, h:0.34, fontFace:BODY, fontSize:11, color:SOFT, valign:'middle', margin:0 })
})
notes(s,'Year one is 766,125. After that it is 61,125 a year to run, plus 162,000 once in year two for the referral engine.')
}

/* ══ 8 · THREE-YEAR COMPARISON ═════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Cheaper than v1, despite doing more', 'Three-year total cost of ownership, 637 employees.')
s.addChart(pres.ChartType.bar, [{ name:'3-year TCO', labels:['v2 as first scoped','v1 — vacancies in-house','v2-lean — recommended'],
  values:[1542136, 1112420, 1050375] }], {
  x:M, y:1.78, w:8.0, h:4.0, barDir:'bar', chartColors:[SOFT, SOFT, RED], barGapWidthPct:58,
  showValue:true, dataLabelPosition:'outEnd', dataLabelFormatCode:'₱#,##0', dataLabelFontFace:BODY,
  dataLabelFontSize:12, dataLabelColor:INK, showLegend:false,
  catAxisLabelFontFace:BODY, catAxisLabelFontSize:12, catAxisLabelColor:INK,
  valAxisLabelFontFace:BODY, valAxisLabelFontSize:10, valAxisLabelColor:SOFT,
  valAxisMaxVal:1800000, valAxisLabelFormatCode:'₱#,##0,,"M"',
  valGridLine:{ color:'EEF2F6', size:1 }, catGridLine:{ style:'none' }, plotArea:{ fill:{ color:PAPER } } })
const facts = [['−32%','against v2 as first scoped', RED],['−6%','against v1', GREEN],['₱550','per employee per year', INK]]
facts.forEach((f,i) => {
  const y = 1.86 + i*1.36
  card(s, 8.9, y, 3.81, 1.16)
  s.addText(f[0], { x:9.18, y:y+0.14, w:3.3, h:0.5, fontFace:HEAD, fontSize:24, bold:true, color:f[2], margin:0 })
  s.addText(f[1], { x:9.18, y:y+0.66, w:3.3, h:0.32, fontFace:BODY, fontSize:12, color:MUTE, margin:0 })
})
s.addText('The lean build lands under the version that still ran vacancies in-house.', {
  x:8.9, y:5.98, w:3.81, h:0.6, fontFace:BODY, fontSize:12.5, italic:true, color:MUTE, margin:0 })
notes(s,'This resolves the awkward finding. v2-lean does more than v1 and costs 6 percent less.')
}

/* ══ 9 · vs COMPETITION ════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Against buying a platform: 10× – 27× cheaper',
  'Gloat, Fuel50, Eightfold and Workday do not publish per-seat pricing. Bands are RFP planning estimates, not quotes.')
s.addChart(pres.ChartType.bar, [{ name:'3-year cost', labels:['External platform — high band','External platform — low band','v2-lean'],
  values:[27840000, 10150000, 1050375] }], {
  x:M, y:1.86, w:7.7, h:3.3, barDir:'bar', chartColors:['334155','64748B', RED], barGapWidthPct:58,
  showValue:true, dataLabelPosition:'outEnd', dataLabelFormatCode:'₱#,##0,,"M"', dataLabelFontFace:BODY,
  dataLabelFontSize:12, dataLabelColor:INK, showLegend:false,
  catAxisLabelFontFace:BODY, catAxisLabelFontSize:12, catAxisLabelColor:INK,
  valAxisLabelFontFace:BODY, valAxisLabelFontSize:10, valAxisLabelColor:SOFT,
  valAxisLabelFormatCode:'₱#,##0,,"M"', valGridLine:{ color:'EEF2F6', size:1 },
  catGridLine:{ style:'none' }, plotArea:{ fill:{ color:PAPER } } })
card(s, 8.6, 1.86, 4.11, 3.3, INK)
s.addText('The number that lands', { x:8.9, y:2.1, w:3.5, h:0.3, fontFace:BODY, fontSize:11.5, bold:true, color:SOFT, charSpacing:1, margin:0 })
s.addText('29', { x:8.9, y:2.46, w:3.5, h:0.86, fontFace:HEAD, fontSize:52, bold:true, color:WHITE, margin:0 })
s.addText('attributed internal hires a vendor at the low band needs over three years, just to cover its own licence.', { x:8.9, y:3.36, w:3.5, h:0.86, fontFace:BODY, fontSize:12.5, color:ICE, margin:0 })
s.addShape(pres.ShapeType.line, { x:8.9, y:4.34, w:3.5, h:0, line:{ color:'334155', width:1 } })
s.addText([{ text:'v2-lean needs ', options:{ color:ICE } }, { text:'3.', options:{ color:GREEN, bold:true } }],
  { x:8.9, y:4.46, w:3.5, h:0.4, fontFace:BODY, fontSize:16, margin:0 })
card(s, M, 5.42, CW, 1.26)
s.addText([
  { text:'Before deciding:  ', options:{ bold:true, color:INK } },
  { text:'issue an RFP with the 637 seat count stated up front and ask specifically for minimum contract value. At this size the binding constraint is the vendor’s floor, not the per-seat rate — a US$20/employee headline would imply US$12,740, well below what any of them will contract at.', options:{ color:MUTE } },
], { x:M+0.34, y:5.42, w:CW-0.68, h:1.26, fontFace:BODY, fontSize:13, valign:'middle', margin:0 })
notes(s,'Be honest that these are planning bands, not quotes. The break-even framing is what makes the point without over-claiming precision.')
}

/* ══ 10 · BENEFITS ═════════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Two benefit streams — unequally defensible',
  'Base case: 4 attributed hires a year, 120 gig/DJI/service-offer participants.')
const b = [
  { pl:'ATTRIBUTED', pc:'3730A3', pb:'E0E7FF', t:'Permanent-role outcomes', v:'₱1,673,231', sub:'per year',
    lines:[['Avoided agency fees — 4 × ₱350,000','₱1,400,000'],['37 vacancy days saved per fill','₱273,231']],
    foot:'Exists only because of the tracking spend. Without a confirmed referral the hire is invisible in our data and belongs, as far as anyone can tell, to Careers.' },
  { pl:'OWNED', pc:'166534', pb:'DCFCE7', t:'Retention on participants', v:'₱1,296,000', sub:'per year',
    lines:[['120 participants × 3pt retention lift','—'],['× ₱360,000 replacement cost each','₱1,296,000']],
    foot:'Needs no attribution — gigs, DJIs and service offers run end to end here. But the 3-point lift is a discounted judgement, not a measurement. See the stress test.' },
]
b.forEach((col,i) => {
  const x = M + i*(CW/2 + 0.16), w = CW/2 - 0.16
  card(s, x, 1.76, w, 4.9)
  pill(s, x+0.34, 2.04, col.pl, col.pc, col.pb)
  s.addText(col.t, { x:x+0.34, y:2.42, w:w-0.68, h:0.4, fontFace:HEAD, fontSize:20, bold:true, color:INK, margin:0 })
  s.addText(col.v, { x:x+0.34, y:2.86, w:w-0.68, h:0.66, fontFace:HEAD, fontSize:33, bold:true, color: i===0?BLUE:GREEN, margin:0 })
  s.addText(col.sub, { x:x+0.34, y:3.5, w:w-0.68, h:0.28, fontFace:BODY, fontSize:11.5, color:SOFT, margin:0 })
  col.lines.forEach((ln,j) => {
    s.addText(ln[0], { x:x+0.34, y:3.94+j*0.44, w:w-2.3, h:0.36, fontFace:BODY, fontSize:12, color:MUTE, valign:'middle', margin:0 })
    if (ln[1] !== '—') s.addText(ln[1], { x:x+w-1.94, y:3.94+j*0.44, w:1.6, h:0.36, fontFace:HEAD, fontSize:12.5, bold:true, color:INK, align:'right', valign:'middle', margin:0 })
  })
  s.addShape(pres.ShapeType.line, { x:x+0.34, y:4.94, w:w-0.68, h:0, line:{ color:'F1F5F9', width:1 } })
  s.addText(col.foot, { x:x+0.34, y:5.06, w:w-0.68, h:1.4, fontFace:BODY, fontSize:11.5, color:MUTE, lineSpacing:17, margin:0 })
})
s.addText('Excluded on purpose: the value of gig output itself, skills built, and cross-functional network effects. All real, none reliably measurable, none needed to make the case.',
  { x:M, y:6.82, w:CW, h:0.4, fontFace:BODY, fontSize:11, italic:true, color:SOFT, margin:0 })
notes(s,'Flag the retention assumption before anyone else does. The v1 dashboard shows a 13-point gap; that is almost certainly selection bias, so we discounted it to 3 points, and the next slide runs the case without it entirely.')
}

/* ══ 11 · CBA ══════════════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'Cost-benefit analysis', 'Three years, 10% discount rate. Year-1 benefit ramped to 40% for build and adoption.')
const head = ['Scenario','3-yr benefit','3-yr cost','Net','BCR','NPV @10%','Payback']
const rows = [
  ['Conservative — 2 hires/yr','₱5,118,277','₱1,050,375','₱4,067,902','4.9','₱3,213,452','12 mo', false],
  ['Base — 4 hires/yr','₱7,126,154','₱1,050,375','₱6,075,779','6.8','₱4,837,655','9 mo', true],
  ['Optimistic — 7 hires/yr','₱10,137,969','₱1,050,375','₱9,087,594','9.7','₱7,273,959','7 mo', false],
  ['Retention excluded entirely','₱4,015,754','₱1,050,375','₱2,965,379','3.8','₱2,321,604','14 mo', false, true],
  ['Retention only, zero hires','₱3,110,400','₱1,050,375','₱2,060,025','3.0','₱1,589,249','16 mo', false, true],
]
const colX = [M+0.28, 4.00, 5.65, 7.15, 8.95, 9.70, 11.65]
const colW = [3.6, 1.55, 1.4, 1.7, 0.66, 1.86, 0.78]
card(s, M, 1.74, CW, 3.62)
head.forEach((h,i) => s.addText(h, { x:colX[i], y:1.92, w:colW[i], h:0.34, fontFace:BODY, fontSize:10.5,
  bold:true, color:SOFT, charSpacing:0.6, align: i===0?'left':'right', valign:'middle', margin:0 }))
s.addShape(pres.ShapeType.line, { x:M+0.28, y:2.34, w:CW-0.56, h:0, line:{ color:LINE, width:1 } })
rows.forEach((r,i) => {
  const y = 2.44 + i*0.56
  if (r[7]) s.addShape(pres.ShapeType.roundRect, { x:M+0.14, y:y-0.03, w:CW-0.28, h:0.5,
    fill:{color:'FEF2F2'}, line:{color:'FEF2F2'}, rectRadius:0.06 })
  for (let c=0;c<7;c++) {
    const stress = !!r[8]
    s.addText(r[c], { x:colX[c], y, w:colW[c], h:0.44, fontFace: c===0?BODY:HEAD,
      fontSize: r[7]?13:12, bold: r[7] || c===4, italic: stress && c===0,
      color: r[7] ? (c===4?RED:INK) : (stress ? MUTE : (c===4?INK:MUTE)),
      align: c===0?'left':'right', valign:'middle', margin:0 })
  }
  if (i===2) s.addShape(pres.ShapeType.line, { x:M+0.28, y:y+0.52, w:CW-0.56, h:0, line:{ color:LINE, width:1 } })
})
card(s, M, 5.56, CW, 1.28, INK)
s.addText([
  { text:'The case survives the removal of either stream.  ', options:{ color:WHITE, bold:true } },
  { text:'Strip retention out — the softest input — and it is still 3.8. Strip out every vacancy hire instead and retention alone repays the three-year cost in 0.8 years. Both halves would have to be wrong at once.  ', options:{ color:ICE } },
  { text:'Break-even is 1.0 attributed hires a year — one internal fill out of roughly 60 requisitions.', options:{ color:GREEN, bold:true } },
], { x:M+0.34, y:5.56, w:CW-0.68, h:1.28, fontFace:BODY, fontSize:13, valign:'middle', lineSpacing:19, margin:0 })
notes(s,'This is the money slide. Lead with base case 6.8 and nine months, then immediately show the two stress rows so nobody has to ask.')
}

/* ══ 12 · RISKS ════════════════════════════════════════════════ */
{
const s = newSlide()
slideTitle(s,'What would break the case', 'One of these is a gating item. The rest are survivable and already modelled.')
const risks = [
  ['Recruitment declines the source field','Every attributed peso becomes unprovable and Q1 measurement disappears. BCR falls to 3.0.','Secure it before committing to the build. It is a form configuration change, not an integration.', true],
  ['DPO blocks the referral log','The whole attribution tier is unavailable. Retention benefits unaffected.','Get the position before build, not after. Gating item.', true],
  ['Retention lift is actually zero','Benefits fall to the attributed rows. Still BCR 3.8.','Already modelled. Run the promoted-vs-not holdout to measure it properly.', false],
  ['Adoption below 120 participants/yr','Retention benefit scales linearly — 60 participants halves it.','Case still clears at roughly BCR 5 in the base scenario.', false],
  ['Build effort doubles','3-year cost ≈ ₱1.76M, base BCR falls to 4.0.','Still 6×–16× under the vendor bands.', false],
  ['0.25 FTE ownership from year 2','+₱450,000 over three years. Base BCR 6.8 → 3.1.','Include it in the paper — the most under-estimated line in any build-vs-buy.', false],
]
const cwr = (CW - 0.3)/2
risks.forEach((r,i) => {
  const col = i % 2, row = Math.floor(i/2)
  const x = M + col*(cwr+0.3), y = 1.76 + row*1.78
  card(s, x, y, cwr, 1.62, r[3] ? 'FEF2F2' : WHITE)
  s.addText(r[0], { x:x+0.28, y:y+0.16, w:cwr-0.56, h:0.32, fontFace:HEAD, fontSize:14.5, bold:true, color: r[3]?RED:INK, margin:0 })
  s.addText(r[1], { x:x+0.28, y:y+0.54, w:cwr-0.56, h:0.42, fontFace:BODY, fontSize:11.5, color:MUTE, margin:0 })
  s.addText([{ text:'→ ', options:{ color: r[3]?RED:GREEN, bold:true } }, { text:r[2], options:{ color:INK } }],
    { x:x+0.28, y:y+1.06, w:cwr-0.56, h:0.44, fontFace:BODY, fontSize:11.5, margin:0 })
})
notes(s,'The source field is the one to press on. It is free to them and the whole attributed half of the case depends on it.')
}

/* ══ 13 · RECOMMENDATION ═══════════════════════════════════════ */
{
const s = newSlide(true)
pill(s, M, 0.56, 'THE ASK', WHITE, RED)
s.addText('Recommendation', { x:M, y:1.0, w:CW, h:0.7, fontFace:HEAD, fontSize:36, bold:true, color:WHITE, margin:0 })
const asks = [
  ['Build v2-lean','₱766,125 in year one, ₱1,050,375 over three. Base-case BCR 6.8, payback nine months — and cheaper than v1 despite doing more.'],
  ['Get the source field committed first','Free, carries Q1 attribution on its own, and without it the attributed half of the case evaporates. Do not start the build until recruitment has agreed.'],
  ['Ship promotion Q1, tracking Q2','Unless a budget review falls inside Q1 — then build the engine up front. ₱162,000 is cheap next to arriving with nothing to show.'],
  ['Decide phase 2 on year-one data','Automate the ATS join only if referral volume justifies ₱108,000. Assume it does not until it does.'],
  ['Re-run the benefit side once real data exists','Every benefit figure here is a planning assumption. The pilot replaces them within two quarters; the holdout replaces the causal claim within three.'],
]
asks.forEach((a,i) => {
  const y = 1.94 + i*0.94
  s.addShape(pres.ShapeType.ellipse, { x:M, y:y+0.06, w:0.46, h:0.46, fill:{color:RED}, line:{color:RED} })
  s.addText(String(i+1), { x:M, y:y+0.06, w:0.46, h:0.46, fontFace:HEAD, fontSize:15, bold:true, color:WHITE, align:'center', valign:'middle', margin:0 })
  s.addText(a[0], { x:M+0.68, y:y, w:4.0, h:0.34, fontFace:HEAD, fontSize:16, bold:true, color:WHITE, margin:0 })
  s.addText(a[1], { x:M+4.8, y:y-0.02, w:7.7, h:0.66, fontFace:BODY, fontSize:12.5, color:ICE, lineSpacing:17, margin:0 })
})
s.addText('Full analysis: docs/V2_CBA.md  ·  cost model: docs/v2-cba-model.py  ·  working prototype on branch claude/talent-marketplace-v2-explore-kps8k8',
  { x:M, y:6.82, w:CW, h:0.32, fontFace:BODY, fontSize:10.5, color:MUTE, margin:0 })
notes(s,'Close on item two. The source field is free, it is the highest-leverage thing in the programme, and it should be agreed before a single peso is spent on the build.')
}

pres.writeFile({ fileName: 'Growth-v2-Business-Case.pptx' }).then(f => console.log('wrote', f))
