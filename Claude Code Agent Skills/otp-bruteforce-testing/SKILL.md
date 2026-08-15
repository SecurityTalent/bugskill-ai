---
name: otp-bruteforce-testing
description: Detect, validate, and exploit OTP (one-time password) brute-force vulnerabilities in phone/email verification, MFA, password-reset, and transaction-confirmation flows. Use when a target issues numeric one-time codes (4-8 digits via SMS/email), when OTP verification endpoints appear unthrottled, when reviewing authentication or account-recovery code, or when assessing rate limiting on verification APIs. Produces PoC scripts, response-oracle analysis, CVSS scoring, and remediation guidance.
---

# OTP Brute-Force Testing

Validate whether an OTP verification endpoint can be brute-forced: unlimited
attempts, no lockout, long TTL, weak entropy, or a response oracle that reveals
the correct code. Targets must be within the scope of the engagement you are
authorized to test.

## When to use
- Phone/email verification flows (e.g., "add phone number to profile")
- MFA / 2FA challenge steps and login-by-OTP
- Password reset and account recovery
- Transaction confirmation (payments, withdrawals, admin actions)
- Any endpoint that accepts a 4-8 digit numeric code and returns success/failure

## Core attack pattern (reference: HackerOne #3265780, CoinMate.io)
1. Trigger an OTP challenge, submit any code, and **intercept the verification
   request** (Burp proxy).
2. Brute-force the OTP space (100000–999999) with Burp Intruder or the bundled
   script.
3. Detect the valid OTP via a **response oracle** — in the CoinMate case, the
   response containing a valid OTP had a **Content-Length of 961 bytes** vs.
   ~150 for failures.
4. Replay the **original** intercepted request with the recovered OTP to
   complete the operation (the phone number is added to the profile).
5. Chain the impact: attacker-controlled phone number on the account → the
   number receives login/reset OTPs → **account takeover**.

## Phase 0 — Recon the OTP flow
- Map all OTP-issuing and OTP-verifying endpoints; note parameter names
  (`otp`, `code`, `token`, `verificationCode`), length (4/6/8 digits), format.
- Check whether the code is ever returned in responses, logs, or debug headers.
- Check OTP **entropy**: sequential, timestamp-derived, or weak-PRNG codes have
  a much smaller candidate space than the nominal digit range.
- Note whether the same OTP is reusable across accounts or across flows
  (verify vs. reset vs. login).

## Phase 1 — Baseline and response-oracle discovery
Send 10–20 wrong OTPs plus 1 valid OTP and diff the responses. Use the script's
probe mode to inspect a single attempt:

```bash
python3 scripts/otp_bruteforce.py --url https://target/api/verify-phone \
    --method POST \
    --headers '{"Content-Type":"application/json","Cookie":"session=abc"}' \
    --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
    --probe 123456
```

Signals to look for:
- **Content-Length** (e.g., valid = 961 bytes — the CoinMate oracle)
- **HTTP status** (200 vs 400/403)
- **Body markers** (`"verified": true`, new session token, redirect)
- **Timing** (valid code may take a different code path)
- **Set-Cookie / session mutation**

If no oracle is obvious, run the full sweep in auto mode: the valid OTP is
statistically the outlier bucket among otherwise uniform responses.

## Phase 2 — Rate-limit and lockout probing
- Fire 10–30 rapid wrong attempts. If you never see 429/403, CAPTCHA, lockout,
  or escalating delay, the endpoint is a brute-force candidate.
- Test throttling scope: limits keyed to **session/IP only** are bypassable via
  new sessions, IP rotation, or `X-Forwarded-For` spoofing — retest per account.
- Check lockout semantics: per-account, per-session, or global? Does a lockout
  also kill the legitimate user (DoS angle)?
- Test OTP **TTL and reuse**: does a code survive past expiry? Is it
  single-use? Does resending invalidate the previous code?

