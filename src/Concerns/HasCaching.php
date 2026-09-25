<?php

declare(strict_types=1);

namespace Gabrielesbaiz\NovaCardHtml\Concerns;

use Closure;
use DateInterval;
use DateTimeInterface;
use Illuminate\Support\Facades\Cache;

trait HasCaching
{
    protected DateTimeInterface|DateInterval|int|null $cacheTtl = null;

    protected ?string $cacheKey = null;

    protected ?string $cacheStore = null;

    /**
     * Cache the rendered HTML for this card.
     *
     * The default key covers the card class and its lazy state, so a card
     * parameterised with forYear(2024) does not serve 2023's HTML.
     */
    public function cache(
        DateTimeInterface|DateInterval|int $ttl,
        ?string $key = null,
        ?string $store = null,
    ): static {
        $this->cacheTtl = $ttl;
        $this->cacheKey = $key;
        $this->cacheStore = $store;

        return $this;
    }

    public function cacheKey(): string
    {
        if ($this->cacheKey !== null) {
            return $this->cacheKey;
        }

        /** @var string $prefix */
        $prefix = config('nova-card-html.cache.prefix', 'nova-card-html');

        return $prefix.':'.sha1(static::class.':'.json_encode($this->lazyState()));
    }

    /**
     * @param  Closure(): string  $callback
     */
    protected function rememberContent(Closure $callback): string
    {
        if ($this->cacheTtl === null) {
            return $callback();
        }

        /** @var string|null $store */
        $store = $this->cacheStore ?? config('nova-card-html.cache.store');

        /** @var string */
        return Cache::store($store)->remember($this->cacheKey(), $this->cacheTtl, $callback);
    }
}
