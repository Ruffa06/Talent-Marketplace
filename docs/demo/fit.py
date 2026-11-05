#!/usr/bin/env python3
"""Measure a delivered narration and hand back the beat lengths.

The voice arrives as one continuous read, so the film's beats have to be
recovered from it. ffmpeg finds every pause; this picks which of those pauses
are the line breaks.

It is not the longest pauses — a narrator's breath between clauses is often
longer than the join between two short lines, and some readers barely pause
at a full stop at all. What does hold is structure: a line with four
comma-separated phrases tends to come back as four runs of speech. So the
search is over every way of dealing consecutive runs out to consecutive
lines, scored on how close each line's duration lands to its syllable count
and penalised for giving a line more or fewer runs than it has phrases.

Read the printed table before trusting the answer. When the fit is right
almost every line's run count equals its phrase count and the ratios sit
near 1.0; a line at 0.5 means a boundary is in the wrong place. If several
lines are out, the detector is probably missing short pauses — lower
--noise or --gap and run it again.

    python3 docs/demo/fit.py <narration.mp3> <lines.txt> [--patch recorder.js]
"""
import argparse
import re
import shutil
import subprocess
import sys


def ffmpeg():
    found = shutil.which('ffmpeg')
    if found:
        return found
    try:
        import imageio_ffmpeg
    except ImportError:
        sys.exit('no ffmpeg: install one, or pip install imageio-ffmpeg')
    return imageio_ffmpeg.get_ffmpeg_exe()


FF = ffmpeg()
VOWELS = re.compile(r'[aeiouy]+')
WORD = re.compile(r"[a-zA-Z']+")


def duration(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: ([\d:.]+)', out).group(1).split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def runs(path, total, noise, gap):
    """The stretches of speech, split at every detected pause."""
    out = subprocess.run(
        [FF, '-i', path, '-af', f'silencedetect=noise={noise}:d={gap}',
         '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([-\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([-\d.]+)', out)]
    pauses = sorted(zip(starts, ends))
    inner = [p for p in pauses if p[0] > 0.2 and p[1] < total - 0.2]
    trailing = [p for p in pauses if p[1] >= total - 0.2]
    stop = trailing[0][0] if trailing else total
    out_runs, at = [], 0.0
    for a, b in inner:
        out_runs.append((at, a))
        at = b
    out_runs.append((at, stop))
    return out_runs, inner


def syllables(line):
    n = 0
    for w in WORD.findall(line.lower()):
        v = len(VOWELS.findall(w))
        if w.endswith('e') and v > 1 and not w.endswith('le'):
            v -= 1
        n += max(1, v)
    return n


def phrases(line):
    return len([p for p in re.split(r'[.,;:]', line) if p.strip()])


def fit(dur, syl, ph):
    """Deal consecutive runs out to consecutive lines, cheapest total cost."""
    n, L = len(dur), len(syl)
    per = sum(dur) / sum(syl)
    cum = [0.0]
    for d in dur:
        cum.append(cum[-1] + d)
    INF = float('inf')
    best = [[INF] * (n + 1) for _ in range(L + 1)]
    back = [[None] * (n + 1) for _ in range(L + 1)]
    best[0][0] = 0.0
    for i in range(1, L + 1):
        want = per * syl[i - 1]
        for j in range(1, n + 1):
            for c in range(1, min(ph[i - 1] + 2, j) + 1):
                p = j - c
                if best[i - 1][p] == INF:
                    continue
                d = cum[j] - cum[p]
                cost = (((d - want) / want) ** 2
                        + 0.10 * max(0, c - ph[i - 1]) ** 2
                        + 0.05 * max(0, ph[i - 1] - c) ** 2)
                if best[i - 1][p] + cost < best[i][j]:
                    best[i][j] = best[i - 1][p] + cost
                    back[i][j] = p
    cuts, j = [], n
    for i in range(L, 0, -1):
        p = back[i][j]
        cuts.append((p, j))
        j = p
    return list(reversed(cuts)), cum, per, best[L][n]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('narration')
    ap.add_argument('lines')
    ap.add_argument('--patch', help='recorder.js to rewrite the beat lengths in')
    ap.add_argument('--noise', default='-32dB')
    ap.add_argument('--gap', default='0.15')
    a = ap.parse_args()

    text = [l.split('  ', 2)[-1].strip() if re.match(r'^\d\d  \[', l) else l.strip()
            for l in open(a.lines) if l.strip() and not l.startswith('#')]
    total = duration(a.narration)
    spans, pauses = runs(a.narration, total, a.noise, a.gap)
    dur = [b - x for x, b in spans]
    syl, ph = [syllables(t) for t in text], [phrases(t) for t in text]

    cuts, cum, per, cost = fit(dur, syl, ph)
    print('%s · %.2fs · %d runs of speech · %.0f syllables a minute'
          % (a.narration, total, len(dur), 60 / per))
    print('fit cost %.3f — under about 1.0 is a good fit\n' % cost)

    bounds, ms = [0.0], []
    for i, (p, j) in enumerate(cuts):
        d = cum[j] - cum[p]
        edge = total if j >= len(dur) else sum(pauses[j - 1]) / 2
        bounds.append(edge)
        ms.append(int(round((edge - bounds[-2]) * 1000)))
        flag = '' if 0.75 < d / (per * syl[i]) < 1.3 else '   <-- look at this'
        print('%2d  runs %d/%-2d  %5.2fs  ratio %.2f  ends %7.2f%s'
              % (i + 1, j - p, ph[i], d, d / (per * syl[i]), edge, flag))
    ms[-1] += int(round(total * 1000)) - sum(ms)
    print('\nms = %s   (%d total)' % (ms, sum(ms)))

    if a.patch:
        src = open(a.patch).read()
        if len(re.findall(r'\{ t: \d+,', src)) != len(ms):
            sys.exit('%s has a different number of beats than %s has lines'
                     % (a.patch, a.lines))
        seen = iter(ms)
        open(a.patch, 'w').write(
            re.sub(r'\{ t: \d+,', lambda _: '{ t: %d,' % next(seen), src))
        print('patched %s' % a.patch)


if __name__ == '__main__':
    main()
