---
name: stack-bounds-format-auditing
description: Detect and exploit stack buffer overflows caused by incorrect bounds arithmetic in string formatting — snprintf/swprintf/sprintf/strncpy/memcpy calls writing into fixed stack buffers where the size argument is never reduced as the destination advances. Use when auditing C/C++ protocol serializers, URL/URI builders, message formatters, logging of remote data, or network-facing code that concatenates attacker-controlled fields into fixed arrays. Reproduces the HackerOne #2551512 bug (nn::nex::StationURL::Format on Wii U/3DS/Switch NEX clients). Produces static-scan triage, PoC harnesses, crash validation, and remediation guidance.
---

# Stack-Bounds Format Auditing (C/C++)

Find and prove stack buffer overflows in string-formatting code where the size
argument to a bounded function is wrong — most commonly because it is never
decremented as the write pointer advances. Targets must be within the scope of
the engagement you are authorized to test.

## Reference case: HackerOne #2551512 (Nintendo NEX, StationURL::Format)
`nn::nex::StationURL::Format` builds a URL from a `std::map<String, String>` of
parameters into a fixed stack buffer:

```cpp
wchar_t url[1024];
uint offset = 0, written = 0;
bool writeDelimiter = false;

for (auto param = normalParams.begin(); param != normalParams.end(); param++) {
    if (writeDelimiter) {
        written = swprintf(url + offset, 1024, L";");
        offset += written;
    }
    written = swprintf(url + offset, 1024, L"%ls%ls%ls",
                       param->first, L"=", param->second);
    offset += written;
    writeDelimiter = true;
}
SetURL(url);