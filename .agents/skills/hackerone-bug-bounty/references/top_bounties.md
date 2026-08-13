# Top Awarded HackerOne Bug Bounty Reports

Total Rewarded Reports Analyzed: 1,832

### [$50,000] Github access token exposure
- **URL:** https://hackerone.com/reports/1087489
- **Program:** `Shopify` | **Severity:** `Critical` | **CWE:** `Uncategorized`
- **Summary:** A GitHub Personal Access Token belonging to a Shopify employee was found in a public MacOS app, which granted read and write access to all of Shopify's private GitHub repositories. The token was immediately revoked and access logs were audited to ensure no unauthorized activity had occurred.

---

### [$39,999] [Pre-Submission][H1-4420-2019] API access to Phabricator on code.uberinternal.com from leaked certificate in git repo
- **URL:** https://hackerone.com/reports/591813
- **Program:** `Uber` | **Severity:** `Critical` | **CWE:** `Insecure Storage of Sensitive Information`

---

### [$35,000] Account Takeover via Password Reset without user interactions
- **URL:** https://hackerone.com/reports/2293343
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Improper Access Control - Generic`
- **Summary:** The report submitted to GitLab described a vulnerability that allowed account takeover via the password reset form. The vulnerability was triggered by modifying the JSON request to include the victim's email along with the attacker's email. This resulted in the password reset email being sent to both emails, allowing the attacker to access the victim's account by using the reset link.

---

### [$33,510] Remote Command Execution via Github import
- **URL:** https://hackerone.com/reports/1679624
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Command Injection - Generic`
- **Summary:** Arbitrary Redis commands could be executed on GitLab servers via a remote command execution vulnerability when importing a GitHub repository. The vulnerability was caused by the `Sawyer` library, which allowed an attacker to override built-in methods, and the Redis gem, which used `to_s` and `bytesize` to generate the RESP command. An attacker could inject arbitrary Redis commands by passing a `Sawyer::Resource` object with a controllable hash to Redis. This could be combined with a call to `Marshal.load` to execute a deserialization gadget and gain remote code execution. The vulnerability was patched in GitLab 15.3.1-ee.

---

### [$33,510] RCE via the DecompressedArchiveSizeValidator and Project BulkImports (behind feature flag)
- **URL:** https://hackerone.com/reports/1609965
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Command Injection - Generic`
- **Summary:** Arbitrary command execution was possible on GitLab servers via the `DecompressedArchiveSizeValidator` and Project BulkImports (behind feature flag). An attacker could exploit this vulnerability if the `bulk_import_projects` feature was enabled. This vulnerability has been patched.

---

### [$30,000] RCE via npm misconfig -- installing internal libraries from the public registry
- **URL:** https://hackerone.com/reports/925585
- **Program:** `PayPal` | **Severity:** `Critical` | **CWE:** `Code Injection`
- **Summary:** A vulnerability was identified where certain development projects defaulted to the public NPM registry, instead of using the intended internal packages. This allowed for the creation of packages on the public registry that could have been registered with malicious intent and included in internal development. The issue was mitigated by PayPal with no evidence of prior malicious activity.

---

### [$29,000] Arbitrary file read  via the bulk imports UploadsPipeline
- **URL:** https://hackerone.com/reports/1439593
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Path Traversal`
- **Summary:** Arbitrary files could be read via the bulk imports UploadsPipeline due to the bulk imports API not removing symlinks when untaring the uploads.tar.gz file, allowing any file that the git user has read access to be read and uploaded when importing a group. This could be exploited by a user with access to import a group on GitLab to read arbitrary files on the GitLab server.

---

### [$25,000] Disclosing  PolicyPageAssetGroup in Private Programs via /graphql `gid://hackerone/PolicyPageAssetGroupsIndex::PolicyPageAssetGroup/{id}`
- **URL:** https://hackerone.com/reports/1618347
- **Program:** `HackerOne` | **Severity:** `Critical` | **CWE:** `Uncategorized`
- **Summary:** The vulnerability allowed unauthorized users to retrieve sensitive information about private bug bounty programs on HackerOne, including program names, scope details, and the titles of reports. The issue was promptly addressed by the HackerOne team, who recognized its critical severity and awarded a generous bounty for its discovery.

---

