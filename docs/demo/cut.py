#!/usr/bin/env python3
"""Cut the recorded walkthrough to the narration.

Playwright's screencast is not a wall clock: frames are emitted when the page
paints, so a beat that typed into a form comes back 10-15% longer than the
waitForTimeout that produced it. Trimming a fixed head off the raw capture
therefore drifts several seconds by the end of the film — which is how the
captions came to run ahead of the voice.

So the cut is measured, not assumed. Each beat's caption swap is found in the
capture by differencing the caption strip frame to frame, and every beat is
then time-stretched to the length of its spoken line. Boundaries land within
a frame or two of the narration.

    python3 docs/demo/cut.py <raw.webm> <narration.mp3> <out-dir>
"""
import json, re, subprocess, sys, os
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
FADE = 0.15          # __cap holds the old text this long before swapping
STRIP = 'crop=1280:80:0:620'


def beats():
    src = open(os.path.join(HERE, 'record.js')).read()
    return [int(t) / 1000 for t in re.findall(r'\{ t: (\d+),', src)]


def run(*a):
    subprocess.run([FF, '-y', '-v', 'error', *a], check=True)


def duration(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: ([\d:.]+)', out).group(1).split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def transitions(path, n):
    """Times at which the caption changes, read off the pixels."""
    p = subprocess.run([FF, '-v', 'error', '-i', path, '-vf',
                        f'fps=10,{STRIP},scale=128:8,format=gray',
                        '-f', 'rawvideo', '-'], capture_output=True, check=True)
    size, data, prev, hits = 128 * 8, p.stdout, None, []
    for i in range(len(data) // size):
        f = data[i * size:(i + 1) * size]
        if prev is not None:
            d = sum(abs(a - b) for a, b in zip(f, prev)) / size
            if d > 20 and (not hits or i / 10 - hits[-1] > 0.6):
                hits.append(i / 10)
        prev = f
    if len(hits) == n + 1:            # the page's first paint, before beat 1
        hits = hits[1:]
    if len(hits) != n:
        sys.exit(f'found {len(hits)} caption changes, expected {n}: {hits}')
    return [max(0.0, t - FADE) for t in hits]


def main():
    raw, voice, out = sys.argv[1], sys.argv[2], sys.argv[3]
    B = beats()
    full = os.path.join(out, 'full.mp4')
    run('-i', raw, '-vf', 'fps=25', '-c:v', 'libx264', '-preset', 'veryfast',
        '-crf', '20', '-pix_fmt', 'yuv420p', full)

    marks = transitions(full, len(B)) + [duration(full)]
    parts, names = [], []
    for i, want in enumerate(B):
        a, b = marks[i], marks[i + 1]
        parts.append(f'[0:v]trim=start={a:.3f}:end={b:.3f},'
                     f'setpts={want / (b - a):.6f}*(PTS-STARTPTS)[v{i}]')
        names.append(f'[v{i}]')
        print(f'beat {i+1:2d}  shot {b-a:6.2f}s -> {want:6.2f}s  x{(b-a)/want:.3f}')
    script = os.path.join(out, 'concat.txt')
    open(script, 'w').write(';'.join(parts) + ';' + ''.join(names) +
                            f'concat=n={len(B)}:v=1:a=0[out]')

    silent = os.path.join(out, 'growth-walkthrough-silent.mp4')
    run('-i', full, '-filter_complex_script', script, '-map', '[out]',
        '-r', '25', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent)
    run('-i', silent, '-i', voice, '-af',
        'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000', '-ac', '2',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest',
        '-movflags', '+faststart', os.path.join(out, 'growth-walkthrough.mp4'))

    # the boundaries, re-read off the finished cut
    got = transitions(silent, len(B))
    at = 0.0
    for i, want in enumerate(B):
        print(f'beat {i+1:2d}  cut at {got[i]:6.2f}s  narration {at:6.2f}s  '
              f'{got[i]-at:+.2f}s')
        at += want


if __name__ == '__main__':
    main()
