<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Concerns;

use Closure;
use Gabrielesbaiz\NovaCardHtml\Attributes\LazyState;
use Gabrielesbaiz\NovaCardHtml\Exceptions\LazyCardException;
use Gabrielesbaiz\NovaCardHtml\Support\LazyToken;
use ReflectionClass;
use ReflectionProperty;

trait IsLazy
{
    protected bool $lazy = false;

    protected bool $deferUntilVisible = false;

    protected ?int $refreshEvery = null;

    protected Closure|string|null $placeholder = null;

    /**
     * Load this card's content over a separate request after the dashboard paints.
     */
    public function lazy(bool $lazy = true): static
    {
        if ($lazy) {
            $this->assertLazyable();
        }

        $this->lazy = $lazy;

        return $this;
    }

    /**
     * Only fetch the content once the card scrolls into view. Implies lazy().
     */
    public function deferUntilVisible(bool $defer = true): static
    {
        $this->deferUntilVisible = $defer;

        return $defer ? $this->lazy() : $this;
    }

    /**
     * Re-fetch the content every N seconds. Implies lazy().
     */
    public function refreshEvery(int $seconds): static
    {
        $this->refreshEvery = $seconds;

        return $this->lazy();
    }

    /**
     * HTML shown while the content loads. Defaults to a skeleton shimmer.
     */
    public function placeholder(Closure|string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function isLazy(): bool
    {
        return $this->lazy;
    }

    /**
     * Capture the state a lazily loaded card must be rebuilt with.
     *
     * Override for full control; by default every #[LazyState] property is
     * captured automatically.
     *
     * @return array<string, mixed>
     */
    public function lazyState(): array
    {
        $state = [];

        foreach ($this->lazyStateProperties() as $property) {
            if ($property->isInitialized($this)) {
                $state[$property->getName()] = $property->getValue($this);
            }
        }

        return $state;
    }

    /**
     * Restore state captured by lazyState() onto a freshly built card.
     *
     * @param  array<string, mixed>  $state
     */
    public function fromLazyState(array $state): static
    {
        foreach ($this->lazyStateProperties() as $property) {
            $name = $property->getName();

            if (array_key_exists($name, $state)) {
                $property->setValue($this, $state[$name]);
            }
        }

        return $this;
    }

    /**
     * @return list<ReflectionProperty>
     */
    protected function lazyStateProperties(): array
    {
        $properties = [];

        foreach ((new ReflectionClass($this))->getProperties() as $property) {
            if ($property->getAttributes(LazyState::class) !== []) {
                $properties[] = $property;
            }
        }

        return $properties;
    }

    /**
     * A lazy card is rebuilt from nothing in a second request, so it must be
     * constructible without arguments. Failing here — at serialization time —
     * turns an obscure runtime 500 into an actionable message on the dashboard.
     */
    protected function assertLazyable(): void
    {
        $constructor = (new ReflectionClass($this))->getConstructor();

        if ($constructor !== null && $constructor->getNumberOfRequiredParameters() > 0) {
            throw LazyCardException::requiresConstructorArguments(static::class);
        }
    }

    protected function lazyToken(): string
    {
        return LazyToken::encode(static::class, $this->lazyState());
    }

    /**
     * @return array<string, mixed>
     */
    protected function lazyPayload(): array
    {
        if (! $this->lazy) {
            return [
                'lazy' => false,
                'lazyToken' => null,
                'deferUntilVisible' => false,
                'refreshEvery' => null,
                'placeholder' => null,
            ];
        }

        return [
            'lazy' => true,
            'lazyToken' => $this->lazyToken(),
            'lazyEndpoint' => route('nova-card-html.content'),
            'deferUntilVisible' => $this->deferUntilVisible,
            'refreshEvery' => $this->refreshEvery,
            'placeholder' => $this->resolveSlot($this->placeholder),
        ];
    }
}
