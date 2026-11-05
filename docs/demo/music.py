#!/usr/bin/env python3
"""Write the showcase's instrumental bed.

Synthesised here rather than licensed, so the repository carries no music
rights and the bed can be regenerated at any length.

It is built out of short, struck sounds — plucked bass, marimba, a bell on
the downbeat, kick, clap, shaker — and no sustained pad at all. That is
deliberate: a first attempt leaned on held low chords, and held low chords
under a low-pass filter stop reading as music and start reading as wind. A
bed that has to compete with speech needs clear attacks and a steady pulse,
not texture.

I-vi-IV-V in A major at 112 BPM. Bright, obvious, and happy to be ignored.
The film's own mix drops it ~13 dB under the voice and ducks it further
while anyone is speaking.

    python3 docs/demo/music.py <seconds> <out.wav>
"""
import math
import struct
import sys
import wave

import numpy as np

SR = 44100
BPM = 112.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT

# I - vi - IV - V, one bar each.
CHORDS = [
    (57, [0, 4, 7, 11]),    # Amaj7
    (54, [0, 3, 7, 10]),    # F#m7
    (50, [0, 4, 7, 11]),    # Dmaj7
    (52, [0, 4, 7, 10]),    # E7
]
# A major pentatonic, so the hook never clashes with the chord under it.
HOOK = [76, 78, 81, 78, 73, 76, 78, 76]     # E5 F#5 A5 F#5 | C#5 E5 F#5 E5


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12.0)


def struck(freq, dur, partials, decay, click=0.0):
    """A struck tone: instant attack, exponential decay, fixed partials."""
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    sig = np.zeros(n, dtype=np.float32)
    for mult, amp, d in partials:
        sig += amp * np.sin(2 * math.pi * freq * mult * t) * np.exp(-t * d * decay)
    if click:
        sig[:60] += click * np.linspace(1, 0, 60, dtype=np.float32)
    # 4 ms attack ramp, so nothing clicks where it should not
    a = int(0.004 * SR)
    sig[:a] *= np.linspace(0, 1, a, dtype=np.float32)
    return sig.astype(np.float32)


def noise_hit(dur, decay, bright=2):
    """Filtered noise for shaker and clap — differenced to brighten it."""
    n = int(dur * SR)
    x = np.random.default_rng(0xC0FFEE + n).standard_normal(n).astype(np.float32)
    for _ in range(bright):
        x = np.diff(x, prepend=x[:1])
    t = np.arange(n, dtype=np.float32) / SR
    return (x / (np.max(np.abs(x)) or 1) * np.exp(-t * decay)).astype(np.float32)


def kick(dur=0.19):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f = 170 * np.exp(-t * 30) + 72
    return (np.sin(2 * math.pi * np.cumsum(f) / SR)
            * np.exp(-t * 19)).astype(np.float32)


def clap():
    base = noise_hit(0.17, 26, bright=1)
    out = np.zeros(len(base) + int(0.022 * SR), dtype=np.float32)
    for i, g in enumerate((0.55, 0.85, 1.0)):
        at = int(i * 0.009 * SR)
        out[at:at + len(base)] += g * base
    return out


def add(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[:j - i]


def build(seconds):
    n = int(seconds * SR)
    bass = np.zeros(n, dtype=np.float32)
    keys = np.zeros(n, dtype=np.float32)
    lead = np.zeros(n, dtype=np.float32)
    drums = np.zeros(n, dtype=np.float32)

    PLUCK = [(1, 0.6, 1.0), (2, 0.22, 1.7), (3, 0.09, 2.6), (4.2, 0.04, 3.4)]
    BASSP = [(1, 0.8, 1.0), (2, 0.18, 2.2), (3, 0.06, 3.0)]
    BELL = [(1, 0.5, 1.0), (2.76, 0.22, 1.4), (5.40, 0.08, 2.0)]

    clp, kck = clap(), kick()
    shk = noise_hit(0.06, 58, bright=1)
    shk_soft = 0.45 * shk

    bar = 0
    while bar * BAR < seconds:
        root, voicing = CHORDS[bar % len(CHORDS)]
        t0 = bar * BAR

        # bass — root on 1 and 3, fifth on the and-of-4, all short
        for beat, step in ((0, 0), (2, 0), (3.5, 7)):
            add(bass, struck(hz(root + step - 12), 0.5, BASSP, 7.0, 0.05),
                t0 + beat * BEAT)

        # keys — staccato stabs on the offbeats, never held
        for beat in (0.5, 1.5, 2.5, 3.0):
            for step in voicing[1:]:
                add(keys, struck(hz(root + step), 0.34, PLUCK, 11.0),
                    t0 + beat * BEAT)

        # marimba hook — eighth notes, two bars long, so it turns over
        phrase = HOOK if bar % 2 == 0 else HOOK[4:] + HOOK[:4]
        for i, note in enumerate(phrase):
            add(lead, 0.55 * struck(hz(note), 0.42, PLUCK, 9.0),
                t0 + i * BEAT / 2)

        # a bell to mark the top of each four-bar turnaround
        if bar % 4 == 0:
            add(lead, 0.30 * struck(hz(root + 12 + 4), 1.1, BELL, 3.2), t0)

        # drums — kick on 1 and 3, clap on 2 and 4, shaker on every eighth
        for beat in (0, 2):
            add(drums, 0.70 * kck, t0 + beat * BEAT)
        for beat in (1, 3):
            add(drums, 0.40 * clp, t0 + beat * BEAT)
        for i in range(8):
            add(drums, 1.3 * (shk if i % 2 == 0 else shk_soft), t0 + i * BEAT / 2)
        bar += 1

    mix = 0.38 * bass + 0.60 * keys + 0.95 * lead + 0.50 * drums

    fade = int(1.2 * SR)
    mix[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
    out = int(3.0 * SR)
    mix[-out:] *= np.linspace(1, 0, out, dtype=np.float32)

    peak = float(np.max(np.abs(mix))) or 1.0
    return mix / peak * 0.80


def main():
    seconds, path = float(sys.argv[1]), sys.argv[2]
    mono = build(seconds)
    delay = int(0.009 * SR)                    # a touch of width
    right = np.concatenate([np.zeros(delay, dtype=np.float32), mono])[:len(mono)]
    inter = np.empty(len(mono) * 2, dtype=np.float32)
    inter[0::2], inter[1::2] = mono, 0.94 * right
    pcm = np.clip(inter, -1, 1)
    frames = struct.pack('<%dh' % len(pcm), *(pcm * 32767).astype(np.int16))
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames)
    print('%s · %.1fs · %.0f BPM' % (path, seconds, BPM))


if __name__ == '__main__':
    main()
