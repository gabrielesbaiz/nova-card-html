# Upgrade guide

## 2.x → 3.0

### Requirements

| | 2.x | 3.0 |
|---|---|---|
| PHP | ^8.0 | ^8.3 |
| Laravel | 10, 11, 12 | 12, 13 |
| Nova | ^5.0 | ^5.7 (`<6.0`) |

Laravel 13 requires PHP 8.3, which sets the new floor.

### What keeps working untouched

If your cards look like this — and virtually all of them do — they need **no changes**:

```php
class MyCard extends NovaCardHtml
{
    public $width = 'full';

    public function content(): string
    {
        return '<p>…</p>';
    }
}
```

Specifically, all of the following are still supported:

- Overriding `content(): string`. This remains the primary API and is not deprecated.
- The `$title`, `$width` and `$height` properties.
- A subclass `__construct()` calling `parent::__construct()` with no arguments.
- `extraData()`.

### Breaking changes

**1. Default height is now `dynamic` (was `fixed`).**
**2. Default alignment is now left (was centered).**

Cards that set `$height` or `$center` explicitly are unaffected. Only cards that
relied on the old defaults change appearance. Restore the old behaviour with:

```php
public $height = 'fixed';

public string $align = 'center';
```

**3. The `$content` property was removed.**

It never did anything — `jsonSerialize()` always called the `content()` *method*
and ignored the property. Nothing that worked before stops working.

**4. `$center` / `center()` are deprecated.**

Both still work. `$center` is read whenever `align()` was not called, so
`public bool $center = true;` still centers the card. `center()` now emits an
`E_USER_DEPRECATED` notice. Migrate to `$align` / `align()`.

### Automated migration

```bash
php artisan nova-card-html:upgrade --dry-run     # preview
php artisan nova-card-html:upgrade               # apply
```

The command scans for `NovaCardHtml` subclasses and:

1. removes `$height = 'dynamic'`, `$center = false` and `$title = ''`
   declarations that now only restate a default;
2. rewrites `public bool $center = true;` to `public string $align = 'center';`
   so explicitly centered cards stay centered;
3. **reports, without editing**, cards that are candidates for the new features:
   inline `<style>` blocks (→ `->styles()`), hand-written dark mode CSS (the
   package now ships dark mode), hand-rolled `setInterval`/`fetch` polling
   (→ `->refreshEvery()`), and fluent setters with no `#[LazyState]` attribute
   (which block `->lazy()`).

Use `--path=` to scan somewhere other than `app`.

### Recommended follow-up

None of this is required, but it is where the value is:

```php
// Stop re-running expensive queries on every dashboard paint.
->cache(now()->addHour())

// Paint the dashboard first, fetch the content after.
#[LazyState] protected int $year;   // so forYear() survives the round trip
->lazy()

// Replace hand-rolled setInterval in emitted HTML.
->refreshEvery(30)

// Replace <style> blocks emitted from content().
->styles('.my-class { color: red }')
```
