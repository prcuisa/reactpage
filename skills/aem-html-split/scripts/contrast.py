#!/usr/bin/env python3
"""Cek rasio kontras WCAG.
Pemakaian:
  python3 contrast.py FG BG                 -> rasio FG di atas BG
  python3 contrast.py FG BG --over BASE A   -> BG semi transparan (alpha A) di atas BASE
Contoh:
  python3 contrast.py '#1a1a1a' '#f3f1ec'
  python3 contrast.py '#f3f1ec' '#ffffff' --over '#0a0a0a' 0.05
"""
import sys

def hx(h):
    h = h.lstrip('#'); return [int(h[i:i+2], 16) for i in (0, 2, 4)]

def lum(rgb):
    c = [x / 255 for x in rgb]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)

if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 2:
        print(__doc__); sys.exit(1)
    fg, bg = hx(a[0]), hx(a[1])
    if '--over' in a:
        i = a.index('--over'); base = hx(a[i + 1]); al = float(a[i + 2])
        bg = [round(x * al + y * (1 - al)) for x, y in zip(bg, base)]
    r = ratio(fg, bg)
    verdict = 'AA teks normal' if r >= 4.5 else ('AA teks besar saja' if r >= 3 else 'GAGAL')
    print('%.2f:1  (%s)  bg efektif #%02x%02x%02x' % (r, verdict, *bg))
