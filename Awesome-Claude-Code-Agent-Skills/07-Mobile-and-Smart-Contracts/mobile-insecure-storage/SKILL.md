---
name: mobile-insecure-storage
description: >
  Detects sensitive data stored insecurely on mobile devices (Android/iOS). Trigger on: SharedPreferences,
  NSUserDefaults, SQLite, Room DB, DataStore, Core Data, Keychain misconfiguration, external storage,
  backup exposure, plaintext files, unencrypted databases, adb backup, iCloud backup, NSFileProtection,
  EncryptedSharedPreferences, SQLCipher, allowBackup, FLAG_SECURE, keyboard cache, sensitive logs.
  Covers MASVS-STORAGE-1 (local storage) and MASVS-STORAGE-2 (exposure to unauthorized actors).
license: MIT
compatibility: Designed for Claude Code. Android Studio, adb, apktool, jadx, objection, Frida, iMazing, idb recommended.
metadata:
  category: mobile
  version: "0.1"
  source: https://mas.owasp.org/MASTG/
  source_types: framework
  masvs: MASVS-STORAGE-1, MASVS-STORAGE-2
---

# Mobile Insecure Data Storage

## What Is Broken and Why

Mobile apps often store sensitive data (credentials, tokens, PII, keys) in locations accessible to other apps, backups, or physical device extraction. Android's SharedPreferences and iOS's NSUserDefaults are plaintext XML/plist files readable with root/jailbreak. External storage is world-readable. Backups (ADB/iCloud) can expose the entire app sandbox unless explicitly excluded. Logging APIs persist sensitive data in system logs readable by other apps. The attacker gains access to credentials or session tokens without ever touching the backend.

## Key Signals

- `allowBackup="true"` in AndroidManifest.xml without `fullBackupContent` exclusion rules
- SharedPreferences files in `/data/data/<pkg>/shared_prefs/` containing tokens, passwords, or keys
- SQLite databases in the app sandbox without SQLCipher encryption
- Files in `/sdcard/` or `getExternalStorageDirectory()` containing sensitive content
- iOS files lacking `NSFileProtectionComplete` data protection class
- Keychain items with `kSecAttrAccessibleAlways` or no accessibility constraints
- Log statements (`Log.d`, `NSLog`, `print`) containing session tokens or user data
- Input fields without `inputType="textPassword"` or `secureTextEntry=true`
- App switcher screenshots capturing password or payment screens

## Methodology

**Android:**
1. Decompile APK: `apktool d app.apk` — review `AndroidManifest.xml` for `allowBackup`, `fullBackupContent`
2. Pull sandbox via ADB: `adb backup -f backup.ab -noapk <pkg>` → extract with `android-backup-extractor`
3. Inspect `/data/data/<pkg>/` (rooted): `shared_prefs/`, `databases/`, `files/`
4. Check SharedPreferences XML for plaintext credentials or tokens
5. Open SQLite databases: `sqlite3 app.db .dump` — look for unencrypted sensitive tables
6. Search for external storage usage: `grep -r "getExternalStorage"` in decompiled source
7. Check for sensitive log output: `adb logcat | grep -i "password\|token\|secret\|key"`
8. Use objection: `android hooking list activities` → `android clipboard monitor`

**iOS:**
1. Pull IPA and extract app bundle; examine Info.plist for NSAllowsArbitraryLoads
2. Use iMazing or `ideviceinstaller` to pull app sandbox data
3. Check Data Protection class on files: `objection --gadget TARGET run ios filesystem list`
4. Inspect NSUserDefaults: `<uuid>.plist` in Library/Preferences
5. Check Keychain: `objection run ios keychain dump`
6. Dynamic: Frida hook `NSFileManager writeToFile` to observe Data Protection class used
7. Background the app — screenshot the app switcher for sensitive data capture

## Payloads & Tools

```bash
# Android — pull and extract backup
adb backup -f backup.ab -noapk TARGET_PKG
java -jar abe.jar unpack backup.ab backup.tar
tar xvf backup.tar

# Android — inspect SharedPreferences (rooted)
adb shell "cat /data/data/TARGET_PKG/shared_prefs/*.xml"

# Android — check logcat for leaks
adb logcat | grep -iE "password|token|secret|api.?key|session|auth"

# iOS — Frida: dump NSUserDefaults
frida -U TARGET -e "ObjC.classes.NSUserDefaults.standardUserDefaults().dictionaryRepresentation()"

# iOS — objection: keychain dump
objection --gadget TARGET run ios keychain dump

# iOS — check Data Protection class
frida -U TARGET -l data_protection_check.js
```

## Bypass Techniques

- **Backup extraction without root** — ADB backup works on non-rooted devices if `allowBackup=true`
- **Keychain extraction on jailbroken device** — Keychain items without `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` survive device-to-device migration
- **Memory scraping** — even encrypted storage decrypts into memory; dump process memory with `gcore` or Frida memory scanner
- **Log persistence** — `adb logcat -d` captures prior log buffer; sensitive data logged before crash is preserved

## Exploitation Scenarios

**Scenario 1 — ADB Backup Token Theft**
Setup: App stores JWT in SharedPreferences, `allowBackup=true`. → Trigger: Attacker with USB access runs `adb backup`. → Impact: Extracts valid session token, authenticates to backend as victim.

**Scenario 2 — External Storage Credential Exposure**
Setup: App writes exported reports to `getExternalStorageDirectory()`. → Trigger: Malicious app with `READ_EXTERNAL_STORAGE` reads the files. → Impact: PII and embedded tokens from reports leaked to third-party app.

**Scenario 3 — iOS Keychain Accessible After Reboot**
Setup: App stores password in Keychain with `kSecAttrAccessibleAlways`. → Trigger: Attacker with physical device access extracts Keychain via jailbreak. → Impact: Password retrieved even when device is locked/rebooted.

## False Positives

- SharedPreferences containing non-sensitive config (theme, language preference)
- SQLite databases storing only public content (cached news articles, offline maps)
- Keychain items scoped to the correct access control group — confirm accessibility attribute
- Log output in debug builds only — verify the production build strips debug logs

## Fix Patterns

```kotlin
// Android — encrypted SharedPreferences
val masterKey = MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
val prefs = EncryptedSharedPreferences.create(context, "secure_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)

// Android — exclude from backup
// res/xml/backup_rules.xml
// <exclude domain="sharedpref" path="." />
```

```swift
// iOS — Keychain with strict access control
let access = SecAccessControlCreateWithFlags(nil, kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
    .userPresence, nil)
// iOS — exclude file from backup
var url = URL(fileURLWithPath: sensitiveFilePath)
try url.setResourceValues({ v in v.isExcludedFromBackup = true }())
```

## Related Skills

[[mobile-weak-crypto]] is the direct mitigation path: data that must be stored locally should be protected using properly implemented cryptography with keys in the Android Keystore or iOS Secure Enclave. [[mobile-auth-bypass]] overlaps when insecure storage holds auth tokens — a stolen JWT from SharedPreferences enables direct backend access without triggering biometric checks. [[mobile-resilience]] controls (root/jailbreak detection) are the last line of defense if storage protections fail, since extraction typically requires root or jailbreak access.
