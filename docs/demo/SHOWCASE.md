# Growth — 2:02.9 showcase

**Narration script and shot list.** 344 words · 122.86 seconds · 18 beats.
Voice: not yet recorded — timings below are estimates at 168 wpm.

The longer cut, for an audience meeting Growth for the first time. Where the
panel walkthrough assumes you know the problem, this one opens on it, then
walks the whole journey once in order and ends on what a manager and HR each
see out the other end. Shot live against the real prototype: the gig typed in
beat 4 is the gig applied for in beat 12, and nothing is staged between takes.

The film is cut **to** the narration. Beat lengths are the spoken lengths of
each line, measured off the delivered audio, so a screen never changes
mid-sentence.

## Files
| File | Use |
|---|---|
| `growth-showcase.mp4` | The film, with narration. |
| `growth-showcase-silent.mp4` | Same cut, captions only. |
| `record-showcase.js` | Reshoots it against the current prototype. |
| `showcase-lines.txt` | The script, for regenerating the voice. |
| `film.js` | The shared rig — cursor, clicks, captions, beats. |

## The cut
| # | In | Length | On screen | Narration |
|---|----|--------|-----------|-----------|
| 1 | 0:00.00 | 8.57s | Home hero — the problem | Home Credit fills more than eight in ten roles from outside. The talent was already inside. It just had no way to be found. |
| 2 | 0:08.57 | 7.86s | The four shelves — gig, immersion, service offer, permanent vacancy | Growth changes that. Four ways to move: a short gig, a developmental immersion, a service you offer yourself, and a permanent vacancy. |
| 3 | 0:16.43 | 8.21s | How Growth works — the six-step flow | One path runs through all of them. Profile, match, apply, your manager signs off, do the work, and it goes on your record. |
| 4 | 0:24.64 | 6.43s | A manager fills the Post Opportunity form | It starts with someone posting. A title, the work, and the skills it needs. Ten minutes, no requisition. |
| 5 | 0:31.07 | 5.36s | HR approves it out of the queue — it goes live | Nothing goes live until HR approves it. Every post is reviewed before anyone sees it. |
| 6 | 0:36.43 | 5.36s | The employee profile, already populated | And nobody starts with an empty profile. HR has already loaded what the company knows. |
| 7 | 0:41.78 | 10.00s | Provenance chips, and skills to develop | Every skill shows where it came from. Verified by a manager, uploaded by HR from MyDevelopment, or added by you. You correct it. You don't begin from scratch. |
| 8 | 0:51.78 | 7.50s | My Top Matches, the score explaining itself | Every opportunity is then scored against that profile, and it shows its reasoning. Why you matched, and what you are missing. |
| 9 | 0:59.28 | 6.43s | Notifications — the weekly digest surface | And you don't have to come looking. Like LinkedIn, your top matches arrive in your email every week. |
| 10 | 1:05.71 | 4.64s | All Opportunities — nothing filtered out | The score never blocks you. A stretch is a choice, not a permission. |
| 11 | 1:10.36 | 11.07s | The nominate dialog, then My Nominations and its quarterly ranking | And it is not only about you. Anyone can nominate anyone. Spot a colleague who fits, put them forward in one click, and the top referrer each quarter wins a prize. |
| 12 | 1:21.43 | 6.79s | Applying, with the manager release checkbox | Applying takes one click, and your manager releases the time before anything starts. Nobody disappears from their day job. |
| 13 | 1:28.21 | 6.07s | My Applications — in review, scheduled, accepted, declined with reasons | You always know where you stand. In review, conversation scheduled, accepted. And a no comes with reasons. |
| 14 | 1:34.28 | 6.07s | My Openings — the host opens the applicant's evidence | The host sees what each applicant has actually finished, and who vouched for it. Evidence, not familiarity. |
| 15 | 1:40.36 | 6.07s | Close-out — the host rates the work five stars | When the work ends, the host rates it, and that rating verifies the skill on your record. |
| 16 | 1:46.43 | 5.00s | My Team Activity — the manager's view | Managers see their whole team's growth in one place, and who needs a nudge. |
| 17 | 1:51.43 | 8.57s | HR dashboard — impact row and vacancy contribution | Admin sees in real time how many transactions are made, how many careers are impacted, and how much savings this means for Home Credit. |
| 18 | 1:60.00 | 2.86s | Home again — the hero | This is Growth. Where talent meets opportunity, intelligently. |

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

## Two claims to keep honest
**Beat 9 — the weekly email.** The digest is designed, and `Digest email` is
already one of the referral sources the attribution model counts, but no mail
service sits behind the prototype, so the film shows the Notifications page
standing in for the inbox. Say "will arrive" rather than "arrive" if the room
is likely to ask.

**Beat 11 — the prize.** The Nomination Dashboard ranks nominators by
*selected* nominations with a three-nomination floor, and the reward itself is
a programme decision that has not been made. The film shows the ranking, not a
prize anyone has been given.
