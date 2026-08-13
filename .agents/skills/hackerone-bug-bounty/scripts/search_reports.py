#!/usr/bin/env python3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def search_reports(query, json_path="hackerone_public_reports.json"):
    path = Path(json_path)
    if not path.exists():
        print(f"Data file '{json_path}' not found.")
        return
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    query_lower = query.lower()
    matches = []
    
    for r in data.get("reports", []):
        attrs = r.get("attributes", {})
        title = attrs.get("title", "") or ""
        cwe = attrs.get("cwe", "") or ""
        url = attrs.get("url", "") or ""
        
        if query_lower in title.lower() or query_lower in cwe.lower():
            matches.append((r.get("id"), title, attrs.get("severity_rating"), attrs.get("total_awarded_amount"), url))
            
    print(f"Found {len(matches)} matching reports for '{query}':\n")
    for r_id, title, sev, bounty, url in matches[:20]:
        bounty_str = f" [${bounty:,}]" if bounty else ""
        print(f"- [{sev}] {title}{bounty_str}\n  {url}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python search_reports.py <query_keyword>")
    else:
        search_reports(sys.argv[1])
