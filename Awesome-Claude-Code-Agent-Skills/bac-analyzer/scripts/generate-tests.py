#!/usr/bin/env python3
"""
generate-tests.py - Generate BAC/IDOR test cases from analysis results
Creates auth-switch, method switch, parameter pollution, and 403 bypass tests
"""

import json
import sys
import os
import argparse
from datetime import datetime
from typing import Dict, List, Any
from urllib.parse import urlencode, urlparse, urlunparse, parse_qs

# Get script directory for loading config files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PAYLOADS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'payloads')
DATA_DIR = os.path.expanduser('~/.openclaw/workspace/data/idor-research')


def load_payloads(filename: str) -> List[str]:
    """Load payloads from file."""
    payloads = []
    filepath = os.path.join(PAYLOADS_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    payloads.append(line)
    return payloads


def load_research_techniques() -> Dict:
    """Load techniques from research data."""
    techniques = {}
    
    # Load practitioner techniques
    tech_file = os.path.join(DATA_DIR, 'practitioner-techniques.json')
    if os.path.exists(tech_file):
        with open(tech_file, 'r') as f:
            techniques['practitioner'] = json.load(f)
    
    # Load 403 bypass research
    bypass_file = os.path.join(DATA_DIR, '403-bypass-research.json')
    if os.path.exists(bypass_file):
        with open(bypass_file, 'r') as f:
            techniques['bypass'] = json.load(f)
    
    return techniques


def generate_auth_switch_tests(endpoint: Dict, contexts: List[Dict]) -> List[Dict]:
    """Generate auth-switch test cases."""
    tests = []
    
    if len(contexts) < 2:
        # Can't do auth switch with only one context
        return tests
    
    # For each endpoint, try each auth context
    for i, context_a in enumerate(contexts):
        for j, context_b in enumerate(contexts):
            if i >= j:
                continue  # Skip same context and duplicates
            
            test = {
                'type': 'auth_switch',
                'description': f"Access with context {context_b['id'][:8]} instead of {context_a['id'][:8]}",
                'url': endpoint['url'],
                'method': endpoint['method'],
                'original_context': context_a['id'],
                'test_context': context_b['id'],
                'auth_header': None,
                'cookies': {},
                'risk': 'critical' if endpoint.get('has_high_value_params') else 'high'
            }
            
            # Set auth values from test context
            sample_auth = context_b.get('sample_auth', {})
            if sample_auth.get('bearer_token'):
                test['auth_header'] = f"Bearer {sample_auth['bearer_token']}"
            test['cookies'] = sample_auth.get('cookies', {})
            test['custom_headers'] = sample_auth.get('custom_headers', {})
            
            tests.append(test)
    
    return tests


def generate_method_switch_tests(endpoint: Dict) -> List[Dict]:
    """Generate HTTP method switching test cases."""
    tests = []
    
    all_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
    current_method = endpoint.get('method', 'GET').upper()
    
    for method in all_methods:
        if method != current_method:
            tests.append({
                'type': 'method_switch',
                'description': f"Try {method} instead of {current_method}",
                'url': endpoint['url'],
                'method': method,
                'original_method': current_method,
                'risk': 'high' if method in ['DELETE', 'PUT', 'PATCH'] else 'medium'
            })
    
    return tests


def generate_param_pollution_tests(endpoint: Dict) -> List[Dict]:
    """Generate parameter pollution test cases."""
    tests = []
    
    detected_ids = endpoint.get('detected_ids', [])
    
    for id_info in detected_ids:
        if id_info.get('location') == 'parameter':
            param_name = id_info.get('param_name')
            original_value = id_info.get('value')
            
            # Duplicate parameter
            tests.append({
                'type': 'param_pollution',
                'description': f"Duplicate {param_name} parameter with different value",
                'url': endpoint['url'],
                'method': endpoint['method'],
                'param_name': param_name,
                'payloads': [
                    f"{param_name}={original_value}&{param_name}=ATTACKER_ID",
                    f"{param_name}[]=ATTACKER_ID&{param_name}[]={original_value}",
                    f"{param_name}={original_value},{param_name}=ATTACKER_ID"
                ],
                'risk': 'high'
            })
            
            # JSON pollution for body params
            if id_info.get('location') == 'body':
                tests.append({
                    'type': 'json_pollution',
                    'description': f"JSON parameter pollution on {param_name}",
                    'url': endpoint['url'],
                    'method': endpoint['method'],
                    'json_path': id_info.get('json_path', param_name),
                    'payloads': [
                        f'{{"{param_name}": "ATTACKER_ID", "{param_name}": "{original_value}"}}',
                        f'{{"{param_name}": ["{original_value}", "ATTACKER_ID"]}}',
                        f'{{"{param_name}": {{"{param_name}": "ATTACKER_ID"}}}}'
                    ],
                    'risk': 'high'
                })
    
    return tests


def generate_403_bypass_tests(endpoint: Dict) -> List[Dict]:
    """Generate 403 bypass test cases."""
    tests = []
    
    response_status = endpoint.get('response_status', 0)
    if response_status != 403:
        return tests
    
    # Load bypass payloads
    url_payloads = load_payloads('403-bypass.txt')
    header_payloads = load_payloads('headers.txt')
    
    parsed = urlparse(endpoint['url'])
    path = parsed.path
    
    # URL manipulation tests
    for payload_template in url_payloads[:30]:  # Limit to top 30
        new_path = payload_template.replace('{path}', path.rstrip('/'))
        new_path = new_path.replace('{PATH}', path.upper().rstrip('/'))
        new_path = new_path.replace('{Path}', path.title().rstrip('/'))
        
        new_url = urlunparse((
            parsed.scheme, parsed.netloc, new_path,
            parsed.params, parsed.query, parsed.fragment
        ))
        
        tests.append({
            'type': '403_bypass_url',
            'description': f"URL manipulation: {new_path}",
            'url': new_url,
            'method': endpoint['method'],
            'original_url': endpoint['url'],
            'risk': 'high'
        })
    
    # Header injection tests
    for header_line in header_payloads[:20]:  # Limit to top 20
        if ':' in header_line:
            header_name, header_value = header_line.split(':', 1)
            tests.append({
                'type': '403_bypass_header',
                'description': f"Header injection: {header_name}",
                'url': endpoint['url'],
                'method': endpoint['method'],
                'inject_header': {header_name.strip(): header_value.strip()},
                'risk': 'high'
            })
    
    return tests


def generate_actuator_tests(endpoint: Dict) -> List[Dict]:
    """Generate Spring Boot actuator probe tests."""
    tests = []
    
    # Check if Spring Boot detected
    frameworks = endpoint.get('frameworks', [])
    is_spring = any(f.get('name') == 'spring_boot' for f in frameworks)
    
    if not is_spring:
        return tests
    
    # Load actuator endpoints
    actuator_endpoints = load_payloads('actuators.txt')
    
    parsed = urlparse(endpoint['url'])
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    
    for actuator_path in actuator_endpoints:
        tests.append({
            'type': 'actuator_probe',
            'description': f"Spring Boot actuator: /{actuator_path}",
            'url': f"{base_url}/{actuator_path}",
            'method': 'GET',
            'risk': 'critical' if 'heapdump' in actuator_path or 'env' in actuator_path else 'high'
        })
    
    return tests


def generate_id_manipulation_tests(endpoint: Dict) -> List[Dict]:
    """Generate ID manipulation test cases."""
    tests = []
    
    detected_ids = endpoint.get('detected_ids', [])
    
    for id_info in detected_ids:
        id_type = id_info.get('type') or (id_info.get('id_types', [{}])[0].get('type') if id_info.get('id_types') else None)
        value = id_info.get('value', '')
        
        if id_type == 'integer' and value.isdigit():
            original_int = int(value)
            test_values = [
                str(original_int + 1),
                str(original_int - 1),
                str(original_int + 100),
                '1',
                '0',
                '-1'
            ]
            
            tests.append({
                'type': 'id_manipulation',
                'description': f"Integer ID iteration on {id_info.get('param_name', 'path')}",
                'url': endpoint['url'],
                'method': endpoint['method'],
                'original_id': value,
                'test_values': test_values,
                'location': id_info.get('location'),
                'risk': 'critical' if id_info.get('is_high_value_param') else 'high'
            })
        
        elif id_type == 'base64_encoded':
            decoded = id_info.get('decoded', '')
            tests.append({
                'type': 'base64_id',
                'description': f"Base64 encoded ID - decoded: {decoded}",
                'url': endpoint['url'],
                'method': endpoint['method'],
                'original_encoded': value,
                'decoded': decoded,
                'note': 'Encode ATTACKER_ID with base64 and replace',
                'risk': 'high'
            })
    
    return tests


def generate_curl_command(test: Dict, base_headers: Dict = None) -> str:
    """Generate a curl command for a test case."""
    parts = ['curl', '-s']
    
    # Method
    method = test.get('method', 'GET')
    if method != 'GET':
        parts.append(f"-X {method}")
    
    # Headers
    headers = base_headers or {}
    if test.get('auth_header'):
        headers['Authorization'] = test['auth_header']
    if test.get('cookies'):
        cookie_str = '; '.join(f"{k}={v}" for k, v in test['cookies'].items())
        headers['Cookie'] = cookie_str
    if test.get('inject_header'):
        headers.update(test['inject_header'])
    if test.get('custom_headers'):
        headers.update(test['custom_headers'])
    
    for name, value in headers.items():
        parts.append(f'-H "{name}: {value}"')
    
    # URL
    parts.append(f'"{test["url"]}"')
    
    return ' \\\n  '.join(parts)


def main():
    parser = argparse.ArgumentParser(description='Generate BAC/IDOR test cases')
    parser.add_argument('ids_file', help='ID detection results JSON')
    parser.add_argument('auth_file', nargs='?', help='Auth context results JSON (optional)')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--curl', action='store_true', help='Include curl commands')
    parser.add_argument('--min-risk', choices=['low', 'medium', 'high', 'critical'],
                       default='medium', help='Minimum risk level for tests')
    
    args = parser.parse_args()
    
    # Load ID detection results
    with open(args.ids_file, 'r') as f:
        ids_data = json.load(f)
    
    # Load auth contexts if provided
    contexts = []
    if args.auth_file:
        with open(args.auth_file, 'r') as f:
            auth_data = json.load(f)
            contexts = auth_data.get('contexts', [])
    
    if args.verbose:
        print(f"[*] Loaded {len(ids_data.get('endpoints', []))} endpoints with IDs", file=sys.stderr)
        print(f"[*] Loaded {len(contexts)} auth contexts", file=sys.stderr)
    
    # Load research techniques
    research = load_research_techniques()
    
    # Generate tests
    all_tests = []
    risk_priority = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
    min_risk_val = risk_priority.get(args.min_risk, 2)
    
    for endpoint in ids_data.get('endpoints', []):
        endpoint_tests = []
        
        # Auth switch tests
        endpoint_tests.extend(generate_auth_switch_tests(endpoint, contexts))
        
        # Method switch tests
        endpoint_tests.extend(generate_method_switch_tests(endpoint))
        
        # Parameter pollution tests
        endpoint_tests.extend(generate_param_pollution_tests(endpoint))
        
        # 403 bypass tests
        endpoint_tests.extend(generate_403_bypass_tests(endpoint))
        
        # Actuator tests
        endpoint_tests.extend(generate_actuator_tests(endpoint))
        
        # ID manipulation tests
        endpoint_tests.extend(generate_id_manipulation_tests(endpoint))
        
        # Filter by risk
        filtered_tests = [
            t for t in endpoint_tests
            if risk_priority.get(t.get('risk', 'low'), 0) >= min_risk_val
        ]
        
        # Add curl commands if requested
        if args.curl:
            for test in filtered_tests:
                test['curl'] = generate_curl_command(test)
        
        # Group tests by endpoint
        if filtered_tests:
            all_tests.append({
                'endpoint': {
                    'url': endpoint['url'],
                    'method': endpoint['method'],
                    'path': endpoint['path'],
                    'overall_risk': endpoint['overall_risk']
                },
                'tests': filtered_tests,
                'test_count': len(filtered_tests)
            })
    
    # Sort by endpoint risk
    all_tests.sort(key=lambda x: risk_priority.get(x['endpoint']['overall_risk'], 0), reverse=True)
    
    # Calculate summary
    total_tests = sum(ep['test_count'] for ep in all_tests)
    by_type = {}
    for ep in all_tests:
        for test in ep['tests']:
            test_type = test['type']
            by_type[test_type] = by_type.get(test_type, 0) + 1
    
    if args.verbose:
        print(f"\n[*] Generated {total_tests} test cases:", file=sys.stderr)
        for test_type, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
            print(f"    {test_type}: {count}", file=sys.stderr)
    
    output = {
        'meta': {
            'source_ids': args.ids_file,
            'source_auth': args.auth_file,
            'generated_at': datetime.now().isoformat(),
            'total_test_cases': total_tests,
            'endpoints_tested': len(all_tests),
            'tests_by_type': by_type
        },
        'test_groups': all_tests
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
