#!/usr/bin/env python3
"""
Deep URL Crawler using hakrawler and gospider

This script provides a unified interface to crawl URLs using both hakrawler
and gospider, with options for subdomain discovery, endpoint extraction,
and JavaScript analysis. All bash commands are logged with stdout/stderr.

Usage:
    python crawl.py <target_url> [options]

Examples:
    python crawl.py https://example.com
    python crawl.py https://example.com --depth 3 --subdomains
    python crawl.py https://example.com --js-analysis --output-dir ./results
"""

import argparse
import json
import os
import subprocess
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


class CrawlResult:
    """Container for crawl results"""

    def __init__(self, target):
        self.target = target
        self.urls = set()
        self.subdomains = set()
        self.js_files = set()
        self.api_endpoints = set()
        self.parameters = set()
        self.extensions = defaultdict(set)

    def add_url(self, url):
        """Add a URL and categorize it"""
        self.urls.add(url)

        # Extract subdomain
        parsed = urlparse(url)
        if parsed.hostname:
            self.subdomains.add(parsed.hostname)

        # Categorize by extension
        path = parsed.path.lower()
        if path.endswith('.js'):
            self.js_files.add(url)

        # Check for API patterns
        if any(pattern in path for pattern in ['/api/', '/v1/', '/v2/', '/graphql', '/rest/']):
            self.api_endpoints.add(url)

        # Extract parameters
        if parsed.query:
            params = parsed.query.split('&')
            for param in params:
                if '=' in param:
                    param_name = param.split('=')[0]
                    self.parameters.add(param_name)

        # Categorize by extension
        if '.' in path.split('/')[-1]:
            ext = path.split('.')[-1].split('?')[0]
            if ext and len(ext) <= 5:
                self.extensions[ext].add(url)

    def get_summary(self):
        """Get a summary of the crawl results"""
        return {
            'target': self.target,
            'total_urls': len(self.urls),
            'subdomains': len(self.subdomains),
            'js_files': len(self.js_files),
            'api_endpoints': len(self.api_endpoints),
            'parameters': len(self.parameters),
            'extensions': {ext: len(urls) for ext, urls in self.extensions.items()}
        }


def check_tools():
    """Check if required tools are installed"""
    tools = ['hakrawler', 'gospider']
    missing = []

    for tool in tools:
        try:
            subprocess.run([tool, '-h'], capture_output=True, timeout=5)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append(tool)

    return missing


def install_instructions():
    """Print installation instructions for missing tools"""
    print("\n=== Tool Installation Instructions ===\n")
    print("hakrawler:")
    print("  go install github.com/hakluke/hakrawler@latest")
    print("\ngospider:")
    print("  go install github.com/jaeles-project/gospider@latest")
    print("\nMake sure ~/go/bin is in your PATH:")
    print("  export PATH=$PATH:~/go/bin")
    print()


