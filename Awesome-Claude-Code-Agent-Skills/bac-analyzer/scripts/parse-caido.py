#!/usr/bin/env python3
"""
parse-caido.py - Parse Caido JSON exports into normalized format
Also supports pulling directly from Caido API
"""

import json
import sys
import os
import argparse
from urllib.parse import urlparse, parse_qs
from datetime import datetime

try:
    import urllib.request
    HAS_URLLIB = True
except:
    HAS_URLLIB = False


def parse_caido_export(caido_path: str) -> list:
    """Parse Caido JSON export file."""
    with open(caido_path, 'r', encoding='utf-8') as f:
        caido_data = json.load(f)
    
    entries = []
    
    # Caido exports can have different formats
    items = caido_data if isinstance(caido_data, list) else caido_data.get('items', caido_data.get('requests', []))
    
    for item in items:
        # Handle different Caido export structures
        request = item.get('request', item)
        response = item.get('response', {})
        
        url = request.get('url', request.get('uri', ''))
        parsed_url = urlparse(url)
        
        # Extract headers
        headers = {}
        raw_headers = request.get('headers', {})
        if isinstance(raw_headers, dict):
            headers = raw_headers
        elif isinstance(raw_headers, list):
            for h in raw_headers:
                if isinstance(h, dict):
                    headers[h.get('name', h.get('key', ''))] = h.get('value', '')
                elif isinstance(h, str) and ':' in h:
                    k, v = h.split(':', 1)
                    headers[k.strip()] = v.strip()
        
        # Extract cookies from headers
        cookies = {}
        cookie_header = headers.get('Cookie', headers.get('cookie', ''))
        if cookie_header:
            for pair in cookie_header.split(';'):
                if '=' in pair:
                    k, v = pair.strip().split('=', 1)
                    cookies[k] = v
        
        # Query params
        query_params = parse_qs(parsed_url.query)
        query_params = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
        
        # Body
        body = request.get('body', request.get('postData', None))
        body_type = headers.get('Content-Type', headers.get('content-type', ''))
        
        if body and body_type and 'json' in body_type.lower():
            try:
                if isinstance(body, str):
                    body = json.loads(body)
            except:
                pass
        
        # Response
        response_status = response.get('status', response.get('statusCode', 0))
        response_headers = response.get('headers', {})
        response_body = response.get('body', None)
        
        entry_data = {
            'url': url,
            'method': request.get('method', 'GET'),
            'host': parsed_url.netloc or request.get('host', ''),
            'path': parsed_url.path or request.get('path', ''),
            'query_string': parsed_url.query,
            'query_params': query_params,
            'headers': headers,
            'cookies': cookies,
            'body': body,
            'body_type': body_type,
            'response': {
                'status': response_status,
                'headers': response_headers if isinstance(response_headers, dict) else {},
                'body': response_body
            },
            'timestamp': item.get('timestamp', item.get('createdAt', '')),
            'source': 'caido',
            'caido_id': item.get('id', '')
        }
        
        entries.append(entry_data)
    
    return entries


def fetch_from_caido_api() -> list:
    """Fetch requests directly from Caido API."""
    caido_url = os.environ.get('CAIDO_URL', 'http://localhost:8080')
    api_key = os.environ.get('CAIDO_API_KEY', '')
    
    if not HAS_URLLIB:
        print("[!] urllib not available for API requests", file=sys.stderr)
        return []
    
    # Caido GraphQL API
    graphql_url = f"{caido_url}/graphql"
    
    query = """
    query GetRequests {
        requests(first: 1000) {
            edges {
                node {
                    id
                    method
                    host
                    path
                    query
                    raw
                    response {
                        statusCode
                        raw
                    }
                }
            }
        }
    }
    """
    
    headers = {
        'Content-Type': 'application/json'
    }
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    try:
        data = json.dumps({'query': query}).encode('utf-8')
        req = urllib.request.Request(graphql_url, data=data, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        
        entries = []
        for edge in result.get('data', {}).get('requests', {}).get('edges', []):
            node = edge.get('node', {})
            
            url = f"https://{node.get('host', '')}{node.get('path', '')}"
            if node.get('query'):
                url += f"?{node.get('query')}"
            
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            query_params = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
            
            # Parse raw request for headers
            headers = {}
            cookies = {}
            body = None
            raw = node.get('raw', '')
            if raw:
                lines = raw.split('\n')
                in_body = False
                body_lines = []
                for line in lines[1:]:  # Skip request line
                    if in_body:
                        body_lines.append(line)
                    elif line.strip() == '':
                        in_body = True
                    elif ':' in line:
                        k, v = line.split(':', 1)
                        headers[k.strip()] = v.strip()
                        if k.lower() == 'cookie':
                            for pair in v.split(';'):
                                if '=' in pair:
                                    ck, cv = pair.strip().split('=', 1)
                                    cookies[ck] = cv
                if body_lines:
                    body = '\n'.join(body_lines)
            
            response = node.get('response', {}) or {}
            
            entry_data = {
                'url': url,
                'method': node.get('method', 'GET'),
                'host': node.get('host', ''),
                'path': node.get('path', ''),
                'query_string': node.get('query', ''),
                'query_params': query_params,
                'headers': headers,
                'cookies': cookies,
                'body': body,
                'body_type': headers.get('Content-Type', ''),
                'response': {
                    'status': response.get('statusCode', 0),
                    'headers': {},
                    'body': None
                },
                'timestamp': '',
                'source': 'caido-api',
                'caido_id': node.get('id', '')
            }
            
            entries.append(entry_data)
        
        return entries
        
    except Exception as e:
        print(f"[!] Failed to fetch from Caido API: {e}", file=sys.stderr)
        return []


def main():
    parser = argparse.ArgumentParser(description='Parse Caido exports into normalized format')
    parser.add_argument('input', nargs='?', help='Caido JSON export file')
    parser.add_argument('--api', action='store_true', help='Fetch from Caido API instead of file')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.api:
        if args.verbose:
            print("[*] Fetching from Caido API...", file=sys.stderr)
        entries = fetch_from_caido_api()
    elif args.input:
        if args.verbose:
            print(f"[*] Parsing Caido export: {args.input}", file=sys.stderr)
        entries = parse_caido_export(args.input)
    else:
        parser.error("Either input file or --api flag required")
        return
    
    if args.verbose:
        print(f"[*] Parsed {len(entries)} requests", file=sys.stderr)
    
    output = {
        'meta': {
            'source_file': args.input or 'caido-api',
            'source_type': 'caido',
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
