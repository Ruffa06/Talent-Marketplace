# Growth — 95-second walkthrough
**Narration script and shot list.** 172 words · 95 seconds · 13 beats.

One continuous journey, shot live against the real prototype: a manager posts
a gig, HR approves it, an employee finds it, applies, their manager releases
the time, the host picks them, the work is rated, and the dashboard counts it.
The gig posted in beat 3 is the same gig applied for in beat 9 — nothing is
staged between takes.

## Files
| File | Use |
|---|---|
| `growth-walkthrough.mp4` | The film with narration. |
| `growth-walkthrough-silent.mp4` | Same cut, captions only — for narrating live. |
| `narration-guide.wav` | The narration track on its own. |
| `record.js` | Reshoots the film against the current prototype. |

## Delivery direction
Unhurried and warm. Documentary, not advertisement: the pace of someone
describing something they find genuinely interesting, with a beat of silence
after each full stop. Drop pitch slightly on the last three words of each
section. Never sell — the numbers do that.

Three lines carry the argument and are given extra air in the cut:
*"You correct it. You don't begin from scratch."*, *"A stretch is a choice,
not a permission."* and the closing pair.

## The cut
| # | In | On screen | Narration |
|---|----|-----------|-----------|
| 1 | 0:00.00 | Home hero | Home Credit fills seventeen per cent of its roles from the inside. Growth is how that changes. |
| 2 | 0:07.80 | The four shelves — gig, immersion, service offer, permanent vacancy | Four ways to grow. A gig. An immersion. A service offer you publish yourself. And a permanent vacancy, applied for in HC Connect. |
| 3 | 0:19.43 | A manager fills the Post Opportunity form | It starts with someone posting. A title, the work, and the skills it needs. |
| 4 | 0:28.63 | HR approves it out of the queue — it goes live | Nothing goes live until HR approves it. |
| 5 | 0:34.63 | The employee profile, already populated | Nobody begins with an empty profile. HR has already loaded what the company knows. |
| 6 | 0:44.43 | Provenance chips on the skills | You correct it. You don't begin from scratch. |
| 7 | 0:49.07 | My Top Matches, the score explaining itself | Every opportunity is scored against that profile, and shows its reasoning. |
| 8 | 0:55.37 | All Opportunities — nothing filtered out | The score never blocks you. A stretch is a choice, not a permission. |
| 9 | 1:01.37 | Applying, with the manager release checkbox | You apply in one click, and your manager releases the time before anything starts. |
| 10 | 1:09.97 | The host opens the applicant's evidence | The host sees what each applicant has finished, and who vouched for it. |
| 11 | 1:15.97 | Close-out — the host rates the work five stars | At the end, the host rates the work. Four stars verifies the skills it used. |
| 12 | 1:22.97 | HR dashboard — ₱4.23M across twelve hires | Twelve internal hires. Four point two three million pesos we did not spend on recruitment. |
| 13 | 1:30.48 | Close on the hero | Work people can see. Skills we can prove. |

## Re-recording the voice
Beats are cut to the narration, so a replacement track must match the in-points
above. `node docs/demo/record.js <dir>` reads its beat lengths from the same
table and re-cuts to whatever you record. Record at 48 kHz in a soft room.

## A note on the narration shipped here
It is espeak-ng, a formant synthesiser — the only engine reachable from the
build environment. Accurate and correctly timed; it does not sound like a
person. Use the silent cut in front of a panel unless the voice is replaced.
