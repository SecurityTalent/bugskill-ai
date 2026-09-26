---
name: business-logic-flaws
description: >
  Business logic flaws are application vulnerabilities where valid functions are abused in unintended ways: price manipulation via hidden field tampering, workflow step-skipping, function call limit bypass (coupon reuse), process timing exploitation (race conditions on balance updates), and request forging via guessable/predictable parameters. Detect using Burp Suite proxy interception, HTTP POST/GET parameter analysis, and misuse-case testing against multi-step workflows. Tools: Burp Suite, OWASP ZAP.
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite or OWASP ZAP.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-BUSL-01
---

# Business Logic Flaws

## What Is Broken and Why
Business logic flaws occur when an application's security controls are implemented only on the client side, or when developers assume users will always follow the intended workflow. Unlike injection attacks, these vulnerabilities use the application's own features correctly from a technical standpoint but in unintended sequences or with unexpected values. They are particularly dangerous because automated scanners rarely detect them — they require understanding the application's intended purpose. Common manifestations include price/quantity manipulation, workflow step bypass, coupon reuse, race conditions in financial operations, and privilege escalation via hidden or predictable parameters.

## Key Signals
- Hidden form fields containing prices, discount amounts, user roles, or IDs
- Multi-step purchase/checkout workflows where steps can be skipped via direct URL navigation
- Coupon or discount codes accepted multiple times
- Pricing or quantity fields not validated server-side (only validated in JavaScript)
- Parameters incrementing predictably (orderId=1001, 1002…) suggesting enumerable resources
- Time-sensitive operations (balance checks, reservation holds) that can be exploited between check and action
- Admin or privilege flags passed in HTTP parameters
- Audit log endpoints with insufficient access controls

## Methodology
1. **Data Validation Testing (BUSL-01)**
   - Identify all data entry and handoff points between system components
   - Intercept HTTP requests and submit logically invalid values: negative quantities, non-existent IDs, out-of-range prices
   - Verify server rejects logically invalid data (not just client-side validation)

2. **Request Forging (BUSL-02)**
   - Monitor POST/GET for guessable or predictable parameter values
   - Identify hidden features (debug flags, admin toggles) in HTTP parameters
   - Modify discovered values to test for unintended access or behavior

3. **Integrity Check Testing (BUSL-03)**
   - Compare hidden HTTP fields against visible GUI fields
   - Submit alternative values in "read-only" fields via proxy
   - Test log file and audit trail manipulation via unauthorized access

4. **Process Timing Exploitation (BUSL-04)**
   - Identify time-dependent processes (reservation windows, balance updates, quote validity periods)
   - Automate concurrent requests to exploit race conditions
   - Diagram the workflow and measure timing windows between steps

5. **Function Use Limit Testing (BUSL-05)**
   - Identify functions designed for single or limited use (one-time codes, single-use coupons, free trial)
   - Attempt re-application via browser back/forward navigation
   - Test repeated API calls to bypass server-side counters

6. **Workflow Circumvention (BUSL-06)**
   - Map the complete multi-step workflow
   - Attempt to skip steps by navigating directly to later steps via URL
   - Test whether beginning a transaction and abandoning mid-flow grants partial benefits

