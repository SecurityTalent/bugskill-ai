# AI Code Security & Audit Checklist

Use this checklist during code reviews to prevent common bug bounty vulnerabilities.

## 1. Authentication & Authorization
- [ ] Are all API endpoints protected by authorization middleware?
- [ ] Are direct object references (e.g. `/api/users/:id`) checked against the current session user?
- [ ] Is rate limiting enabled on sensitive routes (login, register, reset-password, OTP verification)?

## 2. Input Validation & Data Sanitization
- [ ] Are database queries using parameterized queries / prepared statements (SQLi prevention)?
- [ ] Is HTML output properly encoded or sanitized with a security library (XSS prevention)?
- [ ] Are file uploads restricted by file extension, MIME type, and size?

## 3. Server-Side Request Forgery (SSRF)
- [ ] Are external URLs fetched by the server validated against an allowlist?
- [ ] Is access to internal cloud metadata endpoints (`169.254.169.254`) blocked?

## 4. API & Business Logic
- [ ] Are price/amount parameters verified on the server side instead of trusting client input?
- [ ] Are CSRF tokens validated for state-changing requests?
- [ ] Are CORS headers restricted to authorized origins instead of wildcard `*`?
