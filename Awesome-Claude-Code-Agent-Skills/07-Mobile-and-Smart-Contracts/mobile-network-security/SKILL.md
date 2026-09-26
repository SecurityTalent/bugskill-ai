---
name: mobile-network-security
description: >
  Detects insecure network communication in mobile apps (Android/iOS). Trigger on: cleartext HTTP,
  TLS misconfiguration, certificate pinning bypass, hostname verification disabled, allowCleartextTraffic,
  NSAllowsArbitraryLoads, ATS exceptions, custom TrustManager, ALLOW_ALL_HOSTNAME_VERIFIER, TLS 1.0/1.1,
  weak cipher suites, certificate pinning absent, Network Security Configuration, onReceivedSslError,
  SSLSocket, OkHttp, NSURL, URLSession, certificate transparency, HSTS, MITM.
  Covers MASVS-NETWORK-1 (TLS required) and MASVS-NETWORK-2 (certificate validation).
license: MIT
compatibility: Designed for Claude Code. Burp Suite, mitmproxy, Frida, objection, apktool, jadx, Proxyman recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-NETWORK-1, MASVS-NETWORK-2
---

# Mobile Network Security

## What Is Broken and Why

Mobile apps fail network security when they allow cleartext HTTP traffic, disable TLS certificate validation, or implement certificate pinning incorrectly. Custom `X509TrustManager` implementations that accept all certificates (empty `checkServerTrusted`) are a common developer shortcut that makes the entire TLS layer useless. ATS exceptions in iOS Info.plist or Android Network Security Configuration that allow arbitrary cleartext expose all traffic to MITM. Apps that call `onReceivedSslError().proceed()` in WebViewClient bypass all certificate errors. Certificate pinning without key backup pins causes production outages, so developers remove pinning — leaving no protection.

## Key Signals

- Android: `android:networkSecurityConfig` pointing to XML with `<domain-config cleartextTrafficPermitted="true">`
- Android: `android:usesCleartextTraffic="true"` in manifest
- iOS: `NSAllowsArbitraryLoads: true` in Info.plist ATS section
- Custom `X509TrustManager` with empty `checkServerTrusted()` method body
- `HostnameVerifier` returning `true` for all hosts: `ALLOW_ALL_HOSTNAME_VERIFIER`
- `SSLContext.init(null, arrayOf(trustAllManager), null)`
- WebViewClient `onReceivedSslError` calling `handler.proceed()`
- TLS 1.0/1.1 explicitly enabled via `SSLParameters.setProtocols()`
- No `pin-set` in Network Security Configuration for sensitive domains
- iOS `NSURLSessionDelegate` returning no error for invalid certificates
- `URLSession.shared` with no custom delegate (no pinning) for high-value endpoints

## Methodology

**Setup MITM proxy:**
1. Install Burp/mitmproxy CA cert on device (Android: Settings > Security; iOS: Settings > General > VPN & Device Management)
2. Configure device proxy to point at Burp listener
3. Launch app — observe if traffic appears in proxy (cleartext) or throws certificate errors (pinning)

**Android static analysis:**
1. `apktool d app.apk` — check `AndroidManifest.xml` for `usesCleartextTraffic`, `networkSecurityConfig`
2. Review `res/xml/network_security_config.xml` for cleartext rules and pin-set presence
3. Search decompiled source for `TrustManager`, `HostnameVerifier`, `ALLOW_ALL`, `onReceivedSslError`
4. Search for `SSLContext.init`, `HttpsURLConnection.setDefaultHostnameVerifier`
5. Check OkHttp client config: `OkHttpClient.Builder()` for custom `sslSocketFactory`

**iOS static analysis:**
1. Extract IPA — inspect `Info.plist` for `NSAppTransportSecurity` exceptions
2. Search source for `URLSession`, `NSURLConnection`, custom `URLSessionDelegate` methods
3. Check `didReceiveChallenge` delegate for `completionHandler(.useCredential, ...)`
4. Look for TrustKit, Alamofire, or custom pinning implementation

**Dynamic analysis:**
1. With Burp proxy active — if app connects normally: no pinning or pinning bypass available
2. Attempt SSL kill switch: objection `ios sslpinning disable` or Android `android sslpinning disable`
3. Use Frida script to hook `TrustManagerImpl.checkServerTrusted` or `SecTrustEvaluate`

## Payloads & Tools

