#!/usr/bin/env python3
"""
search_reports.py - Offline Search & Intelligence CLI for HackerOne Disclosed Reports

Provides instant, multi-dimensional search and analytics across the 9,950+ HackerOne
public vulnerability dataset (hackerone_public_reports.json).

Usage Examples:
    # 1. Quick keyword search
    python search_reports.py "OTP"
    python search_reports.py "SSRF"

    # 2. Filter by severity and minimum bounty
    python search_reports.py "bypass" --severity critical --min-bounty 2000

    # 3. Filter by CWE category
    python search_reports.py --cwe "CWE-307"
    python search_reports.py --cwe "CWE-79" --limit 10

    # 4. Filter by target program/company
    python search_reports.py --program "shopify" --severity high

    # 5. Inspect specific report details by ID
    python search_reports.py --id 3265780

    # 6. View dataset statistical breakdown
    python search_reports.py --stats

    # 7. Output structured JSON for automation/tooling
    python search_reports.py "RCE" --severity critical --json
"""

import argparse
import json
import os
import sys
from collections import Counter
from pathlib import Path

# Ensure UTF-8 output encoding across Windows / Linux / macOS
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DEFAULT_DATASET = "hackerone_public_reports.json"


def load_dataset(dataset_path: str = DEFAULT_DATASET) -> list:
    """Load and return reports list from JSON dataset."""
    path = Path(dataset_path)
    if not path.exists():
        print(f"[!] Error: Dataset file '{dataset_path}' not found.", file=sys.stderr)
        print("    Run 'python hackerone_public.py' to download the dataset.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("reports", [])
    except Exception as e:
        print(f"[!] Error loading JSON dataset: {e}", file=sys.stderr)
        sys.exit(1)


def show_statistics(reports: list) -> None:
    """Print high-level intelligence and dataset metrics."""
    total = len(reports)
    cwe_counter = Counter()
    severity_counter = Counter()
    program_counter = Counter()
    total_bounties = 0
    bounties_awarded_count = 0
    top_bounties = []

    for r in reports:
        attrs = r.get("attributes", {})
        rels = r.get("relationships", {})

        cwe = attrs.get("cwe") or "Uncategorized"
        sev = attrs.get("severity_rating") or "Unknown"
        bounty = attrs.get("total_awarded_amount") or 0
        program = rels.get("program", {}).get("data", {}).get("attributes", {}).get("name", "Unknown Program")

        cwe_counter[cwe] += 1
        severity_counter[sev.lower()] += 1
        program_counter[program] += 1

        if bounty and bounty > 0:
            total_bounties += bounty
            bounties_awarded_count += 1
            top_bounties.append((attrs.get("title"), bounty, program, attrs.get("url")))

    top_bounties.sort(key=lambda x: x[1], reverse=True)

    print("======================================================================")
    print(" 📊 HackerOne Public Bug Bounty Dataset Intelligence Overview")
    print("======================================================================")
    print(f"[*] Total Disclosed Reports : {total:,}")
    print(f"[*] Total Bounty Value Paid  : ${total_bounties:,.2f}")
    print(f"[*] Rewarded Reports Count   : {bounties_awarded_count:,} (Avg: ${total_bounties / max(1, bounties_awarded_count):,.2f})")
    print()

    print("--- Severity Breakdown ---")
    for sev in ["critical", "high", "medium", "low", "none", "unknown"]:
        if sev in severity_counter:
            print(f"  • {sev.upper():<10}: {severity_counter[sev]:,}")
    print()

    print("--- Top 10 Vulnerability Types (CWE) ---")
    for cwe, count in cwe_counter.most_common(10):
        print(f"  • {cwe:<45}: {count:,}")
    print()

    print("--- Top 5 Programs by Disclosed Reports ---")
    for prog, count in program_counter.most_common(5):
        print(f"  • {prog:<35}: {count:,}")
    print()

    print("--- Top 5 Highest Bounty Reports ---")
    for title, bounty, prog, url in top_bounties[:5]:
        print(f"  • [${bounty:,.0f}] {title} ({prog})")
        print(f"    {url}")
    print("======================================================================")


def inspect_report_by_id(reports: list, report_id: str) -> None:
    """Print deep details of a specific vulnerability report by its ID."""
    matched = None
    for r in reports:
        if str(r.get("id")) == str(report_id):
            matched = r
            break

    if not matched:
        print(f"[!] Report ID #{report_id} not found in the dataset.", file=sys.stderr)
        return

    attrs = matched.get("attributes", {})
    rels = matched.get("relationships", {})
    summary = rels.get("report_generated_content", {}).get("data", {}).get("attributes", {}).get("hacktivity_summary")
    program = rels.get("program", {}).get("data", {}).get("attributes", {}).get("name", "N/A")
    reporter = rels.get("reporter", {}).get("data", {}).get("attributes", {}).get("username", "N/A")
    bounty = attrs.get("total_awarded_amount")
    bounty_str = f"${bounty:,.2f}" if bounty else "None / Undisclosed"

    print("======================================================================")
    print(f" 🛡️ HackerOne Report #{matched.get('id')}: {attrs.get('title')}")
    print("======================================================================")
    print(f" • URL          : {attrs.get('url')}")
    print(f" • Program      : {program}")
    print(f" • Reporter     : {reporter}")
    print(f" • Severity     : {attrs.get('severity_rating', 'Unknown').upper()}")
    print(f" • CWE          : {attrs.get('cwe', 'Uncategorized')}")
    print(f" • Bounty Paid  : {bounty_str}")
    print(f" • Disclosed At : {attrs.get('disclosed_at', 'N/A')}")
    print(f" • Created At   : {attrs.get('created_at', 'N/A')}")
    print("----------------------------------------------------------------------")
    if summary:
        print("📄 Report Summary / Key Takeaways:")
        print(summary.strip())
    else:
        print("📄 Summary: (No public summary attached; check full report at URL)")
    print("======================================================================")


def search_reports(reports: list, query: str = "", severity: str = None, cwe_filter: str = None,
                   min_bounty: float = None, program_filter: str = None, limit: int = 25,
                   as_json: bool = False) -> None:
    """Filter and display matching reports based on multi-dimensional criteria."""
    query_lower = query.lower() if query else ""
    sev_filter = severity.lower() if severity else None
    cwe_lower = cwe_filter.lower() if cwe_filter else None
    prog_lower = program_filter.lower() if program_filter else None

    matches = []

    for r in reports:
        attrs = r.get("attributes", {})
        rels = r.get("relationships", {})

        title = attrs.get("title") or ""
        cwe = attrs.get("cwe") or ""
        sev = attrs.get("severity_rating") or ""
        bounty = attrs.get("total_awarded_amount") or 0
        url = attrs.get("url") or ""
        program = rels.get("program", {}).get("data", {}).get("attributes", {}).get("name", "") or ""
        summary = rels.get("report_generated_content", {}).get("data", {}).get("attributes", {}).get("hacktivity_summary") or ""

        # Apply query filter across Title, CWE, Summary, and Program
        if query_lower:
            searchable_text = f"{title} {cwe} {summary} {program}".lower()
            if query_lower not in searchable_text:
                continue

        # Apply Severity filter
        if sev_filter and sev.lower() != sev_filter:
            continue

        # Apply CWE filter
        if cwe_lower and cwe_lower not in cwe.lower():
            continue

        # Apply Program filter
        if prog_lower and prog_lower not in program.lower():
            continue

        # Apply Min Bounty filter
        if min_bounty is not None and bounty < min_bounty:
            continue

        matches.append({
            "id": r.get("id"),
            "title": title,
            "severity": sev or "unknown",
            "cwe": cwe or "Uncategorized",
            "bounty": bounty,
            "program": program,
            "url": url,
            "disclosed_at": attrs.get("disclosed_at"),
            "summary": summary[:300] if summary else ""
        })

    if as_json:
        results = matches if limit == 0 else matches[:limit]
        print(json.dumps({
            "total_matches": len(matches),
            "displayed": len(results),
            "results": results
        }, indent=2, ensure_ascii=False))
        return

    print(f"[+] Found {len(matches):,} matching report(s)")
    if query:
        print(f"    Query: '{query}'")
    if severity:
        print(f"    Severity: {severity.upper()}")
    if cwe_filter:
        print(f"    CWE: '{cwe_filter}'")
    if min_bounty:
        print(f"    Min Bounty: ${min_bounty:,.0f}")
    if program_filter:
        print(f"    Program: '{program_filter}'")
    print()

    displayed_matches = matches if limit == 0 else matches[:limit]

    for item in displayed_matches:
        bounty_str = f" [${item['bounty']:,.0f}]" if item['bounty'] else ""
        sev_label = item['severity'].upper()
        prog_label = f" ({item['program']})" if item['program'] else ""
        print(f"• [{sev_label}] #{item['id']} - {item['title']}{bounty_str}{prog_label}")
        print(f"  CWE : {item['cwe']}")
        print(f"  URL : {item['url']}")
        if item['summary']:
            clean_summary = item['summary'].replace('\n', ' ').strip()
            print(f"  Info: {clean_summary[:160]}...")
        print()

    if limit > 0 and len(matches) > limit:
        print(f"[*] Showing first {limit} results. Use '--limit 0' to show all {len(matches):,} matches.")


def main():
    parser = argparse.ArgumentParser(
        description="Search and analyze 9,950+ disclosed HackerOne bug bounty reports."
    )
    parser.add_argument("query", nargs="?", default="", help="Search query (matches title, CWE, summary, program)")
    parser.add_argument("-s", "--severity", choices=["critical", "high", "medium", "low", "none"], help="Filter by severity rating")
    parser.add_argument("-c", "--cwe", help="Filter by CWE name or ID (e.g., 'CWE-307', 'XSS', 'IDOR')")
    parser.add_argument("-b", "--min-bounty", type=float, help="Filter reports with bounty >= specified amount")
    parser.add_argument("-p", "--program", help="Filter by program/company name")
    parser.add_argument("-l", "--limit", type=int, default=20, help="Max results to display (0 for all, default 20)")
    parser.add_argument("--id", help="Inspect detailed information for a specific report ID")
    parser.add_argument("--stats", action="store_true", help="Display dataset overview statistics and top bounties")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("-d", "--dataset", default=DEFAULT_DATASET, help="Path to reports JSON file")

    args = parser.parse_args()

    reports = load_dataset(args.dataset)

    if args.stats:
        show_statistics(reports)
        return

    if args.id:
        inspect_report_by_id(reports, args.id)
        return

    if not args.query and not args.severity and not args.cwe and not args.min_bounty and not args.program:
        print("[!] No search criteria provided. Displaying recent reports (or use --stats / --help):\n")

    search_reports(
        reports=reports,
        query=args.query,
        severity=args.severity,
        cwe_filter=args.cwe,
        min_bounty=args.min_bounty,
        program_filter=args.program,
        limit=args.limit,
        as_json=args.json,
    )


if __name__ == "__main__":
    main()
