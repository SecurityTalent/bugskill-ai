---
name: password-reset-flaws
description: >
  Exploit weak password reset and change flows via CSRF on reset forms, cross-user password
  modification by swapping username parameters, token predictability in reset links, reset
  displaying old password in plaintext (revealing weak storage), missing current-password
  verification on change forms, and session hijacker lockout via passwordless change.
  Test with Burp Suite, OWASP ZAP following OWASP Forgot Password Cheat Sheet.
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite or OWASP ZAP.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-ATHN-07, WSTG-ATHN-09
---

# Password Reset and Change Flaws

## What Is Broken and Why

Password reset and change workflows are high-value attack targets because they operate partially
outside a user's active session. Flaws arise when reset tokens are predictable, when the workflow
can be manipulated to affect other users' accounts, when CSRF protections are absent, or when
password changes do not require verification of the current credential. Additionally, displaying
the old password during a reset reveals that it is stored in recoverable form (plaintext or
reversible encryption), indicating fundamentally broken credential storage.

## Key Signals

- Reset endpoint accepts `user=` or `username=` parameter that can be swapped to another account
- Password change form does not require current password field
- Reset token in URL is short, numeric, sequential, or time-derived
- Reset page displays old/current password in cleartext
- Password reset or change form lacks CSRF token
- Reset link does not expire or remains valid after use
- Weak policy: accepts "Password1", "123456", no minimum length enforcement
- Password reuse permitted across resets
- Application accepts `changepassword?user=VICTIM` without validating session ownership

## Methodology

1. **CSRF check on reset form**: Capture reset/change request; remove or replay CSRF token;
   confirm if server accepts.
2. **Cross-user modification**: On password change endpoint, swap the `user=`, `username=`, or
   `account=` parameter to a different account while authenticated as another user.
3. **Token analysis**: Request multiple reset tokens; compare for patterns (sequential integers,
   Unix timestamps, MD5 of email+time).
4. **Token lifetime**: Use a reset token after 1 hour, 24 hours, 1 week; note if still valid.
5. **Plaintext password detection**: Trigger "forgot password" flow; if response contains the
   actual current password, storage is reversible.
6. **Missing current-password gate**: Submit password change request without `currentPassword`
   field or with an incorrect value; observe if accepted.
7. **Workflow manipulation**: Intercept multi-step reset flow; skip steps or replay confirmation
   tokens against a different account.
8. **Password policy audit**: Test minimum/maximum length, character class requirements, common
   password blocking, history enforcement.

## Payloads & Tools

```bash
# Test cross-user password change (swap victim username)
curl -X POST https://TARGET/account/changepassword \
  -b "SessionID=ATTACKER_SESSION" \
  -d "user=VICTIM&newPassword=hacked123&confirmPassword=hacked123"

# Test password change without current password
curl -X POST https://TARGET/account/changepassword \
  -b "SessionID=VALID_SESSION" \
  -d "newPassword=hacked123&confirmPassword=hacked123"

# CSRF PoC for password reset (save as csrf_reset.html, open in victim browser)
cat << 'EOF'
<html>
<body onload="document.forms[0].submit()">
  <form action="https://TARGET/account/resetPassword" method="POST">
    <input type="hidden" name="email" value="VICTIM_EMAIL">
  </form>
</body>
</html>
EOF

# Collect reset tokens and diff for predictability
for i in {1..5}; do
  curl -s -X POST https://TARGET/forgot-password \
    -d "email=test${i}@TARGET" -D - | grep -i "location\|token"
done

# Test token reuse after use
curl "https://TARGET/reset?token=TOKEN&newpass=test123"
# Wait, then retry:
curl "https://TARGET/reset?token=TOKEN&newpass=changed_again"

# Weak password policy test
curl -X POST https://TARGET/register \
  -d "user=testuser&pass=123456&confirm=123456"
curl -X POST https://TARGET/register \
  -d "user=testuser2&pass=Password1&confirm=Password1"
```

## Bypass Techniques

- If reset token is `MD5(email + timestamp)`, brute-force the timestamp within a known window.
- Multi-step reset flows sometimes store the target account in session; manipulating the session
  between steps can redirect the reset to a different account.
- If `currentPassword` field is client-side validated only, remove validation via browser devtools.
- Applications that send reset links to email may have a separate "display reset code" API
  endpoint accessible without email delivery.
- Some reset flows accept both GET and POST; CSRF is often only protected on POST.

## Exploitation Scenarios

**Scenario 1 — CSRF Account Takeover via Password Reset**
Setup: Password reset endpoint lacks CSRF token; accepts `email=` parameter via POST.
Trigger: Victim visits attacker-controlled page containing auto-submitting form targeting reset
endpoint with victim's email. Attacker controls email account (or intercepts reset token).
Impact: Attacker resets victim's password and locks them out.

**Scenario 2 — Cross-User Password Change**
Setup: Password change endpoint uses `user=` parameter without validating it matches session owner.
Trigger: Authenticated attacker POSTs to `/changepassword` with `user=admin&newPassword=hacked`.
Impact: Admin account password changed to attacker-controlled value; full privilege escalation.

**Scenario 3 — Session Hijacker Lockout Attack**
Setup: Password change does not require current password; attacker has stolen a valid session token.
Trigger: Attacker changes victim's password using stolen session before victim notices.
Impact: Victim locked out of their own account; attacker maintains persistent access.

## False Positives

- A reset link that appears numeric may include an HMAC suffix not visible in the URL fragment;
  verify the full token is validated server-side.
- "Current password" field present client-side but removed by JS may still be enforced server-side.
- Displaying a temporary auto-generated password (not the original) does not necessarily indicate
  reversible storage; confirm whether it is the original or freshly generated.

## Fix Patterns

- Generate reset tokens using a cryptographically secure random source; minimum 128-bit entropy.
- Expire reset tokens after first use and after a short time window (15-30 minutes).
- Enforce CSRF tokens on all password change and reset form submissions.
- Require current password verification for password change; derive target account from server
  session, never from user-supplied parameters.
- Hash passwords with bcrypt, scrypt, or Argon2; never store reversibly.
- Enforce minimum password length (12+ characters), block common passwords using a deny-list.
- Follow the OWASP Forgot Password Cheat Sheet for reset flow design.

## Related Skills

Password reset is one of the most common [[auth-bypass]] vectors — a flawed reset flow often completely sidesteps a hardened login page. A missing CSRF token on the reset form makes it immediately chainable with [[csrf]] for account takeover. If the reset endpoint reflects a predictable token in the URL, [[session-fixation]] techniques (token prediction analysis) apply to reconstruct the token space. Cross-user password modification via parameter swap is the same class of bug as [[authz-bypass]].