## Payloads & Tools
```
# Price/quantity manipulation via Burp Intercept
# Original request:
POST /checkout HTTP/1.1
item_id=123&quantity=1&price=99.99&total=99.99

# Modified request:
POST /checkout HTTP/1.1
item_id=123&quantity=1&price=0.01&total=0.01

# Negative quantity for credit
POST /cart/add HTTP/1.1
item_id=123&quantity=-10

# Hidden field privilege escalation
# Original:
POST /profile/update HTTP/1.1
name=John&email=john@domain.com

# Modified (inject hidden admin field observed in source):
POST /profile/update HTTP/1.1
name=John&email=john@domain.com&role=admin&is_admin=true

# Coupon reuse — apply same coupon twice via Burp Repeater
POST /apply-coupon HTTP/1.1
coupon_code=DISCOUNT20

# Race condition on coupon/balance (Burp Intruder / turbo-intruder)
# Send 20 simultaneous requests to apply one-time coupon
# turbo-intruder script:
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint, concurrentConnections=20)
    for i in range(20):
        engine.queue(target.req)

# Workflow skip — bypass payment step
# Step 1: /checkout/cart  -> Step 2: /checkout/payment -> Step 3: /checkout/confirm
# Skip step 2:
GET /checkout/confirm?order_id=12345 HTTP/1.1

# IDOR — enumerate predictable order IDs
curl -s -b "session=TOKEN" TARGET/orders/1001
curl -s -b "session=TOKEN" TARGET/orders/1002
# Automate with Burp Intruder: numeric sequence on order ID

# Distributed Denial of Dollar — trigger fee thresholds
POST /transfer HTTP/1.1
amount=0.01
# Repeat 10000 times to trigger per-transaction fee accumulation
```

## Bypass Techniques
- Intercept and modify client-side validated fields before server submission
- Replay completed transaction requests with modified amounts
- Use browser developer tools to modify disabled form fields before submission
- Manipulate cookies or local storage containing business-critical state (cart contents, user tier)
- Navigate directly to workflow step N+1 by manipulating URL path or state parameter
- Exploit session persistence: complete partial workflows across sessions to maintain state
- For timing attacks: use Burp Intruder with max concurrency or turbo-intruder for sub-millisecond precision
- Exploit distributed systems' eventual consistency windows for double-spend attacks

## Exploitation Scenarios
**Scenario 1 — E-Commerce Price Manipulation**
Setup: Shopping cart stores price in hidden POST field; server trusts client-supplied price on checkout.
Trigger: Intercept POST to `/checkout`, change `price=299.99` to `price=0.01`.
Impact: High-value item purchased for near-zero cost; financial loss to merchant.

**Scenario 2 — Race Condition on One-Time Coupon**
Setup: Discount coupon validated server-side but check and update are not atomic.
Trigger: Send 20 simultaneous POST requests applying the same coupon using Burp Intruder with max concurrency.
Impact: Coupon applied multiple times before server marks it as used; full discount stack.

**Scenario 3 — Workflow Step Bypass on Free Trial**
Setup: Premium feature gated behind payment step in multi-step checkout; state stored in URL parameter.
Trigger: Skip directly to `/account/activate-premium?plan=annual&payment_status=complete` without completing payment.
Impact: Premium features activated without payment; revenue bypass.

## False Positives
- Server-side validation correctly rejecting manipulated values even when client-side validation is absent
- Race condition window too small to exploit reliably in practice (atomic database transactions)
- Hidden fields present in HTML but ignored by server-side processing
- Admin flags in POST body that are filtered or re-set from server-side session on every request

## Fix Patterns
- Never trust client-supplied pricing, discounts, or privilege indicators — recalculate from authoritative server-side data
- Validate business logic server-side: check quantity ranges, valid product IDs, and pricing against database
- Implement atomic operations for race-condition-sensitive flows (database transactions, optimistic locking, Redis SETNX)
- Track workflow state server-side (session), not in URL parameters or hidden fields
- Apply per-user, per-session counters for limited-use functions stored in the database (not cookies)
- Implement audit logging for all financial and privilege operations with anomaly alerting
- Enforce sequential workflow steps server-side: verify prerequisite steps are completed before allowing next step

## Related Skills

[[bola-idor]] frequently surfaces business logic violations — accessing another user's order ID often reveals whether they have applied discounts, completed payments, or hold different access tiers. Price manipulation via hidden field tampering is the same class of bug as [[authz-bypass]] parameter tampering. Race conditions in financial operations benefit from the same timing analysis as [[session-fixation]] window attacks. Workflow step-skipping that grants access to restricted features without paying is structurally identical to an [[auth-bypass]] on the payment gate.
