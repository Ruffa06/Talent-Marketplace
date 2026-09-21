# Growth — 89-second walkthrough
**Narration script and shot list.** 191 words · 89.34 seconds · 13 beats.
Voice: ElevenLabs "Bill".

One continuous journey, shot live against the real prototype: a manager posts
a gig, HR approves it, an employee finds it, applies, their manager releases
the time, the host picks them, the work is rated, and the dashboard counts it.
The gig typed in beat 3 is the same gig applied for in beat 9 — nothing is
staged between takes.

The film is cut **to** the narration. Beat lengths are the spoken lengths of
each line, measured off the delivered audio, so a screen never changes
mid-sentence.

## Files
| File | Use |
|---|---|
| `growth-walkthrough.mp4` | The film, with narration. |
| `growth-walkthrough-silent.mp4` | Same cut, captions only. |
| `record.js` | Reshoots the film against the current prototype. |
| `cut.py` | Cuts the capture to the narration and muxes the voice. |
| `narration-lines.txt` | The script, one line per beat, for regenerating the voice. |

## The cut
| # | In | Length | On screen | Narration |
|---|----|--------|-----------|-----------|
| 1 | 0:00.00 | 7.13s | Home hero | Home Credit fills seventeen per cent of its roles from the inside. Growth is how that changes. |
| 2 | 0:07.13 | 11.27s | The four shelves — gig, immersion, service offer, permanent vacancy | Four ways to grow. A gig. An immersion. A service offer you publish yourself. And a permanent vacancy, applied for in HC Connect. |
| 3 | 0:18.40 | 6.18s | A manager fills the Post Opportunity form | It starts with someone posting. A title, the work, and the skills it needs. |
| 4 | 0:24.58 | 3.42s | HR approves it out of the queue — it goes live | Nothing goes live until HR approves it. |
| 5 | 0:27.99 | 6.17s | The employee profile, already populated | Nobody begins with an empty profile. HR has already loaded what the company knows. |
| 6 | 0:34.16 | 3.13s | Provenance chips on the skills | You correct it. You don't begin from scratch. |
| 7 | 0:37.29 | 5.34s | My Top Matches, the score explaining itself | Every opportunity is scored against that profile, and shows its reasoning. |
| 8 | 0:42.63 | 6.18s | All Opportunities — nothing filtered out | The score never blocks you. A stretch is a choice, not a permission. |
| 9 | 0:48.81 | 6.04s | Applying, with the manager release checkbox | You apply in one click, and your manager releases the time before anything starts. |
| 10 | 0:54.86 | 4.95s | The host opens the applicant's evidence | The host sees what each applicant has finished, and who vouched for it. |
| 11 | 0:59.80 | 6.84s | Close-out — the host rates the work five stars | At the end, the host rates the work. Four stars verifies the skills it used. |
| 12 | 1:06.65 | 12.76s | HR dashboard — impact row, then vacancy contribution | The admin dashboard gives a snapshot of the platform’s progress. Sixteen internal hires. Five point six million pesos we did not spend on recruitment. |
| 13 | 1:19.40 | 9.94s | Home again — the hero, the four shelves, the hero | Opportunities people can see. Skills we can prove. This is Growth — where talent meets opportunities intelligently. |

## Reshooting
    node docs/demo/record.js /tmp/shot
    python3 docs/demo/cut.py /tmp/shot/*.webm narration.mp3 docs/demo

Playwright's capture is not a wall clock — it emits frames when the page
paints, so a beat that typed into a form comes back 10–15% longer than the
pause that produced it. `cut.py` finds each caption swap in the pixels and
stretches every beat back onto its spoken line, which is why the boundaries
hold to a frame or two instead of drifting four seconds by the close.

## Replacing the voice again
Generate the lines in `narration-lines.txt` as one continuous read, send the
file, and the beats are re-measured off it and the film re-cut. Nothing needs
to match the timings above — they are an output, not a constraint.
