# Contributing

Thanks for contributing!

## Getting started

```bash
composer install
npm install
```

Nova is a commercial package: you need a `auth.json` with your Nova credentials
in the project root (it is gitignored).

## Before opening a pull request

```bash
composer lint     # Pint + PHPStan level 6
composer test     # Pest
npm run test      # Vitest
npm run build     # rebuild dist/ and commit it
```

`dist/` is committed on purpose — the service provider serves the built assets
from there, so any change under `resources/` must ship with a rebuilt bundle.

## Conventions

- PHP: Pint (`laravel` preset, `declare(strict_types=1)`), PHPStan level 6.
- JS/Vue: Prettier, `<script setup>` SFCs.
- **The README carries no code samples.** They live on the documentation site
  in `docs/`, which is the single source for them. If you add a sample there,
  cover the behaviour in the Pest suite that owns it.
- New behaviour needs a test. Changes to BC-sensitive surfaces (the `content()`
  hook, the `$title`/`$width`/`$height`/`$center` properties, the constructor
  signature) must keep `tests/LegacySubclassTest.php` green.
