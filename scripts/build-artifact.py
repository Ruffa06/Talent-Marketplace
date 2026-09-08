# -*- coding: utf-8 -*-
"""Build the publishable artifact from the repository prototype.

    python3 scripts/build-artifact.py [output.html]


The artifact runs in a sandboxed frame with no shared database reachable, so
four things differ from the file in the repo — and they are carried across on
every republish rather than re-derived by hand."""
import base64, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'prototype', 'talent-marketplace-v2.html')
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
# --no-private builds for an audience that should not receive the Internal
# DJI documents: the download buttons ship, with nothing behind them.
NO_PRIVATE = '--no-private' in sys.argv[1:]
OUT = ARGS[0] if ARGS else os.path.join(ROOT, 'build', 'growth-home-credit-ph.html')
PRIVATE = os.path.join(ROOT, 'assets', 'private')

src = io.open(SRC, encoding='utf-8').read()
head = src.split('<head>', 1)[1].split('</head>', 1)[0]
body = src.split('<body>', 1)[1].rsplit('</body>', 1)[0]
keep = '\n'.join(l for l in head.strip().split('\n') if not l.strip().startswith('<meta '))
s = keep.strip() + '\n' + body

def rep(old, new, n=1):
    global s
    c = s.count(old)
    assert c == n, ('count', c, old[:70])
    s = s.replace(old, new)

# 1 ── prompt() and localStorage can be unavailable in a sandboxed frame
rep("""function liveName() {
  if (!LIVE.name) LIVE.name = localStorage.getItem('tm_live_name') || null
  return LIVE.name
}""",
"""function liveName() {
  // PREVIEW BUILD: window.prompt and localStorage may be unavailable in a
  // sandboxed frame, so this falls back to the persona in the role picker —
  // which is also what makes switching persona switch who you are acting as.
  if (!LIVE.name) { try { LIVE.name = localStorage.getItem('tm_live_name') || null } catch (e) { LIVE.name = null } }
  return LIVE.name || (ROLES[currentRole] && ROLES[currentRole].name) || 'Guest'
}""")
rep("""function promptLiveName() {
  const n = prompt('Your name (so your actions are attributed in the pilot):', liveName() || '')
  if (n && n.trim()) {
    LIVE.name = n.trim()
    localStorage.setItem('tm_live_name', LIVE.name)""",
"""function promptLiveName() {
  let n = null
  try { n = prompt('Your name (so your actions are attributed in the pilot):', liveName() || '') } catch (e) { n = null }
  if (n && n.trim()) {
    LIVE.name = n.trim()
    try { localStorage.setItem('tm_live_name', LIVE.name) } catch (e) { /* sandboxed preview */ }""")

# 2 ── impression throttling is best-effort when storage throws
rep("""    const k = 'tm2_view_' + me + '_' + r + '_' + day
    if (localStorage.getItem(k)) return false
    localStorage.setItem(k, '1')
    return true""",
"""    const k = 'tm2_view_' + me + '_' + r + '_' + day
    try {
      if (localStorage.getItem(k)) return false
      localStorage.setItem(k, '1')
    } catch (e) { /* sandboxed preview — reach data is best-effort */ }
    return true""")