## Phase 3 — Brute-force automation
Use `scripts/otp_bruteforce.py`:

```bash
# Known oracle: valid responses are 961 bytes (the CoinMate signal)
python3 scripts/otp_bruteforce.py --url https://target/api/verify-phone \
    --method POST \
    --headers '{"Content-Type":"application/json","Cookie":"session=abc"}' \
    --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
    --oracle-length 961 --threads 10

# No oracle known: auto-detect the outlier response
python3 scripts/otp_bruteforce.py --url https://target/api/verify-phone \
    --method POST \
    --headers '{"Content-Type":"application/json","Cookie":"session=abc"}' \
    --body '{"phone":"+15551234567","otp":"{{OTP}}"}' \
    --range 100000-999999 --threads 20 --delay 0.05

# Route everything through Burp for visibility
python3 scripts/otp_bruteforce.py ... --proxy http://127.0.0.1:8080
```

Burp Intruder alternative (the original researcher's method):
- Positions: replace the OTP value with `§100000§`.
- Payload type: Numbers, 100000 to 999999, step 1, **min/max fraction digits =
  6**.
- Resource pool: 10–20 concurrent requests; watch for 429 and slow down.
- Grep-Match on the oracle signal (length column, marker, or status).
- On hit: copy the valid response, replay the **original** intercepted request
  with that OTP (Burp Repeater) to complete the action.

## Phase 4 — Confirmation and impact chaining
- Confirm the OTP on a **fresh replay** of the original request — this proves
  the finding end-to-end (the CoinMate report's Step 4). For single-use code
  flows, use `--confirm-trials 1` since the sweep may have consumed the code.
- Chain impacts and re-score:
  - Phone added to profile → OTP-based password reset → ATO
  - MFA bypass → session hijack on victim accounts
  - Payment confirmation bypass → financial fraud
  - Reset-flow brute force → mass account takeover
- If the flow targets *victim* accounts (attacker triggers reset on someone
  else's account), interaction/privilege requirements change the score.

## Detection heuristics summary
| Signal | Meaning |
|---|---|
| Unique content-length bucket (e.g., 961) | Valid-code oracle |
| Rare HTTP status (200 vs 400) | Valid-code oracle |
| Success marker / token in body | Valid-code oracle |
| No 429/403/lockout after 30 rapid tries | No rate limiting |
| Lockout only per-IP/session | Throttling bypassable |
| Old code still valid after resend/expiry | Weak TTL/reuse |
| Constant response size for all inputs | No oracle — needs timing or other side channel |

## Reporting
- **CWE-307** (Improper Restriction of Excessive Authentication Attempts) is the
  primary mapping; also consider **CWE-640** (weak password recovery) and
  **CWE-287** (improper authentication). Note: platform auto-tags can be off —
  the CoinMate case was tagged "Insecure Storage of Sensitive Information".
- **CVSS 3.1**: base ~4.3–6.5 medium
  (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N). Escalate to 7.5+ high when it directly
  yields account takeover or bypasses MFA on victim accounts.
- PoC write-up: endpoint, request template, oracle used, candidate space,
  request rate, time-to-recovery, and the replay confirmation.

## Remediation checklist
1. Rate-limit per **account + IP** (e.g., 5 attempts / 15 min) with CAPTCHA
   escalation; key limits on the user identifier, not just session/IP.
2. Short OTP TTL (2–5 min), **single-use**, invalidated on resend.
3. Cryptographically secure RNG for code generation; never sequential or
   time-derived codes.
4. Server-side attempt counter with lockout; uniform responses so no
   length/status oracle leaks validity.
5. Monitor and alert on verification-failure bursts; add jitter to error paths.
6. Prefer TOTP/HOTP (RFC 6238/4226) with rate-limited verification windows.

## Files
- `scripts/otp_bruteforce.py` — threaded Python3 brute-forcer with explicit
  and auto-detect oracles, throttling backoff, confirmation replays, and Burp
  proxy support.