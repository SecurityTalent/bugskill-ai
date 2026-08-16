#!/usr/bin/env python3
"""
fmt_bounds_audit.py - Audit C/C++ formatting code for stack buffer overflows
caused by incorrect bounds arithmetic.

Based on HackerOne #2551512 (Nintendo NEX, nn::nex::StationURL::Format,
CWE-121). The vulnerable pattern:

    wchar_t url[1024];
    unsigned offset = 0, written = 0;
    ...
    written = swprintf(url + offset, 1024, L"%ls=%ls", key, val);
    offset += written;

The size argument stays 1024 while the destination pointer advances, so
accumulated writes run past the fixed stack buffer. StationURLs are relayed
between clients via the server -> remote crash / potential RCE of peers.

Subcommands:
  scan     - regex-based static scan for dangerous format/copy calls
  harness  - generate (and optionally build/run) a C PoC of the bug pattern
  demo     - write the vulnerable StationURL::Format sample into cwd

This is a triage aid (regex heuristics), not a sound static analyzer.
Stdlib only. Python 3.8+.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import string
import subprocess
import sys
from typing import Optional

# ------------------------------------------------------------------ regexes

BOUNDED_RE = re.compile(
    r"(?P<func>snprintf|vsnprintf|swprintf|_snprintf|_snwprintf|_vsnprintf|"
    r"_vsnwprintf|strncpy|wcsncpy|strncat|wcsncat|memcpy|memmove|memccpy)\s*\("
    r"(?P<dst>[^,]{1,120}?),\s*(?P<size>[^,]{1,80}?)\s*,",
    re.I,
)
UNBOUNDED_RE = re.compile(
    r"\b(?P<func>sprintf|wsprintf|wsprintfA|wsprintfW|strcpy|wcscpy|strcat|"
    r"wcscat|gets)\s*\(",
    re.I,
)

SAMPLE = r"""// stationurl_sample.cpp - vulnerable code as reported (H1 #2551512)
#include <cstdio>
#include <map>
#include <string>

namespace nn { namespace nex {
using String = std::wstring;
class StationURL {
  std::map<String, String> normalParams;
  void SetURL(const wchar_t* u);
 public:
  void Format();
};
}}

