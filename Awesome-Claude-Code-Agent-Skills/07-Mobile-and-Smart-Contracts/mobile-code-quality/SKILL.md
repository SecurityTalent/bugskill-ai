---
name: mobile-code-quality
description: >
  Detects code quality vulnerabilities in mobile apps (Android/iOS). Trigger on: SQL injection in SQLite,
  JavaScript injection in WebViews, intent injection, unsafe deserialization, NSKeyedUnarchiver,
  NSCoding, Java serialization, Parcelable, buffer overflow, JNI native code, PIE disabled, NX disabled,
  stack canary absent, RELRO, ARC disabled, third-party library CVE, vulnerable dependency, outdated SDK,
  targetSdkVersion, update enforcement missing, implicit Intent, URL loading in WebView,
  object persistence, memory corruption, OWASP dependency check. Covers MASVS-CODE-1/2/3/4.
license: MIT
compatibility: Designed for Claude Code. jadx, apktool, semgrep, MobSF, OWASP Dependency-Check, checksec, Frida recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-CODE-1, MASVS-CODE-2, MASVS-CODE-3, MASVS-CODE-4
---

# Mobile Code Quality

## What Is Broken and Why

Mobile code quality vulnerabilities arise from using deprecated/unsafe APIs, failing to validate input from local storage or IPC, insecure object deserialization, and shipping with exploitable native code. SQL injection via string-concatenated SQLite queries is common. WebViews that load arbitrary URLs without scheme/host validation allow navigation to attacker-controlled content. Java/Kotlin deserialization of untrusted Parcelables or `ObjectInputStream` can lead to type confusion and arbitrary code execution. Native code (JNI/NDK) compiled without stack canaries, PIE, or NX creates exploitable memory corruption conditions.

## Key Signals

- `rawQuery("SELECT * FROM users WHERE id='" + userInput + "'")` — string-concatenated SQL
- `webView.loadUrl(intent.getStringExtra("url"))` — unvalidated URL load
- `ObjectInputStream.readObject()` on data from Intent extras or ContentProvider
- `NSKeyedUnarchiver.unarchiveObject(with:)` without class whitelist (iOS < 12)
- Native library without PIE: `checksec --file=libapp.so` shows `No PIE`
- Gradle `implementation` dependency with published CVE in OSS Index
- `targetSdkVersion` below 30 — misses numerous security improvements
- Implicit Intent used to send sensitive data: `sendBroadcast(Intent("ACTION"))` without package target
- No version check / forced update mechanism — vulnerable older versions remain in production

## Methodology

**SQL Injection:**
1. Identify SQLite query construction in decompiled code — search for `rawQuery`, `execSQL` with `+` concatenation
2. Trace input sources: Intent extras, ContentProvider queries, user input fields
3. Test: inject `' OR '1'='1` via deep link parameter or IPC

**WebView URL loading:**
1. Find all `webView.loadUrl()` / `WKWebView.load(URLRequest)` calls
2. Trace the URL source — does it come from user input, Intent, or remote config?
3. Inject `javascript:` or `file://` scheme payloads

**Deserialization:**
1. Search for `ObjectInputStream`, `Parcel.readValue`, `NSKeyedUnarchiver` in source
2. Check if input is from untrusted source (Intent extras, network, files)
3. Attempt to pass crafted gadget chain via Intent Parcelable extra

**Binary hardening:**
```bash
# Android — check native library protections
apktool d app.apk
for so in app/lib/**/*.so; do checksec --file="$so"; done

# iOS — check binary protections
otool -hv Payload/App.app/App  # check MH_PIE flag
otool -Iv Payload/App.app/App | grep stack_chk  # stack canary
```

**Dependency scanning:**
```bash
# Android — OWASP Dependency-Check
dependency-check --project "app" --scan app.apk --format HTML

# iOS — check Podfile.lock or Package.resolved for known CVEs
```

## Payloads & Tools