### [$25,000] Server Side Request Forgery (SSRF) via Analytics Reports
- **URL:** https://hackerone.com/reports/2262382
- **Program:** `HackerOne` | **Severity:** `Critical` | **CWE:** `Server-Side Request Forgery (SSRF)`
- **Summary:** We recently received a critical server-side request forgery (SSRF) vulnerability report through our bug bounty program. The issue allowed attackers to make internal requests from our application servers by exploiting a lack of output sanitization in an error message. By crafting malicious requests, an attacker could have accessed internal AWS services and obtained temporary credentials.

Upon receiving the report, we were able to reproduce and verify the issue. We have implemented a fix that is now deployed in production. We have also added regression tests to prevent future occurrences of this vulnerability.  

Our forensic investigation concluded that there is no evidence this issue was exploited prior to the report.

We have rated this vulnerability CVSSv3 10 (Critical) based on the potential impact of exposed credentials.

Based on the severity, business impact, and quality of this report, we have awarded a bounty of $25,000.  

We want to thank @mega7 for sending in their report; reports like

---

### [$25,000] Exposed Kubernetes API - RCE/Exposed Creds
- **URL:** https://hackerone.com/reports/455645
- **Program:** `Snapchat` | **Severity:** `Critical` | **CWE:** `OS Command Injection`

---

### [$25,000] SQL Injection in report_xml.php through countryFilter[] parameter
- **URL:** https://hackerone.com/reports/383127
- **Program:** `Valve` | **Severity:** `Critical` | **CWE:** `SQL Injection`

---

### [$22,300] RepositoryPipeline allows importing of local git repos
- **URL:** https://hackerone.com/reports/1685822
- **Program:** `GitLab` | **Severity:** `Medium` | **CWE:** `Improper Access Control - Generic`
- **Summary:** Arbitrary local git repositories could be imported into GitLab via the `RepositoryPipeline` when importing a project via the BulkImports. This allowed an attacker to clone any repository on GitLab with just the project ID. The vulnerability was due to the `RepositoryPipeline` allowing arbitrary URL protocols to be passed to `project.repository.fetch_as_mirror(url)`.

---

### [$20,160] Potential pre-auth RCE on Twitter VPN
- **URL:** https://hackerone.com/reports/591295
- **Program:** `X / xAI` | **Severity:** `Critical` | **CWE:** `OS Command Injection`

---

### [$20,000] bd-j exploit chain
- **URL:** https://hackerone.com/reports/1379975
- **Program:** `PlayStation` | **Severity:** `High` | **CWE:** `Privilege Escalation`
- **Summary:** A chain of five vulnerabilities was discovered that allowed an attacker to gain JIT capabilities and execute arbitrary payloads on PlayStation 4 and PlayStation 5. The vulnerabilities included insecure deserialization, arbitrary class instantiation, permission bypass, write-what-where primitive, and buffer overflow. An attacker could exploit these vulnerabilities to load and execute pirated games, bypass kernel security measures, and cause a kernel panic. The exploit chain was demonstrated in an ISO image called "bd-jb."

---

### [$20,000] Steal private objects of other projects via project import
- **URL:** https://hackerone.com/reports/743953
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Insecure Direct Object Reference (IDOR)`
- **Summary:** Private objects of other projects could be stolen via project import in GitLab. An attacker could transfer issues, merge requests, and other objects of another project to the imported project by importing a crafted GitLab export. The vulnerability was caused by the fact that many attributes (foreign key) were not excluded during import, allowing the attacker to modify relations between objects and access random resources of other users by traversing the incremental ID space.

---

### [$20,000] Private objects exposed through project import
- **URL:** https://hackerone.com/reports/767770
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Insecure Direct Object Reference (IDOR)`
- **Summary:** Private objects were exposed through a project import vulnerability, allowing an attacker to modify relations between objects and potentially access random resources of other users by traversing the incremental ID space. The vulnerability was a bypass of a previous fix that blocked all "_ids" attributes.

---

### [$20,000] RCE when removing metadata with ExifTool
- **URL:** https://hackerone.com/reports/1154542
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Code Injection`

---

### [$20,000] RCE via unsafe inline Kramdown options when rendering certain Wiki pages
- **URL:** https://hackerone.com/reports/1125425
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Code Injection`
- **Summary:** Arbitrary code execution was possible in GitLab due to unsafe inline Kramdown options when rendering certain Wiki pages. This allowed any user with push access to a wiki to execute arbitrary ruby code.

