---
name: stack-bounds-format-auditing
description: Detect, audit, and validate stack buffer overflows caused by incorrect bounds arithmetic in string formatting and memory copy operations (snprintf, swprintf, sprintf, strncpy, memcpy) writing into fixed stack buffers where the size argument is not decremented as the destination pointer advances. Use when auditing C/C++ network protocol serializers, URL/URI builders, message formatters, IPC serialization, or logging routines concatenating attacker-controlled fields. Reproduces HackerOne #2551512 (Nintendo NEX StationURL::Format). Produces static scans, crash validation harnesses, CVSS scoring, and remediation guidance.
---

# Stack-Bounds Format Auditing (C/C++)

Find, validate, and remediate stack buffer overflows in C/C++ string-formatting and serialization routines where the size argument to a bounded function is incorrect — specifically when destination pointers advance without a corresponding decrement to the remaining buffer size. Targets and codebases must be within the authorized scope of your assessment.

---

## When to Use

- Auditing C/C++ network protocol serializers, deserializers, and packet formatters.
- Reviewing URL/URI generators, query-string builders, and header concatenation routines.
- Assessing string formatting loops (`snprintf`, `swprintf`, `strncpy`, `wcsncpy`, `memcpy`) writing to fixed stack or heap buffers.
- Triaging potential buffer overflows in game networking, IoT firmware, embedded systems, and IPC mechanisms.
- Analyzing HackerOne report patterns similar to **#2551512** (`nn::nex::StationURL::Format` on Wii U, 3DS, and Nintendo Switch NEX clients).

---

## Reference Case: HackerOne #2551512 (Nintendo NEX `StationURL::Format`)

In Nintendo's NEX network library, `nn::nex::StationURL::Format` serializes key-value connection parameters from a `std::map<String, String>` into a fixed 1024-character stack buffer (`wchar_t url[1024]`):

```cpp
// Vulnerable implementation in NEX clients (HackerOne #2551512)
void nn::nex::StationURL::Format() {
    wchar_t url[1024];
    unsigned int offset = 0;
    unsigned int written = 0;
    bool writeDelimiter = false;

    for (auto param = normalParams.begin(); param != normalParams.end(); param++) {
        if (writeDelimiter) {
            // BUG: size is always 1024 regardless of offset!
            written = swprintf(url + offset, 1024, L";");
            offset += written;
        }
        // BUG: remaining buffer space is not (1024 - offset)
        written = swprintf(url + offset, 1024, L"%ls%ls%ls",
                           param->first.c_str(), L"=", param->second.c_str());
        offset += written;
        writeDelimiter = true;
    }
    SetURL(url);
}
```

### Root Cause Analysis
1. `swprintf(url + offset, 1024, ...)` allows each iteration to write up to **1024 wide characters** starting at `url + offset`.
2. As `offset` grows, `url + offset + written` exceeds the 1024-element boundary (`sizeof(url) = 2048` or `4096` bytes).
3. Because `StationURL` strings are relayed between peer clients via Nintendo servers in multiplayer lobbies, an attacker controlling connection parameters can cause **remote crashes** or **remote code execution (RCE)** on peer consoles.

---

## Phase 0: Recon & Codebase Scanning

1. **Locate Target String Formatting Routines:**
   - Search for bounded format and copy functions: `snprintf`, `swprintf`, `vsnprintf`, `strncpy`, `wcsncpy`, `memcpy`, `memmove`.
   - Search for inherently unsafe unbounded functions: `sprintf`, `vsprintf`, `wsprintf`, `strcpy`, `strcat`, `gets`.

2. **Identify Cumulative Buffer Patterns:**
   - Loops iterating over containers (`std::vector`, `std::map`, linked lists, arrays).
   - Pointer arithmetic or offset accumulation: `buf + offset`, `ptr += n`, `dst += written`.

---

## Phase 1: Static Bounds Arithmetic Analysis

Run the bundled scanner tool across your C/C++ target source tree:

```bash
# Scan a single source file or directory
python3 scripts/fmt_bounds_audit.py scan --src path/to/source/

# Scan with strict filter (highlight only HIGH/CRITICAL arithmetic flaws)
python3 scripts/fmt_bounds_audit.py scan --src path/to/source/ --only-suspicious

# Output machine-readable JSON for integration
python3 scripts/fmt_bounds_audit.py scan --src path/to/source/ --json
```

### Flagged Vulnerability Signatures