// BUG: swprintf's size argument is always 1024 while the destination
// advances with 'offset' -> cumulative stack overflow (CWE-121).
void nn::nex::StationURL::Format() {
  wchar_t url[1024];
  unsigned offset = 0;
  unsigned written = 0;
  bool writeDelimiter = false;

  for (auto param = normalParams.begin(); param != normalParams.end(); param++) {
    if (writeDelimiter) {
      written = swprintf(url + offset, 1024, L";");
      offset += written;
    }
    written = swprintf(url + offset, 1024, L"%ls%ls%ls",
                       param->first.c_str(), L"=", param->second.c_str());
    offset += written;
    writeDelimiter = true;
  }
  SetURL(url);
}
"""


# ------------------------------------------------------------- scan helpers

def line_of(content: str, pos: int) -> int:
    return content.count("\n", 0, pos) + 1


def classify(dst: str, size: str) -> tuple[str, str]:
    """Heuristic severity for a bounded call."""
    dst = dst.strip()
    size = size.strip()
    size_n = re.sub(r"\s+", "", size)
    adv = "+" in dst
    buf_ids = set(re.findall(r"\b[a-zA-Z_]\w*", dst))

    if "-" in size_n:
        return "LOW", "size is decremented; verify operand (should be total - offset)"
    if adv:
        if re.fullmatch(r"sizeof\(\w+\)", size_n):
            return ("SUSPICIOUS",
                    "FULL-BUFFER size with ADVANCED destination: cumulative "
                    "overflow (H1 #2551512 pattern)")
        if re.fullmatch(r"\d+", size_n):
            return ("SUSPICIOUS",
                    "FIXED constant size with ADVANCED destination: cumulative overflow")
        if size_n in buf_ids:
            return ("SUSPICIOUS",
                    "buffer-sized argument with ADVANCED destination: cumulative overflow")
        return "LOW", "advanced destination; verify size argument"
    return "LOW", "non-advanced destination; check for loop accumulation / size correctness"


def iter_files(path: str, exts: set[str]):
    if os.path.isfile(path):
        yield path
        return
    for root, _, files in os.walk(path):
        for f in sorted(files):
            if f.rsplit(".", 1)[-1].lower() in exts:
                yield os.path.join(root, f)


def scan_one(path: str, context: int, only_suspicious: bool) -> list[dict]:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
    except OSError as e:
        return [{"file": path, "error": str(e)}]
    lines = content.splitlines()
    out: list[dict] = []

    def push(func: str, sev: str, reason: str, pos: int):
        if only_suspicious and sev not in ("SUSPICIOUS", "WARNING"):
            return
        ln = line_of(content, pos)
        lo = max(0, ln - 1 - context)
        hi = min(len(lines), ln + context)
        snippet = "\n".join(f"{i+1:>5} | {lines[i]}" for i in range(lo, hi))
        out.append({
            "file": path, "line": ln, "func": func, "severity": sev,
            "reason": reason, "snippet": snippet,
        })

    for m in UNBOUNDED_RE.finditer(content):
        push(m.group("func"), "WARNING", "unbounded function, no size limit", m.start())
    for m in BOUNDED_RE.finditer(content):
        sev, reason = classify(m.group("dst"), m.group("size"))
        push(m.group("func"), sev, reason, m.start())
    return out


def cmd_scan(args: argparse.Namespace) -> int:
    exts = {e.lstrip(".").lower() for e in args.ext.split(",") if e.strip()}
    results: list[dict] = []
    for path in iter_files(args.src, exts):
        results.extend(scan_one(path, args.context, args.only_suspicious))

    if args.json:
        print(json.dumps(results, indent=2))
        return 0

    sev_count = {"SUSPICIOUS": 0, "WARNING": 0, "LOW": 0}
    for r in results:
        if "severity" in r:
            sev_count[r["severity"]] += 1

    print(f"Scanned: {args.src}  ({len(results)} finding(s): "
          f"{sev_count['SUSPICIOUS']} suspicious, {sev_count['WARNING']} warning, "
          f"{sev_count['LOW']} low)")
    print("Note: regex heuristics - verify each hit in source.\n")
    for r in results:
        if "error" in r:
            print(f"[!] {r['file']}: {r['error']}")
            continue
        print(f"{r['severity']:<11} {r['file']}:{r['line']}  "
              f"{r['func']}()  -- {r['reason']}")
        print(r["snippet"])
        print()
    return 0


# --------------------------------------------------------------- harness PoC

HARNESS_TPL = string.Template(r"""/* poc_stationurl.c - generated by fmt_bounds_audit.py
 *
 * Reproduces the bounds bug in nn::nex::StationURL::Format
 * (HackerOne #2551512, Nintendo NEX clients, CWE-121):
 *
 *     wchar_t url[1024];
 *     ...
 *     written = swprintf(url + offset, 1024, L"%ls=%ls", key, val);
 *     offset += written;
 *
 * The size argument stays $BUFSIZE while 'url + offset' advances, so
 * accumulated writes run past the end of the fixed stack buffer.
 *
 * Build (vulnerable, stack protector -> deterministic canary abort):
 *   gcc -O0 -g -fstack-protector-all -fno-inline -o poc poc_stationurl.c
 * Run:  ./poc
 *
 * Build (fixed variant):
 *   gcc -O0 -g -fstack-protector-all -fno-inline -DSAFE -o poc_safe poc_stationurl.c
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>

#define BUFSIZE $BUFSIZE
#define NPARAMS $NPARAMS
#define VLEN    $VLEN

/* Mirrors the vulnerable loop from StationURL::Format(). */
static size_t simulate(void) {
    $TYPE url[BUFSIZE];
    unsigned offset = 0, written = 0;
    $TYPE key[VLEN], val[VLEN];
    int i;

    memset(key, 'K', sizeof(key) - sizeof($TYPE));
    key[VLEN - 1] = 0;
    memset(val, 'V', sizeof(val) - sizeof($TYPE));
    val[VLEN - 1] = 0;

    for (i = 0; i < NPARAMS; i++) {
        if (offset > 0) {
#ifdef SAFE
            written = (unsigned)$FUNC(url + offset, BUFSIZE - offset, $L";");
#else
            written = (unsigned)$FUNC(url + offset, BUFSIZE, $L";");
#endif
            offset += written;
        }
#ifdef SAFE
        /* FIX: subtract what was already written; stop on truncation. */
        {
            int n = $FUNC(url + offset, BUFSIZE - offset, $SPEC, key, val);
            if (n < 0) { written = 0; break; }
            written = (unsigned)n;
        }
#else
        /* BUG: size argument is always BUFSIZE (H1 #2551512). */
        written = (unsigned)$FUNC(url + offset, BUFSIZE, $SPEC, key, val);
#endif
        offset += written;
    }
    return offset;
}

