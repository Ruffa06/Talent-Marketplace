#!/usr/bin/env python3
"""Write the showcase's instrumental bed.

Synthesised here rather than licensed, so the repository carries no music
rights and the bed can be regenerated at any length. It is deliberately
plain: a four-chord loop under a soft arpeggio, a warm pad, and a light
pulse on the beat. Nothing lands on a strong transient, nothing modulates,
and the melody never resolves anywhere interesting — a bed that attracts
attention is a bed that has failed.

The film's own mix drops it ~20 dB under the voice and ducks it further
while anyone is speaking, so what reaches the viewer is mostly the pad.

    python3 docs/demo/music.py <seconds> <out.wav>
"""
import math
import struct
import sys
import wave

import numpy as np

SR = 44100
BPM = 96.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT

# I - V/vii - vi - IV in A major, two bars each: warm, unresolved, unhurried.
CHORDS = [
    (57, [0, 4, 7, 11]),    # Amaj7
    (52, [0, 4, 7, 10]),    # E7     (as V, with the 7th to keep it soft)
    (54, [0, 3, 7, 10]),    # F#m7
    (50, [0, 4, 7, 11]),    # Dmaj7
]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12.0)


def env(n, attack, decay, sustain=0.0, release=None):
    """A plain ADSR over n samples, as a float32 curve."""
    release = release if release is not None else n / SR - attack - decay
    a, d = int(attack * SR), int(decay * SR)
    r = max(0, n - a - d)
    out = np.concatenate([
        np.linspace(0, 1, a, endpoint=False, dtype=np.float32),
        np.linspace(1, sustain, d, endpoint=False, dtype=np.float32),
        np.full(r, sustain, dtype=np.float32),
    ])[:n]
    if out.size < n:
        out = np.pad(out, (0, n - out.size))
    return out


def tone(freq, dur, harmonics, attack, decay, sustain=0.0, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    sig = np.zeros(n, dtype=np.float32)
    for k, amp in enumerate(harmonics, start=1):
        f = freq * k * (1 + detune * (k - 1))
        sig += amp * np.sin(2 * math.pi * f * t).astype(np.float32)
    return sig * env(n, attack, decay, sustain)


def add(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[:j - i]


def build(seconds):
    n = int(seconds * SR)
    pad = np.zeros(n, dtype=np.float32)
    arp = np.zeros(n, dtype=np.float32)
    pulse = np.zeros(n, dtype=np.float32)

    bar = 0
    while bar * BAR < seconds:
        root, voicing = CHORDS[(bar // 2) % len(CHORDS)]
        t0 = bar * BAR

        # pad — the chord, held, barely moving
        for step in voicing:
            add(pad, tone(hz(root + step - 12), BAR * 1.08,
                          [0.5, 0.22, 0.10, 0.05], 0.55, 0.9, 0.42), t0)

        # arpeggio — eighth notes up and back down the voicing
        order = voicing + voicing[-2:0:-1]
        for i in range(8):
            step = order[i % len(order)]
            oct_up = 12 if i >= 4 else 0
            add(arp, tone(hz(root + step + 12 + oct_up), BEAT * 0.9,
                          [0.5, 0.18, 0.06], 0.012, 0.42, 0.0, 0.0008),
                t0 + i * BEAT / 2)

        # pulse — a soft low thump on 1 and 3, nothing on the backbeat
        for i in (0, 2):
            d = 0.16
            m = int(d * SR)
            tt = np.arange(m, dtype=np.float32) / SR
            f = 120 * np.exp(-tt * 26)
            add(pulse, (np.sin(2 * math.pi * np.cumsum(f) / SR)
                        * np.exp(-tt * 15)).astype(np.float32), t0 + i * BEAT)
        bar += 1

    mix = 0.52 * pad + 0.30 * arp + 0.26 * pulse

    # one-pole low-pass: take the edge off the arpeggio so it sits behind speech
    a = math.exp(-2 * math.pi * 2600 / SR)
    lp = np.empty_like(mix)
    acc = 0.0
    for i, v in enumerate(mix):
        acc = (1 - a) * v + a * acc
        lp[i] = acc
    mix = lp

    fade = int(2.5 * SR)
    mix[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
    out = int(3.5 * SR)
    mix[-out:] *= np.linspace(1, 0, out, dtype=np.float32)

    peak = float(np.max(np.abs(mix))) or 1.0
    return mix / peak * 0.72


def main():
    seconds, path = float(sys.argv[1]), sys.argv[2]
    mono = build(seconds)
    # a touch of width: the right channel a few ms late
    delay = int(0.011 * SR)
    right = np.concatenate([np.zeros(delay, dtype=np.float32), mono])[:len(mono)]
    inter = np.empty(len(mono) * 2, dtype=np.float32)
    inter[0::2], inter[1::2] = mono, 0.92 * right
    pcm = np.clip(inter, -1, 1)
    frames = struct.pack('<%dh' % len(pcm), *(pcm * 32767).astype(np.int16))
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames)
    print('%s · %.1fs' % (path, seconds))


if __name__ == '__main__':
    main()
