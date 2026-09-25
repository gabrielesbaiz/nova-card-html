# Changelog

All notable changes to `nova-card-html` will be documented in this file.

## 3.0.0 - 2026-09-25

### Requirements

- Requires PHP 8.3+, Laravel 12 or 13, and Nova 5.7+ (Nova 6 is explicitly conflicted).
- Dropped Laravel 10 and 11, and PHP 8.0–8.2.

### Added

- Fluent API: `NovaCardHtml::make()` builds a card without declaring a subclass.
- Content sources: `html()`, `markdown()`, `view()`, `text()`/`escape()`.
- Lazy loading: `lazy()`, `deferUntilVisible()`, `refreshEvery()`, `placeholder()`,
  with `#[LazyState]` to carry fluent state across the round trip. The lazy
  endpoint re-checks card authorization on every fetch and forwards the
  dashboard query string so request-reading cards behave identically.
- Caching: `cache($ttl, $key, $store)`, keyed on the card class and its state.
- Presentation: `icon()`, `theme()`, `align()`, `styles()`, `collapsible()`,
  `header()`, `footer()`, `withoutCardStyles()`, and an integer `height()` that
  sets a pixel cap.
- Sanitizing: opt-in `sanitize()` with a dependency-free allow-list sanitizer,
  automatically upgraded to mews/purifier when installed, plus `trustHtml()`.
- Dark mode support, a skeleton loading state, and a retry affordance.
- `php artisan nova-card-html:upgrade` to migrate subclasses from 2.x.
- A publishable config file and translations.
- Real test coverage: 71 Pest tests and 15 Vitest component tests.

### Changed

- **Default height is now `dynamic`** (was `fixed`).
- **Default alignment is now left** (was centered).
- `jsonSerialize()` now merges the card's own keys last, so Nova's `Card` base
  class can no longer override them.
- The build moved from Laravel Mix to Vite; `dist/` output paths are unchanged.
- Card heights are applied as inline styles instead of arbitrary Tailwind
  classes, which only existed in the host application's own Tailwind build and
  therefore silently did nothing.
- `title()` keeps the public `$title` property authoritative for plain strings.

### Deprecated

- `$center` and `center()`; use `$align` and `align()`.

### Removed

- The unused `$content` property. `jsonSerialize()` always called the `content()`
  method and ignored it.
- Laravel Mix, `nova.mix.js`, `postcss.config.js`, `.php-cs-fixer.php` and
  `tlint.json`; the unused `spatie/laravel-package-tools`, `vuex` and `axios`
  dependencies; and the `Workbench\App\` autoload entry pointing at a directory
  that did not exist.

### Fixed

- **The card generator produced broken classes.** `NovaCard.stub` still extended
  the renamed-away `CardHtml`, so every card created by
  `php artisan nova-card-html` fatalled on load.
- `__construct()` no longer breaks `Card::__construct($component)` compatibility,
  and the dead `request()->is('nova-api/metrics/*')` guard was removed.
- The dead `uri-key` replacement in the generator command.
- The Laravel Mix `.nova()` unique name still said `gabrielesbaiz/card-html`.
- Scrollbar styling was hardcoded to light colours and broke in Nova dark mode.

## 2.2.0 - 2.0.0

Nova 5 support, and the rename from `CardHtml` to `NovaCardHtml`.

## 1.0.0

Initial release, based on [abordage/nova-card-html](https://github.com/abordage/nova-card-html).
