#!/usr/bin/env python3
"""
extract-auth.py - Extract authentication contexts from parsed traffic
Groups requests by auth context for IDOR testing
"""

import json
import sys
import os
import re
import hashlib
import argparse
from datetime import datetime
from typing import Dict, List, Set, Any

# Get script directory for loading config files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LIB_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'lib')


def load_auth_indicators() -> Dict:
    """Load auth indicators from config."""
    indicators_file = os.path.join(LIB_DIR, 'auth-indicators.txt')
    indicators = {'headers': {}, 'cookies': {}, 'params': {}}
    
    if os.path.exists(indicators_file):
        with open(indicators_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split('|')
                    if len(parts) >= 3:
                        name, ind_type, priority = parts[:3]
                        notes = parts[3] if len(parts) > 3 else ''
                        
                        if ind_type == 'header':
                            indicators['headers'][name.lower()] = {'name': name, 'priority': priority, 'notes': notes}
                        elif ind_type == 'cookie':
                            indicators['cookies'][name.lower()] = {'name': name, 'priority': priority, 'notes': notes}
                        elif ind_type == 'param':
                            indicators['params'][name.lower()] = {'name': name, 'priority': priority, 'notes': notes}
    
    return indicators


def extract_bearer_token(auth_header: str) -> str:
    """Extract token from Authorization header."""
    if auth_header.lower().startswith('bearer '):
        return auth_header[7:].strip()
    return auth_header


def decode_jwt_payload(token: str) -> Dict:
    """Decode JWT payload without verification."""
    import base64
    
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        
        payload = parts[1]
        # Add padding
        payload += '=' * (4 - len(payload) % 4) if len(payload) % 4 else ''
        payload = payload.replace('-', '+').replace('_', '/')
        
        decoded = base64.b64decode(payload).decode('utf-8')
        return json.loads(decoded)
    except:
        return {}


def generate_context_id(auth_values: Dict) -> str:
    """Generate a unique ID for an auth context."""
    # Create a deterministic hash of auth values
    sorted_items = sorted(auth_values.items())
    context_str = json.dumps(sorted_items, sort_keys=True)
    return hashlib.sha256(context_str.encode()).hexdigest()[:16]


def extract_auth_from_entry(entry: Dict, indicators: Dict) -> Dict:
    """Extract authentication context from a request."""
    auth_context = {
        'bearer_token': None,
        'cookies': {},
        'api_keys': {},
        'custom_headers': {},
        'params': {}
    }
    
    headers = entry.get('headers', {})
    cookies = entry.get('cookies', {})
    query_params = entry.get('query_params', {})
    
    # Check Authorization header
    for header_name, header_value in headers.items():
        if header_name.lower() == 'authorization':
            auth_context['bearer_token'] = extract_bearer_token(header_value)
        
        # Check against known auth headers
        if header_name.lower() in indicators['headers']:
            auth_context['custom_headers'][header_name] = header_value
    
    # Check cookies
    for cookie_name, cookie_value in cookies.items():
        if cookie_name.lower() in indicators['cookies']:
            auth_context['cookies'][cookie_name] = cookie_value
    
    # Check query params for API keys
    for param_name, param_value in query_params.items():
        if param_name.lower() in indicators['params']:
            auth_context['params'][param_name] = param_value
    
    return auth_context


def analyze_auth_context(auth_context: Dict) -> Dict:
    """Analyze auth context for identity information."""
    analysis = {
        'has_auth': False,
        'auth_type': None,
        'user_identifier': None,
        'session_id': None,
        'jwt_claims': {}
    }
    
    # Check bearer token
    if auth_context.get('bearer_token'):
        analysis['has_auth'] = True
        token = auth_context['bearer_token']
        
        # Check if JWT
        if token.startswith('eyJ'):
            analysis['auth_type'] = 'jwt'
            claims = decode_jwt_payload(token)
            analysis['jwt_claims'] = claims
            
            # Extract user identifier from common JWT claims
            for claim in ['sub', 'user_id', 'userId', 'uid', 'email', 'username']:
                if claim in claims:
                    analysis['user_identifier'] = claims[claim]
                    break
        else:
            analysis['auth_type'] = 'bearer'
    
    # Check session cookies
    session_cookies = ['jsessionid', 'phpsessid', 'asp.net_sessionid', 'connect.sid', 'session', 'sessionid']
    for cookie_name, cookie_value in auth_context.get('cookies', {}).items():
        if cookie_name.lower() in session_cookies:
            analysis['has_auth'] = True
            analysis['auth_type'] = analysis['auth_type'] or 'session'
            analysis['session_id'] = cookie_value[:16] + '...' if len(cookie_value) > 16 else cookie_value
            break
    
    # Check API keys
    if auth_context.get('api_keys') or auth_context.get('params'):
        analysis['has_auth'] = True
        analysis['auth_type'] = analysis['auth_type'] or 'api_key'
    
    # Check custom auth headers
    if auth_context.get('custom_headers'):
        analysis['has_auth'] = True
        analysis['auth_type'] = analysis['auth_type'] or 'custom'
    
    return analysis


def main():
    parser = argparse.ArgumentParser(description='Extract auth contexts from parsed traffic')
    parser.add_argument('input', help='Parsed traffic JSON file')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Load indicators
    indicators = load_auth_indicators()
    
    if args.verbose:
        print(f"[*] Loaded auth indicators:", file=sys.stderr)
        print(f"    Headers: {len(indicators['headers'])}", file=sys.stderr)
        print(f"    Cookies: {len(indicators['cookies'])}", file=sys.stderr)
        print(f"    Params: {len(indicators['params'])}", file=sys.stderr)
    
    # Load input
    with open(args.input, 'r') as f:
        data = json.load(f)
    
    entries = data.get('entries', [])
    
    if args.verbose:
        print(f"[*] Analyzing {len(entries)} requests for auth contexts...", file=sys.stderr)
    
    # Extract auth contexts
    contexts = {}  # context_id -> context info
    entry_contexts = []  # mapping of entry to context
    
    for i, entry in enumerate(entries):
        auth_context = extract_auth_from_entry(entry, indicators)
        analysis = analyze_auth_context(auth_context)
        
        if analysis['has_auth']:
            # Generate context ID based on auth values
            auth_values = {
                'bearer': auth_context['bearer_token'][:50] if auth_context['bearer_token'] else None,
                'cookies': {k: v[:20] for k, v in auth_context['cookies'].items()},
                'headers': {k: v[:20] for k, v in auth_context['custom_headers'].items()},
                'params': auth_context['params']
            }
            
            context_id = generate_context_id(auth_values)
            
            if context_id not in contexts:
                contexts[context_id] = {
                    'id': context_id,
                    'auth_type': analysis['auth_type'],
                    'user_identifier': analysis['user_identifier'],
                    'session_id': analysis['session_id'],
                    'jwt_claims': analysis['jwt_claims'],
                    'sample_auth': auth_context,
                    'request_count': 0,
                    'endpoints': []
                }
            
            contexts[context_id]['request_count'] += 1
            contexts[context_id]['endpoints'].append({
                'url': entry.get('url', ''),
                'method': entry.get('method', ''),
                'path': entry.get('path', '')
            })
            
            entry_contexts.append({
                'entry_index': i,
                'url': entry.get('url', ''),
                'context_id': context_id
            })
        else:
            entry_contexts.append({
                'entry_index': i,
                'url': entry.get('url', ''),
                'context_id': None
            })
    
    # Deduplicate endpoints per context
    for context_id, context in contexts.items():
        seen = set()
        unique_endpoints = []
        for ep in context['endpoints']:
            key = (ep['method'], ep['path'])
            if key not in seen:
                seen.add(key)
                unique_endpoints.append(ep)
        context['endpoints'] = unique_endpoints
        context['unique_endpoint_count'] = len(unique_endpoints)
    
    if args.verbose:
        print(f"[*] Found {len(contexts)} unique auth contexts", file=sys.stderr)
        for ctx_id, ctx in contexts.items():
            print(f"    Context {ctx_id[:8]}...: {ctx['auth_type']} - {ctx['request_count']} requests", file=sys.stderr)
            if ctx['user_identifier']:
                print(f"        User: {ctx['user_identifier']}", file=sys.stderr)
    
    output = {
        'meta': {
            'source_file': args.input,
            'analyzed_at': datetime.now().isoformat(),
            'total_contexts': len(contexts),
            'authenticated_requests': sum(1 for ec in entry_contexts if ec['context_id']),
            'unauthenticated_requests': sum(1 for ec in entry_contexts if not ec['context_id'])
        },
        'contexts': list(contexts.values()),
        'entry_mapping': entry_contexts
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
