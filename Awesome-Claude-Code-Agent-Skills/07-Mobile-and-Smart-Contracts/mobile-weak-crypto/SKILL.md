---
name: mobile-weak-crypto
description: >
  Detects weak or misconfigured cryptography in mobile apps (Android/iOS). Trigger on: hardcoded keys,
  ECB mode, DES, 3DES, RC4, MD5, SHA-1, SecureRandom misuse, static IV, reused IV, Math.random,
  arc4random, CommonCrypto, CryptoKit, Android Keystore, SecKey, AES-ECB, RSA without OAEP,
  insufficient key size, predictable seed, insecure key storage, broken hash, PBKDF2 iteration count.
  Covers MASVS-CRYPTO-1 (algorithm choice) and MASVS-CRYPTO-2 (key management).
license: MIT
compatibility: Designed for Claude Code. jadx, apktool, MobSF, objection, Frida, semgrep recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-CRYPTO-1, MASVS-CRYPTO-2
---

# Mobile Weak Cryptography

## What Is Broken and Why

Mobile apps frequently implement cryptography incorrectly: using broken algorithms (DES, RC4), insecure modes (ECB), static/reused IVs, hardcoded keys embedded in source or resources, or non-cryptographic RNGs for key generation. Android's `java.util.Random` is not a CSPRNG. iOS's `arc4random()` is acceptable but older code uses `rand()`. ECB mode leaks plaintext patterns in ciphertext. Hardcoded keys are extractable via static analysis of the APK or IPA in seconds.

## Key Signals

- `Cipher.getInstance("AES/ECB/NoPadding")` or `Cipher.getInstance("DES/...")` in Android code
- `kCCAlgorithmDES`, `kCCAlgorithmRC4` in iOS CommonCrypto calls
- Hardcoded hex/base64 strings adjacent to crypto API calls
- `new Random()` or `Math.random()` used to generate keys or IVs
- `arc4random()` replaced by `rand()` or custom PRNG in security-critical iOS code
- Static byte arrays used as IV: `byte[] iv = {0,0,0,0,...}`
- `SecretKeySpec` initialized directly from a string literal: `new SecretKeySpec("hardcoded".getBytes(), "AES")`
- RSA without OAEP: `Cipher.getInstance("RSA/ECB/PKCS1Padding")`
- Key sizes below 128-bit (AES), 2048-bit (RSA), 256-bit (EC)

## Methodology

1. **Static analysis — Android:** Decompile APK with `jadx` or `apktool`; search for `Cipher.getInstance`, `SecretKeySpec`, `MessageDigest`, `SecureRandom`, `Random()`
2. **Static analysis — iOS:** Extract IPA; search Swift/ObjC source or binary strings for `CCCrypt`, `kCCAlgorithm`, `SecKey`, hardcoded key strings
3. **Identify algorithm strings** — grep for `"DES"`, `"ECB"`, `"RC4"`, `"MD5"`, `"SHA-1"` in decompiled code
4. **Locate hardcoded key material** — search for 16/32-byte hex strings, base64-encoded strings near crypto calls
5. **Check IV handling** — look for static IV byte arrays or IVs derived from non-random sources
6. **Check key storage** — verify keys are in Android Keystore / iOS Secure Enclave, not in SharedPreferences or NSUserDefaults
7. **Dynamic analysis** — use Frida to hook `Cipher.doFinal()` / `CCCrypt()` and log key, IV, and plaintext at runtime
8. **Verify RNG** — check that `SecureRandom` (Android) and `SecRandomCopyBytes` (iOS) are used for all security-sensitive randomness

## Payloads & Tools

