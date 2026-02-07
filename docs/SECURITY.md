# Security & Compliance Documentation

## What We Store

| Data | Purpose | Retention |
|------|---------|-----------|
| Build content | User-submitted build data (title, description, skills, rotation) | Until deleted by edit token holder |
| Edit tokens | 64-char hex tokens for anonymous build ownership | Tied to build lifetime |
| Hashed IP (SHA-256 + salt) | Vote deduplication — **never raw IPs** | Tied to vote lifetime |
| Comment author name | Optional display name (defaults to "Anonymous") | Tied to comment lifetime |
| Comment content | User-submitted text | Until flagged/removed |
| Report data | Reason + optional details for moderation | Until reviewed |

## What We Explicitly Do NOT Do

1. **No reverse engineering** — We do not decompile, disassemble, or reverse engineer the Where Winds Meet game client.
2. **No hooking/injection** — We do not inject code into the game process or intercept game traffic.
3. **No private API usage** — We do not access undocumented or private game APIs.
4. **No scraping** — We do not scrape game websites or third-party databases without explicit permission.
5. **No cheating facilitation** — This tool is for community build planning only. We do not provide hacks, exploits, or automation tools.
6. **No PII collection** — No email, real name, or other PII is required. Accounts are optional.
7. **No tracking** — No analytics, fingerprinting, or cross-site tracking. No third-party scripts.
8. **No raw IP storage** — Voter IPs are hashed with a server-side salt before storage.

## Threat Model

### Assets
- Build data (community content)
- Edit tokens (access control)
- Vote integrity
- System availability

### Threats & Mitigations

| Threat | Category | Mitigation |
|--------|----------|------------|
| XSS via user content | OWASP A7 | All user text sanitized via `stripHtml()` before storage; no `dangerouslySetInnerHTML`; CSP headers block inline scripts (with Next.js exceptions) |
| SQL Injection | OWASP A3 | Prisma ORM with parameterized queries; no raw SQL |
| CSRF | OWASP A8 | API routes use JSON body (not form data); `SameSite` cookie defaults; `form-action 'self'` CSP |
| Rate limiting bypass | Abuse | In-memory rate limiter on all write endpoints; IP-based keying |
| Edit token theft | Authz | Tokens are 256-bit random hex; transmitted only via `x-edit-token` header; never exposed in API responses after creation |
| Vote manipulation | Integrity | One vote per IP hash per build; toggle behavior prevents accumulation |
| Spam content | Content | Rate limits on creation; report system for community moderation; comment flagging |
| DDoS | Availability | Vercel edge network provides baseline protection; rate limits reduce application-level abuse |
| Clickjacking | OWASP A5 | `X-Frame-Options: DENY`; `frame-ancestors 'none'` in CSP |
| Information disclosure | OWASP A1 | `X-Content-Type-Options: nosniff`; `poweredBy: false` in Next config; edit tokens stripped from GET responses |

### Security Headers (next.config.mjs)

- `Content-Security-Policy` — Restricts script, style, image, font, and connect sources
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-Frame-Options: DENY` — Prevents framing
- `X-XSS-Protection: 1; mode=block` — Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Limits referrer leakage
- `Permissions-Policy` — Disables camera, microphone, geolocation
- `Strict-Transport-Security` — Enforces HTTPS

### Input Validation

All input is validated with Zod schemas before processing:
- String length limits on every field
- Enum validation for tags, report reasons, vote values
- Numeric range validation for cast times, cooldowns
- Array length limits (max 5 tags, max 50 rotation actions, max 20 skills)
- HTML stripping on all stored text

## Moderation Approach

1. **Report System** — Any user can report builds or comments with categorized reasons
2. **Flag System** — Reported content can be flagged by moderators (manual review)
3. **Rate Limiting** — Prevents automated spam (10 builds/hour, 20 comments/hour per IP)
4. **Skill Approval** — Submitted skills require moderation approval before appearing publicly
5. **No Automated Moderation** — For MVP, moderation is manual via database queries. Future: admin panel.

### Moderation Queries (Manual)

```sql
-- View pending reports
SELECT * FROM Report WHERE status = 'pending' ORDER BY createdAt DESC;

-- Flag a build
UPDATE Build SET flagged = true WHERE id = '<build-id>';

-- Flag a comment
UPDATE Comment SET flagged = true WHERE id = '<comment-id>';

-- Approve a skill
UPDATE Skill SET approved = true WHERE id = '<skill-id>';

-- Dismiss a report
UPDATE Report SET status = 'dismissed' WHERE id = '<report-id>';
```

## Future Security Enhancements

- [ ] Migrate rate limiter to Redis/Upstash for multi-instance support
- [ ] Add CAPTCHA for build/comment creation if spam becomes an issue
- [ ] Implement admin authentication for moderation panel
- [ ] Add Content-Security-Policy reporting endpoint
- [ ] Consider constant-time comparison for edit tokens
- [ ] Add audit logging for moderation actions
