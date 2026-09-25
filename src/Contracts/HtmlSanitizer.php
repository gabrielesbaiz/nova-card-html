<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Contracts;

interface HtmlSanitizer
{
    /**
     * Return a version of the given HTML that is safe to pass to v-html.
     */
    public function sanitize(string $html): string;
}
