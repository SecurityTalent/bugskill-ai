#!/usr/bin/env python3
"""
HackerOne Public Hacktivity Downloader
======================================
Automatically downloads disclosed public bug bounty reports from HackerOne REST API
and saves them into clean, structured JSON datasets.

Stdlib only (Python 3.8+). Zero external dependencies required.

Usage:
    python hackerone_public.py --identifier "YOUR_API_ID" --token "YOUR_API_TOKEN" --max-pages 5
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Ensure UTF-8 output encoding across Windows / Linux / macOS
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Default Configuration
API_URL = "https://api.hackerone.com/v1/hackers/hacktivity"
PAGE_SIZE = 50
DEFAULT_OUTPUT = "hackerone_public_reports.json"
REQUEST_TIMEOUT = 60
RETRY_WAIT = 30
PAGE_DELAY = 1


def save_json(reports: list, output_file: str) -> None:
    """Save collected reports to JSON."""
    output = {
        "source": "HackerOne Hacktivity",
        "filter": "disclosed:true",
        "page_size_requested": PAGE_SIZE,
        "total_collected": len(reports),
        "reports": reports,
    }

    Path(output_file).write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def report_key(report: dict) -> str:
    """Create a unique key for deduplication."""
    if not isinstance(report, dict):
        return None

    report_id = report.get("id")
    if report_id:
        return str(report_id)

    attributes = report.get("attributes", {})
    if isinstance(attributes, dict):
        url = attributes.get("url")
        if url:
            return str(url)

        title = attributes.get("title")
        if title:
            return str(title)

    return json.dumps(report, sort_keys=True)


def extract_reports(data: dict) -> list:
    """Extract reports list from HackerOne API response."""
    if not isinstance(data, dict):
        return []
    reports = data.get("data", [])
    if not isinstance(reports, list):
        return []
    return reports


def fetch_page(identifier: str, token: str, page: int) -> dict:
    """Fetch a single page of disclosed reports from HackerOne REST API."""
    params = {
        "queryString": "disclosed:true",
        "page[number]": page,
        "page[size]": PAGE_SIZE,
        "sort": "-disclosed_at",
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"

    auth_str = f"{identifier}:{token}"
    b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("ascii")

    headers = {
        "Accept": "application/json",
        "Authorization": f"Basic {b64_auth}",
        "User-Agent": "HackerOne-Public-Hacktivity-Downloader/2.0",
    }

    req = urllib.request.Request(url, headers=headers, method="GET")

    while True:
        try:
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
                content = response.read().decode("utf-8", errors="replace")
                return json.loads(content)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                retry_after = e.headers.get("Retry-After")
                try:
                    wait_time = int(retry_after)
                except (TypeError, ValueError):
                    wait_time = RETRY_WAIT
                print(f"[!] Rate limited (429). Waiting {wait_time}s...", flush=True)
                time.sleep(wait_time)
                continue
            elif e.code == 401:
                print("[!] HTTP 401 Unauthorized. Please check your API Identifier and Token.", file=sys.stderr)
                sys.exit(1)
            elif e.code == 403:
                print("[!] HTTP 403 Forbidden. Permission denied.", file=sys.stderr)
                sys.exit(1)
            else:
                err_body = e.read().decode("utf-8", errors="replace")[:1000]
                print(f"[!] HTTP Error {e.code}: {err_body}", file=sys.stderr)
                sys.exit(1)
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"[!] Network error: {error}. Retrying in {RETRY_WAIT}s...", flush=True)
            time.sleep(RETRY_WAIT)
            continue
        except json.JSONDecodeError:
            print("[!] Invalid JSON received from HackerOne API.", file=sys.stderr)
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Download HackerOne Public Disclosed Bug Bounty Reports.")
    parser.add_argument("-i", "--identifier", default=os.getenv("H1_API_IDENTIFIER", ""), help="HackerOne API Identifier")
    parser.add_argument("-t", "--token", default=os.getenv("H1_API_TOKEN", ""), help="HackerOne API Token")
    parser.add_argument("-m", "--max-pages", type=int, default=int(os.getenv("H1_MAX_PAGES", "0")), help="Max pages to download (0 = unlimited)")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT, help="Output JSON filename")

    args = parser.parse_args()

    if not args.identifier or not args.token:
        print("[!] HackerOne API Identifier and Token are required.")
        print()
        print("Set environment variables:")
        print("  export H1_API_IDENTIFIER='YOUR_IDENTIFIER'")
        print("  export H1_API_TOKEN='YOUR_TOKEN'")
        print()
        print("Or run with flags:")
        print("  python hackerone_public.py -i YOUR_IDENTIFIER -t YOUR_TOKEN")
        sys.exit(1)

    print("==============================================")
    print(" HackerOne Public Hacktivity Downloader")
    print("==============================================")
    print(f"[*] API URL    : {API_URL}")
    print(f"[*] Page Size  : {PAGE_SIZE}")
    print(f"[*] Output JSON: {args.output}")
    print(f"[*] Max Pages  : {'Unlimited' if args.max_pages == 0 else args.max_pages}")
    print()

    all_reports = []
    seen_reports = set()
    page = 1

    while True:
        if args.max_pages and page > args.max_pages:
            print(f"[!] Reached maximum specified pages ({args.max_pages}). Stopping.")
            break

        print(f"[*] Fetching page {page}...")
        data = fetch_page(args.identifier, args.token, page)
        reports = extract_reports(data)

        if not reports:
            print("[+] No more reports returned. Download complete.")
            break

        new_count = 0
        for r in reports:
            key = report_key(r)
            if key and key not in seen_reports:
                seen_reports.add(key)
                all_reports.append(r)
                new_count += 1

        save_json(all_reports, args.output)
        print(f"[+] Page {page}: Received {len(reports)} reports ({new_count} new). Total collected: {len(all_reports):,}")

        page += 1
        time.sleep(PAGE_DELAY)

    save_json(all_reports, args.output)
    print()
    print(f"[+] Download complete! Total reports saved: {len(all_reports):,} in '{args.output}'")


if __name__ == "__main__":
    main()
