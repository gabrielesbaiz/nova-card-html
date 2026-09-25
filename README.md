<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="art/nova-card-html-logo.png">
        <img src="art/nova-card-html-logo-light.png" alt="NovaCardHtml" width="600">
    </picture>
</p>

# Nova Card HTML

Any HTML you can render in PHP, as a Laravel Nova card — a string, a Markdown document or a Blade view, placed on the dashboard grid, lazy-loaded so it never blocks the paint.

[![Latest version](https://img.shields.io/packagist/v/gabrielesbaiz/nova-card-html.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-card-html)
[![PHP](https://img.shields.io/packagist/dependency-v/gabrielesbaiz/nova-card-html/php?style=flat-square)](composer.json)
[![Laravel](https://img.shields.io/packagist/dependency-v/gabrielesbaiz/nova-card-html/illuminate%2Fsupport?style=flat-square&label=laravel)](composer.json)
[![Downloads](https://img.shields.io/packagist/dt/gabrielesbaiz/nova-card-html.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-card-html)
[![Stars](https://img.shields.io/github/stars/gabrielesbaiz/nova-card-html?style=flat-square&logo=github)](https://github.com/gabrielesbaiz/nova-card-html/stargazers)
[![Sponsor](https://img.shields.io/github/sponsors/gabrielesbaiz?style=flat-square&label=sponsor&logo=github)](https://github.com/sponsors/gabrielesbaiz)

### 📖 [Read the documentation →](https://gabrielesbaiz.github.io/nova-card-html/)

Every method, every config key, a card-geometry sheet you can drive yourself,
and a live specimen where every presentation and behaviour option rewrites the
call as you click it.

> [!CAUTION]
> **Upgrading from 2.x?** Read [UPGRADE.md](UPGRADE.md) first. The default height
> is now `dynamic` and the default alignment is left. Your `content()` methods
> are untouched; `php artisan nova-card-html:upgrade --dry-run` previews the rest.

> [!IMPORTANT]
> A ⭐ costs you nothing and helps other developers find this package.
> [Sponsoring](https://github.com/sponsors/gabrielesbaiz) keeps it compatible
> with every new Laravel and Nova release.

## What it does

Nova ships metrics. If you want a number, a trend or a breakdown, use
`Value`, `Trend` or `Partition` — they cache, they range-select, and you write
no markup at all. If you want a widget with its own state, forms and events,
write a real Vue card; you will end up there anyway.

This package is the middle: markup your application already produces, on the
dashboard grid, without a build step.

- **Four content sources** — a string, Markdown, a Blade view, or escaped text.
- **Lazy loading** that keeps card queries off the dashboard's critical path, with `#[LazyState]` to carry a selected year or filter across the fetch.
- **Response caching and polling**, keyed on the card class and its state.
- **Dark mode, five accent themes, card-scoped CSS** — and pixel heights applied inline, so they work whatever your Tailwind build generated.
- **An opt-in sanitizer** for the content you did not author.
- **4.95 kB of JavaScript and 2.23 kB of CSS**, both gzipped under 2 kB, with no runtime dependency of its own.

Card content is a trust boundary: this renders server-produced HTML through
Vue's `v-html`, and the package cannot tell your markup from a user's name that
ended up inside it. That is what `sanitize()` and `text()` are for.

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- Nova 5.7+ — Nova 6 is explicitly conflicted

## Installation

```bash
composer require gabrielesbaiz/nova-card-html

php artisan nova-card-html MyHtmlCard

php artisan vendor:publish --tag=nova-card-html-config
php artisan vendor:publish --tag=nova-card-html-lang
```

The service provider is auto-discovered and the assets register themselves with
Nova: no migrations, no tables, nothing to add to `NovaServiceProvider`. Both
publish steps are optional — the card works untouched.

**[Full installation guide →](https://gabrielesbaiz.github.io/nova-card-html/#/install)**

## Artisan commands

| Command | Purpose |
|---|---|
| `nova-card-html {name}` | Generate a card in `app/Nova/Cards`. `--force` overwrites. |
| `nova-card-html:upgrade` | Migrate 2.x subclasses to the 3.0 defaults, and report what is a candidate for the new features. `--dry-run` writes nothing. |

See the [commands page](https://gabrielesbaiz.github.io/nova-card-html/#/commands).

## Documentation

| | |
|---|---|
| [Documentation site](https://gabrielesbaiz.github.io/nova-card-html/) | Everything: install, configure, operate. |
| [Guide](https://gabrielesbaiz.github.io/nova-card-html/#/guide) | Building a card, and the four content sources. |
| [Performance](https://gabrielesbaiz.github.io/nova-card-html/#/performance) | Caching, lazy loading, `#[LazyState]`, polling. |
| [API reference](https://gabrielesbaiz.github.io/nova-card-html/#/api) | All thirty-two methods, with defaults. |
| [Configuration](https://gabrielesbaiz.github.io/nova-card-html/#/config) | All sixteen keys, and what changing them does. |
| [Security](https://gabrielesbaiz.github.io/nova-card-html/#/security) | The trust boundary, and what is deliberate. |
| [UPGRADE.md](UPGRADE.md) | Upgrading from 2.x. Read before you start. |
| [CHANGELOG.md](CHANGELOG.md) | What changed, and when. |

## Testing

```bash
composer test        # Pest
composer analyse     # PHPStan
composer format      # Pint
npm run test         # Vitest, for the Vue component
npm run build        # rebuild dist/
```

There is no CI. Those commands are the contract. `dist/` is committed because
the service provider serves from it, so any change under `resources/` ships with
a rebuilt bundle.

## Contributing

Thank you for considering contributing. The guide is in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Security vulnerabilities

Please review [SECURITY.md](SECURITY.md) for reporting a vulnerability. Please
do not open a public issue.

## Credits

Written and maintained by [Gabriele Sbaiz](https://github.com/gabrielesbaiz).

Originally based on
[abordage/nova-card-html](https://github.com/abordage/nova-card-html) by
[Pavel Bychko](https://github.com/abordage). It builds on Laravel and Laravel
Nova, and optionally on
[league/commonmark](https://commonmark.thephpleague.com) and
[mews/purifier](https://github.com/mewebstudio/Purifier).

## Support this package

If it is useful to you:

- ⭐ **Star the repo.** Free, thirty seconds, and it is the first signal other developers look at.
- ❤️ **[Become a sponsor](https://github.com/sponsors/gabrielesbaiz).** From $5 a month.
- 🐛 **Open a good issue.** A clear reproduction is worth more than you think.
- 🗣️ **Tell another Laravel developer.** Word of mouth is how packages survive.

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-gabrielesbaiz-ff69b4?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/gabrielesbaiz)

## Disclaimer

This package is provided **as is**, without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose, title and non-infringement. To the fullest
extent permitted by applicable law, in no event shall the authors, copyright
holders or contributors be liable for any claim, damages or other liability —
whether in an action of contract, tort or otherwise — arising from, out of or in
connection with this package or its use, including without limitation any
direct, indirect, incidental, special, exemplary, consequential or punitive
damages, loss of data, loss of profits, business interruption, account
compromise, or unauthorised access.

This package renders HTML that your application produces, through `v-html`,
without inspecting it by default. Whoever deploys it is responsible for deciding
whether a given card's content is safe to render unescaped. That responsibility
includes, and is not limited to, calling `sanitize()` or `text()` on anything a
user can influence, reviewing what your own `content()` methods interpolate,
restricting who can see a card with `canSee()` or `authorize()`, and reviewing
the code yourself before putting it in front of data you cannot afford to leak.
Nothing here constitutes security, legal or compliance advice.

Use of this package is entirely at your own risk.

## License

MIT. See [LICENSE.md](LICENSE.md). The MIT licence's warranty disclaimer and
limitation of liability apply in full, alongside the disclaimer above.
