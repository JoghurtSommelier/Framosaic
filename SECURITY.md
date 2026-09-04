# Security Policy

Framosaic is a client-only web app: images never leave your browser, and the
app takes no user accounts, no payment details, and no server-side secrets.
Still, if you find a security issue, please report it responsibly.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports. Instead,
use [GitHub's private vulnerability reporting](https://github.com/JoghurtSommelier/Framosaic/security/advisories/new)
for this repository, or email the maintainer listed on the GitHub profile
linked from the repo.

Include what you found, steps to reproduce, and the impact you'd expect. We
aim to acknowledge reports within a few days.

## Scope

Relevant reports include (but aren't limited to):

- XSS or other injection via uploaded filenames or EXIF data
- Dependency vulnerabilities with a real exploit path in this app
- Any code path that would send image data or other user content off-device
- CSP or build-pipeline weaknesses that could lead to supply-chain compromise

## Repository hygiene

- No secrets are used or stored by this app; anything under `VITE_*` is public
  by design (see `.env.example`).
- CI runs a `gitleaks` secret scan on every push/PR.
- GitHub Secret Scanning and Push Protection should be enabled on this
  repository (Settings → Code security).
- Branch protection on `main` should require CI to pass and disallow direct
  pushes (Settings → Branches).
- Dependabot is configured (`.github/dependabot.yml`) for dependency updates.
