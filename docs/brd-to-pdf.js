const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const SP = '/tmp'   // reads the HTML written by brd-to-pdf.py
const OUT = '/home/user/Talent-Marketplace/docs/BRD_V2.pdf'
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  await p.goto('file://' + SP + '/brd.html', { waitUntil: 'networkidle' })
  await p.emulateMedia({ media: 'print' })
  await p.pdf({
    path: OUT, format: 'A4', printBackground: true,
    margin: { top: '17mm', bottom: '16mm', left: '13mm', right: '13mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-family:Arial;font-size:7pt;color:#9CA3AF;
        padding:0 13mm;display:flex;justify-content:space-between;">
        <span>Growth v2 — Business Requirements Document · v2.0</span>
        <span>People &amp; Culture Department · Home Credit PH</span></div>`,
    footerTemplate: `<div style="width:100%;font-family:Arial;font-size:7pt;color:#9CA3AF;
        padding:0 13mm;display:flex;justify-content:space-between;">
        <span>For IT effort estimation · 31 August 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  })
  await b.close()
  console.log('pdf written', OUT)
})()
