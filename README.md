# 

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gabrielesbaiz/nova-html-card.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-html-card)
[![Total Downloads](https://img.shields.io/packagist/dt/gabrielesbaiz/nova-html-card.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-html-card)

A Laravel Nova card that displays any html content.

Original code from [abordage/nova-html-card](https://github.com/abordage/nova-html-card)

## Features

- ✅ HTML content in Nova card
- ✅ Variable height

## Installation

You can install the package via composer:

```bash
composer require gabrielesbaiz/nova-html-card
```

## Usage

To create a cards use the `artisan` command:

```bash
php artisan nova-html-card MyHtmlCard
```

```php
$novaHtmlCard = new Gabrielesbaiz\NovaHtmlCard();
echo $novaHtmlCard->echoPhrase('Hello, Gabrielesbaiz!');
```

By default, all new cards will be placed in the `app/Nova/Cards` directory. Once your html card class has been generated, 
you're ready to customize it.


```php
<?php

namespace App\Nova\Cards;

use Gabrielesbaiz\NovaHtmlCard\NovaHtmlCard;

class MyHtmlCard extends NovaHtmlCard
{
    /**
     * Name of the card (optional)
     */
    public string $title = '';

    /**
     * The width of the card (1/2, 1/3, 1/4 or full).
     */
    public $width = '1/3';

    /**
     * The height strategy of the card (fixed or dynamic).
     */
    public $height = 'fixed';

    /**
     * Align content to the center of the card.
     */
    public bool $center = true;

    /**
     * Html content
     */
    public function content(): string
     {
        return '<h1 class="text-4xl">Some content</h1>';
     }
}

```

If set `$height = 'fixed'` content will scroll.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Pavel Bychko](https://github.com/abordage)
- [Gabriele Sbaiz](https://github.com/gabrielesbaiz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
