# QuickEnum Workflow

Fast passive-only subdomain enumeration. Completes in 2-5 minutes.

## When to Use

- Initial reconnaissance on a new target
- Quick scope expansion
- When you need results fast

## Prerequisites

- `subfinder` installed with API keys configured
- `httpx` installed

## Workflow Steps

### Step 1: Run Subfinder

```bash
subfinder -d {target} -all -o {target}-subdomains.txt
```

### Step 2: Probe with HTTPX

```bash
cat {target}-subdomains.txt | httpx -status-code -title -tech-detect -no-color -o {target}-live-detailed.txt
cat {target}-subdomains.txt | httpx -o {target}-live.txt
```

### Step 3: Stats

```bash
echo "Subdomains: $(wc -l < {target}-subdomains.txt)"
echo "Live: $(wc -l < {target}-live.txt)"
```

## Output Files

| File | Contents |
|------|----------|
| `{target}-subdomains.txt` | All subdomains |
| `{target}-live.txt` | Live webservers |
| `{target}-live-detailed.txt` | Live with status/title/tech |

## One-Liner

```bash
subfinder -d {target} -all -silent | httpx -status-code -title -tech-detect -o {target}-quick.txt
```
