---
name: mobile-platform-interaction
description: >
  Detects insecure platform interaction in mobile apps (Android/iOS). Trigger on: exported Activity,
  exported Service, exported BroadcastReceiver, Content Provider, Intent injection, deep link hijacking,
  WebView JavaScript enabled, JavascriptInterface, addJavascriptInterface, setJavaScriptEnabled,
  intent:// scheme, file:// scheme, WKWebView, WKScriptMessageHandler, UIPasteboard, URL scheme hijacking,
  Universal Links, PendingIntent, FLAG_IMMUTABLE, overlay attack, tapjacking, screenshot prevention,
  FLAG_SECURE, Broadcast sniffing, IPC data exposure. Covers MASVS-PLATFORM-1/2/3.
license: MIT
compatibility: Designed for Claude Code. drozer, adb, apktool, jadx, Frida, objection, Burp Suite recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-PLATFORM-1, MASVS-PLATFORM-2, MASVS-PLATFORM-3
---

# Mobile Platform Interaction

## What Is Broken and Why

Mobile platforms expose rich IPC mechanisms (Intents, Content Providers, URL schemes, XPC, Pasteboard) that apps use to communicate. Without proper access control, exported components become attack vectors: a malicious app can send crafted Intents to trigger sensitive operations, read Content Provider data without permission, or hijack deep links by registering the same scheme. WebViews with JavaScript enabled and `addJavascriptInterface` create XSS-to-RCE bridges. Deep link URL parameters injected into WebView navigation or SQL queries without sanitization enable injection attacks within the app.

## Key Signals

- `android:exported="true"` on Activity, Service, or BroadcastReceiver without `android:permission`
- ContentProvider with `android:exported="true"` and no read/write permission constraints
- `setJavaScriptEnabled(true)` in a WebView that loads remote/user-supplied URLs
- `addJavascriptInterface(obj, "name")` exposing Java objects to WebView JS
- `onReceivedSslError().proceed()` (also a network issue, creates XSS delivery path)
- Deep link Intent filter `<data android:scheme="app">` without caller validation
- iOS: custom URL scheme registered without origin verification
- `PendingIntent` created with implicit Intent and no `FLAG_IMMUTABLE`
- iOS: `UIPasteboard.generalPasteboard` writes containing credentials
- WebView `setAllowFileAccess(true)` or `setAllowFileAccessFromFileURLs(true)`
- `filterTouchesWhenObscured` absent on security-sensitive touch targets

## Methodology

**Android:**
1. `apktool d app.apk` — list all exported components in AndroidManifest.xml
2. drozer: `run app.package.attacksurface TARGET_PKG` — shows all exposed components
3. Test exported Activity: `adb shell am start -n TARGET_PKG/.SensitiveActivity`
4. Test exported BroadcastReceiver: `adb shell am broadcast -a com.target.ACTION`
5. Test ContentProvider: `adb shell content query --uri content://TARGET_PKG.provider/users`
6. Review deep link handling: trace `Intent.getData()` usage without input validation
7. WebView audit: search decompiled code for `setJavaScriptEnabled`, `addJavascriptInterface`
8. PendingIntent audit: check all `PendingIntent.getActivity/getBroadcast` calls for `FLAG_IMMUTABLE`

**iOS:**
1. Examine Info.plist for `CFBundleURLTypes` (custom schemes) and `com.apple.developer.associated-domains`
2. Trace `application(_:open:options:)` and `scene(_:openURLContexts:)` for URL parameter handling
3. Check Universal Link validation — does AASA file restrict app association correctly?
4. WKWebView audit: search for `WKScriptMessageHandler` implementations exposing native functionality
5. Pasteboard: search for `UIPasteboard.general.string = ` with sensitive data
6. Background screenshot: trigger app to background, inspect Recents screen for sensitive data visibility

## Payloads & Tools

