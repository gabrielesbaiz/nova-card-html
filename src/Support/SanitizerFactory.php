<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Support;

use Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer;

class SanitizerFactory
{
    public static function make(): HtmlSanitizer
    {
        /** @var string $driver */
        $driver = config('nova-card-html.sanitizer.driver', 'auto');

        return match ($driver) {
            'purifier' => new PurifierSanitizer(self::purifierConfig()),
            'allow-list' => self::allowList(),
            default => PurifierSanitizer::isAvailable()
                ? new PurifierSanitizer(self::purifierConfig())
                : self::allowList(),
        };
    }

    protected static function allowList(): AllowListSanitizer
    {
        /** @var list<string> $tags */
        $tags = config('nova-card-html.sanitizer.allowed_tags', []);

        /** @var array<string, list<string>> $attributes */
        $attributes = config('nova-card-html.sanitizer.allowed_attributes', []);

        return new AllowListSanitizer($tags, $attributes);
    }

    protected static function purifierConfig(): ?string
    {
        /** @var string|null */
        return config('nova-card-html.sanitizer.purifier_config');
    }
}
