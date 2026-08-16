#!/usr/bin/env python3
"""
parse-har.py - Parse HAR (HTTP Archive) files into normalized format
Handles browser DevTools exports and Caido HAR exports
"""

import json
import sys
import argparse
from urllib.parse import urlparse, parse_qs
from datetime import datetime

def parse_har(har_path: str) -> list:
    """Parse HAR file and extract request/response pairs."""
    with open(har_path, 'r', encoding='utf-8') as f:
        har_data = json.load(f)
    
    entries = []
    log = har_data.get('log', har_data)  # Handle both wrapped and unwrapped formats
    
    for entry in log.get('entries', []):
        request = entry.get('request', {})
        response = entry.get('response', {})
        
        # Parse URL
        url = request.get('url', '')
        parsed_url = urlparse(url)
        
        # Extract headers as dict
        headers = {}
        for h in request.get('headers', []):
            name = h.get('name', '')
            if name.lower() not in ['cookie']:  # Handle cookies separately
                headers[name] = h.get('value', '')
        
        # Extract cookies
        cookies = {}
        for c in request.get('cookies', []):
            cookies[c.get('name', '')] = c.get('value', '')
        
        # Also check for Cookie header
        for h in request.get('headers', []):
            if h.get('name', '').lower() == 'cookie':
                cookie_str = h.get('value', '')
                for pair in cookie_str.split(';'):
                    if '=' in pair:
                        k, v = pair.strip().split('=', 1)
                        cookies[k] = v
        
        # Extract query parameters
        query_params = parse_qs(parsed_url.query)
        # Flatten single-value lists
        query_params = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
        
        # Extract body
        body = None
        body_type = None
        post_data = request.get('postData', {})
        if post_data:
            body = post_data.get('text', '')
            body_type = post_data.get('mimeType', '')
            
            # Try to parse JSON body
            if body_type and 'json' in body_type.lower():
                try:
                    body = json.loads(body)
                except:
                    pass
        
        # Extract response info
        response_status = response.get('status', 0)
        response_headers = {}
        for h in response.get('headers', []):
            response_headers[h.get('name', '')] = h.get('value', '')
        
        response_body = None
        response_content = response.get('content', {})
        if response_content:
            response_body = response_content.get('text', '')
            # Try to parse JSON response
            if response_content.get('mimeType', '').find('json') >= 0:
                try:
                    response_body = json.loads(response_body)
                except:
                    pass
        
        entry_data = {
            'url': url,
            'method': request.get('method', 'GET'),
            'host': parsed_url.netloc,
            'path': parsed_url.path,
            'query_string': parsed_url.query,
            'query_params': query_params,
            'headers': headers,
            'cookies': cookies,
            'body': body,
            'body_type': body_type,
            'response': {
                'status': response_status,
                'headers': response_headers,
                'body': response_body
            },
            'timestamp': entry.get('startedDateTime', ''),
            'source': 'har'
        }
        
        entries.append(entry_data)
    
    return entries


def main():
    parser = argparse.ArgumentParser(description='Parse HAR files into normalized format')
    parser.add_argument('input', help='HAR file to parse')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        print(f"[*] Parsing HAR file: {args.input}", file=sys.stderr)
    
    entries = parse_har(args.input)
    
    if args.verbose:
        print(f"[*] Parsed {len(entries)} requests", file=sys.stderr)
    
    output = {
        'meta': {
            'source_file': args.input,
            'source_type': 'har',
            'parsed_at': datetime.now().isoformat(),
            'total_requests': len(entries)
        },
        'entries': entries
    }
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, default=str)
        if args.verbose:
            print(f"[*] Output written to: {args.output}", file=sys.stderr)
    else:
        print(json.dumps(output, indent=2, default=str))


if __name__ == '__main__':
    main()