---

### [$20,000] Arbitrary file read via the UploadsRewriter when moving and issue
- **URL:** https://hackerone.com/reports/827052
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Path Traversal`

---

### [$20,000] Account takeover via leaked session cookie
- **URL:** https://hackerone.com/reports/745324
- **Program:** `HackerOne` | **Severity:** `High` | **CWE:** `Insufficiently Protected Credentials`

---

### [$20,000] Bypass for #488147 enables stored XSS on https://paypal.com/signin again
- **URL:** https://hackerone.com/reports/510152
- **Program:** `PayPal` | **Severity:** `High` | **CWE:** `HTTP Request Smuggling`

---

### [$20,000] Getting all the CD keys of any game
- **URL:** https://hackerone.com/reports/391217
- **Program:** `Valve` | **Severity:** `Critical` | **CWE:** `Improper Access Control - Generic`

---

### [$18,900] Stored XSS on https://paypal.com/signin via cache poisoning
- **URL:** https://hackerone.com/reports/488147
- **Program:** `PayPal` | **Severity:** `High` | **CWE:** `HTTP Request Smuggling`

---

### [$16,000] Stored XSS in markdown via the DesignReferenceFilter 
- **URL:** https://hackerone.com/reports/1212067
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Cross-site Scripting (XSS) - Stored`
- **Summary:** A stored XSS vulnerability was discovered in GitLab that allowed arbitrary JavaScript to be run anywhere that markdown could be posted, such as issues and comments. The vulnerability was caused by a lack of validation or escaping of the URL used in the `AbstractReferenceFilter` and the ability to upload a design with an arbitrary attribute. The vulnerability could be used to create and exfiltrate API tokens with full access.

---

### [$16,000] Arbitrary file read during project import
- **URL:** https://hackerone.com/reports/1132378
- **Program:** `GitLab` | **Severity:** `Critical` | **CWE:** `Path Traversal`
- **Summary:** An arbitrary file read vulnerability was discovered during project import in GitLab. An attacker could exploit a mis-usage of json schema validator to read any file in the GitLab server, potentially leaking sensitive data such as credentials. The vulnerability also allowed for an SSRF attack. The issue affected GitLab.com and self-hosted GitLab instances.

---

### [$15,300] Token leak in security challenge flow allows retrieving victim's PayPal email and plain text password
- **URL:** https://hackerone.com/reports/739737
- **Program:** `PayPal` | **Severity:** `High` | **CWE:** `Missing Authentication for Critical Function`

---

### [$15,250] Ability to bypass partner email confirmation to take over any store given an employee email
- **URL:** https://hackerone.com/reports/300305
- **Program:** `Shopify` | **Severity:** `Critical` | **CWE:** `Time-of-check Time-of-use (TOCTOU) Race Condition`

---

### [$15,000] Groups module can halt chain when handling a proposal with malicious group weights 
- **URL:** https://hackerone.com/reports/3018307
- **Program:** `Cosmos` | **Severity:** `High` | **CWE:** `Uncategorized`
- **Summary:** The Cosmos SDK's groups module contained a vulnerability that could cause a chain to halt when handling a proposal with malicious group weights. The issue was triggered by a division operation that could fail due to the exponent of the resulting value being out of range, leading to a panic and chain halt. This was possible because there were no limits on group member weights, allowing the creation of malicious weights that could trigger the vulnerability.

---

### [$15,000] Delete anyone's content spotlight remotely.
- **URL:** https://hackerone.com/reports/1819832
- **Program:** `Snapchat` | **Severity:** `High` | **CWE:** `Insecure Direct Object Reference (IDOR)`
- **Summary:** A vulnerability was discovered in Snapchat's Spotlight feature that allowed anyone to delete another user's content remotely. By intercepting and modifying the delete request, an attacker could replace the ID parameter with that of another user's video, resulting in the deletion of their content. This could have had a significant impact on content creators and influencers.

---

### [$15,000] Incorrect authorization to the intelbot service leading to ticket information
- **URL:** https://hackerone.com/reports/1328546
- **Program:** `TikTok` | **Severity:** `Critical` | **CWE:** `Improper Authentication - Generic`

---

