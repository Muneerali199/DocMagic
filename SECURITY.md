# Security Policy

We take the security of Draftdeckai seriously. We appreciate your efforts to responsibly disclose your findings, and we will make every effort to acknowledge your contributions.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please **do not** create a public GitHub issue. If you discover a security vulnerability within this project, please **do not** create a public GitHub issue. Instead, please report it via email to **[MAINTAINERS: PLEASE INSERT SECURITY EMAIL HERE]**.

Please include the following details in your report:
* Description of the location and potential impact of the vulnerability.
* A detailed description of the steps required to reproduce the vulnerability (POC scripts, screenshots, and compressed packet captures are all helpful).
* Any relevant background information or technical details.

## Expected Response Time

We aim to respond to all vulnerability reports within **48 hours** of receipt. We will keep you informed of our progress as we investigate and resolve the issue. We aim to triage and fix critical vulnerabilities within 7 days.

## Scope

**In Scope:**
* Authentication or authorization bypasses.
* Cross-Site Scripting (XSS), SQL Injection (SQLi), or Cross-Site Request Forgery (CSRF).
* Data exposure or data leaks.
* Server-Side Request Forgery (SSRF).
* Remote Code Execution (RCE).

**Out of Scope:**
* Volumetric vulnerabilities (e.g., Denial of Service / DDoS).
* Spam or social engineering techniques (e.g., phishing).
* Issues requiring physical access to a user's device.
* Missing security headers that do not lead directly to a vulnerability.
* Vulnerabilities in third-party integrations (e.g., Stripe, Supabase) unless they are caused by our specific implementation.