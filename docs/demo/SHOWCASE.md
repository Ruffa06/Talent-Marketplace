# Growth — 2:08.1 showcase

**Narration script and shot list.** 344 words · 128.13 seconds · 18 beats.
Voice: ElevenLabs "Laura", over a synthesised instrumental bed.

The longer cut, for an audience meeting Growth for the first time. Where the
panel walkthrough assumes you know the problem, this one opens on it, then
walks the whole journey once in order and ends on what a manager and admin
each see out the other end. Shot live against the real prototype: the gig
typed in beat 4 is the gig applied for in beat 12, and nothing is staged
between takes.

The film is cut **to** the narration. Beat lengths are the spoken lengths of
each line, measured off the delivered audio, so a screen never changes
mid-sentence. All eighteen boundaries land within 0.08s of their line.

## Files
| File | Use |
|---|---|
| `growth-showcase.mp4` | The film, with narration and bed. |
| `growth-showcase-silent.mp4` | Same cut, captions only. |
| `record-showcase.js` | Reshoots it against the current prototype. |
| `showcase-lines.txt` | The script, for regenerating the voice. |
| `fit.py` | Measures a delivered read into beat lengths. |
| `music.py` | Writes the instrumental bed. |
| `cut.py` | Retimes the capture and mixes the audio. |
| `film.js` | The shared rig — cursor, clicks, captions, beats. |

## The cut
| # | In | Length | On screen | Narration |
|---|----|--------|-----------|-----------|
| 1 | 0:00.00 | 7.77s | Home hero — the problem | Home Credit fills more than eight in ten roles from outside. The talent was already inside. It just had no way to be found. |
| 2 | 0:07.77 | 8.09s | The four shelves — gig, immersion, service offer, permanent vacancy | Growth changes that. Four ways to move: a short gig, a developmental immersion, a service you offer yourself, and a permanent vacancy. |
| 3 | 0:15.86 | 8.01s | How Growth works — the six-step flow | One path runs through all of them. Profile, match, apply, your manager signs off, do the work, and it goes on your record. |
| 4 | 0:23.87 | 7.48s | A manager fills the Post Opportunity form | It starts with someone posting. A title, the work, and the skills it needs. Ten minutes, no requisition. |
| 5 | 0:31.34 | 5.87s | HR approves it out of the queue — it goes live | Nothing goes live until HR approves it. Every post is reviewed before anyone sees it. |
| 6 | 0:37.21 | 5.67s | The employee profile, already populated | And nobody starts with an empty profile. HR has already loaded what the company knows. |
| 7 | 0:42.88 | 10.36s | Provenance chips, and skills to develop | Every skill shows where it came from. Verified by a manager, uploaded by HR from MyDevelopment, or added by you. You correct it. You don't begin from scratch. |
| 8 | 0:53.24 | 7.64s | My Top Matches, the score explaining itself | Every opportunity is then scored against that profile, and it shows its reasoning. Why you matched, and what you are missing. |
| 9 | 1:00.88 | 5.83s | Notifications — the weekly digest surface | And you don't have to come looking. Like LinkedIn, your top matches arrive in your email every week. |
| 10 | 1:06.71 | 4.97s | All Opportunities — nothing filtered out | The score never blocks you. A stretch is a choice, not a permission. |
| 11 | 1:11.68 | 10.72s | The nominate dialog, then My Nominations and its quarterly ranking | And it is not only about you. Anyone can nominate anyone. Spot a colleague who fits, put them forward in one click, and the top referrer each quarter wins a prize. |
| 12 | 1:22.40 | 7.68s | Applying, with the manager release checkbox | Applying takes one click, and your manager releases the time before anything starts. Nobody disappears from their day job. |
| 13 | 1:30.08 | 7.67s | My Applications — in review, scheduled, accepted, declined with reasons | You always know where you stand. In review, conversation scheduled, accepted. And a no comes with reasons. |
| 14 | 1:37.75 | 7.05s | My Openings — the host opens the applicant's evidence | The host sees what each applicant has actually finished, and who vouched for it. Evidence, not familiarity. |
| 15 | 1:44.81 | 5.11s | Close-out — the host rates the work five stars | When the work ends, the host rates it, and that rating verifies the skill on your record. |
| 16 | 1:49.92 | 4.85s | My Team Activity — the manager's view | Managers see their whole team's growth in one place, and who needs a nudge. |
| 17 | 1:54.77 | 8.21s | HR dashboard — impact row and vacancy contribution | Admin sees in real time how many transactions are made, how many careers are impacted, and how much savings this means for Home Credit. |
| 18 | 2:02.98 | 5.15s | Home again — the hero | This is Growth. Where talent meets opportunity, intelligently. |

## Reshooting
    node docs/demo/record-showcase.js /tmp/shot
    python3 docs/demo/music.py 128.13 /tmp/bed.wav
    python3 docs/demo/cut.py --music /tmp/bed.wav \
        /tmp/shot/*.webm narration.mp3 docs/demo \
        docs/demo/record-showcase.js

Pass `-` instead of an mp3 to cut the silent captioned film on its own.

## Replacing the voice
Generate `showcase-lines.txt` as one continuous read, then

    python3 docs/demo/fit.py narration.mp3 docs/demo/showcase-lines.txt \
        --patch docs/demo/record-showcase.js

and reshoot. `fit.py` finds the line breaks among the pauses — not by taking
the longest ones, which is wrong often enough to ruin a cut, but by matching
each line's phrase count against the runs of speech between pauses. Read its
table: when the fit is right almost every line's run count equals its phrase
count. Laura's read came back at cost 0.339 with 17 of 18 matching exactly.

Playwright's capture is not a wall clock — it emits frames when the page
paints, so a beat that typed into a form comes back longer than the pause
that produced it. `cut.py` finds each caption swap in the pixels and
stretches every beat back onto its spoken line.

## The bed
`music.py` synthesises it rather than licensing it, so the repository carries
no music rights: I-vi-IV-V in A major at 112 BPM — plucked bass, staccato
keys on the offbeats, a marimba hook, kick on one and three, clap on two and
four, shaker on every eighth.

**Every sound in it is struck.** The first attempt was built the obvious way,
on a held low pad under a low-pass filter, and held low chords with no
attacks do not read as music — they read as wind. What makes a bed audible
under speech without competing with it is a clear pulse and defined
transients, not texture, and keeping its energy out of the sub: measured in
a gap between lines, the bed now peaks in the 250-800 Hz marimba band with
everything below 80 Hz some 30 dB down.

`cut.py` high-passes it at 80 Hz, lifts 2.5 dB above 4.5 kHz, sets it 13 dB
down and ducks it a further 7-8 dB off the narration itself, so it sits about
15 dB under her between lines and over 20 dB under inside them. The mix lands
at -16.0 LUFS, true peak -3.1 dBFS.

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
