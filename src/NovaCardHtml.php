<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml;

use Gabrielesbaiz\NovaCardHtml\Concerns\HasAppearance;
use Gabrielesbaiz\NovaCardHtml\Concerns\HasCaching;
use Gabrielesbaiz\NovaCardHtml\Concerns\HasContent;
use Gabrielesbaiz\NovaCardHtml\Concerns\IsLazy;
use Gabrielesbaiz\NovaCardHtml\Concerns\SanitizesHtml;
use Laravel\Nova\Card;
use ReflectionClass;

/**
 * Subclasses must keep a constructor that is callable with no arguments:
 * make() and lazy() both rebuild the card from nothing.
 *
 * @phpstan-consistent-constructor
 */
class NovaCardHtml extends Card
{
    use HasAppearance;
    use HasCaching;
    use HasContent;
    use IsLazy;
    use SanitizesHtml;

    /**
     * The width of the card (1/4, 1/3, 1/2, 2/3, 3/4 or full).
     *
     * @var string
     */
    public $width = '1/3';

    /**
     * Height strategy: 'dynamic' (grow with content) or 'fixed' (scroll).
     *
     * Declared here rather than in HasAppearance because PHP forbids a trait
     * from redefining an inherited property with a different default.
     *
     * Defaults to 'dynamic': that is what content cards almost always want,
     * and Nova itself forces 'dynamic' for full width cards.
     *
     * @var string
     */
    public $height = 'dynamic';

    public function __construct(?string $component = null)
    {
        parent::__construct($component ?? 'nova-card-html');

        $this->applyConfiguredDefaults();
    }

    /**
     * Build a card without declaring a subclass.
     *
     * Nova's Makeable::make() forwards its arguments to the constructor, which
     * for an Element means the component name. A title is far more useful here,
     * so the first argument is treated as one; pass a component to the
     * constructor directly if you need to override it.
     */
    public static function make(mixed ...$arguments): static
    {
        $card = new static;

        $title = $arguments[0] ?? null;

        return is_string($title) ? $card->title($title) : $card;
    }

    /**
     * Expose arbitrary data to the Vue component and to view() content.
     *
     * @param  array<string, mixed>  $extraData
     */
    public function extraData(array $extraData): static
    {
        return $this->withMeta(['extraData' => $extraData]);
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        // Own keys are merged last so that the card, not Nova's Card base
        // class, decides the final value of any shared key.
        return array_merge(
            parent::jsonSerialize(),
            $this->appearancePayload(),
            $this->lazyPayload(),
            ['content' => $this->isLazy() ? null : $this->renderContent()],
        );
    }

    /**
     * Apply the configured defaults, without clobbering what a subclass
     * declared: a card that sets $width or $height as a property has already
     * expressed an intent, and only the untouched values fall back to config.
     */
    protected function applyConfiguredDefaults(): void
    {
        $defaults = (array) config('nova-card-html.defaults', []);

        $declared = self::declaredDefaults();

        foreach (['width', 'height', 'align'] as $key) {
            if (! isset($defaults[$key]) || ! is_string($defaults[$key])) {
                continue;
            }

            // Only override a value the subclass left at the package default.
            if ($this->{$key} === $declared[$key]) {
                $this->{$key} = $defaults[$key];
            }
        }
    }

    /**
     * The package's own property defaults, read once via reflection so they
     * stay in sync with the declarations above.
     *
     * @return array{width: string, height: string, align: string}
     */
    protected static function declaredDefaults(): array
    {
        /** @var array{width: string, height: string, align: string}|null $cache */
        static $cache = null;

        if ($cache === null) {
            $properties = (new ReflectionClass(self::class))->getDefaultProperties();

            $cache = [
                'width' => (string) $properties['width'],
                'height' => (string) $properties['height'],
                'align' => (string) $properties['align'],
            ];
        }

        return $cache;
    }
}