```bash
# jadx search for weak algorithms
grep -r "ECB\|DES\|RC4\|MD5\|SHA-1\|new Random()" jadx-output/

# Frida — Android: hook Cipher.doFinal and log key+plaintext
Java.use("javax.crypto.Cipher").doFinal.overload("[B").implementation = function(b) {
  var key = this.getParameters(); console.log("Key:", key); return this.doFinal(b); };

# Frida — iOS: hook CCCrypt to log algorithm and key
Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "CCCrypt"), {
  onEnter: function(args) {
    console.log("alg:", args[0], "key:", hexdump(args[3], {length: args[4].toInt32()})); }});

# MobSF static analysis (Docker)
docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf
# Upload APK/IPA via web UI — check Crypto section of report

# semgrep rules for Android crypto
semgrep --config p/owasp-top-ten android-source/
```

## Bypass Techniques

- **String obfuscation** — keys obfuscated via XOR or base64 in strings.xml; decode with CyberChef
- **Split key reconstruction** — key split across multiple constants assembled at runtime; trace with Frida
- **Native library crypto** — crypto implemented in JNI `.so`; use Frida to hook `CCCrypt`/`AES_encrypt` in native code
- **ProGuard obfuscation** — class/method names mangled; search by API signature rather than name

## Exploitation Scenarios

**Scenario 1 — Hardcoded AES Key**
Setup: App encrypts local SQLite DB with `SecretKeySpec("SuperSecret1234".getBytes(), "AES")`. → Trigger: Attacker decompiles APK, extracts key string. → Impact: Decrypts all user data without authentication.

**Scenario 2 — ECB Mode Pattern Leak**
Setup: App encrypts user profile images with AES-ECB. → Trigger: Attacker observes ciphertext blocks; identical plaintext blocks produce identical ciphertext. → Impact: Partial plaintext recovery and pattern detection in encrypted files.

**Scenario 3 — Predictable IV Leads to Decryption**
Setup: App uses `new Random(System.currentTimeMillis()).nextBytes(iv)` as IV for AES-CBC. → Trigger: Attacker knows approximate encryption time (from file timestamp). → Impact: Brute-forces seed space (~ms precision), recovers IV, decrypts ciphertext.

## False Positives

- MD5/SHA-1 used for non-security purposes (cache key hashing, file checksums for integrity only)
- `Random` used for UI animations or non-security feature (retry delay jitter)
- Hardcoded strings that look like keys but are test vectors or example data in comments
- ECB mode used for single-block encryption where semantic security is irrelevant (e.g., 16-byte fixed-format ID)

## Fix Patterns

```kotlin
// Android — correct AES-GCM with Android Keystore
val keyGen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
keyGen.init(KeyGenParameterSpec.Builder("myKey",
    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
    .setKeySize(256).build())
val secretKey = keyGen.generateKey()
val cipher = Cipher.getInstance("AES/GCM/NoPadding")
cipher.init(Cipher.ENCRYPT_MODE, secretKey) // IV auto-generated
```

```swift
// iOS — AES-GCM via CryptoKit (iOS 13+)
import CryptoKit
let key = SymmetricKey(size: .bits256)
let sealedBox = try AES.GCM.seal(plaintext, using: key)
// Store key in Secure Enclave or Keychain, never in UserDefaults
```

- Never hardcode keys — generate at first launch and store in Android Keystore / iOS Secure Enclave
- Use AES-GCM or AES-CBC with random IV; never reuse IV with the same key
- Prefer authenticated encryption (AEAD) to detect tampering
- Use `SecureRandom` (Android) / `SecRandomCopyBytes` (iOS) for all security-sensitive randomness

## Related Skills

[[mobile-insecure-storage]] and weak crypto are tightly paired: data stored in SQLite or SharedPreferences with a hardcoded AES key is effectively the same as storing it in plaintext. [[mobile-auth-bypass]] is often enabled by weak crypto — if biometric authentication relies on a poorly keyed token rather than a hardware-bound key, cryptographic bypass is possible. The predictable IV and weak PRNG issues here parallel the session token predictability analysis in [[session-fixation]] and [[cookie-attacks]] on the web side.