```bash
# objection — disable SSL pinning (Android/iOS)
objection --gadget TARGET run android sslpinning disable
objection --gadget TARGET run ios sslpinning disable

# Frida — Android: bypass TrustManager
Java.perform(function() {
  var TrustManager = Java.use("javax.net.ssl.X509TrustManager");
  var SSLContext = Java.use("javax.net.ssl.SSLContext");
  var TM = Java.registerClass({
    name: "FakeTrustManager", implements: [TrustManager],
    methods: { checkClientTrusted: function(){}, checkServerTrusted: function(){},
               getAcceptedIssuers: function(){ return []; } }
  });
  SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;","[Ljavax.net.ssl.TrustManager;","java.security.SecureRandom")
    .implementation = function(km, tm, sr) { this.init(km, [TM.$new()], sr); };
});

# iOS — SSL kill switch (jailbroken device)
# Install SSL Kill Switch 3 via Cydia/Sileo
# OR use Frida script ssl-kill-switch2.js

# Check ATS config in IPA
unzip app.ipa; grep -A20 "NSAppTransportSecurity" Payload/App.app/Info.plist

# Check Android Network Security Config
apktool d app.apk && cat app/res/xml/network_security_config.xml
```

## Bypass Techniques

- **objection sslpinning disable** — hooks common pinning libraries (OkHttp, TrustKit, Alamofire) at runtime
- **SSL Kill Switch 3** — jailbroken iOS; patches `SecTrustEvaluate` at OS level
- **Frida TrustManager replacement** — replaces the app's trust manager with one that accepts all certs
- **MagiskTrustUserCerts** — on rooted Android, installs CA cert as system cert (bypasses Android 14+ restrictions)
- **apk-mitm** — patches APK to disable pinning statically without needing runtime instrumentation
- **Network Security Config override** — repack APK with `cleartextTrafficPermitted="true"` and custom trust anchors

## Exploitation Scenarios

**Scenario 1 — Empty TrustManager MITM**
Setup: App uses `SSLContext.init(null, arrayOf(TrustAllManager()), null)` to avoid pinning errors in dev, shipped to production. → Trigger: Attacker on same Wi-Fi runs mitmproxy. → Impact: All HTTPS traffic decrypted — credentials, session tokens, PII visible.

**Scenario 2 — ATS Exception Cleartext**
Setup: iOS app sets `NSAllowsArbitraryLoads: true` for legacy API compatibility. → Trigger: Network interception on hotel Wi-Fi. → Impact: Plaintext auth tokens and API responses captured.

**Scenario 3 — WebView onReceivedSslError Bypass**
Setup: WebViewClient overrides `onReceivedSslError` and calls `handler.proceed()`. → Trigger: MITM proxy presents a self-signed cert to the WebView. → Impact: Victim navigates authenticated WebView session through attacker's proxy.

## False Positives

- `cleartextTrafficPermitted="true"` only for non-sensitive domains (analytics, CDN assets) with sensitive traffic separately pinned
- Custom `URLSessionDelegate` that validates the cert chain manually and only accepts the prod CA
- Debug-only bypass code that is stripped in release builds (`BuildConfig.DEBUG` guard)
- Certificate pinning disabled for localhost (test environment) — confirm production build behavior

## Fix Patterns

```xml
<!-- Android Network Security Config — correct -->
<network-security-config>
  <domain-config>
    <domain includeSubdomains="true">api.TARGET</domain>
    <pin-set expiration="2026-01-01">
      <pin digest="SHA-256">SPKI_HASH_HERE</pin>
      <pin digest="SHA-256">BACKUP_SPKI_HASH</pin>  <!-- Always include backup pin -->
    </pin-set>
  </domain-config>
</network-security-config>
```

```swift
// iOS — URLSession pinning via TrustKit or manual
func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge,
    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
    guard let serverTrust = challenge.protectionSpace.serverTrust,
          validateCert(serverTrust) else {   // compare SPKI hash
        completionHandler(.cancelAuthenticationChallenge, nil); return
    }
    completionHandler(.useCredential, URLCredential(trust: serverTrust))
}
```

## Related Skills

[[cors-misconfig]] on mobile backend APIs mirrors the same trust boundary issue as missing certificate pinning — both allow a network-positioned attacker to intercept or manipulate authenticated traffic. An empty `TrustManager` is functionally equivalent to [[ssrf]] from the attacker's perspective: the server (or in this case the app) makes authenticated requests to an unverified destination. [[mobile-insecure-storage]] is the fallback attack when network interception fails — if TLS is properly pinned, credentials may still be extractable from local storage.