| Pattern | Code Example | Risk Level | Explanation |
| :--- | :--- | :--- | :--- |
| **Static Size with Advancing Pointer** | `snprintf(buf + off, sizeof(buf), ...)` | **CRITICAL** | Size argument does not subtract `off`. Cumulative writes overflow the buffer. |
| **Unbounded String Function** | `sprintf(buf, "%s=%s", k, v)` | **HIGH** | No bounds checking whatsoever. |
| **Incorrect Size Unit (Wide Char)** | `swprintf(buf, sizeof(buf), ...)` | **HIGH** | `sizeof(buf)` gives byte count instead of wide character count (`sizeof(buf)/sizeof(wchar_t)`). |
| **Underflow via Negation** | `snprintf(buf + off, sizeof(buf) - off, ...)` | **MEDIUM** | If `off > sizeof(buf)`, `sizeof(buf) - off` wraps to huge unsigned integer if types are mismatched. |

---

## Phase 2: PoC Harness Generation & Crash Validation

Generate and execute a standalone reproduction harness to prove stack overflow and memory corruption:

```bash
# Generate the C/C++ reproduction PoC
python3 scripts/fmt_bounds_audit.py harness --out poc_stationurl.c

# Build and run the PoC with AddressSanitizer (ASan) / stack protector
python3 scripts/fmt_bounds_audit.py harness --build --run

# Test char / snprintf (narrow character) variant
python3 scripts/fmt_bounds_audit.py harness --narrow --build --run

# Compile the verified safe fix (-DSAFE) to prove remediation
python3 scripts/fmt_bounds_audit.py harness --safe --build --run
```

---

## Phase 3: Automation Tooling (`fmt_bounds_audit.py`)

The bundled standalone utility [`scripts/fmt_bounds_audit.py`](scripts/fmt_bounds_audit.py) provides zero-dependency C/C++ code auditing:

- `scan`: Regex-based static analysis engine tailored for format-string bounds errors and pointer arithmetic bugs.
- `harness`: Self-contained PoC generator simulating multi-parameter serialization overflow.
- `demo`: Exports the exact vulnerable Nintendo NEX `StationURL::Format` sample code for verification and benchmarking.

```bash
# Write demo sample and test scanner
python3 scripts/fmt_bounds_audit.py demo --out stationurl_sample.cpp
python3 scripts/fmt_bounds_audit.py scan --src stationurl_sample.cpp
```

---

## Phase 4: Exploitability & Impact Assessment

- **Denial of Service (Crash):** Overwriting the return address or stack canary triggers immediate process termination (`SIGSEGV` or `__stack_chk_fail`).
- **Remote Code Execution (RCE):** In environments lacking stack canaries or with controllable stack layout, an attacker can overwrite return pointers or function pointers on the stack to hijack control flow.
- **Peer-to-Peer Relay Attack Vector:** When formatted strings are exchanged through matchmaking servers, untrusted inputs from one client compromise remote peer clients.

---

## CVSS 3.1 & CWE Mapping

- **CWE-121:** Stack-based Buffer Overflow
- **CWE-119:** Improper Restriction of Operations within the Bounds of a Memory Buffer
- **CWE-676:** Use of Potentially Dangerous Function
- **CVSS:3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` (Base Score: **9.8 Critical** for remote network services / peer relays; **7.5 High** for local crashes)

---

## Remediation Checklist & Secure Patterns

- [ ] **Subtract Current Offset from Remaining Capacity:**
  ```cpp
  // Secure bounds arithmetic
  if (offset < sizeof(url)/sizeof(url[0])) {
      size_t remaining = (sizeof(url)/sizeof(url[0])) - offset;
      int written = swprintf(url + offset, remaining, L"%ls=%ls", key, val);
      if (written > 0 && (size_t)written < remaining) {
          offset += written;
      }
  }
  ```
- [ ] **Use Dynamic String Containers in Modern C++:**
  ```cpp
  // Recommended modern C++ pattern using std::wstring / std::stringstream
  std::wstring url;
  for (const auto& [key, val] : normalParams) {
      if (!url.empty()) url += L";";
      url += key + L"=" + val;
  }
  SetURL(url.c_str());
  ```
- [ ] **Check snprintf / swprintf Return Values for Truncation:**
  - In C99/C++11, `snprintf` returns the number of characters that *would* have been written if buffer was large enough. Always check `if (written >= remaining)` to detect truncation and prevent offset inflation.
- [ ] **Enable Compiler Hardening:**
  - Compile with `-D_FORTIFY_SOURCE=2`, `-fstack-protector-strong`, and `-fsanitize=address,undefined`.