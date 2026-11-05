# Growth — 2:01.1 showcase

**Narration script and shot list.** 339 words · 121.07 seconds · 17 beats.
Voice: not yet recorded — timings below are estimates at 168 wpm.

The longer cut, for an audience meeting Growth for the first time. Where the
panel walkthrough assumes you know the problem, this one opens on it, then
walks the whole journey once in order and ends on what a manager and HR each
see out the other end. Shot live against the real prototype: the gig typed in
beat 4 is the gig applied for in beat 11, and nothing is staged between takes.

The film is cut **to** the narration. Beat lengths are the spoken lengths of
each line, measured off the delivered audio, so a screen never changes
mid-sentence.

## Files
| File | Use |
|---|---:|
| `growth-showcase.mp4` | The film, with narration. |
| `growth-showcase-silent.mp4` | Same cut, captions only. |
| `record-showcase.js` | Reshoots it against the current prototype. |
| `showcase-lines.txt` | The script, for regenerating the voice. |
| `film.js` | The shared rig — cursor, clicks, captions, beats. |

## The cut
| # | In | Length | On screen | Narration |
|---|----|--------|-----------|-----------|
| 1 | 0:00.00 | 9.29s | Home hero — the problem | Every year, Home Credit fills more than eight in ten roles from outside. The talent was already inside. It just had no way to be found. |
| 2 | 0:09.29 | 8.57s | The four shelves — gig, immersion, service offer, permanent vacancy | Growth changes that. Four ways to move: a short gig, a developmental immersion, a service you offer the company yourself, and a permanent vacancy. |
| 3 | 0:17.86 | 9.29s | How Growth works — the six-step flow | One path runs through all of them. Build a profile, get matched, apply, your manager signs off, do the work, and it goes on your record. |
| 4 | 0:27.14 | 7.14s | A manager fills the Post Opportunity form | It starts with someone posting. A title, the work, and the skills it needs. Ten minutes, no requisition, no recruiter. |
| 5 | 0:34.29 | 5.36s | HR approves it out of the queue — it goes live | Nothing goes live until HR approves it. Every post is reviewed before anyone sees it. |
| 6 | 0:39.64 | 6.07s | The employee profile, already populated | And nobody starts with an empty profile. HR has already loaded what the company knows about you. |
| 7 | 0:45.71 | 9.29s | Provenance chips, and skills to develop | Every skill shows where it came from. Verified by a manager, uploaded by HR, or added by you. You correct it. You don't begin from scratch. |
| 8 | 0:55.00 | 8.21s | My Top Matches, the score explaining itself | Then every opportunity is scored against that profile, and it shows its reasoning. You see why you matched, and what you are missing. |
| 9 | 1:03.21 | 6.43s | Notifications — the weekly digest surface | And you don't have to come looking. Like LinkedIn, your top matches arrive in your inbox every week. |
| 10 | 1:09.64 | 4.64s | All Opportunities — nothing filtered out | The score never blocks you. A stretch is a choice, not a permission. |
| 11 | 1:14.29 | 6.79s | Applying, with the manager release checkbox | Applying takes one click, and your manager releases the time before anything starts. Nobody disappears from their day job. |
| 12 | 1:21.07 | 7.50s | My Applications — in review, scheduled, accepted, declined with reasons | You always know where you stand. In review, conversation scheduled, accepted. And if it is a no, you are told why. |
| 13 | 1:28.57 | 7.14s | My Openings — the host opens the applicant's evidence | The host sees what each applicant has actually finished, and who vouched for it. Evidence, not who they already know. |
| 14 | 1:35.72 | 7.14s | Close-out — the host rates the work five stars | When the work ends, the host rates it, and that rating verifies the skill on your record. The loop closes. |
| 15 | 1:42.86 | 5.00s | My Team Activity — the manager's view | Managers see their whole team's growth in one place, and who needs a nudge. |
| 16 | 1:47.86 | 5.36s | HR dashboard — impact row and vacancy contribution | HR sees the whole company. What is posted, who is moving, and what it saved. |
| 17 | 1:53.22 | 7.86s | Home again — the hero | Sixteen internal hires. Five point six million pesos we did not spend on recruitment. This is Growth. Where talent meets opportunity, intelligently. |

## Reshooting
    node docs/demo/record-showcase.js /tmp/shot
    python3 docs/demo/cut.py /tmp/shot/*.webm narration.mp3 docs/demo \
        docs/demo/record-showcase.js

Pass `-` instead of an mp3 to cut the silent captioned film on its own.

Playwright's capture is not a wall clock — it emits frames when the page
paints, so a beat that typed into a form comes back 10-15% longer than the
pause that produced it. `cut.py` finds each caption swap in the pixels and
stretches every beat back onto its spoken line, which is why the boundaries
hold to a frame or two instead of drifting.

## One claim to keep honest
Beat 9 says top matches arrive in your inbox every week. The digest is
designed — `Digest email` is already one of the referral sources the
attribution model counts — but no mail service is wired up behind the
prototype, so the film shows the Notifications page standing in for the
inbox. Say "will" rather than "does" if the room is likely to ask.
