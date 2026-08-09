# Security

We take the security of **Planning Poker Free** seriously.

<p>
  <a href="SECURITY.es.md">Español</a>
  ·
  <a href="SECURITY.md">English</a>
</p>

## Supported versions

Only the `main` branch (latest deployed / repository version) receives security fixes.

## How to report a vulnerability

**Do not** open a public issue or a PR that exposes the problem.

Preferred options, in this order:

1. **GitHub Security Advisories** — report privately from the repository *Security* tab (if *Private vulnerability reporting* is enabled).
2. Private contact with the maintainer listed in the [README](README.md) (GitHub or LinkedIn).

Include, if you can:

- Impact description
- Steps to reproduce
- Affected version / commit
- Minimal PoC (without harming third-party systems)

## What to expect

- Acknowledgement when possible
- Impact assessment and, if applicable, a patch or advisory
- Credit in the advisory if you want it (say so in the report)

## Scope (indicative)

In scope (examples):

- Bypass of private rooms / passwords
- Role escalation (moderation, votes)
- XSS, injection, or WebSocket abuse that affects other participants
- Session data leaks across rooms

Out of scope (examples):

- Volume DoS without a specific bug
- Issues only in forks or unofficial third-party deployments
- Reports without reproducible steps

## Responsible disclosure

Please allow reasonable time to fix before publishing details. We will coordinate disclosure with you once a fix or mitigation is ready.
