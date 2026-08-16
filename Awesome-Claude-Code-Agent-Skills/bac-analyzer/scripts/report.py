#!/usr/bin/env python3
"""
report.py - Generate HTML report from BAC analysis results
"""

import json
import sys
import os
import argparse
from datetime import datetime
from typing import Dict, List

# Get script directory for loading templates
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'templates')


def load_template() -> str:
    """Load HTML template."""
    template_file = os.path.join(TEMPLATES_DIR, 'report.html')
    if os.path.exists(template_file):
        with open(template_file, 'r') as f:
            return f.read()
    return DEFAULT_TEMPLATE


def escape_html(text: str) -> str:
    """Escape HTML special characters."""
    if not isinstance(text, str):
        text = str(text)
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#39;'))


def risk_badge(risk: str) -> str:
    """Generate HTML badge for risk level."""
    colors = {
        'critical': '#dc3545',
        'high': '#fd7e14',
        'medium': '#ffc107',
        'low': '#28a745'
    }
    color = colors.get(risk, '#6c757d')
    return f'<span class="badge" style="background-color: {color}; color: white; padding: 2px 8px; border-radius: 4px;">{risk.upper()}</span>'


def generate_summary_section(meta: Dict) -> str:
    """Generate summary stats section."""
    return f'''
    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="stats">
            <div class="stat">
                <span class="stat-value">{meta.get('total_test_cases', 0)}</span>
                <span class="stat-label">Test Cases</span>
            </div>
            <div class="stat">
                <span class="stat-value">{meta.get('endpoints_tested', 0)}</span>
                <span class="stat-label">Endpoints</span>
            </div>
            <div class="stat">
                <span class="stat-value">{meta.get('tests_by_type', {}).get('auth_switch', 0)}</span>
                <span class="stat-label">Auth Switch</span>
            </div>
            <div class="stat">
                <span class="stat-value">{meta.get('tests_by_type', {}).get('403_bypass_url', 0) + meta.get('tests_by_type', {}).get('403_bypass_header', 0)}</span>
                <span class="stat-label">403 Bypass</span>
            </div>
        </div>
        <p class="generated">Generated: {meta.get('generated_at', 'Unknown')}</p>
    </div>
    '''


def generate_endpoint_section(group: Dict) -> str:
    """Generate section for one endpoint."""
    endpoint = group['endpoint']
    tests = group['tests']
    
    tests_html = ''
    for test in tests:
        curl_html = ''
        if test.get('curl'):
            curl_html = f'''
            <div class="curl-command">
                <button onclick="copyToClipboard(this)" class="copy-btn">📋 Copy</button>
                <pre>{escape_html(test['curl'])}</pre>
            </div>
            '''
        
        payloads_html = ''
        if test.get('payloads'):
            payloads_html = '<ul class="payloads">'
            for payload in test['payloads']:
                payloads_html += f'<li><code>{escape_html(payload)}</code></li>'
            payloads_html += '</ul>'
        
        if test.get('test_values'):
            payloads_html = '<ul class="payloads">'
            for val in test['test_values']:
                payloads_html += f'<li><code>{escape_html(val)}</code></li>'
            payloads_html += '</ul>'
        
        tests_html += f'''
        <div class="test-case">
            <div class="test-header">
                {risk_badge(test.get('risk', 'medium'))}
                <span class="test-type">{escape_html(test.get('type', ''))}</span>
            </div>
            <p class="test-desc">{escape_html(test.get('description', ''))}</p>
            {payloads_html}
            {curl_html}
        </div>
        '''
    
    return f'''
    <div class="endpoint" id="{hash(endpoint['url'])}">
        <div class="endpoint-header">
            {risk_badge(endpoint.get('overall_risk', 'medium'))}
            <span class="method method-{endpoint['method'].lower()}">{endpoint['method']}</span>
            <span class="path">{escape_html(endpoint['path'])}</span>
            <span class="test-count">{group['test_count']} tests</span>
        </div>
        <div class="endpoint-url">{escape_html(endpoint['url'])}</div>
        <div class="tests">
            {tests_html}
        </div>
    </div>
    '''


def generate_report(data: Dict) -> str:
    """Generate full HTML report."""
    meta = data.get('meta', {})
    test_groups = data.get('test_groups', [])
    
    # Generate sections
    summary_html = generate_summary_section(meta)
    
    endpoints_html = ''
    for group in test_groups:
        endpoints_html += generate_endpoint_section(group)
    
    # Build full report
    template = load_template()
    
    report = template.replace('{{TITLE}}', 'BAC/IDOR Analysis Report')
    report = report.replace('{{GENERATED}}', meta.get('generated_at', datetime.now().isoformat()))
    report = report.replace('{{SUMMARY}}', summary_html)
    report = report.replace('{{ENDPOINTS}}', endpoints_html)
    report = report.replace('{{TOTAL_TESTS}}', str(meta.get('total_test_cases', 0)))
    report = report.replace('{{TOTAL_ENDPOINTS}}', str(meta.get('endpoints_tested', 0)))
    
    return report


