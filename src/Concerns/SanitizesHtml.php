<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Concerns;

use Gabrielesbaiz\NovaCardHtml\Contracts\HtmlSanitizer;
use Gabrielesbaiz\NovaCardHtml\Support\SanitizerFactory;

trait SanitizesHtml
{
    protected ?bool $shouldSanitize = null;

    protected bool $trustsHtml = false;

    protected ?HtmlSanitizer $sanitizer = null;

    /**
     * Run the card's HTML through a sanitizer before it reaches v-html.
     */
    public function sanitize(bool $sanitize = true, ?HtmlSanitizer $sanitizer = null): static
    {
        $this->shouldSanitize = $sanitize;
        $this->sanitizer = $sanitizer;

        if ($sanitize) {
            $this->trustsHtml = false;
        }

        return $this;
    }

    /**
     * Declare the card's HTML trusted, opting out of sanitizing entirely.
     *
     * This is the historical behaviour of the package and remains the default:
     * card content is authored in PHP by the application, not submitted by users.
     * Call ->sanitize() whenever any part of the content is user supplied.
     */
    public function trustHtml(): static
    {
        $this->trustsHtml = true;
        $this->shouldSanitize = false;

        return $this;
    }

    protected function sanitizesHtml(): bool
    {
        if ($this->shouldSanitize !== null) {
            return $this->shouldSanitize;
        }

        return (bool) config('nova-card-html.sanitize', false);
    }

    protected function sanitizeHtml(string $html): string
    {
        if (! $this->sanitizesHtml()) {
            return $html;
        }

        return ($this->sanitizer ?? SanitizerFactory::make())->sanitize($html);
    }
}
