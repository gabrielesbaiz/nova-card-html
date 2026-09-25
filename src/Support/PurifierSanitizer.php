<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Support;

use Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer;

/**
 * Delegates to mews/purifier when the host application has it installed.
 *
 * The package is an optional dependency, so it is resolved from the container
 * by name rather than referenced as a class: this file must stay loadable in
 * an application that never installs it.
 */
class PurifierSanitizer implements HtmlSanitizer
{
    public function __construct(protected ?string $config = null) {}

    public static function isAvailable(): bool
    {
        return app()->bound('purifier');
    }

    public function sanitize(string $html): string
    {
        /** @var callable $clean */
        $clean = [app('purifier'), 'clean'];

        return (string) $clean($html, $this->config);
    }
}