DEFAULT_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a2e;
            color: #eee;
            line-height: 1.6;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { 
            color: #00d4ff; 
            margin-bottom: 20px;
            font-size: 2em;
        }
        h2 { color: #00d4ff; margin: 20px 0 15px; }
        .summary {
            background: #16213e;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .stats {
            display: flex;
            gap: 30px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .stat {
            text-align: center;
            background: #1a1a2e;
            padding: 15px 25px;
            border-radius: 8px;
        }
        .stat-value {
            display: block;
            font-size: 2em;
            color: #00d4ff;
            font-weight: bold;
        }
        .stat-label {
            color: #888;
            font-size: 0.9em;
        }
        .generated { color: #666; font-size: 0.9em; }
        .endpoint {
            background: #16213e;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #0f3460;
            flex-wrap: wrap;
        }
        .method {
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
        }
        .method-get { background: #28a745; }
        .method-post { background: #007bff; }
        .method-put { background: #fd7e14; }
        .method-delete { background: #dc3545; }
        .method-patch { background: #6f42c1; }
        .path { font-family: monospace; color: #fff; }
        .test-count { margin-left: auto; color: #888; }
        .endpoint-url {
            padding: 10px 15px;
            background: #1a1a2e;
            font-family: monospace;
            font-size: 0.9em;
            color: #888;
            word-break: break-all;
        }
        .tests { padding: 15px; }
        .test-case {
            background: #1a1a2e;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .test-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        .test-type {
            font-family: monospace;
            color: #00d4ff;
        }
        .test-desc { color: #ccc; margin-bottom: 10px; }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .curl-command {
            position: relative;
            background: #0d0d1a;
            border-radius: 4px;
            margin-top: 10px;
        }
        .curl-command pre {
            padding: 15px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85em;
            color: #0f0;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .copy-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #333;
            border: none;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
        }
        .copy-btn:hover { background: #555; }
        .payloads {
            list-style: none;
            margin: 10px 0;
        }
        .payloads li {
            padding: 5px 10px;
            margin: 5px 0;
            background: #0d0d1a;
            border-radius: 4px;
        }
        .payloads code {
            font-family: monospace;
            color: #f90;
        }
        .filter-bar {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .filter-btn {
            background: #333;
            border: none;
            color: #fff;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        .filter-btn:hover, .filter-btn.active { background: #00d4ff; color: #000; }
        @media (max-width: 768px) {
            .stats { flex-direction: column; }
            .endpoint-header { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 BAC/IDOR Analysis Report</h1>
        
        {{SUMMARY}}
        
        <div class="filter-bar">
            <button class="filter-btn active" onclick="filterTests('all')">All</button>
            <button class="filter-btn" onclick="filterTests('critical')">Critical</button>
            <button class="filter-btn" onclick="filterTests('high')">High</button>
            <button class="filter-btn" onclick="filterTests('auth_switch')">Auth Switch</button>
            <button class="filter-btn" onclick="filterTests('403')">403 Bypass</button>
        </div>
        
        <h2>🎯 Endpoints & Test Cases</h2>
        <div id="endpoints">
            {{ENDPOINTS}}
        </div>
    </div>
    
    <script>
        function copyToClipboard(btn) {
            const pre = btn.nextElementSibling;
            navigator.clipboard.writeText(pre.textContent).then(() => {
                btn.textContent = '✅ Copied!';
                setTimeout(() => btn.textContent = '📋 Copy', 2000);
            });
        }
        
        function filterTests(filter) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            
            document.querySelectorAll('.endpoint').forEach(ep => {
                if (filter === 'all') {
                    ep.style.display = 'block';
                } else if (filter === 'critical' || filter === 'high') {
                    const badge = ep.querySelector('.badge');
                    ep.style.display = badge && badge.textContent.toLowerCase() === filter ? 'block' : 'none';
                } else if (filter === 'auth_switch') {
                    const hasType = ep.querySelector('.test-type')?.textContent.includes('auth_switch');
                    ep.style.display = hasType ? 'block' : 'none';
                } else if (filter === '403') {
                    const hasType = ep.querySelector('.test-type')?.textContent.includes('403');
                    ep.style.display = hasType ? 'block' : 'none';
                }
            });
        }
    </script>
</body>
</html>'''


def main():
    parser = argparse.ArgumentParser(description='Generate HTML report from BAC analysis')
    parser.add_argument('input', help='Test cases JSON file or combined results')
    parser.add_argument('-o', '--output', help='Output HTML file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Load input
    with open(args.input, 'r') as f:
        data = json.load(f)
    
    if args.verbose:
        print(f"[*] Generating report...", file=sys.stderr)
    
    report = generate_report(data)
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        if args.verbose:
            print(f"[*] Report written to: {args.output}", file=sys.stderr)
    else:
        print(report)


if __name__ == '__main__':
    main()
