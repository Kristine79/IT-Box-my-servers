# Cybersecurity Skills Library

**754 structured cybersecurity skills** for AI agents by [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)

## Coverage

- **26 security domains**
- **5 frameworks**: MITRE ATT&CK, NIST CSF 2.0, MITRE ATLAS, D3FEND, NIST AI RMF
- **Apache 2.0 License**

## Skill Categories

| Category | Count |
|----------|-------|
| Threat Hunting | 50+ |
| Incident Response | 40+ |
| Malware Analysis | 35+ |
| Penetration Testing | 45+ |
| Forensics | 30+ |
| Cloud Security | 40+ |
| Zero Trust | 25+ |
| Detection Engineering | 35+ |
| Vulnerability Management | 20+ |
| And more... | 400+ |

## Usage

Ask Claude to use specific skills:

```
"Use the skill implementing-secrets-management-with-vault to review our codebase"
"Apply detecting-credential-dumping-techniques to analyze these logs"
"Follow performing-threat-hunting-with-yara-rules to hunt for malware"
```

## Installation

```bash
# Update skills from upstream
git subtree pull --prefix=.windsurf/skills https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git main --squash
```

---

*Installed: $(Get-Date -Format "yyyy-MM-dd")*
