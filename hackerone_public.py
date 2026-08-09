#!/usr/bin/env python3
"""
HackerOne Public Hacktivity Downloader & AI Skill Exporter
=========================================================
Automatically downloads disclosed public bug bounty reports from HackerOne REST API
and exports them into structured JSON and AI Skill (SKILL.md) formats for AI Agents.

Usage:
    python hackerone_public.py --identifier "YOUR_API_ID" --token "YOUR_API_TOKEN" --max-pages 5 --export-skill
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
import requests

# Default Configuration
API_URL = "https://api.hackerone.com/v1/hackers/hacktivity"
PAGE_SIZE = 50
DEFAULT_OUTPUT = "hackerone_public_reports.json"
REQUEST_TIMEOUT = 60
RETRY_WAIT = 30
PAGE_DELAY = 1

def save_json(reports, output_file):
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

def report_key(report):
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

def extract_reports(data):
    """Extract reports list from HackerOne API response."""
    if not isinstance(data, dict):
        return []
    reports = data.get("data", [])
    if not isinstance(reports, list):
        return []
    return reports

def main():
    parser = argparse.ArgumentParser(description="Download HackerOne Public Disclosed Bug Bounty Reports.")
    parser.add_argument("-i", "--identifier", default=os.getenv("H1_API_IDENTIFIER", ""), help="HackerOne API Identifier")
    parser.add_argument("-t", "--token", default=os.getenv("H1_API_TOKEN", ""), help="HackerOne API Token")
    parser.add_argument("-m", "--max-pages", type=int, default=int(os.getenv("H1_MAX_PAGES", "0")), help="Max pages to download (0 = unlimited)")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT, help="Output JSON filename")
    parser.add_argument("-s", "--export-skill", action="store_true", help="Automatically generate AI Skill after download")

    args = parser.parse_args()

    if not args.identifier or not args.token:
        print("[!] HackerOne API Identifier and Token are required.")
        print()
        print("Set environment variables:")
        print("  export H1_API_IDENTIFIER='YOUR_IDENTIFIER'")
        print("  export H1_API_TOKEN='YOUR_TOKEN'")
        print()
        print("Or run with flags:")
        print("  python hackerone_public.py -i YOUR_IDENTIFIER -t YOUR_TOKEN --export-skill")
        sys.exit(1)

    print("==============================================")
    print(" HackerOne Public Hacktivity Downloader")
    print("==============================================")
    print(f"[*] API URL: {API_URL}")
    print(f"[*] Page Size: {PAGE_SIZE}")
    print(f"[*] Output JSON: {args.output}")
    print(f"[*] Max Pages: {'Unlimited' if args.max_pages == 0 else args.max_pages}")
    print()

    session = requests.Session()
    session.auth = (args.identifier, args.token)
    session.headers.update({
        "Accept": "application/json",
        "User-Agent": "HackerOne-Public-Hacktivity-Downloader/2.0",
    })

    all_reports = []
    seen_reports = set()
    page = 1

    while True:
        if args.max_pages and page > args.max_pages:
            print(f"[!] Reached maximum specified pages ({args.max_pages}). Stopping.")
            break

        print(f"[*] Fetching page {page}...")
        params = {
            "queryString": "disclosed:true",
            "page[number]": page,
            "page[size]": PAGE_SIZE,
            "sort": "-disclosed_at",
        }

        while True:
            try:
                response = session.get(API_URL, params=params, timeout=REQUEST_TIMEOUT)
            except requests.RequestException as error:
                print(f"[!] Network error: {error}. Retrying in {RETRY_WAIT}s...")
                time.sleep(RETRY_WAIT)
                continue

            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After")
                try:
                    wait_time = int(retry_after)
                except (TypeError, ValueError):
                    wait_time = RETRY_WAIT
                print(f"[!] Rate limited (429). Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue

            break

        if response.status_code == 401:
            print("[!] HTTP 401 Unauthorized. Check your API Identifier and Token.")
            sys.exit(1)
        if response.status_code == 403:
            print("[!] HTTP 403 Forbidden. Permission denied.")
            sys.exit(1)
        if response.status_code != 200:
            print(f"[!] HTTP Error {response.status_code}: {response.text[:1000]}")
            sys.exit(1)

        try:
            data = response.json()
        except ValueError:
            print("[!] Invalid JSON response from HackerOne.")
            sys.exit(1)

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
        print(f"[+] Page {page}: Received {len(reports)} reports ({new_count} new). Total collected: {len(all_reports)}")

        page += 1
        time.sleep(PAGE_DELAY)

    save_json(all_reports, args.output)
    print()
    print("[+] Download complete. Total reports saved:", len(all_reports))

    if args.export_skill:
        print("[*] Triggering AI Skill generator...")
        try:
            from generate_ai_skill import generate_ai_skill
            generate_ai_skill(all_reports)
        except Exception as e:
            print(f"[!] Error exporting AI skill: {e}")

if __name__ == "__main__":
    main()