```bash
# semgrep — Android SQL injection patterns
semgrep --pattern 'rawQuery($QUERY + $INPUT, $_)' --lang java android-src/
semgrep --pattern 'execSQL($QUERY + $INPUT)' --lang java android-src/

# adb — inject SQL via deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "app://search?q=' OR '1'='1" TARGET_PKG

# checksec — native library hardening
checksec --file=libapp.so
# Look for: Canary: No, NX: No, PIE: No, RELRO: No

# MobSF — automated scan
docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf
# Upload APK — check "Binary Analysis" and "Code Analysis" sections

# iOS — class whitelist check (correct pattern)
# Should use: NSKeyedUnarchiver.unarchivedObject(ofClass: Target.self, from: data)
# Not: NSKeyedUnarchiver.unarchiveObject(with: data)  (deprecated, no type restriction)
```

## Bypass Techniques

- **Parcelable deserialization confusion** — Android's Parcel reads type information from data; craft Parcel with type confusion to trigger unexpected code paths
- **WebView scheme confusion** — `intent://` URIs in WebView can launch app components on Android; `file://` cross-origin reads possible with `setAllowFileAccessFromFileURLs`
- **Dependency CVE chaining** — vulnerable transitive dependency (not direct dependency) often missed by basic scans
- **Native format string** — JNI function using `printf(userInput)` without format string → info leak or code execution

## Exploitation Scenarios

**Scenario 1 — SQLite Injection via Deep Link**
Setup: App's search feature constructs `rawQuery("SELECT * FROM notes WHERE title LIKE '" + query + "'")`. Deep link passes `query` parameter. → Trigger: `app://search?q=' UNION SELECT password FROM users --`. → Impact: All user passwords extracted from local database.

**Scenario 2 — WebView File Read via Intent**
Setup: `WebViewActivity` loads `intent.getStringExtra("url")` without validation; `setAllowFileAccessFromFileURLs(true)`. → Trigger: Malicious app sends Intent with `url=file:///data/data/TARGET/shared_prefs/auth.xml`. → Impact: Victim's SharedPreferences (containing tokens) read by attacker via WebView.

**Scenario 3 — Native Buffer Overflow**
Setup: JNI function processes image metadata with `strcpy(buf, userControlledString)` — no bounds check, no stack canary. → Trigger: Craft image with oversized EXIF field. → Impact: Stack smash; exploitable for code execution in native context.

## False Positives

- `rawQuery` with parameterized query: `rawQuery("SELECT * FROM t WHERE id=?", arrayOf(id))` — safe
- WebView loading only `file:///android_asset/` or `https://` with host whitelist
- Deserialization of trusted, internally generated data with known class whitelist
- Old `targetSdkVersion` in a library module that doesn't affect app runtime security features

## Fix Patterns

```kotlin
// Android — parameterized SQLite query
db.rawQuery("SELECT * FROM notes WHERE title LIKE ?", arrayOf("%$userInput%"))
// Or use Room with @Query annotation (handles binding automatically)

// Android — WebView URL whitelist
val allowedHosts = setOf("api.target.com", "assets.target.com")
webView.webViewClient = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        return request.url.host !in allowedHosts  // block if not whitelisted
    }
}
```

```swift
// iOS — typed NSKeyedUnarchiver (safe)
guard let obj = try? NSKeyedUnarchiver.unarchivedObject(ofClass: MyModel.self, from: data) else { return }

// iOS — force update check
let storeVersion = fetchAppStoreVersion()
if currentVersion < minimumSupportedVersion { showForceUpdateDialog() }
```

```cmake
# CMakeLists.txt — enable hardening flags for native code
target_compile_options(mylib PRIVATE -fstack-protector-strong -D_FORTIFY_SOURCE=2 -fpie)
target_link_options(mylib PRIVATE -Wl,-z,relro,-z,now -pie)
```

## Related Skills

[[mobile-platform-interaction]] is the delivery layer for many code quality vulnerabilities — exported components and deep links are how untrusted input reaches `rawQuery()` and `webView.loadUrl()`. SQLite injection via string concatenation here is the mobile equivalent of [[sql-injection]] on the web, with identical methodology and payloads adapted for Android's `rawQuery`. Deserialization of Parcelable data mirrors web-side unsafe deserialization and [[xxe]] in the sense that both exploit parser trust of attacker-controlled structured input.
