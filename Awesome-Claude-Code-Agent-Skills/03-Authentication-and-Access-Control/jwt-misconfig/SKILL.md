---
name: jwt-misconfig
description: >
  Use when testing JWT-based authentication for algorithm confusion, alg:none bypass,
  weak HMAC secrets, missing expiration, kid parameter injection, and token storage in
  localStorage. Trigger on: Authorization: Bearer tokens, JWTs in cookies, any base64url
  encoded header.payload.signature pattern, OAuth2 access tokens, API authentication
  tokens, SSO tokens, JWKS endpoints. Detects RS256→HS256 confusion, public key as
  HMAC secret, unverified kid values used in file reads or SQL queries, and JWT cracking
  with short secrets.
license: Apache-2.0
compatibility: Designed for Claude Code. Tools: Burp Suite JWT Editor, jwt_tool, hashcat.
metadata:
  category: web
  version: "0.1"
  source: https://github.com/BehiSecc/VibeSec-Skill
  source_types: blog_post
---

# JWT Misconfiguration

## What Is Broken and Why

JWTs that accept `alg: none`, trust the algorithm declared in the token header, or use
guessable HMAC secrets allow attackers to forge arbitrary tokens — including admin-level
claims — without knowing any signing key. Algorithm confusion attacks exploit servers
that accept both RS256 (asymmetric) and HS256 (symmetric): the attacker signs with the
public key (which is public) using HS256 and the server verifies it as a valid HMAC.

## Key Signals

- `Authorization: Bearer <base64url>.<base64url>.<base64url>` in requests
- JWTs stored in cookies (check `httpOnly`, `Secure`, `SameSite` flags)
- JWKS endpoint at `/.well-known/jwks.json` or `/oauth/certs` (exposes public key)
- `alg` field in JWT header — watch for `HS256`, `RS256`, `none`
- `kid` (Key ID) field in JWT header — check for path traversal or SQLi
- Short or dictionary-based HMAC secret (crack with hashcat)

## Methodology

1. Decode the JWT header and payload (`base64url` decode each part).
2. Note the `alg` value; attempt to change it to `none` and remove signature.
3. If `alg` is `RS256`, fetch the public key from JWKS endpoint; re-sign with HS256
   using the public key as the HMAC secret.
4. If `alg` is `HS256`, attempt to crack the secret with `hashcat` or `jwt_tool`.
5. Check `kid` value — test for path traversal (`../../dev/null`), SQLi, or SSRF.
6. Modify `exp` claim to far-future timestamp; attempt to use expired tokens.
7. Escalate claims: change `role`, `admin`, `sub`, `userId` in payload after forging.

## Payloads & Tools

```bash
# jwt_tool — Swiss army knife for JWT attacks
pip install jwt_tool
jwt_tool TOKEN -X a           # alg:none attack
jwt_tool TOKEN -X s           # algorithm confusion (RS256→HS256)
jwt_tool TOKEN -C -d wordlist.txt  # crack HMAC secret

# hashcat JWT cracking
hashcat -a 0 -m 16500 TOKEN wordlist.txt

# Manual alg:none
# 1. Decode header: {"alg":"RS256","typ":"JWT"}
# 2. Change to:     {"alg":"none","typ":"JWT"}
# 3. Re-encode and append empty signature: header.payload.
# (trailing dot is required)

# kid SQLi
{"kid": "' UNION SELECT 'attacker_secret' --", "alg":"HS256"}
# Sign token with 'attacker_secret'

# kid path traversal (sign with empty string)
{"kid": "../../dev/null", "alg":"HS256"}
# /dev/null reads as empty → sign with empty string ""
```

## Bypass Techniques

| Attack | Technique |
|--------|-----------|
| `alg: none` | Change header alg to `none`, drop signature, keep trailing dot |
| Algorithm confusion | Fetch RS256 public key; use it as HS256 HMAC secret |
| Weak secret | Crack short/dictionary HMAC with hashcat `-m 16500` |
| `kid` path traversal | Point kid to `/dev/null` or known empty file; sign with `""` |
| `kid` SQLi | Inject SQL into kid to return attacker-controlled key from DB |
| Missing `exp` | If no expiry check, reuse old tokens indefinitely |
| `jku`/`x5u` injection | Point to attacker-hosted JWKS to supply own public key |
| Embedded JWK | Inject `jwk` into header containing attacker's own public key |

## Exploitation Scenarios

**Algorithm confusion to admin:**
Setup → API uses RS256; JWKS endpoint public at `/.well-known/jwks.json`.
Trigger → Fetch public key → re-sign token with HS256 using public key as secret → set
`"role":"admin"` in payload.
Impact → Full admin access without any private key.

**alg:none on misconfigured library:**
Setup → Old version of JWT library doesn't reject `alg: none`.
Trigger → Set `alg: none`, modify `sub` to another user's ID, remove signature.
Impact → Arbitrary account takeover.

**kid path traversal to RCE:**
Setup → `kid` is used to load key from filesystem without sanitization.
Trigger → `kid: "../../proc/self/fd/0"` with socket input; or `../../tmp/evil`.
Impact → Attacker controls signing key; full token forgery.

## False Positives

- `alg: none` rejected with 401 — library properly validates algorithm.
- RS256 server that only accepts RS256 (not HS256) — algorithm confusion not applicable.
- JWKS endpoint present but server uses pinned key in code — `jku`/`x5u` injection blocked.

## Fix Patterns

```javascript
// Always whitelist algorithm — never derive from token header
jwt.verify(token, secret, { algorithms: ['HS256'] });

// For RS256: pin the public key in code, don't trust jku/jwk headers
jwt.verify(token, publicKeyPem, { algorithms: ['RS256'] });

// Always validate exp
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  ignoreExpiration: false  // default false — make it explicit
});
```

## Related Skills

JWT attacks are a class of [[auth-bypass]] specific to token-based systems. `kid` SQLi
chains into [[sql-injection]]; `kid` path traversal chains into [[path-traversal]].
Weak session management after JWT compromise connects to [[cookie-attacks]] and
[[session-fixation]].