def run_hakrawler(target, depth=2, subdomains=False, timeout=300, output_dir=None):
    """Run hakrawler on the target and log all output"""
    print(f"[*] Running hakrawler on {target}...")

    cmd = ['hakrawler', '-d', str(depth)]
    if subdomains:
        cmd.append('-subs')

    # hakrawler reads URLs from stdin
    input_data = target

    # Prepare log file
    log_data = {
        'tool': 'hakrawler',
        'command': f"echo '{target}' | " + ' '.join(cmd),
        'timestamp': datetime.now().isoformat(),
        'stdout': '',
        'stderr': '',
        'returncode': None
    }

    try:
        result = subprocess.run(
            cmd,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        log_data['stdout'] = result.stdout
        log_data['stderr'] = result.stderr
        log_data['returncode'] = result.returncode

        # Save log file
        if output_dir:
            log_path = output_dir / "logs" / "hakrawler.log"
            log_path.parent.mkdir(parents=True, exist_ok=True)
            log_path.write_text(
                f"Command: {log_data['command']}\n"
                f"Timestamp: {log_data['timestamp']}\n"
                f"Return code: {log_data['returncode']}\n"
                f"\n=== STDOUT ===\n{log_data['stdout']}\n"
                f"\n=== STDERR ===\n{log_data['stderr']}\n"
            )

        urls = [line.strip() for line in result.stdout.split('\n') if line.strip()]
        print(f"[+] hakrawler found {len(urls)} URLs")
        return urls, log_data

    except subprocess.TimeoutExpired:
        log_data['stderr'] = f"Timeout after {timeout} seconds"
        log_data['returncode'] = -1
        print(f"[!] hakrawler timed out after {timeout} seconds")
        return [], log_data
    except Exception as e:
        log_data['stderr'] = str(e)
        log_data['returncode'] = -1
        print(f"[!] Error running hakrawler: {e}")
        return [], log_data


def run_gospider(target, depth=2, subdomains=False, timeout=300, output_dir=None):
    """Run gospider on the target and log all output"""
    print(f"[*] Running gospider on {target}...")

    cmd = ['gospider', '-s', target, '-d', str(depth), '-c', '10', '--json']
    if subdomains:
        cmd.append('--subs')

    # Prepare log file
    log_data = {
        'tool': 'gospider',
        'command': ' '.join(cmd),
        'timestamp': datetime.now().isoformat(),
        'stdout': '',
        'stderr': '',
        'returncode': None
    }

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        log_data['stdout'] = result.stdout
        log_data['stderr'] = result.stderr
        log_data['returncode'] = result.returncode

        # Save log file
        if output_dir:
            log_path = output_dir / "logs" / "gospider.log"
            log_path.parent.mkdir(parents=True, exist_ok=True)
            log_path.write_text(
                f"Command: {log_data['command']}\n"
                f"Timestamp: {log_data['timestamp']}\n"
                f"Return code: {log_data['returncode']}\n"
                f"\n=== STDOUT ===\n{log_data['stdout']}\n"
                f"\n=== STDERR ===\n{log_data['stderr']}\n"
            )

        urls = []
        for line in result.stdout.split('\n'):
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                if 'output' in data:
                    urls.append(data['output'])
            except json.JSONDecodeError:
                # Some lines might not be JSON
                if line.startswith('http'):
                    urls.append(line.strip())

        print(f"[+] gospider found {len(urls)} URLs")
        return urls, log_data

    except subprocess.TimeoutExpired:
        log_data['stderr'] = f"Timeout after {timeout} seconds"
        log_data['returncode'] = -1
        print(f"[!] gospider timed out after {timeout} seconds")
        return [], log_data
    except Exception as e:
        log_data['stderr'] = str(e)
        log_data['returncode'] = -1
        print(f"[!] Error running gospider: {e}")
        return [], log_data


def save_results(result, output_dir, tool_logs):
    """Save crawl results to organized directory structure"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Create subdirectories
    (output_path / "results").mkdir(exist_ok=True)
    (output_path / "logs").mkdir(exist_ok=True)

    # Save categorized URL lists
    categories = {
        'urls': result.urls,
        'subdomains': result.subdomains,
        'js_files': result.js_files,
        'api_endpoints': result.api_endpoints,
        'parameters': result.parameters
    }

    for category_name, category_urls in categories.items():
        if category_urls:
            category_file = output_path / "results" / f"{category_name}.txt"
            with open(category_file, 'w') as f:
                for item in sorted(category_urls):
                    f.write(f"{item}\n")
            print(f"[+] Saved {len(category_urls)} {category_name} to results/{category_name}.txt")

    # Save extensions breakdown
    if result.extensions:
        ext_file = output_path / "results" / "extensions.json"
        ext_data = {ext: sorted(list(urls)) for ext, urls in result.extensions.items()}
        with open(ext_file, 'w') as f:
            json.dump(ext_data, f, indent=2)
        print(f"[+] Saved extension breakdown to results/extensions.json")

    # Create summary with tool logs
    summary = result.get_summary()
    summary['timestamp'] = datetime.now().isoformat()
    summary['tool_logs'] = tool_logs
    summary['files'] = {
        'urls': 'results/urls.txt',
        'subdomains': 'results/subdomains.txt' if result.subdomains else None,
        'js_files': 'results/js_files.txt' if result.js_files else None,
        'api_endpoints': 'results/api_endpoints.txt' if result.api_endpoints else None,
        'parameters': 'results/parameters.txt' if result.parameters else None,
        'extensions': 'results/extensions.json' if result.extensions else None,
    }

    # Save summary JSON
    summary_file = output_path / "summary.json"
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"[+] Saved summary to summary.json")

    # Generate and save markdown report
    report = generate_markdown_report(result, summary)
    report_file = output_path / "REPORT.md"
    with open(report_file, 'w') as f:
        f.write(report)
    print(f"[+] Saved markdown report to REPORT.md")

    return summary


def generate_markdown_report(result, summary):
    """Generate a human-readable markdown report"""
    report = f"""# Web Crawl Report

**Target:** {result.target}
**Crawl Date:** {summary['timestamp']}

---

## Summary Statistics

- **Total URLs:** {summary['total_urls']}
- **Subdomains:** {summary['subdomains']}
- **JavaScript Files:** {summary['js_files']}
- **API Endpoints:** {summary['api_endpoints']}
- **Parameters:** {summary['parameters']}

---

## File Extensions

"""

    if result.extensions:
        report += "| Extension | Count |\n|-----------|-------|\n"
        for ext, urls in sorted(result.extensions.items(), key=lambda x: len(x[1]), reverse=True)[:20]:
            report += f"| .{ext} | {len(urls)} |\n"
    else:
        report += "*No file extensions found*\n"

    report += "\n---\n\n## Discovered Subdomains\n\n"

    if result.subdomains:
        for subdomain in sorted(result.subdomains)[:100]:
            report += f"- `{subdomain}`\n"
        if len(result.subdomains) > 100:
            report += f"\n*... and {len(result.subdomains) - 100} more*\n"
    else:
        report += "*No subdomains found*\n"

    report += "\n---\n\n## JavaScript Files\n\n"

    if result.js_files:
        for js_url in sorted(result.js_files)[:50]:
            report += f"- `{js_url}`\n"
        if len(result.js_files) > 50:
            report += f"\n*... and {len(result.js_files) - 50} more*\n"
    else:
        report += "*No JavaScript files found*\n"

    report += "\n---\n\n## API Endpoints\n\n"

    if result.api_endpoints:
        for endpoint in sorted(result.api_endpoints)[:50]:
            report += f"- `{endpoint}`\n"
        if len(result.api_endpoints) > 50:
            report += f"\n*... and {len(result.api_endpoints) - 50} more*\n"
    else:
        report += "*No API endpoints found*\n"

    report += "\n---\n\n## Parameters\n\n"

    if result.parameters:
        for param in sorted(result.parameters)[:100]:
            report += f"- `{param}`\n"
        if len(result.parameters) > 100:
            report += f"\n*... and {len(result.parameters) - 100} more*\n"
    else:
        report += "*No parameters found*\n"

    report += "\n---\n\n## Tool Execution Logs\n\n"
    report += "All bash command logs (stdout/stderr) are saved in the `logs/` directory:\n\n"

    for log in summary.get('tool_logs', []):
        tool_name = log.get('tool', 'unknown')
        returncode = log.get('returncode', 'N/A')
        status = "✅ Success" if returncode == 0 else f"❌ Failed (code: {returncode})"
        report += f"- `{tool_name}`: {status} - See `logs/{tool_name}.log`\n"

    return report


def main():
    parser = argparse.ArgumentParser(
        description='Deep URL crawler using hakrawler and gospider',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://example.com
  %(prog)s https://example.com --depth 3 --subdomains
  %(prog)s https://example.com --js-analysis --output-dir ./custom_output
  %(prog)s https://example.com --tool hakrawler --timeout 600
        """
    )

    parser.add_argument('target', help='Target URL to crawl')
    parser.add_argument('-d', '--depth', type=int, default=2,
                        help='Crawl depth (default: 2)')
    parser.add_argument('-s', '--subdomains', action='store_true',
                        help='Include subdomains in crawl')
    parser.add_argument('-j', '--js-analysis', action='store_true',
                        help='Extract and analyze JavaScript files')
    parser.add_argument('-o', '--output-dir', default=None,
                        help='Output directory (default: crawl_[domain]_[timestamp])')
    parser.add_argument('-t', '--tool', choices=['both', 'hakrawler', 'gospider'],
                        default='both', help='Which tool to use (default: both)')
    parser.add_argument('--timeout', type=int, default=300,
                        help='Timeout per tool in seconds (default: 300)')
    parser.add_argument('--install', action='store_true',
                        help='Show installation instructions and exit')

    args = parser.parse_args()

    if args.install:
        install_instructions()
        return 0

    # Check if tools are installed
    missing_tools = check_tools()
    if missing_tools:
        print(f"[!] Missing tools: {', '.join(missing_tools)}")
        install_instructions()
        return 1

    # Validate target URL
    if not args.target.startswith(('http://', 'https://')):
        print("[!] Target must start with http:// or https://")
        return 1

    # Create output directory
    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        parsed = urlparse(args.target)
        domain = parsed.netloc.replace(':', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_dir = Path.cwd() / f"crawl_{domain}_{timestamp}"

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"Deep URL Crawl")
    print(f"{'='*60}")
    print(f"Target: {args.target}")
    print(f"Depth: {args.depth}")
    print(f"Subdomains: {args.subdomains}")
    print(f"JS Analysis: {args.js_analysis}")
    print(f"Tool: {args.tool}")
    print(f"Output: {output_dir}")
    print(f"{'='*60}\n")

    result = CrawlResult(args.target)
    tool_logs = []

    # Run crawlers
    all_urls = []

    if args.tool in ['both', 'hakrawler']:
        hakrawler_urls, hakrawler_log = run_hakrawler(
            args.target,
            depth=args.depth,
            subdomains=args.subdomains,
            timeout=args.timeout,
            output_dir=output_dir
        )
        all_urls.extend(hakrawler_urls)
        tool_logs.append(hakrawler_log)

    if args.tool in ['both', 'gospider']:
        gospider_urls, gospider_log = run_gospider(
            args.target,
            depth=args.depth,
            subdomains=args.subdomains,
            timeout=args.timeout,
            output_dir=output_dir
        )
        all_urls.extend(gospider_urls)
        tool_logs.append(gospider_log)

    # Process results
    print(f"\n[*] Processing {len(all_urls)} URLs...")
    for url in all_urls:
        if url and url.startswith('http'):
            result.add_url(url)

    # Print summary
    print(f"\n{'='*60}")
    print("Crawl Summary")
    print(f"{'='*60}")
    summary = result.get_summary()
    print(f"Total URLs: {summary['total_urls']}")
    print(f"Subdomains: {summary['subdomains']}")
    print(f"JS Files: {summary['js_files']}")
    print(f"API Endpoints: {summary['api_endpoints']}")
    print(f"Parameters: {summary['parameters']}")

    if result.extensions:
        print("\nTop File Extensions:")
        for ext, urls in sorted(result.extensions.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
            print(f"  .{ext}: {len(urls)}")

    print(f"{'='*60}\n")

    # Save results
    save_results(result, output_dir, tool_logs)

    print(f"\n{'='*60}")
    print("Output Directory Structure:")
    print(f"{'='*60}")
    print(f"{output_dir}/")
    print(f"├── results/          # Categorized URL lists")
    print(f"├── logs/             # Bash command logs (stdout/stderr)")
    print(f"├── summary.json      # JSON summary with statistics")
    print(f"└── REPORT.md         # Human-readable markdown report")
    print(f"{'='*60}\n")

    print("[+] Crawl complete!")
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user")
        sys.exit(130)
