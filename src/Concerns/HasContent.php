<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Concerns;

use Closure;
use Gabrielesbaiz\NovaCardHtml\Support\MarkdownRenderer;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\View;

trait HasContent
{
    protected Closure|string|Htmlable|null $contentSource = null;

    /**
     * Set raw HTML content.
     */
    public function html(Closure|string|Htmlable $html): static
    {
        $this->contentSource = $html;

        return $this;
    }

    /**
     * Set Markdown content, rendered to HTML at serialization time.
     *
     * @param  array<string, mixed>  $options
     */
    public function markdown(Closure|string $markdown, array $options = []): static
    {
        $this->contentSource = function () use ($markdown, $options): string {
            $source = $markdown instanceof Closure
                ? (string) $this->callWithRequest($markdown)
                : $markdown;

            // Markdown is usually authored content rather than a trusted template,
            // so embedded HTML is stripped unless the card explicitly trusts it.
            $options = array_merge(
                ['html_input' => $this->trustsHtml ? 'allow' : 'strip'],
                $options,
            );

            return MarkdownRenderer::render($source, $options);
        };

        return $this;
    }

    /**
     * Render a Blade view as the card content.
     *
     * @param  array<string, mixed>  $data
     */
    public function view(string $view, array $data = []): static
    {
        $this->contentSource = fn (): string => View::make($view, array_merge(
            ['card' => $this, 'extraData' => $this->meta()['extraData'] ?? []],
            $data,
        ))->render();

        return $this;
    }

    /**
     * Set plain text content, HTML-escaped on output.
     */
    public function text(Closure|string $text): static
    {
        $this->contentSource = function () use ($text): string {
            $value = $text instanceof Closure ? (string) $this->callWithRequest($text) : $text;

            return e($value);
        };

        return $this;
    }

    /**
     * Alias of text(): render the given value as escaped plain text.
     */
    public function escape(Closure|string $text): static
    {
        return $this->text($text);
    }

    /**
     * The content hook subclasses override.
     *
     * Every card in the wild implements this, so it stays the primary API; the
     * fluent setters above are purely additive and only take precedence when
     * one of them was actually called.
     */
    public function content(): string
    {
        return '';
    }

    /**
     * Resolve the final HTML for this card, applying caching and sanitizing.
     */
    public function renderContent(): string
    {
        return $this->sanitizeHtml($this->rememberContent(fn (): string => $this->resolveContent()));
    }

    protected function resolveContent(): string
    {
        if ($this->contentSource === null) {
            return $this->content();
        }

        $source = $this->contentSource;

        if ($source instanceof Closure) {
            $source = $this->callWithRequest($source);
        }

        if ($source instanceof Htmlable) {
            return $source->toHtml();
        }

        return (string) $source;
    }

    /**
     * Call a user closure through the container so it may type-hint NovaRequest.
     */
    protected function callWithRequest(Closure $callback): mixed
    {
        return app()->call($callback, ['card' => $this]);
    }
}
