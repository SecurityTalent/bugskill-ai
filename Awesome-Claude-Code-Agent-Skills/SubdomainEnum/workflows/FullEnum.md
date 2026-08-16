# FullEnum Workflow

Comprehensive subdomain enumeration using all TBHM techniques.

## When to Use

- Deep reconnaissance on high-value targets
- Bug bounty programs with wide scope
- When you need maximum coverage

## Prerequisites

- All tools installed (see `ToolsInstall.md`)
- API keys configured
- Fresh DNS resolvers
- **Wordlist folder location** (will ask user)

## Workflow Steps

### Step 1: Setup

```bash
TARGET="{target}"
OUTPUT_DIR="./${TARGET}-enum"
mkdir -p $OUTPUT_DIR
```

**ASK USER:** What is the path to your wordlist folder?

### Step 2: Passive Enumeration

#### 2a. Subfinder (all sources)
```bash
subfinder -d $TARGET -all -o $OUTPUT_DIR/subfinder.txt
```

#### 2b. GitHub Subdomains
```bash
github-subdomains -t $(cat ~/.config/github-token) -d $TARGET -o $OUTPUT_DIR/github.txt
```

#### 2c. Shodan Subdomains
```bash
shosubgo -d $TARGET -s $(cat ~/.config/shodan-key) > $OUTPUT_DIR/shodan.txt
```

### Step 3: Merge Passive Results

```bash
cat $OUTPUT_DIR/subfinder.txt $OUTPUT_DIR/github.txt $OUTPUT_DIR/shodan.txt | sort -u > $OUTPUT_DIR/passive-all.txt
```

### Step 4: DNS Brute Force

```bash
# Get fresh resolvers
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o /tmp/resolvers.txt

# Brute force with wordlist
puredns bruteforce {WORDLIST_PATH}/subdomains.txt $TARGET -r /tmp/resolvers.txt -o $OUTPUT_DIR/brute.txt
```

### Step 5: Permutation Scanning

```bash
# Generate permutations from existing subdomains
cat $OUTPUT_DIR/passive-all.txt | dnsgen - > $OUTPUT_DIR/permutations-raw.txt

# Resolve permutations
puredns resolve $OUTPUT_DIR/permutations-raw.txt -r /tmp/resolvers.txt -o $OUTPUT_DIR/permutations.txt
```

### Step 6: Final Merge

```bash
cat $OUTPUT_DIR/passive-all.txt $OUTPUT_DIR/brute.txt $OUTPUT_DIR/permutations.txt | sort -u > $OUTPUT_DIR/all-subdomains.txt
```

### Step 7: Probe with HTTPX

```bash
cat $OUTPUT_DIR/all-subdomains.txt | httpx -status-code -title -tech-detect -content-length -no-color -o $OUTPUT_DIR/live-detailed.txt
cat $OUTPUT_DIR/all-subdomains.txt | httpx -o $OUTPUT_DIR/live.txt
```

### Step 8: Final Stats

```bash
echo "=== FullEnum Complete ==="
echo "Passive sources: $(wc -l < $OUTPUT_DIR/passive-all.txt)"
echo "Brute force: $(wc -l < $OUTPUT_DIR/brute.txt)"
echo "Permutations: $(wc -l < $OUTPUT_DIR/permutations.txt)"
echo "Total unique: $(wc -l < $OUTPUT_DIR/all-subdomains.txt)"
echo "Live hosts: $(wc -l < $OUTPUT_DIR/live.txt)"
```

## Output Files

```
{target}-enum/
├── subfinder.txt        # Subfinder results
├── github.txt           # GitHub results
├── shodan.txt           # Shodan results
├── passive-all.txt      # Merged passive
├── brute.txt            # Brute force results
├── permutations.txt     # Permutation results
├── all-subdomains.txt   # Everything merged
├── live.txt             # Live webservers
└── live-detailed.txt    # Live with details
```

## Recommended Wordlists

Ask user for wordlist folder, then use:

| Wordlist | Size | Use Case |
|----------|------|----------|
| `subdomains-top1million-5000.txt` | 5K | Quick brute |
| `subdomains-top1million-20000.txt` | 20K | Standard |
| `jhaddix-all.txt` | 2M+ | Comprehensive |
| `n0kovo-subdomains.txt` | 3M+ | Maximum coverage |

## Time Estimates

| Target Size | Passive | Brute (20k) | Permutation | Total |
|-------------|---------|-------------|-------------|-------|
| Small | 1-2 min | 5-10 min | 5-10 min | ~20 min |
| Medium | 2-5 min | 10-20 min | 15-30 min | ~45 min |
| Large | 5-10 min | 20-40 min | 30-60 min | ~90 min |
