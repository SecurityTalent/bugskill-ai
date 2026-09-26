---
name: mass-assignment
description: >
  Use when testing APIs and web frameworks for mass assignment vulnerabilities where
  user-controlled request body fields are bound directly to model attributes without
  a field allowlist. Trigger on: ORM update/create endpoints, REST APIs accepting JSON
  body, Rails strong parameters, Django model forms, Laravel fillable/guarded, Node.js
  Mongoose/Sequelize, PUT/PATCH requests, registration endpoints, profile update endpoints,
  GraphQL mutations. Detects privilege escalation via role/admin/isAdmin fields, plan
  upgrades via subscription fields, and horizontal access via ownerId/userId injection.
license: Apache-2.0
compatibility: Designed for Claude Code. Tools: Burp Suite.
metadata:
  category: web
  version: "0.1"
  source: https://github.com/BehiSecc/VibeSec-Skill
  source_types: blog_post
---

# Mass Assignment

## What Is Broken and Why

Frameworks that automatically bind request body parameters to model attributes (Rails,
Laravel, Django, Mongoose, Sequelize) allow attackers to set fields that were never
meant to be user-modifiable. A profile update endpoint intended to accept `{name, email}`
will also accept `{role: "admin", plan: "enterprise", ownerId: 999}` if the server
doesn't explicitly allowlist accepted fields.

## Key Signals

- PUT/PATCH/POST endpoints that update model records
- JSON bodies passed to ORM `update()`, `create()`, `save()`, or `assign()` calls
- Registration or profile endpoints in Rails, Laravel, Django, Express apps
- API responses that reveal field names not expected in requests (leak model schema)
- GraphQL mutations with `input` types
- Endpoints where adding extra fields returns 200 (not 400 Bad Request)

## Methodology

1. Identify PUT/PATCH endpoints for user profile, settings, or resource updates.
2. Intercept a normal request; examine which fields are accepted.
3. Inspect API responses and other endpoints to discover undocumented field names
   (`role`, `admin`, `isAdmin`, `verified`, `plan`, `credits`, `ownerId`, `orgId`).
4. Add extra fields to the request body — observe if they're accepted silently.
5. Attempt privilege escalation: inject `"role": "admin"` or `"isAdmin": true`.
6. Attempt horizontal access: inject `"userId"` or `"ownerId"` pointing to another user.
7. For registration endpoints: try setting `"emailVerified": true`, `"credits": 9999`.
8. Fuzz with common sensitive field names from framework conventions.

## Payloads & Tools

```json
// Profile update — attempt privilege escalation
PATCH /api/users/me
{"name": "test", "email": "test@example.com", "role": "admin", "isAdmin": true}

// Registration — attempt auto-verification and credit injection
POST /api/register
{"email": "x@x.com", "password": "pass", "emailVerified": true, "credits": 9999,
 "plan": "enterprise", "trialExpires": "2099-01-01"}

// Resource update — attempt ownership change (IDOR via mass assignment)
PATCH /api/posts/42
{"title": "new", "ownerId": 1, "userId": 1}

// Nested object injection (common in JSON APIs)
PUT /api/profile
{"name": "x", "address": {"city": "x"}, "billingPlan": {"tier": "enterprise"}}

// GraphQL mutation with extra input fields
mutation {
  updateUser(input: {name: "x", role: "admin", isAdmin: true}) { id role }
}
```

**Common sensitive field names to try:**

```
role, roles, isAdmin, admin, superuser, verified, emailVerified,
plan, tier, subscription, credits, balance, ownerId, userId, orgId,
organizationId, groupId, permissions, scopes, approved, active,
banned, locked, passwordResetRequired, mfaEnabled, apiKey, secret
```

## Bypass Techniques

- **Nested objects**: Try `{"billing": {"plan": "enterprise"}}` if flat fields are blocked.
- **Array assignment**: `{"roles": ["admin", "user"]}` for role arrays.
- **Underscore variants**: `_role`, `__role`, `role_id` for alternate field names.
- **camelCase vs snake_case**: Try both `isAdmin` and `is_admin`.
- **Partial allowlist bypass**: Some frameworks check top-level but not nested fields.
- **GraphQL alias injection**: Extra fields in `input` type if server doesn't validate schema strictly.

## Exploitation Scenarios

**Privilege escalation via role injection:**
Setup → Rails app uses `User.update(params[:user])` without strong parameters.
Trigger → Send `PATCH /profile` with `{"name":"x","role":"admin"}`.
Impact → Attacker account elevated to admin; full application access.

**Free premium tier via registration:**
Setup → Laravel registration with unguarded `User` model.
Trigger → POST register with `{"email":"x","password":"x","plan":"premium","credits":10000}`.
Impact → Free premium access and inflated credits.

**Horizontal access via ownerId change:**
Setup → Node/Mongoose `Document.findByIdAndUpdate(id, req.body)`.
Trigger → PATCH document with `{"title":"x","ownerId":"VICTIM_ID"}`.
Impact → Attacker's document transferred to victim — or attacker claims victim's document.

## False Positives

- Extra fields returned as 400 with validation error — server validates allowed fields.
- Fields accepted in request body but ignored (no change in response/DB) — check DB directly.

## Fix Patterns

```javascript
// Node.js — explicit allowlist with lodash pick
const allowed = ['name', 'email', 'avatar'];
User.findByIdAndUpdate(id, pick(req.body, allowed));

// Express/Mongoose — never pass req.body directly to ORM
// Bad:  User.updateOne({ _id }, req.body)
// Good: User.updateOne({ _id }, { name: req.body.name, email: req.body.email })
```

```python
# Django — use form or serializer to allowlist fields
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['name', 'email']  # never use fields = '__all__'
```

## Related Skills

Mass assignment is a specific form of [[authz-bypass]] where the bypass is structural
rather than a missing check. When the injected field is an object ID pointing to another
user's data, it becomes [[bola-idor]]. Discovering which hidden fields exist often requires
[[web-fingerprinting]] of the framework (Rails, Laravel, Django leave recognizable patterns).
