# PermutationEnum Workflow

Generate and resolve subdomain permutations from existing discoveries.

## When to Use

- After passive enumeration reveals naming patterns
- Targets with predictable naming (dev1, dev2, staging-api, etc.)
- When brute force wordlists miss custom patterns

## Concept (from TBHM)

Admins often name subdomains with patterns:

```
dev.company.com     ->  dev1.company.com
                        dev2.company.com
                        dev-1.company.com
                        dev.1.company.com
                        staging-dev.company.com
```

Tools like `dnsgen` and `alterx` recognize these patterns and generate variations.

## Prerequisites

- Existing subdomain list (from passive enum)
- `dnsgen` or `alterx` installed
- `puredns` with fresh resolvers

## Workflow Steps

### Step 1: Get Fresh Resolvers

```bash
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o /tmp/resolvers.txt
```

### Step 2: Generate Permutations with Dnsgen

```bash
TARGET="{target}"

# Generate permutations (can be millions of lines)
cat {target}-subdomains.txt | dnsgen - > {target}-permutations-raw.txt

# Check size
wc -l {target}-permutations-raw.txt
```

### Step 3: Resolve Permutations

```bash
puredns resolve {target}-permutations-raw.txt -r /tmp/resolvers.txt -o {target}-permutations.txt
```

### Step 4: Find New Discoveries

```bash
# Compare to original list
comm -13 <(sort {target}-subdomains.txt) <(sort {target}-permutations.txt) > {target}-new-from-permutations.txt

echo "New subdomains from permutations: $(wc -l < {target}-new-from-permutations.txt)"
```

### Step 5: Probe New Discoveries

```bash
cat {target}-new-from-permutations.txt | httpx -status-code -title -o {target}-new-live.txt
```

## Alternative: Alterx (ProjectDiscovery)

Alterx is faster and has built-in patterns:

```bash
# Generate and resolve in one pipeline
cat {target}-subdomains.txt | alterx | puredns resolve -r /tmp/resolvers.txt -o {target}-alterx-results.txt
```

## Custom Patterns

Create custom patterns for target-specific naming:

```bash
# Create pattern file
cat > patterns.txt << 'EOF'
{{word}}-{{number}}
{{word}}{{number}}
{{word}}.{{number}}
staging-{{word}}
dev-{{word}}
{{word}}-prod
{{word}}-api
EOF

# Use with alterx
cat {target}-subdomains.txt | alterx -p patterns.txt | puredns resolve -r /tmp/resolvers.txt
```

## Output Files

| File | Contents |
|------|----------|
| `{target}-permutations-raw.txt` | All generated permutations |
| `{target}-permutations.txt` | Resolved permutations |
| `{target}-new-from-permutations.txt` | Only new discoveries |
| `{target}-new-live.txt` | New live webservers |

## Performance Tips

1. **Limit input** - Large subdomain lists = billions of permutations
2. **Use alterx** - Generally faster than dnsgen
3. **Increase threads** - `puredns resolve -t 100` for speed
4. **Fresh resolvers** - Critical for accuracy
