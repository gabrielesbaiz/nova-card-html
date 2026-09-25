<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Support;

use Illuminate\Support\Str;
use League\CommonMark\CommonMarkConverter;
use RuntimeException;

class MarkdownRenderer
{
    /**
     * @param  array<string, mixed>  $options
     */
    public static function render(string $markdown, array $options = []): string
    {
        if (! class_exists(CommonMarkConverter::class)) {
            throw new RuntimeException(
                'Rendering Markdown requires league/commonmark. Install it with '
                .'"composer require league/commonmark", or use ->html() instead.',
            );
        }

        return Str::markdown($markdown, $options);
    }
}
