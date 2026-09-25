# Security Policy

## Reporting a vulnerability

Please report security issues to gabriele@sbaiz.com rather than opening a public
issue. You will get a response as quickly as possible.

## Threat model for this package

This card renders HTML into the Nova dashboard through Vue's `v-html`. That is
its entire purpose, and it means **card content is a trust boundary**.

- Content is assumed to be authored by your application, in PHP. It is passed to
  the browser untouched by default.
- If any part of a card's content comes from user input — a name, a comment, a
  filename, an imported spreadsheet cell — call `->sanitize()` on that card, or
  set `nova-card-html.sanitize` to `true` globally. Otherwise you have a stored
  XSS vector in your admin panel.
- `->text()` escapes its input and is always safe.
- `->markdown()` strips embedded HTML unless you call `->trustHtml()`.

## Lazy loading

Lazy card tokens are encrypted with the application key, so they cannot be
forged or read by the client. Two rules follow from that:

- A valid token proves **provenance, not permission**. The lazy endpoint
  re-instantiates the card and re-runs its `authorize()` on every request.
- The endpoint refuses any token whose class is not a `NovaCardHtml` subclass,
  so a token can never be used to instantiate arbitrary application classes.

The route is registered inside Nova's own middleware group, so Nova
authentication and the `viewNova` gate apply before any of the above runs.