# 3 ── a hosted page cannot start its own download; hand the file over instead
rep("""  const blob = new Blob(['﻿' + lines.join('\\r\\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'growth-referrals-' + new Date().toISOString().slice(0, 10) + '.csv'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  toast('✓ ' + refs.length + ' referrals exported. Join it against the ' + ATS_SHORT + ' export on referral_code.')
}""",
"""  const csv = '﻿' + lines.join('\\r\\n')
  const name = 'growth-referrals-' + new Date().toISOString().slice(0, 10)
  saveExport(name, csv, refs.length)
}

/* PREVIEW BUILD: a hosted page cannot start its own download, so the file is
   handed over through the viewer's save prompt. The repository file uses a
   plain blob link, which is what works when the HTML is opened directly. */
async function saveExport(name, csv, n) {
  const dl = (typeof claude !== 'undefined' && claude.use) ? await claude.use('downloads').catch(() => null) : null
  if (!dl) { showExportFallback(name, csv); return }
  const ok = () => toast('✓ ' + n + ' referrals exported. Join it against the ' + ATS_SHORT + ' export on referral_code.')
  try { await dl.save({ filename: name + '.csv', data: csv }); ok() }
  catch (e) {
    if (e && e.code === 'extension_not_enabled') {
      try { await dl.save({ filename: name + '.csv.txt', data: csv }); ok(); return }
      catch (e2) { if (e2 && e2.code === 'declined') return; showExportFallback(name, csv); return }
    }
    if (e && e.code === 'declined') return
    showExportFallback(name, csv)
  }
}

function showExportFallback(name, csv) {
  const overlay = document.createElement('div')
  overlay.setAttribute('data-overlay', '1')
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;'
  overlay.innerHTML = '<div style="background:#fff;border-radius:14px;padding:26px;width:720px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,0.14);">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9CA3AF;margin-bottom:6px;">Referral export</div>' +
    '<div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px;">' + esc(name) + '.csv</div>' +
    '<div style="font-size:12px;color:#6B7280;line-height:1.6;margin-bottom:14px;">Saving a file is not available in this preview, so here is the export in full. Select it, copy it, and paste it into a spreadsheet \\u2014 it is the same content the real button writes.</div>' +
    '<textarea readonly style="width:100%;height:280px;padding:12px;border:1px solid #E5E7EB;border-radius:9px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.6;color:#374151;resize:vertical;white-space:pre;overflow:auto;"></textarea>' +
    '<div style="display:flex;gap:9px;justify-content:flex-end;margin-top:16px;">' +
    '<button class="btn btn-outline" onclick="this.closest(\\'[data-overlay]\\').remove()">Close</button>' +
    '<button class="btn btn-red" onclick="copyExport(this)">Copy all</button></div></div>'
  overlay.querySelector('textarea').value = csv
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove() })
  document.body.appendChild(overlay)
}

function copyExport(btn) {
  const ta = btn.closest('[data-overlay]').querySelector('textarea')
  ta.select()
  const done = () => { btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = 'Copy all' }, 1800) }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => toast('Select the text and copy it manually.', 'warning'))
  else { try { document.execCommand('copy'); done() } catch (e) { toast('Select the text and copy it manually.', 'warning') } }
}""")

# 4 ── say plainly what this build can and cannot do
rep("""</div><!-- /main -->
""",
"""</div><!-- /main -->

<div id="previewNote" style="position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;background:#0F172A;color:#E2E8F0;border:1px solid #334155;border-radius:9px;padding:9px 14px;font-family:Arial,system-ui,sans-serif;font-size:11.5px;line-height:1.5;max-width:min(620px,92vw);box-shadow:0 6px 24px rgba(0,0,0,0.25);">
  <strong style="color:#fff;">Preview build.</strong> The shared database is unreachable from here, so the badge reads
  <strong style="color:#fff;">Offline</strong> — but everything works: posting, approving, applying, deciding, editing
  your skills and closing out an engagement are all saved in this browser and survive a reload.
  <strong style="color:#fff;">↺ Reset demo</strong> in the top bar puts it back. Sign in with any credentials.
  <button onclick="document.getElementById('previewNote').remove()" style="margin-left:8px;background:transparent;border:1px solid #475569;color:#CBD5E1;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Dismiss</button>
</div>
""")

# 5 ── the two Internal DJI documents, inlined only for a build that is going
#      to an audience entitled to see them. They are not in the repository.
DOCS = [
    ('policy', '211_2021_P_Developmental_Job_Immersion_v1.0.pdf',
     'Policy 211_2021 — Developmental Job Immersion v1.0'),
    ('form', 'Annex_1_Developmental_Job_Immersion_Form.pdf',
     'Annex 1 — Developmental Job Immersion Form'),
]
for doc_id, fname, name in DOCS:
    path = os.path.join(PRIVATE, fname)
    anchor = "name: '%s', data: null }" % name
    assert s.count(anchor) == 1, ('no anchor for ' + doc_id)
    if NO_PRIVATE or not os.path.exists(path):
        print('  - %-6s left out%s' % (doc_id, ' (--no-private)' if NO_PRIVATE
              else ' — not in assets/private'))
        continue
    b64 = base64.b64encode(io.open(path, 'rb').read()).decode('ascii')
    s = s.replace(anchor, "name: '%s', data: '%s' }" % (name, b64))
    print('  + %-6s %s (%.0f KB inlined)' % (doc_id, fname, len(b64) / 1024))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, 'w', encoding='utf-8').write(s)
print('built', OUT, len(s), 'bytes')
