#!/usr/bin/env python3
"""
parse-burp.py - Parse Burp Suite XML exports into normalized format
Handles both proxy history and saved items exports
"""

import json
import sys
import argparse
import base64
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, parse_qs
from datetime import datetime


def decode_base64_content(content: str) -> str:
    """Decode base64 content from Burp export."""
    try:
        return base64.b64decode(content).decode('utf-8', errors='replace')
    except:
        return content


def parse_raw_request(raw: str) -> dict:
    """Parse raw HTTP request into components."""
    headers = {}
    cookies = {}
    body = None
    
    if not raw:
        return {'headers': headers, 'cookies': cookies, 'body': body}
    
    lines = raw.split('\n')
    in_body = False
    body_lines = []
    
    for line in lines[1:]:  # Skip request line
        line = line.rstrip('\r')
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
    
    return {'headers': headers, 'cookies': cookies, 'body': body}


def parse_burp_xml(burp_path: str) -> list:
    """Parse Burp Suite XML export file."""
    entries = []
    
    tree = ET.parse(burp_path)
    root = tree.getroot()
    
    # Handle different Burp export formats
    items = root.findall('.//item')
    if not items:
        items = root.findall('.//request/..')
    
    for item in items:
        # Extract URL components
        url_elem = item.find('url')
        url = url_elem.text if url_elem is not None else ''
        
        host_elem = item.find('host')
        host = host_elem.text if host_elem is not None else ''
        
        path_elem = item.find('path')
        path = path_elem.text if path_elem is not None else ''
        
        method_elem = item.find('method')
        method = method_elem.text if method_elem is not None else 'GET'
        
        # If no URL, construct from host/path
        if not url and host:
            protocol = 'https' if item.find('protocol') is not None and item.find('protocol').text == 'https' else 'http'
            port_elem = item.find('port')
            port = port_elem.text if port_elem is not None else ('443' if protocol == 'https' else '80')
            url = f"{protocol}://{host}:{port}{path}"
        
        parsed_url = urlparse(url)
        
        # Parse request
        request_elem = item.find('request')
        raw_request = ''
        if request_elem is not None:
            is_base64 = request_elem.get('base64', 'false') == 'true'
            raw_request = request_elem.text or ''
            if is_base64:
                raw_request = decode_base64_content(raw_request)
        
        req_parts = parse_raw_request(raw_request)
        
        # Query params
        query_params = parse_qs(parsed_url.query)
        query_params = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
        
        # Body type
        body_type = req_parts['headers'].get('Content-Type', '')
        body = req_parts['body']
        
        if body and body_type and 'json' in body_type.lower():
            try:
                body = json.loads(body)
            except:
                pass
        
        # Parse response
        response_elem = item.find('response')
        response_status = 0
        response_headers = {}
        response_body = None
        
        status_elem = item.find('status')
        if status_elem is not None:
            try:
                response_status = int(status_elem.text)
            except:
                pass
        
        if response_elem is not None:
            is_base64 = response_elem.get('base64', 'false') == 'true'
            raw_response = response_elem.text or ''
            if is_base64:
                raw_response = decode_base64_content(raw_response)
            
            # Parse response headers and body
            if raw_response:
                resp_lines = raw_response.split('\n')
                in_body = False
                body_lines = []
                
                # Get status from first line if not already set
                if resp_lines and response_status == 0:
                    first_line = resp_lines[0]
                    parts = first_line.split()
                    if len(parts) >= 2:
                        try:
                            response_status = int(parts[1])
                        except:
                            pass
                
                for line in resp_lines[1:]:
                    line = line.rstrip('\r')
                    if in_body:
                        body_lines.append(line)
                    elif line.strip() == '':
                        in_body = True
                    elif ':' in line:
                        k, v = line.split(':', 1)
                        response_headers[k.strip()] = v.strip()
                
                if body_lines:
                    response_body = '\n'.join(body_lines)
        
        # Timestamp
        time_elem = item.find('time')
        timestamp = time_elem.text if time_elem is not None else ''
        
        entry_data = {
            'url': url,
            'method': method,
            'host': parsed_url.netloc or host,
            'path': parsed_url.path or path,
            'query_string': parsed_url.query,
            'query_params': query_params,
            'headers': req_parts['headers'],
            'cookies': req_parts['cookies'],
            'body': body,
            'body_type': body_type,
            'response': {
                'status': response_status,
                'headers': response_headers,
                'body': response_body
            },
            'timestamp': timestamp,
            'source': 'burp'
        }
        
        entries.append(entry_data)
    
    return entries


def main():
    parser = argparse.ArgumentParser(description='Parse Burp Suite XML exports into normalized format')
    parser.add_argument('input', help='Burp XML file to parse')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        print(f"[*] Parsing Burp XML: {args.input}", file=sys.stderr)
    
    entries = parse_burp_xml(args.input)
    
    if args.verbose:
        print(f"[*] Parsed {len(entries)} requests", file=sys.stderr)
    
    output = {
        'meta': {
            'source_file': args.input,
            'source_type': 'burp',
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