```bash
# drozer — Android attack surface
drozer console connect
run app.package.attacksurface TARGET_PKG
run app.activity.start --component TARGET_PKG TARGET_PKG.ui.AdminActivity
run app.provider.query content://TARGET_PKG.UserProvider/users
run app.broadcast.send --action TARGET_PKG.TRIGGER_ACTION --extra string key value

# adb — deep link injection
adb shell am start -W -a android.intent.action.VIEW \
  -d "app://login?next=javascript:alert(1)" TARGET_PKG

# adb — access exported content provider
adb shell content query --uri content://TARGET_PKG.provider/internal_notes

# iOS — custom scheme invocation from attacker app
open "victim-app://action?param=../../../etc/passwd"

# Frida — hook WebView JS interface
Java.perform(function() {
  var WebView = Java.use("android.webkit.WebView");
  WebView.addJavascriptInterface.implementation = function(obj, name) {
    console.log("[+] addJavascriptInterface:", name, obj.$className);
    this.addJavascriptInterface(obj, name);
  };
});
```

## Bypass Techniques

- **Intent redirection** — exploit exported Activity that accepts and re-fires a user-supplied Intent, enabling access to unexported components
- **Deep link scheme squatting** — register same URL scheme in a malicious app (Android); when user taps a link, system prompts to choose → hijack possible
- **JavaScript interface reflection** — `addJavascriptInterface` exposes the full Java reflection API on Android < 4.2; use `getClass().forName("Runtime").exec()`
- **Content Provider path traversal** — append `../../` to content URI path to escape intended directory
- **PendingIntent hijacking** — intercept implicit PendingIntent from notification, replace extras to trigger unintended action

## Exploitation Scenarios

**Scenario 1 — Exported Activity Data Theft**
Setup: `SettingsActivity` is exported with no permission; it reads and displays account details from Intent extras. → Trigger: `adb shell am start -n TARGET/.SettingsActivity` with crafted extras. → Impact: Sensitive account data displayed to attacker without authentication.

**Scenario 2 — WebView JavascriptInterface RCE (Android < 4.2)**
Setup: WebView loads user-supplied URL with `addJavascriptInterface(helper, "Android")` binding. → Trigger: Attacker-controlled page calls `window.Android.getClass().forName("java.lang.Runtime").exec(["id"])`. → Impact: Remote code execution in app process via reflected Java method invocation.

**Scenario 3 — iOS URL Scheme Hijacking**
Setup: App registers `myapp://` scheme for deep link login; no verification of calling app. → Trigger: Malicious app opens `myapp://auth?token=STOLEN_TOKEN`. → Impact: Attacker-controlled token processed as legitimate, session hijacked.

## False Positives

- Exported Activity with `android:permission="android.permission.INTERNET"` — any app can hold this; not protective
- Content Provider with `grantUriPermissions` but explicit permission grants only — verify the grant mechanism is controlled
- JavaScript enabled WebView loading only same-origin/local content (resource files from app bundle)
- Custom URL scheme validates calling app via `sourceApplication` — confirm validation is cryptographically sound

## Fix Patterns

```xml
<!-- Android — protect exported component with custom permission -->
<activity android:name=".AdminActivity"
          android:exported="false" />  <!-- prefer unexported -->

<!-- If export required: -->
<activity android:name=".ShareActivity"
          android:exported="true"
          android:permission="com.target.SHARE_PERMISSION" />
```

```kotlin
// Android — PendingIntent with FLAG_IMMUTABLE
val pi = PendingIntent.getActivity(ctx, 0, Intent(ctx, MainActivity::class.java),
    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

// Android — WebView: disable JS if not needed; never expose JS interface to untrusted content
webView.settings.javaScriptEnabled = false
// If JS required, load only trusted local assets:
webView.loadUrl("file:///android_asset/index.html")
```

```swift
// iOS — validate URL scheme source
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any]) -> Bool {
    guard let source = options[.sourceApplication] as? String,
          allowedApps.contains(source) else { return false }
    // process url
}
```

## Related Skills

Deep link parameters injected into WebView navigation parallel [[dom-xss]] — URL scheme parameters that reach `loadUrl()` without validation are the mobile equivalent of a JavaScript-executing DOM sink. Exported Content Providers with path traversal are a mobile-specific form of [[path-traversal]] — the same `../` sequences apply to content URI paths. [[mobile-code-quality]] covers WebView `addJavascriptInterface` vulnerabilities and SQL injection via IPC, which are code-level defects often triggered by platform interaction vectors.
