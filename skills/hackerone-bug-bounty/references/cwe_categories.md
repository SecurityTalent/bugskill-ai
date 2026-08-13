# HackerOne Vulnerabilities by CWE Category

Total Categories: 207

## Uncategorized (948 Reports)

- **[Unauthenticated team "income/payments" export ignores donor privacy settings (hide_giving, hide_from_lists) and uses frozen visibility, exposing donat](https://hackerone.com/reports/3878586)** (Program: `Liberapay` | Severity: `Medium` - Bounty: $100)
  > *Summary:* A vulnerability was discovered in the unauthenticated team "income/payments" export feature of Liberapay. The vulnerability allowed an attacker to retrieve donor identity, exact donation amount, and d...
- **[`exportReportPdf` mutation shows internal Activity](https://hackerone.com/reports/3577216)** (Program: `HackerOne` | Severity: `High`)
  > *Summary:* A vulnerability was identified in the PDF export path for disclosed reports. When a report was exported to PDF, the export pipeline did not apply the same visibility and authorization scoping that gov...
- **[Able to bypass authorization logic and gain more access then intended](https://hackerone.com/reports/3713965)** (Program: `GitHub` | Severity: `Medium`)
  > *Summary:* A UI misrepresentation vulnerability was identified in GitHub Enterprise Server that allowed an OAuth application to gain unintended access to an organization's runner management. The vulnerability wa...
- **[admin.shopify.com: Shopify Flow continues sending internal emails to a configured recipient after the staff author is removed](https://hackerone.com/reports/3628961)** (Program: `Shopify` | Severity: `None`)
- **[setopt(VERIFYPEER) from callback bypasses TLS verify on connection reuse](https://hackerone.com/reports/3831432)** (Program: `curl` | Severity: `Low`)

## Information Disclosure (881 Reports)

- **[CVE-2026-9079: stale proxy password leak](https://hackerone.com/reports/3750295)** (Program: `curl` | Severity: `Medium`)
- **[CVE-2026-8926: password leak with netrc and user in URL](https://hackerone.com/reports/3735184)** (Program: `curl` | Severity: `Low`)
- **[ Secure cookies leaked to HTTP origins through HTTPS forwarding proxy](https://hackerone.com/reports/3803415)** (Program: `curl` | Severity: `None`)
- **[CURLOPT_COOKIE leaked to cross-origin redirect target — CURLOPT_UNRESTRICTED_AUTH bypass for the STRING_COOKIE path](https://hackerone.com/reports/3766065)** (Program: `curl` | Severity: `Medium`)
- **[PRE_PROXY change leaks stale Proxy Digest state across proxy-chain boundary](https://hackerone.com/reports/3777381)** (Program: `curl` | Severity: `Unknown`)

## Improper Access Control - Generic (673 Reports)

- **[ `relay_tx` wallet-rpc skips `--restricted-rpc` guard and lets any caller corrupt wallet state via attacker-controlled `pending_tx`](https://hackerone.com/reports/3687543)** (Program: `Monero` | Severity: `Low`)
  > *Summary:* The `relay_tx` wallet-RPC method in Monero was found to bypass the `--restricted-rpc` guard, allowing any caller to corrupt the wallet state by submitting a malicious `pending_tx` blob. The issue was ...
- **[Permission Model bypass: process.report writes (and overwrites) files outside --allow-fs-write paths](https://hackerone.com/reports/3815767)** (Program: `Node.js` | Severity: `Low`)
  > *Summary:* A flaw was found in the Node.js Permission Model enforcement that allowed the process.report function to write (and overwrite) files outside the --allow-fs-write paths.
- **[GitHub scoped user to server tokens can escape their installation](https://hackerone.com/reports/3638909)** (Program: `GitHub` | Severity: `High`)
  > *Summary:* An improper authorization vulnerability in scoped user-to-server (ghu_) token authorization in GitHub Enterprise Server was discovered. The vulnerability allowed an authenticated attacker to access pr...
- **[Permission Model: --allow-fs-read/--allow-fs-write radix-tree prefix-boundary over-grant](https://hackerone.com/reports/3761342)** (Program: `Node.js` | Severity: `High`)
  > *Summary:* A flaw was discovered in the Node.js Permission Model's enforcement of filesystem access control. The vulnerability could allow an attacker granted access to one path to read from or write to paths ou...
- **[Permission Model Bypass: `trace_events.createTracing().enable()` Writes Trace Logs Outside `--allow-fs-write`](https://hackerone.com/reports/3838601)** (Program: `Node.js` | Severity: `Low`)
  > *Summary:* A flaw in Node.js Permission Model enforcement was discovered that allowed `trace_events.createTracing().enable()` to write trace logs outside of the `--allow-fs-write` setting. This vulnerability aff...

## Cross-site Scripting (XSS) - Reflected (516 Reports)

- **[Reflected XSS via unsanitised refresh parameter in zone invocation tag](https://hackerone.com/reports/3780806)** (Program: `Revive Adserver` | Severity: `Medium`)
  > *Summary:* A missing sanitization of user input in the zone-include.php script of Revive Adserver 6.0.7 and earlier was reported. This vulnerability allowed a low-privileged user to perform reflected XSS attacks...
- **[Reflected XSS in stats‑video.php via improperly encoded URL parameters](https://hackerone.com/reports/3793243)** (Program: `Revive Adserver` | Severity: `Medium`)
  > *Summary:* A reflected XSS vulnerability was discovered in the stats‑video.php script due to improper encoding of user input in the URL parameters.
- **[Reflected XSS in AI Chat Bot Greetings at help.shopify.com via Markdown Image Rendering](https://hackerone.com/reports/2509022)** (Program: `Shopify` | Severity: `Medium` - Bounty: $1,600)
  > *Summary:* A reflected XSS vulnerability was reported in the AI chat bot greetings at help.shopify.com. The issue was caused by the rendering of a markdown image in the greeting, which allowed the attacker to in...
- **[Reflected Cross-Site Scripting (XSS) found on IBM.com domain](https://hackerone.com/reports/3664261)** (Program: `IBM` | Severity: `Unknown`)
  > *Summary:* A reflected Cross-Site Scripting (XSS) vulnerability was found on the IBM.com domain. The vulnerability was reported to IBM, analyzed, and remediated. The external researcher who reported the issue wa...
- **[Reflected XSS via clientid parameter in zone‑include.php](https://hackerone.com/reports/3653316)** (Program: `Revive Adserver` | Severity: `Medium`)

## Cross-site Scripting (XSS) - Stored (467 Reports)

- **[Stored XSS in nameserver field on account settings page](https://hackerone.com/reports/3644182)** (Program: `Tucows (VDP)` | Severity: `Low`)
  > *Summary:* A stored XSS vulnerability was discovered in the nameserver field on the account settings page. The lack of input validation and weak CSP configuration allowed the injection of malicious JavaScript co...
- **[Stored XSS via SVG Upload — check_content() Blocklist Bypass & 256-Byte Scan Limit (Self-Propagating Worm)](https://hackerone.com/reports/3606773)** (Program: `phpBB` | Severity: `Medium`)
  > *Summary:* A stored XSS vulnerability was discovered in phpBB 4.0.0-a2-dev. The vulnerability was caused by an incomplete blocklist for file uploads and a 256-byte read limit in the content scanning check. Speci...
- **[Stored XSS in Rocket.Chat HTML File Export — Unauthenticated Entry via LiveChat](https://hackerone.com/reports/3779690)** (Program: `Rocket.Chat` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in the HTML file export feature of Rocket.Chat. The vulnerability allowed an attacker to inject arbitrary JavaScript code that would execute when the exported HTML file ...
- **[Stored XSS on Trix Editor version latest (2.1.16) - Sanitizer Bypass ](https://hackerone.com/reports/3581911)** (Program: `Basecamp` | Severity: `Low` - Bounty: $337)
  > *Summary:* A vulnerability was discovered in Trix Editor version 2.1.16 that allowed for a Stored Cross-Site Scripting (XSS) attack. The vulnerability arose from an unsafe interaction between Trix's custom DOMPu...
- **[Stored XSS in maintenance tools via unescaped entity names](https://hackerone.com/reports/3781311)** (Program: `Revive Adserver` | Severity: `Medium`)
  > *Summary:* A stored XSS vulnerability was discovered in the maintenance tools of Revive Adserver 6.0.7. The issue was caused by entity names being displayed without proper escaping when inconsistencies were dete...

## Uncontrolled Resource Consumption (377 Reports)

- **[Denial of Service (DoS) Vulnerability in Drafts Creation Endpoint](https://hackerone.com/reports/3400140)** (Program: `Discourse` | Severity: `High` - Bounty: $1,024)
  > *Summary:* A Denial of Service (DoS) vulnerability was identified in the /drafts.json endpoint on the Discourse forum. Large payloads (around 800,000 characters or more) submitted to create drafts caused the ser...
- **[Remote node DOS](https://hackerone.com/reports/876530)** (Program: `Monero` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in monerod, the Monero daemon. The vulnerability allowed an attacker to repeatedly request enough objects to fill the outgoing send queue for each peer-to-peer connectio...
- **[Unbounded memory growth in `node:http2` clients via attacker-controlled ORIGIN frames](https://hackerone.com/reports/3676863)** (Program: `Node.js` | Severity: `Medium`)
- **[CVE-2026-11352: QUIC zero-length UDP datagrams busy-loop](https://hackerone.com/reports/3783438)** (Program: `curl` | Severity: `Low`)
- **[HTTP/2 sessions never clean up after GOAWAY on invalid protocol errors](https://hackerone.com/reports/3658225)** (Program: `Node.js` | Severity: `Medium`)
  > *Summary:* A flaw in the Node.js HTTP/2 server API was discovered that could cause servers to keep accepting data even after sending a GOAWAY frame. This vulnerability affected Node.js 22 and Node.js 24.

## Violation of Secure Design Principles (370 Reports)

- **[Brave Shields Domain Reordering Leads to Origin Confusion](https://hackerone.com/reports/3665151)** (Program: `Brave Software` | Severity: `Low`)
  > *Summary:* The Brave Shields feature was observed to reorder domain names, leading to potential origin confusion. Specifically, the domain "1.attacker.com" was displayed as "attacker.com.1", and "1.1.1.1.attacke...
- **[FS Permissions Bypass](https://hackerone.com/reports/3417819)** (Program: `Node.js` | Severity: `High`)
  > *Summary:* A flaw was discovered in Node.js's Permissions model that allowed attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths. By chaining directorie...
- **[Account Takeover via Unverified Email Change and Improper Session Handling](https://hackerone.com/reports/3324823)** (Program: `U.S. Dept Of Defense` | Severity: `High`)
  > *Summary:* A vulnerability was discovered in the email change functionality of the system. When the email was changed to an unregistered email address, the system accepted the change without proper verification....
- **[Cross‑Layer State Confusion in libcurl: Credential & Key‑Material Persistence Across Redirect / Connection Reuse Boundaries](https://hackerone.com/reports/3480641)** (Program: `curl` | Severity: `Critical`)
- **[Invalidate active sessions after password change](https://hackerone.com/reports/716647)** (Program: `Hiro` | Severity: `Low`)

## Improper Authentication - Generic (367 Reports)

- **[HTTPS Agent PFX object-array key collision allows mTLS client identity reuse across different per-request certificates](https://hackerone.com/reports/3816840)** (Program: `Node.js` | Severity: `Medium`)
  > *Summary:* A flaw in Node.js HTTPS Agent connection reuse was discovered that could cause PFX object-array key collisions, allowing mutual TLS (mTLS) client identities to be reused across requests configured wit...
- **[Authentication Bypass via XML Signature Wrapping in SAML SSO](https://hackerone.com/reports/3827674)** (Program: `Rocket.Chat` | Severity: `Critical`)
  > *Summary:* The SAML SSO implementation in Rocket.Chat verified XML signatures but did not bind the validated signature to the `samlp:Response` or `saml:Assertion`. As a result, an attacker could submit a wrapped...
- **[CVE-2026-8927: env-set cross-proxy Digest auth state leak](https://hackerone.com/reports/3744543)** (Program: `curl` | Severity: `Medium`)
- **[Unauthenticated file deletion via deleteFileMessage DDP method allows permanent destruction of any uploaded file](https://hackerone.com/reports/3611837)** (Program: `Rocket.Chat` | Severity: `High`)
- **[Trailing-Dot Hostname in Redirect Silently Strips Client Certificate and Auth Credentials](https://hackerone.com/reports/3791191)** (Program: `curl` | Severity: `Medium`)

## Business Logic Errors (346 Reports)

- **[`check_reserve_proof` counts duplicate entries: one output can inflate `total`](https://hackerone.com/reports/3699522)** (Program: `Monero` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in the `check_reserve_proof` function in the Monero wallet software. The vulnerability allowed duplicate entries in the reserve proof, which could artificially inflate t...
- **[Exceeding the maximum number of spaces allowed by exploiting a Race Condition in the Workspace creation process](https://hackerone.com/reports/3295500)** (Program: `SingleStore` | Severity: `Low`)
  > *Summary:* A race condition vulnerability was discovered in the workspace creation process of SingleStore. The vulnerability allowed users to bypass the limit of one workspace per organization by sending multipl...
- **[CVE-2026-8932: incomplete mTLS config matching in conn reuse](https://hackerone.com/reports/3733910)** (Program: `curl` | Severity: `Low`)
- **[curl/libcurl vulnerable to TLS truncation attacks](https://hackerone.com/reports/1826392)** (Program: `curl` | Severity: `Medium`)
- **[Proxy CONNECT response poisoning via authentication retry in cf-h1-proxy.c (libcurl)](https://hackerone.com/reports/3767963)** (Program: `curl` | Severity: `Medium`)

## Cross-site Scripting (XSS) - Generic (296 Reports)

- **[`use-mcp`'s oauth2 process uses a window.open call with untrusted mcp server provided data allowing for code execution under the page using it](https://hackerone.com/reports/3211031)** (Program: `Cloudflare Public Bug Bounty` | Severity: `Medium` - Bounty: $550)
  > *Summary:* The `authorizeEndpoint` parameter from `use-mcp` version was susceptible to XSS. Sanitization of that parameter was added in version 0.0.10 of use-mcp. A skilled attacker was able to turn this XSS int...
- **[1-Click Cross-Site Scripting via Custom Configuration in SafeListSanitizer](https://hackerone.com/reports/3008446)** (Program: `Ruby on Rails` | Severity: `Medium`)
- **[[CVE-2024-54133] Possible Content Security Policy bypass in Action Dispatch](https://hackerone.com/reports/2905532)** (Program: `Internet Bug Bounty` | Severity: `Low`)
  > *Summary:* A vulnerability was discovered in the content_security_policy helper in Action Pack of Ruby on Rails. Carefully crafted inputs were able to inject new directives into the Content-Security-Policy (CSP)...
- **[ActionView sanitize helper bypass with 'style' and 'svg' tags](https://hackerone.com/reports/2931688)** (Program: `Internet Bug Bounty` | Severity: `Medium`)
  > *Summary:* The Rails-html-sanitizer, which Rails ActionView also uses, failed to sanitize input when `svg` and `style` or `math` and `style` tags were allowed. This resulted in a potential XSS vulnerability in a...
- **[ActionView sanitize helper bypass with noscript](https://hackerone.com/reports/2931691)** (Program: `Internet Bug Bounty` | Severity: `Medium`)
  > *Summary:* The Rails-html-sanitizer 1.6.0 contained a vulnerability that allowed bypassing the sanitization process when the `noscript` tag was used. This could have led to potential cross-site scripting (XSS) a...

## Insecure Direct Object Reference (IDOR) (282 Reports)

- **[Insecure Direct Object Reference (IDOR) allows creating folders.](https://hackerone.com/reports/3353057)** (Program: `SingleStore` | Severity: `Low`)
  > *Summary:* An Insecure Direct Object Reference (IDOR) vulnerability was discovered in the backend API of a software product. The vulnerability allowed authenticated users with low privileges to create unauthoriz...
- **[Delete any folder for any user within the organization](https://hackerone.com/reports/3353035)** (Program: `SingleStore` | Severity: `Low`)
  > *Summary:* A vulnerability in the SingleStore backend API allowed low-privileged users to delete folders belonging to other users within the same organization by manipulating the folder_id parameter in DELETE re...
- **[Missing ownership validation allows cross‑manager tracker–campaign linking](https://hackerone.com/reports/3780709)** (Program: `Revive Adserver` | Severity: `Medium`)
  > *Summary:* A vulnerability was reported in Revive Adserver version 6.0.7 and earlier that allowed a low-privileged user to link their trackers to campaigns owned by other managers on the same instance. This was ...
- **[Autotranslate DDP Method Exposes Private Messages Without Authentication or Room Access Check](https://hackerone.com/reports/3734326)** (Program: `Rocket.Chat` | Severity: `High`)
- **[Cross-repository IDOR in `/settings/security_analysis/bypass_reviewers` allows unauthorized delegated bypass reviewer modification](https://hackerone.com/reports/3560256)** (Program: `GitHub` | Severity: `Medium`)
  > *Summary:* A vulnerability was identified in GitHub Enterprise Server that allowed an attacker with admin access on one repository to modify the secret scanning push protection delegated bypass reviewer list on ...

## Cross-Site Request Forgery (CSRF) (273 Reports)

- **[CSRF in zone‑include.php allows unauthorized banner and campaign linking](https://hackerone.com/reports/3781691)** (Program: `Revive Adserver` | Severity: `Medium`)
  > *Summary:* The `zone-include.php` script in Revive Adserver 6.0.7 was vulnerable to a CSRF attack. Linking and unlinking banners or campaigns to zones could be triggered via crafted GET or POST requests without ...
- **[CSRF allowing unauthorized modification of user Notes on ███████](https://hackerone.com/reports/3367292)** (Program: `Tucows (VDP)` | Severity: `Low`)
  > *Summary:* A CSRF vulnerability was discovered that allowed unauthorized modification of user notes. The vulnerability was present in the endpoint that handled saving the notes. The endpoint did not implement pr...
- **[CSRF vulnerability allows disabling Gmail contacts link for user referrals](https://hackerone.com/reports/1668489)** (Program: `Insightly` | Severity: `Medium`)
  > *Summary:* The CSRF vulnerability allowed users to disable Gmail contacts link for user referrals. The vulnerable endpoint did not sufficiently verify that the requests were intentionally performed by the user, ...
- **[CSRF at Network feature](https://hackerone.com/reports/3230359)** (Program: `Lichess` | Severity: `Medium`)
  > *Summary:* A CSRF vulnerability was found in the network feature, where an attacker could change the Network Routing settings by sending a CSRF script to the victim.
- **[There is a POST based CSRF issue over IBM endpoint leading to modification of contact information. ](https://hackerone.com/reports/2919623)** (Program: `IBM` | Severity: `Medium`)
  > *Summary:* There was a CSRF vulnerability found in an IBM endpoint that allowed modification of contact information through a POST request.

## Privilege Escalation (265 Reports)

- **[Privilege Escalation – Access to the Alert Subscribers page for users with low privileges](https://hackerone.com/reports/3353000)** (Program: `SingleStore` | Severity: `Low`)
  > *Summary:* A privilege escalation vulnerability was discovered in the SingleStore Helios alert management system. The vulnerability allowed users with low privileges to access the Alert Subscribers API endpoint ...
- **[PS4 BD-J privilege escalation using nested JAR](https://hackerone.com/reports/3452696)** (Program: `PlayStation` | Severity: `Medium` - Bounty: $2,500)
  > *Summary:* A PS4 vulnerability was discovered in the Blu-ray Disc Java (BD-J) privilege escalation using nested JAR files. The vulnerability was found in the PS4 system software versions 13.00 to the latest vers...
- **[[Vertical Privilege Escalation] User can Unapproved any Approved Translation at [/translations/unapprove/]](https://hackerone.com/reports/3020021)** (Program: `Mozilla` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in the Pontoon web application where any logged-in user could unapprove any approved translation, regardless of their privileges. This was due to a logical error in the ...
- **[[Privilege Escalation] User can Pin|Unpin Any Comment on Any Project or Locale](https://hackerone.com/reports/3025797)** (Program: `Mozilla` | Severity: `Low`)
  > *Summary:* A vulnerability was discovered in the Pontoon application where any user could pin or unpin comments on any project or locale, despite lacking the necessary privileges. This was possible due to the la...
- **[The role "CI-driven scan initiator" provides excessive read access](https://hackerone.com/reports/2276148)** (Program: `PortSwigger Web Security` | Severity: `Low`)
  > *Summary:* The reporter noticed that all authenticated users were able to access certain non-sensitive information such as metadata about third-party integrations. This was found to be by design, and the documen...

## Code Injection (245 Reports)

- **[Unauthenticated RCE in Taskcluster web-server via GraphQL filter argument (sift $where)](https://hackerone.com/reports/3782701)** (Program: `Mozilla` | Severity: `Critical` - Bounty: $12,000)
  > *Summary:* A vulnerability was discovered in the Taskcluster web-server that allowed unauthenticated remote code execution through the GraphQL filter argument. The issue was caused by the use of the 'sift' libra...
- **[PHP code injection in delivery-limitation `logical` validation bypass - XML-RPC setChannelTargeting](https://hackerone.com/reports/3781492)** (Program: `Revive Adserver` | Severity: `High`)
- **[PHP code injection in delivery-limitation `logical` validation bypass](https://hackerone.com/reports/3780854)** (Program: `Revive Adserver` | Severity: `High`)
  > *Summary:* A vulnerability in the delivery-limitation `logical` validation was reported. The vulnerability allowed bypassing the fix for CVE-2026-34916 by sending a disallowed but otherwise valid plugin identifi...
- **[Authenticated Elasticsearch Painless script execution via Query.search.sort_query on hackerone.com/graphql](https://hackerone.com/reports/3694007)** (Program: `HackerOne` | Severity: `High` - Bounty: $7,000)
  > *Summary:* The GraphQL query on hackerone.com/graphql allowed authenticated users to execute arbitrary Painless scripts through the sort_query argument, without server-side validation or allowlisting. This was c...
- **[PHP code injection via delivery limitation logical ](https://hackerone.com/reports/3656781)** (Program: `Revive Adserver` | Severity: `High`)

## Server-Side Request Forgery (SSRF) (225 Reports)

- **[Unauthenticated SSRF in Voxtelesys integration ('checkUrlForSsrf' Bypass via DNS rebinding)](https://hackerone.com/reports/3473145)** (Program: `Rocket.Chat` | Severity: `High`)
  > *Summary:* An SSRF vulnerability was discovered in Rocket.Chat version 7.13.2 that was caused by a DNS rebinding attack. The vulnerability allowed an attacker to bypass a security check and access internal hosts...
- **[SSRF via Improper Redirect Validation in Rocket.Chat oEmbed Function](https://hackerone.com/reports/3383079)** (Program: `Rocket.Chat` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in Rocket.Chat version 7.10.1 where the oEmbed feature did not properly validate redirected URLs. This allowed an attacker to bypass SSRF protections and access internal...
- **[SSRF via improper validation after DNS name resolution in the link-preview feature](https://hackerone.com/reports/3393664)** (Program: `Rocket.Chat` | Severity: `High`)
  > *Summary:* The link-preview feature in Rocket.Chat version 7.11.0 did not properly validate the IP address after DNS resolution. This allowed an attacker to obtain a domain that pointed to an internal IP address...
- **[curl-ipv4-percent-normalization-SSRF](https://hackerone.com/reports/3791168)** (Program: `curl` | Severity: `Medium`)
- **[Blind POST SSRF via Web Push Notification Endpoint](https://hackerone.com/reports/3608558)** (Program: `phpBB` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in phpBB 4.0.0-alpha1 that allowed registered users to register arbitrary URLs as their Web Push notification endpoint. The endpoint URL was stored without validation an...

## Path Traversal (224 Reports)

- **[Unauthenticated Path Traversal (LFI) via /custom-sounds/ when CustomSounds uses FileSystem storage](https://hackerone.com/reports/3514640)** (Program: `Rocket.Chat` | Severity: `High`)
- **[Active Storage Vips Transformer Missing validate_transformation — CVE-2025-24293 Incomplete Fix](https://hackerone.com/reports/3553340)** (Program: `Ruby on Rails` | Severity: `High`)
- **[jitsi-call-analytics: Unauthenticated arbitrary file write via path traversal in `/api/v1/uploads/analyze`](https://hackerone.com/reports/3485343)** (Program: `8x8` | Severity: `Low` - Bounty: $100)
  > *Summary:* A path traversal vulnerability was discovered in the `/api/v1/uploads/analyze` endpoint of the jitsi-call-analytics backend. The vulnerability allowed unauthenticated users to write files within the c...
- **[Burp Suite Professional: browser-powered crawl can write attacker-controlled files through file input handling](https://hackerone.com/reports/3712279)** (Program: `PortSwigger Web Security` | Severity: `High` - Bounty: $5,000)
  > *Summary:* A vulnerability was discovered in Burp Suite Professional 2026.3.3 on Windows. When Burp Scanner's browser-powered crawler crawled an attacker-controlled website, the website could force Burp to write...
- **[ActiveStorage Disk Service Path Traversal via Custom Blob Key Injection](https://hackerone.com/reports/3580511)** (Program: `Ruby on Rails` | Severity: `Medium`)
  > *Summary:* A vulnerability was discovered in the ActiveStorage Disk Service component of Ruby on Rails. The vulnerability allowed an attacker to achieve arbitrary file write, read, and delete on the server's fil...

## Memory Corruption - Generic (219 Reports)

- **[[MK8DX] Improper ranking/replay file parsing](https://hackerone.com/reports/1813453)** (Program: `Nintendo` | Severity: `Critical`)
  > *Summary:* The vulnerability in the Mario Kart 8 Deluxe game involved improper ranking and replay file parsing. This allowed for potential exploitation, leading to potentially unintended consequences.
- **[Buffer Overflow in curl MQTT Test Server (tests/server/mqttd.c) via Malicious CONNECT Packet](https://hackerone.com/reports/3101127)** (Program: `curl` | Severity: `Critical`)
- **[Corrupted pointer in node::fs::ReadFileUtf8(const FunctionCallbackInfo<Value>& args) when args[0] is a string.](https://hackerone.com/reports/3083428)** (Program: `Node.js` | Severity: `Low`)
  > *Summary:* In Node.js, the `ReadFileUtf8` internal binding was found to have a memory leak due to a corrupted pointer in `uv_fs_s.file`. A UTF-16 path buffer was allocated and subsequently overwritten when the f...
- **[Memory Leak](https://hackerone.com/reports/3137657)** (Program: `curl` | Severity: `Unknown`)
- **[("possible") UAF](https://hackerone.com/reports/2981245)** (Program: `curl` | Severity: `None`)

## SQL Injection (200 Reports)

- **[Blind SQL injection via clientid parameter in zone‑include.php](https://hackerone.com/reports/3653196)** (Program: `Revive Adserver` | Severity: `High`)
- **[SQL Injection in Column Type Parameter Allows Arbitrary SQL Execution](https://hackerone.com/reports/3462991)** (Program: `Nextcloud` | Severity: `High`)
- **[Complete authentication bypass to admin permissions](https://hackerone.com/reports/3564655)** (Program: `Rocket.Chat` | Severity: `Critical`)
- **[SQL Injection Detection Bypass in AWS WAF Managed Rules (AWSManagedRulesSQLiRuleSet)](https://hackerone.com/reports/3591725)** (Program: `AWS VDP` | Severity: `None`)
- **[SQL Injection vulnerability found on ibm.com endpoint](https://hackerone.com/reports/3578842)** (Program: `IBM` | Severity: `Critical`)
  > *Summary:* A SQL injection vulnerability was found on an ibm.com endpoint. The vulnerability was reported to IBM, analyzed, and remediated.

## Open Redirect (195 Reports)

- **[OAuth redirect uri validation bypass for :proxima_first_party_sync apps](https://hackerone.com/reports/3588801)** (Program: `GitHub` | Severity: `High`)
  > *Summary:* A vulnerability was identified in GitHub Enterprise Server that allowed an attacker to bypass OAuth redirect URI validation. The vulnerability was fixed in versions 3.20.1, 3.19.5, 3.18.8, 3.17.14, 3....
- **[Incomplete fix for CVE-2022-35406: meta-redirect content-type check bypassable via parameter injection](https://hackerone.com/reports/3775183)** (Program: `PortSwigger Web Security` | Severity: `High`)
- **[another liberapay member team twitter account broken Link Hijacking via Expired Twitter Account Link](https://hackerone.com/reports/3723002)** (Program: `Liberapay` | Severity: `None`)
- **[Liberapay member team twitter account broken Link Hijacking via Expired Twitter Account Link](https://hackerone.com/reports/3721519)** (Program: `Liberapay` | Severity: `Unknown`)
  > *Summary:* The profile of a Liberapay team member contained a link to an expired Twitter account, creating a broken link hijacking vulnerability. The expired Twitter account link was displayed on the member's Li...
- **[Open Redirect in Rocket.Chat](https://hackerone.com/reports/3418031)** (Program: `Rocket.Chat` | Severity: `Medium`)
  > *Summary:* An open redirect vulnerability was identified in Rocket.Chat. The /_saml/sloRedirect/:provider endpoint included the redirect query string value directly in the Location header for a 302 redirect with...

## Command Injection - Generic (152 Reports)

- **[Argument Injection via curl Short-Flag Grouping](https://hackerone.com/reports/3669305)** (Program: `curl` | Severity: `Critical`)
- **[SSTI leads to Command injection](https://hackerone.com/reports/3584149)** (Program: `curl` | Severity: `None`)
- **[wcurl Argument Injection via Unquoted Variable](https://hackerone.com/reports/3523953)** (Program: `curl` | Severity: `Medium`)
- **[Command Injection on Amazon Q Developer CLI via malicious .amazonq/mcp.json leads to arbitrary code execution](https://hackerone.com/reports/3427370)** (Program: `AWS VDP` | Severity: `None`)
- **[Command Injection - CRITICISM](https://hackerone.com/reports/3418760)** (Program: `curl` | Severity: `Unknown`)

## Cross-site Scripting (XSS) - DOM (126 Reports)

- **[DOM XSS in `fizzy.do` import filename preview enables one-click victim account takeover](https://hackerone.com/reports/3608199)** (Program: `Basecamp` | Severity: `High`)
  > *Summary:* A DOM XSS vulnerability was discovered in the file import functionality of the Fizzy application. The vulnerability allowed an attacker to craft a malicious filename that, when previewed by the victim...
- **[Cross-Site Scripting (XSS) Vulnerability via parameter c0-id + Akamai Firewall Bypass](https://hackerone.com/reports/2750977)** (Program: `U.S. Dept Of Defense` | Severity: `Medium`)
  > *Summary:* A Cross-Site Scripting (XSS) vulnerability was discovered on a specific website. The vulnerability was found in the POST method, allowing the injection of malicious scripts that could be executed. Exp...
- **[Cross-Site Scripting (XSS) Vulnerability via POST Method + Akamai Firewall Bypass](https://hackerone.com/reports/2750728)** (Program: `U.S. Dept Of Defense` | Severity: `Medium`)
  > *Summary:* A Cross-Site Scripting (XSS) vulnerability was discovered in the POST method on the target website. The vulnerability allowed the injection of malicious scripts that could be executed. A payload was p...
- **[DOM XSS on www.omnipod.com/freedom/birthdate-confirmation and www.omnipod.com/pif/thanks-freedom](https://hackerone.com/reports/1073725)** (Program: `Insulet Corporation` | Severity: `Medium`)
  > *Summary:* The DOM-based XSS vulnerability was found on the www.omnipod.com/freedom/birthdate-confirmation and www.omnipod.com/pif/thanks-freedom pages. The vulnerability was triggered by crafting a URL with mal...
- **[XSS on using the legacy "Graphie To Png" API](https://hackerone.com/reports/2846011)** (Program: `Khan Academy` | Severity: `Critical`)
  > *Summary:* The legacy "Graphie To Png" API was vulnerable to exploitation. An attacker could upload malicious graphies that included harmful SVG and JSON data. The SVG contained an `onload` attribute that execut...

## Improper Restriction of Authentication Attempts (89 Reports)

- **[ No Rate Limiting on Password Attempts After Insecure Registration Flow cause ATO](https://hackerone.com/reports/3174778)** (Program: `Mars` | Severity: `Medium`)
  > *Summary:* An authentication vulnerability was identified that lacked rate limiting controls on password attempts. The flaw allowed unlimited brute force attacks against user accounts without triggering security...
- **[testing hackerone functions](https://hackerone.com/reports/3463619)** (Program: `curl` | Severity: `None`)
- **[Improper Restriction of Authentication Attempts in cURL](https://hackerone.com/reports/3030158)** (Program: `curl` | Severity: `Critical`)
- **[Improper Authentication Throttling Allows Attacker-Controlled Account Lockouts ](https://hackerone.com/reports/3160210)** (Program: `Lichess` | Severity: `Medium`)
- **[Bruteforce protection in password verification can be bypassed](https://hackerone.com/reports/2230915)** (Program: `Nextcloud` | Severity: `Medium`)
  > *Summary:* A vulnerability was found where the IP address used for brute force protection in Nextcloud server could be bypassed by adding a valid X-Forwarded-For header. This allowed an attacker to bypass the br...

## UI Redressing (Clickjacking) (83 Reports)

- **[clickjacing can lead to account takeover](https://hackerone.com/reports/2119892)** (Program: `pixiv` | Severity: `Low` - Bounty: $200)
  > *Summary:* An endpoint on the website https://sketch.pixiv.net/draw was discovered to be vulnerable to clickjacking. Proof-of-concept code was provided to demonstrate how a user could be tricked into performing ...
- **[User Impersonation through sendMessage options](https://hackerone.com/reports/1031525)** (Program: `Rocket.Chat` | Severity: `Medium`)
  > *Summary:* The Meteor call "sendMessage" allowed clients to use custom avatar and alias parameters, which could be used to impersonate other chat room members. This vulnerability has been patched.
- **[Clickjacking at open.rocket.chat](https://hackerone.com/reports/1584034)** (Program: `Rocket.Chat` | Severity: `Medium`)
  > *Summary:* The open.rocket.chat instance was found to have a misconfiguration issue with the "X-FRAME-OPTIONS" header, which could have allowed for clickjacking attacks. The issue was acknowledged and accepted b...
- **[Clickjacking Vulnerability In Whole Page Ads Tiktok](https://hackerone.com/reports/1418857)** (Program: `TikTok` | Severity: `Low` - Bounty: $500)
- **[Clickjacking at  app.lemlist.com](https://hackerone.com/reports/1574017)** (Program: `lemlist` | Severity: `High`)
  > *Summary:* A vulnerability called Clickjacking was found on app.lemlist.com during security testing. The vulnerability allowed attackers to trick users into clicking on something different from what they perceiv...

## Misconfiguration (81 Reports)

- **[Session Cookie Leakage via Static Header Field in WebViewerFragment](https://hackerone.com/reports/3475626)** (Program: `LinkedIn` | Severity: `High`)
  > *Summary:* A vulnerability was identified in the "WebViewerFragment" that could lead to the leakage of the user's cookies. The root cause was a static field ("CUSTOM_HEADERS") that persisted cookies across diffe...
- **[Internal Access to Hackerone confluence Docs](https://hackerone.com/reports/3113398)** (Program: `HackerOne` | Severity: `High` - Bounty: $12,500)
  > *Summary:* The vulnerability allowed external access to HackerOne's internal Confluence documentation through a support system misconfiguration. This configuration issue granted the ability to view and modify li...
- **[Subdomain takeover on a subdomain under firefox.com](https://hackerone.com/reports/2899858)** (Program: `Mozilla` | Severity: `Medium` - Bounty: $500)
  > *Summary:* The subdomain ████ was vulnerable to a subdomain takeover due to its CNAME record pointing to a Fastly-hosted service that was not registered with Fastly. This allowed the researcher to claim and take...
- **[[ addons-preview-cdn.mozilla.net ] A subdomain takeover is available via unregistered domain in Fastly](https://hackerone.com/reports/2706358)** (Program: `Mozilla` | Severity: `Medium` - Bounty: $500)
  > *Summary:* The domain addons-preview-cdn.mozilla.net was found to CNAME resolve to addons.allizom.org, which was hosted on Fastly's service. The domain addons-preview-cdn.mozilla.net was not registered within Fa...
- **[phpinfo() exposed on ██████████](https://hackerone.com/reports/2641211)** (Program: `Mars` | Severity: `Medium`)
  > *Summary:* A phpinfo() page was exposed at the URL ███████. This configuration issue allowed sensitive system information to be publicly accessed.

## Cryptographic Issues - Generic (74 Reports)

- **[HashDoS in V8](https://hackerone.com/reports/3511792)** (Program: `Node.js` | Severity: `Medium`)
- **[Timing side-channel in HMAC verification via memcmp() in crypto_hmac.cc leads to potential MAC forgery](https://hackerone.com/reports/3533945)** (Program: `Node.js` | Severity: `Medium`)
- **[blockstack.org - is vulnerable to (CVE-2016-2183, CVE-2016-6329)](https://hackerone.com/reports/910732)** (Program: `Hiro` | Severity: `None`)
- **[elections.k8s.io uses weak session secret key, may place elections at risk](https://hackerone.com/reports/1387366)** (Program: `Kubernetes` | Severity: `High` - Bounty: $250)
  > *Summary:* The elections.k8s.io application used a weak Flask SECRET_KEY, the string "N/A", to sign authentication cookies. This allowed the complete compromise of the application, as the session could be manipu...
- **[HashDoS in V8](https://hackerone.com/reports/3131758)** (Program: `Node.js` | Severity: `High`)
  > *Summary:* The V8 release used in Node.js v24.0.0 changed how string hashes were computed using rapidhash. This implementation reintroduced the HashDoS vulnerability, where an attacker who could control the stri...