int main(void) {
    size_t total = simulate();
    printf("total written      : %zu %s\n", total, "$UNIT");
    printf("stack buffer       : %d %s\n", BUFSIZE, "$UNIT");
#ifdef SAFE
    printf("SAFE variant       : fits within buffer (truncated at capacity)\n");
    return 0;
#else
    if (total > BUFSIZE) {
        printf("OUT-OF-BOUNDS WRITE: %zu %s past the end of 'url'\n",
               total - BUFSIZE, "$UNIT");
        printf("(with -fstack-protector-all: expect 'stack smashing detected')\n");
        printf("(without the protector      : adjacent stack state is corrupted\n");
        printf("                              -> crash, or RCE if bytes are controlled)\n");
        return 2;
    }
    printf("fits within buffer : increase --params or --value-len\n");
    return 0;
#endif
}
""")


def expected_units(params: int, vlen: int) -> int:
    """Per-iteration: delim ';' (1 unit after first) + key '=' val (2*vlen-1)."""
    return (params - 1) * 1 + params * (2 * (vlen - 1) + 1)


def cmd_harness(args: argparse.Namespace) -> int:
    if args.narrow:
        TYPE, L, FUNC, SPEC, DELIM, UNIT = "char", "", "snprintf", '"%s=%s"', '";"', "chars"
    else:
        TYPE, L, FUNC, SPEC, DELIM, UNIT = ("wchar_t", "L", "swprintf",
                                            'L"%ls=%ls"', 'L";"', "wide chars (wchar_t)")

    src = HARNESS_TPL.substitute(
        BUFSIZE=args.buffer, NPARAMS=args.params, VLEN=args.value_len,
        TYPE=TYPE, L=L, FUNC=FUNC, SPEC=SPEC, DELIM=DELIM, UNIT=UNIT,
    )
    with open(args.out, "w") as fh:
        fh.write(src)

    total = expected_units(args.params, args.value_len)
    print(f"[*] wrote {args.out}")
    print(f"[*] expected writes: ~{total} {UNIT} into a {args.buffer}-{UNIT} "
          f"buffer -> {'OVERFLOW by %d' % (total - args.buffer) if total > args.buffer else 'fits'}")

    if args.run and not args.build:
        args.build = True
    if not args.build:
        return 0

    cc = args.cc or shutil.which("gcc") or shutil.which("cc")
    if not cc:
        print("[!] no C compiler found (install gcc or pass --cc)")
        return 1
    base = os.path.splitext(args.out)[0]

    def build_run(defines: tuple[str, ...], out_exe: str) -> Optional[subprocess.CompletedProcess]:
        cmd = [cc, "-O0", "-g", "-fstack-protector-all", "-fno-inline"]
        if args.cflags:
            cmd += args.cflags.split()
        cmd += ["-o", out_exe, args.out, *defines]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"[!] build failed:\n{r.stderr}")
            return None
        try:
            return subprocess.run([out_exe], capture_output=True, text=True, timeout=30)
        except subprocess.TimeoutExpired:
            return None

    print("\n=== vulnerable build (stack protector) ===")
    p = build_run((), base)
    if p:
        sys.stdout.write(p.stdout)
        sys.stderr.write(p.stderr)
        if p.returncode < 0:
            print(f"[!] crashed with signal {-p.returncode} "
                  f"(SIGABRT=6 -> canary detected overflow; SIGSEGV=11 -> wild write)")
        elif p.returncode == 2:
            print("[!] out-of-bounds write proven (return code 2)")
        else:
            print("[*] no crash - increase --params/--value-len")

    if args.safe:
        print("\n=== fixed build (-DSAFE: size = BUFSIZE - offset) ===")
        p = build_run(("-DSAFE",), base + "_safe")
        if p:
            sys.stdout.write(p.stdout)
            sys.stderr.write(p.stderr)
            print(f"[*] safe variant exited {p.returncode} (0 = clean)")
    return 0


def cmd_demo(args: argparse.Namespace) -> int:
    with open(args.out, "w") as fh:
        fh.write(SAMPLE)
    print(f"[*] wrote {args.out} (vulnerable StationURL::Format sample)")
    print("    scan it with:  python3 fmt_bounds_audit.py scan --src %s" % args.out)
    return 0


# -------------------------------------------------------------------- main

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Stack-bounds format auditing (C/C++) - authorized testing only")
    sub = ap.add_subparsers(dest="cmd", required=True)

    ps = sub.add_parser("scan", help="static scan for dangerous format/copy calls")
    ps.add_argument("--src", required=True, help="file or directory to scan")
    ps.add_argument("--ext", default="c,cpp,cc,cxx,h,hpp,hxx", help="extensions")
    ps.add_argument("--context", type=int, default=1, help="snippet lines around match")
    ps.add_argument("--only-suspicious", action="store_true",
                    help="hide LOW-severity findings")
    ps.add_argument("--json", action="store_true")
    ps.set_defaults(fn=cmd_scan)

    ph = sub.add_parser("harness", help="generate/build/run the StationURL PoC")
    ph.add_argument("--buffer", type=int, default=1024, help="stack buffer size")
    ph.add_argument("--params", type=int, default=24, help="number of params")
    ph.add_argument("--value-len", type=int, default=160,
                    help="key/value length (keep < buffer/2 to avoid truncation)")
    ph.add_argument("--narrow", action="store_true", help="char/snprintf variant")
    ph.add_argument("--out", default="poc_stationurl.c")
    ph.add_argument("--build", action="store_true", help="compile with gcc")
    ph.add_argument("--run", action="store_true", help="build and run")
    ph.add_argument("--safe", action="store_true", help="also build -DSAFE fix")
    ph.add_argument("--cc", help="compiler path (default: gcc/cc)")
    ph.add_argument("--cflags", help="extra compiler flags")
    ph.set_defaults(fn=cmd_harness)

    pd = sub.add_parser("demo", help="write the reference vulnerable sample")
    pd.add_argument("--out", default="stationurl_sample.cpp")
    pd.set_defaults(fn=cmd_demo)

    args = ap.parse_args()
    sys.exit(args.fn(args))


if __name__ == "__main__":
    main()