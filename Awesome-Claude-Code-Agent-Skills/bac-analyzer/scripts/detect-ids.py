#!/usr/bin/env python3
"""
detect-ids.py - Detect ID patterns in parsed traffic
Identifies integers, UUIDs, base64, and other ID formats
"""

import json
import sys
import os
import re
import base64
import argparse
from datetime import datetime
from typing import Dict, List, Any, Set, Tuple

# Get script directory for loading config files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LIB_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'lib')


def load_patterns() -> Dict:
    """Load ID patterns from config."""
    patterns_file = os.path.join(LIB_DIR, 'patterns.json')
    if os.path.exists(patterns_file):
        with open(patterns_file, 'r') as f:
            return json.load(f)
    return {}


def load_high_value_params() -> Set[str]:
    """Load high-value parameter names."""
    params_file = os.path.join(LIB_DIR, 'high-value-params.txt')
    params = set()
    if os.path.exists(params_file):
        with open(params_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split('|')
                    params.add(parts[0].lower())
    return params


def detect_id_type(value: str, patterns: Dict) -> List[Dict]:
    """Detect what type of ID a value might be."""
    matches = []
    value_str = str(value)
    
    id_patterns = patterns.get('id_patterns', {})
    
    for pattern_name, pattern_info in id_patterns.items():
        regex = pattern_info.get('regex', '')
        if regex:
            try:
                if re.fullmatch(regex, value_str, re.IGNORECASE):
                    matches.append({
                        'type': pattern_name,
                        'value': value_str,
                        'risk': pattern_info.get('risk', 'medium'),
                        'notes': pattern_info.get('notes', '')
                    })
            except:
                pass
    
    return matches


def try_base64_decode(value: str) -> Tuple[bool, str]:
    """Try to base64 decode a value."""
    if len(value) < 4:
        return False, ''
    
    try:
        # Add padding if needed
        padded = value + '=' * (4 - len(value) % 4) if len(value) % 4 else value
        decoded = base64.b64decode(padded).decode('utf-8', errors='strict')
        # Check if decoded value looks like data (not binary garbage)
        if decoded.isprintable() or re.match(r'^[\w\-_./]+$', decoded):
            return True, decoded
    except:
        pass
    
    # Try URL-safe base64
    try:
        value_std = value.replace('-', '+').replace('_', '/')
        padded = value_std + '=' * (4 - len(value_std) % 4) if len(value_std) % 4 else value_std
        decoded = base64.b64decode(padded).decode('utf-8', errors='strict')
        if decoded.isprintable() or re.match(r'^[\w\-_./]+$', decoded):
            return True, decoded
    except:
        pass
    
    return False, ''


def extract_ids_from_path(path: str, patterns: Dict) -> List[Dict]:
    """Extract potential IDs from URL path."""
    ids = []
    path_patterns = patterns.get('path_patterns', {})
    
    # Split path into segments
    segments = [s for s in path.split('/') if s]
    
    for i, segment in enumerate(segments):
        # Check against ID patterns
        matches = detect_id_type(segment, patterns)
        if matches:
            for match in matches:
                ids.append({
                    'location': 'path',
                    'segment_index': i,
                    'resource_type': segments[i-1] if i > 0 else None,
                    **match
                })
        
        # Check for base64 encoded IDs
        is_b64, decoded = try_base64_decode(segment)
        if is_b64:
            nested_matches = detect_id_type(decoded, patterns)
            ids.append({
                'location': 'path',
                'segment_index': i,
                'type': 'base64_encoded',
                'value': segment,
                'decoded': decoded,
                'nested_ids': nested_matches,
                'risk': 'high',
                'notes': 'Base64 encoded - may hide sequential ID'
            })
    
    # Check path patterns
    for pattern_name, pattern_info in path_patterns.items():
        regex = pattern_info.get('regex', '')
        if regex:
            try:
                match = re.search(regex, path, re.IGNORECASE)
                if match:
                    ids.append({
                        'location': 'path_pattern',
                        'pattern': pattern_name,
                        'groups': match.groups(),
                        'risk': pattern_info.get('risk', 'medium'),
                        'description': pattern_info.get('description', '')
                    })
            except:
                pass
    
    return ids


def extract_ids_from_params(params: Dict, high_value: Set, patterns: Dict) -> List[Dict]:
    """Extract potential IDs from query/body parameters."""
    ids = []
    
    for key, value in params.items():
        values = value if isinstance(value, list) else [value]
        
        for v in values:
            v_str = str(v)
            
            # Check if high-value param
            is_high_value = key.lower() in high_value
            
            # Check ID patterns
            matches = detect_id_type(v_str, patterns)
            
            if matches or is_high_value:
                ids.append({
                    'location': 'parameter',
                    'param_name': key,
                    'value': v_str,
                    'is_high_value_param': is_high_value,
                    'id_types': matches,
                    'risk': 'critical' if is_high_value else (matches[0]['risk'] if matches else 'medium')
                })
            
            # Check for base64
            is_b64, decoded = try_base64_decode(v_str)
            if is_b64 and len(decoded) > 2:
                ids.append({
                    'location': 'parameter',
                    'param_name': key,
                    'type': 'base64_encoded',
                    'value': v_str,
                    'decoded': decoded,
                    'risk': 'high'
                })
    
    return ids


def extract_ids_from_body(body: Any, high_value: Set, patterns: Dict, prefix: str = '') -> List[Dict]:
    """Extract potential IDs from request body."""
    ids = []
    
    if isinstance(body, dict):
        for key, value in body.items():
            full_key = f"{prefix}.{key}" if prefix else key
            
            if isinstance(value, (dict, list)):
                ids.extend(extract_ids_from_body(value, high_value, patterns, full_key))
            else:
                v_str = str(value)
                is_high_value = key.lower() in high_value
                matches = detect_id_type(v_str, patterns)
                
                if matches or is_high_value:
                    ids.append({
                        'location': 'body',
                        'json_path': full_key,
                        'value': v_str,
                        'is_high_value_param': is_high_value,
                        'id_types': matches,
                        'risk': 'critical' if is_high_value else (matches[0]['risk'] if matches else 'medium')
                    })
    
    elif isinstance(body, list):
        for i, item in enumerate(body):
            ids.extend(extract_ids_from_body(item, high_value, patterns, f"{prefix}[{i}]"))
    
    return ids


def detect_framework(entry: Dict, patterns: Dict) -> List[str]:
    """Detect framework indicators."""
    frameworks = []
    framework_indicators = patterns.get('framework_indicators', {})
    
    # Combine all text to search
    search_text = json.dumps(entry, default=str).lower()
    
    for framework_name, info in framework_indicators.items():
        for pattern in info.get('patterns', []):
            if pattern.lower() in search_text:
                frameworks.append({
                    'name': framework_name,
                    'indicator': pattern,
                    'action': info.get('action', '')
                })
                break
    
    return frameworks


def analyze_entry(entry: Dict, patterns: Dict, high_value: Set) -> Dict:
    """Analyze a single traffic entry for IDs."""
    ids = []
    
    # Extract from path
    path_ids = extract_ids_from_path(entry.get('path', ''), patterns)
    ids.extend(path_ids)
    
    # Extract from query params
    param_ids = extract_ids_from_params(entry.get('query_params', {}), high_value, patterns)
    ids.extend(param_ids)
    
    # Extract from body
    body = entry.get('body')
    if body and isinstance(body, dict):
        body_ids = extract_ids_from_body(body, high_value, patterns)
        ids.extend(body_ids)
    
    # Detect frameworks
    frameworks = detect_framework(entry, patterns)
    
    # Calculate overall risk
    risks = [id_info.get('risk', 'low') for id_info in ids]
    risk_priority = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
    max_risk = 'low'
    for r in risks:
        if risk_priority.get(r, 0) > risk_priority.get(max_risk, 0):
            max_risk = r
    
    return {
        'url': entry.get('url', ''),
        'method': entry.get('method', ''),
        'path': entry.get('path', ''),
        'response_status': entry.get('response', {}).get('status', 0),
        'detected_ids': ids,
        'frameworks': frameworks,
        'overall_risk': max_risk,
        'id_count': len(ids),
        'has_high_value_params': any(id_info.get('is_high_value_param') for id_info in ids)
    }


def main():
    parser = argparse.ArgumentParser(description='Detect ID patterns in parsed traffic')
    parser.add_argument('input', help='Parsed traffic JSON file')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--min-risk', choices=['low', 'medium', 'high', 'critical'], 
                       default='low', help='Minimum risk level to include')
    
    args = parser.parse_args()
    
    # Load configs
    patterns = load_patterns()
    high_value = load_high_value_params()
    
    if args.verbose:
        print(f"[*] Loaded {len(patterns.get('id_patterns', {}))} ID patterns", file=sys.stderr)
        print(f"[*] Loaded {len(high_value)} high-value parameters", file=sys.stderr)
    
    # Load input
    with open(args.input, 'r') as f:
        data = json.load(f)
    
    entries = data.get('entries', [])
    
    if args.verbose:
        print(f"[*] Analyzing {len(entries)} requests...", file=sys.stderr)
    
    # Analyze entries
    risk_priority = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
    min_risk_val = risk_priority.get(args.min_risk, 1)
    
    results = []
    for entry in entries:
        result = analyze_entry(entry, patterns, high_value)
        if result['id_count'] > 0:
            if risk_priority.get(result['overall_risk'], 0) >= min_risk_val:
                results.append(result)
    
    # Sort by risk
    results.sort(key=lambda x: risk_priority.get(x['overall_risk'], 0), reverse=True)
    
    if args.verbose:
        print(f"[*] Found {len(results)} endpoints with IDs", file=sys.stderr)
        by_risk = {}
        for r in results:
            by_risk[r['overall_risk']] = by_risk.get(r['overall_risk'], 0) + 1
        for risk, count in sorted(by_risk.items(), key=lambda x: risk_priority.get(x[0], 0), reverse=True):
            print(f"    {risk}: {count}", file=sys.stderr)
    
    output = {
        'meta': {
            'source_file': args.input,
            'analyzed_at': datetime.now().isoformat(),
            'total_endpoints_with_ids': len(results),
            'by_risk': {r['overall_risk']: sum(1 for x in results if x['overall_risk'] == r['overall_risk']) for r in results}
        },
        'endpoints': results
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
