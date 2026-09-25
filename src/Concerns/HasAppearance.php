<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Concerns;

use Closure;

trait HasAppearance
{
    /**
     * Name of the card. Empty renders no heading.
     */
    public string $title = '';

    /**
     * Horizontal alignment of the card content.
     */
    public string $align = 'left';

    /**
     * Legacy centering flag.
     *
     * Declared (and defaulted to false) so that the many subclasses which set
     * it directly keep working. align() wins when it was called explicitly.
     *
     * @deprecated Use $align / align() instead.
     */
    public bool $center = false;

    protected bool $alignWasSet = false;

    protected ?int $maxHeightPx = null;

    protected ?string $icon = null;

    protected string $theme = 'default';

    protected bool $cardStyles = true;

    protected bool $collapsible = false;

    protected bool $collapsedByDefault = false;

    protected ?string $extraStyles = null;

    protected Closure|string|null $headerContent = null;

    protected Closure|string|null $footerContent = null;

    protected Closure|string|null $titleResolver = null;

    /**
     * Set the card title.
     */
    public function title(Closure|string|null $title): static
    {
        // Keep the public $title property authoritative for plain strings, so
        // that content() implementations reading $this->title see the real
        // value. Only a closure needs deferring until serialization.
        if ($title instanceof Closure) {
            $this->titleResolver = $title;

            return $this;
        }

        $this->titleResolver = null;
        $this->title = $title ?? '';

        return $this;
    }

    /**
     * Set the height strategy, or a pixel cap that implies a scrolling card.
     *
     * Widens Nova's Card::height(string) signature to also accept an integer;
     * PHP permits the widening, and passing a string behaves exactly as before.
     */
    public function height(string|int $height): static
    {
        if (is_int($height)) {
            $this->maxHeightPx = $height;
            $this->height = 'fixed';

            return $this;
        }

        $this->height = $height;

        return $this;
    }

    /**
     * Align the card content horizontally.
     */
    public function align(string $align): static
    {
        $this->align = $align;
        $this->alignWasSet = true;

        return $this;
    }

    /**
     * @deprecated Use align('center') / align('left') instead.
     */
    public function center(bool $center = true): static
    {
        trigger_error(
            'NovaCardHtml::center() is deprecated, use align(\'center\') or align(\'left\').',
            E_USER_DEPRECATED,
        );

        return $this->align($center ? 'center' : 'left');
    }

    /**
     * Show a Heroicon next to the title.
     */
    public function icon(?string $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    /**
     * Apply an accent theme: default, info, success, warning or danger.
     */
    public function theme(string $theme): static
    {
        $this->theme = $theme;

        return $this;
    }

    /**
     * Render the content without Nova's card chrome (background, border, padding).
     */
    public function withoutCardStyles(bool $without = true): static
    {
        $this->cardStyles = ! $without;

        return $this;
    }

    /**
     * Let the user collapse the card body.
     */
    public function collapsible(bool $collapsedByDefault = false): static
    {
        $this->collapsible = true;
        $this->collapsedByDefault = $collapsedByDefault;

        return $this;
    }

    /**
     * Attach CSS scoped to this card, instead of emitting a <style> tag inside content().
     */
    public function styles(string $css): static
    {
        $this->extraStyles = $this->extraStyles === null ? $css : $this->extraStyles."\n".$css;

        return $this;
    }

    /**
     * HTML rendered above the content, outside the scroll area.
     */
    public function header(Closure|string $header): static
    {
        $this->headerContent = $header;

        return $this;
    }

    /**
     * HTML rendered below the content, outside the scroll area.
     */
    public function footer(Closure|string $footer): static
    {
        $this->footerContent = $footer;

        return $this;
    }

    protected function resolveTitle(): string
    {
        if ($this->titleResolver === null) {
            return $this->title;
        }

        return $this->titleResolver instanceof Closure
            ? (string) $this->callWithRequest($this->titleResolver)
            : $this->titleResolver;
    }

    /**
     * align() wins when called; otherwise the legacy $center property decides,
     * so subclasses that only set $center still position their content.
     */
    protected function resolveAlign(): string
    {
        if ($this->alignWasSet) {
            return $this->align;
        }

        return $this->center ? 'center' : $this->align;
    }

    protected function resolveSlot(Closure|string|null $slot): ?string
    {
        if ($slot === null) {
            return null;
        }

        return $slot instanceof Closure ? (string) $this->callWithRequest($slot) : $slot;
    }

    /**
     * @return array<string, mixed>
     */
    protected function appearancePayload(): array
    {
        return [
            'title' => $this->resolveTitle(),
            'height' => $this->height,
            'maxHeight' => $this->maxHeightPx,
            'align' => $align = $this->resolveAlign(),
            // Retained so a stale cached bundle keeps rendering correctly.
            'center' => $align === 'center',
            'icon' => $this->icon,
            'theme' => $this->theme,
            'cardStyles' => $this->cardStyles,
            'collapsible' => $this->collapsible,
            'collapsedByDefault' => $this->collapsedByDefault,
            'styles' => $this->extraStyles,
            'header' => $this->resolveSlot($this->headerContent),
            'footer' => $this->resolveSlot($this->footerContent),
        ];
    }
}
